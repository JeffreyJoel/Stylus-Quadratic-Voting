//!
//! Quadratic Voting Contract for Arbitrum Stylus
//!
//! This contract implements quadratic voting where the cost of votes increases quadratically,
//! preventing plutocratic outcomes by making additional votes increasingly expensive.
//! 
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::{string::String, vec::Vec};
use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::sol,
    prelude::*,
};

sol! {
    #[derive(Debug)]
    error SessionNotFound();
    #[derive(Debug)]
    error SessionNotActive();
    #[derive(Debug)]
    error ProposalNotFound();
    #[derive(Debug)]
    error VoterNotRegistered();
    #[derive(Debug)]
    error InsufficientCredits();
    #[derive(Debug)]
    error InvalidVoteCount();
    #[derive(Debug)]
    error Unauthorized();
    #[derive(Debug)]
    error ArithmeticOverflow();

    event SessionCreated(uint256 indexed id, address indexed creator, string name);
    event VoterRegistered(address indexed voter, string email);
    event ProposalCreated(uint256 indexed session_id, uint256 indexed proposal_id, address indexed creator, string title);
    event VoteCast(uint256 indexed session_id, address indexed voter, uint256[] proposal_ids, uint256[] vote_counts, uint256 total_credits_spent);
}

#[derive(SolidityError, Debug)]
pub enum QuadraticVotingError {
    SessionNotFound(SessionNotFound),
    SessionNotActive(SessionNotActive),
    ProposalNotFound(ProposalNotFound),
    VoterNotRegistered(VoterNotRegistered),
    InsufficientCredits(InsufficientCredits),
    InvalidVoteCount(InvalidVoteCount),
    Unauthorized(Unauthorized),
    ArithmeticOverflow(ArithmeticOverflow),
}



sol_storage! {
    pub struct Proposal {
        string title;
        string description;
        uint256 vote_count;
    }

    pub struct Vote {
        uint256 proposal_id;
        uint256 credits;
        uint256 timestamp;
    }

    pub struct Voter {
        string email;
        bool is_registered;
    }

    pub struct VotingSession {
        string name;
        string description;
        uint256 start_time;
        uint256 end_time;
        uint256 credits_per_voter;
        bool active;
        mapping(uint256 => Proposal) proposals;
        uint256 proposal_count;
        address creator;
        mapping(address => mapping(uint256 => uint256)) votes_per_proposal; // voter => proposalId => votes
        mapping(address => uint256) voter_credits; // Credits per voter in this session
    }

    pub struct QuadraticVoting {
        mapping(uint256 => VotingSession) sessions;
        mapping(address => Voter) voters;
        uint256 session_counter;
        address admin;
    }
}


#[public]
impl QuadraticVoting {
    /// Initialize the contract with admin
    pub fn initialize(&mut self) -> Result<(), QuadraticVotingError> {
        // Only allow initialization once
        if !self.admin.get().is_zero() {
            return Err(QuadraticVotingError::Unauthorized(Unauthorized {}));
        }

        let admin = self.vm().msg_sender();
        self.admin.set(admin);
        self.session_counter.set(U256::ZERO);

        Ok(())
    }

    /// Register a voter with their email
    pub fn register_voter(&mut self, email: String) -> Result<(), QuadraticVotingError> {
        let caller = self.vm().msg_sender();

        if self.voters.get(caller).is_registered.get() {
            return Err(QuadraticVotingError::Unauthorized(Unauthorized {}));
        }

        self.voters.setter(caller).email.set_str(&email);
        self.voters.setter(caller).is_registered.set(true);

        // Emit VoterRegistered event
        log(
            self.vm(),
            VoterRegistered {
                voter: caller,
                email: email,
            },
        );

        Ok(())
    }

    /// Create a new voting session
    pub fn create_session(
        &mut self,
        name: String,
        description: String,
        credits_per_voter: U256,
        duration_seconds: U256,
    ) -> Result<U256, QuadraticVotingError> {
        let caller = self.vm().msg_sender();
        let current_block = U256::from(self.vm().block_number());
        let session_id = self.session_counter.get() + U256::from(1);

        // Set session details
        self.sessions.setter(session_id).name.set_str(&name);
        self.sessions.setter(session_id).description.set_str(&description);
        self.sessions.setter(session_id).start_time.set(current_block);
        self.sessions.setter(session_id).end_time.set(current_block + duration_seconds);
        self.sessions.setter(session_id).credits_per_voter.set(credits_per_voter);
        self.sessions.setter(session_id).active.set(true);
        self.sessions.setter(session_id).proposal_count.set(U256::ZERO);
        self.sessions.setter(session_id).creator.set(caller);

        self.session_counter.set(session_id);

        // Emit SessionCreated event
        log(
            self.vm(),
            SessionCreated {
                id: session_id,
                creator: caller,
                name,
            },
        );

        Ok(session_id)
    }

    /// Get session details
    pub fn get_session(&self, session_id: U256) -> Result<(String, String, U256, U256, U256, bool, Address, U256), QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }

        Ok((
            session.name.get_string(),
            session.description.get_string(),
            session.start_time.get(),
            session.end_time.get(),
            session.credits_per_voter.get(),
            session.active.get(),
            session.creator.get(),
            session.proposal_count.get(),
        ))
    }

    /// Add a proposal to a voting session
    pub fn add_proposal(
        &mut self,
        session_id: U256,
        title: String,
        description: String,
    ) -> Result<U256, QuadraticVotingError> {
        // Validate session exists and is active
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }
        if !session.active.get() {
            return Err(QuadraticVotingError::SessionNotActive(SessionNotActive {}));
        }

        let caller = self.vm().msg_sender();
        let proposal_id = session.proposal_count.get() + U256::from(1);

        // Store proposal in session
        self.sessions.setter(session_id).proposals.setter(proposal_id).title.set_str(&title);
        self.sessions.setter(session_id).proposals.setter(proposal_id).description.set_str(&description);
        self.sessions.setter(session_id).proposals.setter(proposal_id).vote_count.set(U256::ZERO);

        // Update proposal count
        self.sessions.setter(session_id).proposal_count.set(proposal_id);

        // Emit ProposalCreated event
        log(
            self.vm(),
            ProposalCreated {
                session_id,
                proposal_id,
                creator: caller,
                title,
            },
        );

        Ok(proposal_id)
    }

    /// Get proposal details from a session
    pub fn get_proposal(&self, session_id: U256, proposal_id: U256) -> Result<(String, String, U256), QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }

        let proposal = session.proposals.get(proposal_id);
        let proposal_title = proposal.title.get_string();
        if proposal_title.is_empty() {
            return Err(QuadraticVotingError::ProposalNotFound(ProposalNotFound {}));
        }

        Ok((
            proposal_title,
            proposal.description.get_string(),
            proposal.vote_count.get(),
        ))
    }

    /// Cast votes on multiple proposals within a session
    pub fn vote(
        &mut self,
        session_id: U256,
        proposal_ids: Vec<U256>,
        vote_counts: Vec<U256>,
    ) -> Result<(), QuadraticVotingError> {
        let caller = self.vm().msg_sender();
        let current_block = U256::from(self.vm().block_number());

        // Validate voter is registered
        if !self.voters.get(caller).is_registered.get() {
            return Err(QuadraticVotingError::VoterNotRegistered(VoterNotRegistered {}));
        }

        // Validate session exists and is active
        {
            let session = self.sessions.get(session_id);
            if session.creator.get() == Address::ZERO {
                return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
            }
            if !session.active.get() {
                return Err(QuadraticVotingError::SessionNotActive(SessionNotActive {}));
            }
            if current_block >= session.end_time.get() {
                return Err(QuadraticVotingError::SessionNotActive(SessionNotActive {}));
            }
        }

        // Validate input arrays have same length
        if proposal_ids.len() != vote_counts.len() {
            return Err(QuadraticVotingError::InvalidVoteCount(InvalidVoteCount {}));
        }

        // Calculate total quadratic cost
        let mut total_credits_needed = U256::ZERO;
        for &vote_count in &vote_counts {
            let cost = vote_count.pow(U256::from(2));
            total_credits_needed = total_credits_needed.saturating_add(cost);
        }

        // Check voter has sufficient credits for this session
        // If voter hasn't voted in this session yet, allocate initial credits
        let session_data = self.sessions.get(session_id);
        let mut voter_credits = session_data.voter_credits.get(caller);

        // If this is the first vote in the session, allocate full credits
        if voter_credits == U256::ZERO {
            voter_credits = session_data.credits_per_voter.get();
        }

        if voter_credits < total_credits_needed {
            return Err(QuadraticVotingError::InsufficientCredits(InsufficientCredits {}));
        }

        // Process votes
        for (i, &proposal_id) in proposal_ids.iter().enumerate() {
            let vote_count = vote_counts[i];

            // Validate proposal exists in session
            let session_data = self.sessions.get(session_id);
            let proposal = session_data.proposals.get(proposal_id);
            if proposal.title.get_string().is_empty() {
                return Err(QuadraticVotingError::ProposalNotFound(ProposalNotFound {}));
            }

            // Update vote counts
            let current_votes = session_data.votes_per_proposal.get(caller).get(proposal_id);
            let new_votes = vote_count;

            // Update proposal vote count (subtract old vote, add new vote)
            let current_proposal_votes = proposal.vote_count.get();
            let new_proposal_votes = current_proposal_votes
                .saturating_sub(current_votes)
                .saturating_add(new_votes);

            self.sessions.setter(session_id).proposals.setter(proposal_id).vote_count.set(new_proposal_votes);

            // Record the vote
            self.sessions.setter(session_id).votes_per_proposal.setter(caller).setter(proposal_id).set(new_votes);
        }

        // Update voter credits for this session (store remaining credits)
        let new_remaining_credits = voter_credits.saturating_sub(total_credits_needed);
        self.sessions.setter(session_id).voter_credits.setter(caller).set(new_remaining_credits);

        // Emit VoteCast event
        log(
            self.vm(),
            VoteCast {
                session_id,
                voter: caller,
                proposal_ids: proposal_ids.clone(),
                vote_counts: vote_counts.clone(),
                total_credits_spent: total_credits_needed,
            },
        );

        Ok(())
    }

    /// Get voter's credits for a specific session
    pub fn get_voter_session_credits(&self, session_id: U256, voter: Address) -> Result<U256, QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }

        // Return remaining credits (stored directly)
        Ok(session.voter_credits.get(voter))
    }

    /// Get vote details for a voter in a session
    pub fn get_vote(&self, session_id: U256, voter: Address, proposal_id: U256) -> Result<U256, QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }

        Ok(session.votes_per_proposal.get(voter).get(proposal_id))
    }

    /// Get all proposals in a session
    pub fn get_session_proposals(&self, session_id: U256) -> Result<Vec<(U256, String, String, U256)>, QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }

        let mut proposals = Vec::new();
        let proposal_count = session.proposal_count.get();

        // Limit to prevent gas issues
        let limit = if proposal_count > U256::from(100) {
            U256::from(100)
        } else {
            proposal_count
        };

        for i in 1..=limit.as_limbs()[0] {
            let id = U256::from(i);
            let proposal = session.proposals.get(id);
            let proposal_title = proposal.title.get_string();
            if !proposal_title.is_empty() {
                proposals.push((
                    id,
                    proposal_title,
                    proposal.description.get_string(),
                    proposal.vote_count.get(),
                ));
            }
        }

        Ok(proposals)
    }

    /// Check if a session is still active
    pub fn is_session_active(&self, session_id: U256) -> bool {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return false;
        }

        let current_block = U256::from(self.vm().block_number());
        session.active.get() && current_block < session.end_time.get()
    }

    /// Get voter information
    pub fn get_voter(&self, voter: Address) -> (String, bool) {
        let voter_info = self.voters.get(voter);
        (
            voter_info.email.get_string(),
            voter_info.is_registered.get(),
        )
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_initialize_contract() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        let admin = Address::from([1u8; 20]);

        vm.set_sender(admin);

        // Initialize contract
        let result = contract.initialize();
        assert!(result.is_ok());

        // Check admin was set
        assert_eq!(contract.admin.get(), admin);

        // Check session counter is initialized
        assert_eq!(contract.session_counter.get(), U256::ZERO);
    }

    #[test]
    fn test_voter_registration() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        let admin = Address::from([1u8; 20]);
        let voter = Address::from([2u8; 20]);
        let email = "test@example.com".to_string();

        vm.set_sender(admin);
        contract.initialize().unwrap();

        // Register voter
        vm.set_sender(voter);
        let result = contract.register_voter(email.clone());
        assert!(result.is_ok());

        // Check voter was registered
        let voter_info = contract.get_voter(voter);
        assert_eq!(voter_info.0, email);
        assert_eq!(voter_info.1, true);
    }

    #[test]
    fn test_create_session() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        let admin = Address::from([1u8; 20]);
        vm.set_sender(admin);
        contract.initialize().unwrap();

        // Create session
        let name = "Test Session".to_string();
        let description = "A test voting session".to_string();
        let credits_per_voter = U256::from(100);
        let duration = U256::from(3600); // 1 hour

        let session_id = contract
            .create_session(name.clone(), description.clone(), credits_per_voter, duration)
            .unwrap();

        // Check session was created
        assert_eq!(session_id, U256::from(1));

        let session = contract.get_session(session_id).unwrap();
        assert_eq!(session.0, name);
        assert_eq!(session.1, description);
        assert_eq!(session.4, credits_per_voter);
        assert_eq!(session.5, true); // active
        assert_eq!(session.6, admin); // creator
        assert_eq!(session.7, U256::ZERO); // proposal_count
    }

    #[test]
    fn test_add_proposal_to_session() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        let admin = Address::from([1u8; 20]);
        vm.set_sender(admin);
        contract.initialize().unwrap();

        // Create session
        let session_id = contract
            .create_session("Test".to_string(), "Desc".to_string(), U256::from(100), U256::from(3600))
            .unwrap();

        // Add proposal to session
        let title = "Test Proposal".to_string();
        let description = "Proposal description".to_string();

        let proposal_id = contract
            .add_proposal(session_id, title.clone(), description.clone())
            .unwrap();

        // Check proposal was added
        assert_eq!(proposal_id, U256::from(1));

        let proposal = contract.get_proposal(session_id, proposal_id).unwrap();
        assert_eq!(proposal.0, title);
        assert_eq!(proposal.1, description);
        assert_eq!(proposal.2, U256::ZERO); // vote_count
    }

    #[test]
    fn test_vote_in_session() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        let admin = Address::from([1u8; 20]);
        let voter = Address::from([2u8; 20]);

        vm.set_sender(admin);
        contract.initialize().unwrap();

        // Register voter
        vm.set_sender(voter);
        contract.register_voter("voter@example.com".to_string()).unwrap();

        // Create session
        vm.set_sender(admin);
        let session_id = contract
            .create_session("Test".to_string(), "Desc".to_string(), U256::from(100), U256::from(3600))
            .unwrap();

        // Add proposals
        let proposal1_id = contract
            .add_proposal(session_id, "Proposal 1".to_string(), "Desc 1".to_string())
            .unwrap();
        let proposal2_id = contract
            .add_proposal(session_id, "Proposal 2".to_string(), "Desc 2".to_string())
            .unwrap();

        // Vote on proposals
        vm.set_sender(voter);
        let proposal_ids = vec![proposal1_id, proposal2_id];
        let vote_counts = vec![U256::from(2), U256::from(1)]; // 4 + 1 = 5 credits total

        let result = contract.vote(session_id, proposal_ids.clone(), vote_counts.clone());
        assert!(result.is_ok());

        // Check votes were recorded
        let vote1 = contract.get_vote(session_id, voter, proposal1_id).unwrap();
        assert_eq!(vote1, U256::from(2));

        let vote2 = contract.get_vote(session_id, voter, proposal2_id).unwrap();
        assert_eq!(vote2, U256::from(1));

        // Check proposal vote counts
        let proposal1 = contract.get_proposal(session_id, proposal1_id).unwrap();
        assert_eq!(proposal1.2, U256::from(2)); // vote_count

        let proposal2 = contract.get_proposal(session_id, proposal2_id).unwrap();
        assert_eq!(proposal2.2, U256::from(1)); // vote_count

        // Check credits were deducted
        let remaining_credits = contract.get_voter_session_credits(session_id, voter).unwrap();
        assert_eq!(remaining_credits, U256::from(95)); // 100 - 5
    }

    #[test]
    fn test_insufficient_credits() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        let admin = Address::from([1u8; 20]);
        let voter = Address::from([2u8; 20]);

        vm.set_sender(admin);
        contract.initialize().unwrap();

        // Register voter
        vm.set_sender(voter);
        contract.register_voter("voter@example.com".to_string()).unwrap();

        // Create session with limited credits
        vm.set_sender(admin);
        let session_id = contract
            .create_session("Test".to_string(), "Desc".to_string(), U256::from(5), U256::from(3600))
            .unwrap();

        // Add proposal
        let proposal_id = contract
            .add_proposal(session_id, "Proposal".to_string(), "Desc".to_string())
            .unwrap();

        // Try to vote with more credits than available (3² = 9 > 5)
        vm.set_sender(voter);
        let result = contract.vote(session_id, vec![proposal_id], vec![U256::from(3)]);
        assert!(matches!(
            result,
            Err(QuadraticVotingError::InsufficientCredits(InsufficientCredits {}))
        ));
    }

    #[test]
    fn test_session_not_active() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        let admin = Address::from([1u8; 20]);
        let voter = Address::from([2u8; 20]);

        vm.set_sender(admin);
        contract.initialize().unwrap();

        // Register voter
        vm.set_sender(voter);
        contract.register_voter("voter@example.com".to_string()).unwrap();

        // Create session
        vm.set_sender(admin);
        let session_id = contract
            .create_session("Test".to_string(), "Desc".to_string(), U256::from(100), U256::from(1)) // 1 block duration
            .unwrap();

        // Add proposal
        let proposal_id = contract
            .add_proposal(session_id, "Proposal".to_string(), "Desc".to_string())
            .unwrap();

        // Advance block number to expire session
        vm.set_block_number(100);

        // Try to vote on expired session
        vm.set_sender(voter);
        let result = contract.vote(session_id, vec![proposal_id], vec![U256::from(1)]);
        assert!(matches!(
            result,
            Err(QuadraticVotingError::SessionNotActive(SessionNotActive {}))
        ));
    }

    #[test]
    fn test_voter_not_registered() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        let admin = Address::from([1u8; 20]);
        let voter = Address::from([2u8; 20]);

        vm.set_sender(admin);
        contract.initialize().unwrap();

        // Create session without registering voter
        let session_id = contract
            .create_session("Test".to_string(), "Desc".to_string(), U256::from(100), U256::from(3600))
            .unwrap();

        // Add proposal
        let proposal_id = contract
            .add_proposal(session_id, "Proposal".to_string(), "Desc".to_string())
            .unwrap();

        // Try to vote without being registered
        vm.set_sender(voter);
        let result = contract.vote(session_id, vec![proposal_id], vec![U256::from(1)]);
        assert!(matches!(
            result,
            Err(QuadraticVotingError::VoterNotRegistered(VoterNotRegistered {}))
        ));
    }

    #[test]
    fn test_session_not_found() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let contract = QuadraticVoting::from(&vm);

        let result = contract.get_session(U256::from(999));
        assert!(matches!(
            result,
            Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}))
        ));
    }
}
