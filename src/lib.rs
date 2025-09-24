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
    alloy_primitives::{Address, U256, U64, U8},
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

    #[derive(Debug)]
    error InvalidProposalCount();

    event SessionCreated(uint64 indexed id, address indexed creator, string name);
    event VoterRegistered(address indexed voter, string email);
    event ProposalCreated(uint64 indexed session_id, uint64 indexed proposal_id, address indexed creator, string title);
    event VoteCast(uint64 indexed session_id, address indexed voter, uint8[] proposal_ids, uint64[] vote_counts, uint64 total_credits_spent);
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
    InvalidProposalCount(InvalidProposalCount),
}

sol_storage! {
    pub struct Proposal {
        string title;
        string description;
        uint64 vote_count;
    }

    pub struct Vote {
        uint8 proposal_id;
        uint8 credits;
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
        uint8 credits_per_voter;
        bool active;
        mapping(uint8 => Proposal) proposals;
        uint8 proposal_count;
        address creator;
        mapping(address => mapping(uint8 => uint64)) votes_per_proposal;
        mapping(address => uint8) voter_credits;
    }

    #[entrypoint]
    pub struct QuadraticVoting {
        mapping(uint64 => VotingSession) sessions;
        mapping(address => Voter) voters;
        uint64 session_counter;
        address admin;
    }
}

#[public]
impl QuadraticVoting {
    #[constructor]
    pub fn constructor(&mut self) {
        let admin = self.vm().msg_sender();
        self.admin.set(admin);
        self.session_counter.set(U64::ZERO);
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
        credits_per_voter: U8,
        duration_seconds: U64,
        initial_proposals: Vec<(String, String)>,
    ) -> Result<U64, QuadraticVotingError> {
        let caller = self.vm().msg_sender();

        if caller != self.admin.get() {
            return Err(QuadraticVotingError::Unauthorized(Unauthorized {}));
        }

        if initial_proposals.is_empty() {
            return Err(QuadraticVotingError::InvalidProposalCount(
                InvalidProposalCount {},
            ));
        }

        let current_block = U256::from(self.vm().block_number());
        let session_id = self.session_counter.get() + U64::from(1);
        let end_time = current_block + U256::from(duration_seconds.as_limbs()[0]);

        // Set session details
        self.sessions.setter(session_id).name.set_str(&name);
        self.sessions
            .setter(session_id)
            .description
            .set_str(&description);
        self.sessions
            .setter(session_id)
            .start_time
            .set(current_block);
        self.sessions
            .setter(session_id)
            .end_time
            .set(end_time);
        self.sessions
            .setter(session_id)
            .credits_per_voter
            .set(credits_per_voter);
        self.sessions.setter(session_id).active.set(true);
        self.sessions.setter(session_id).creator.set(caller);

        self.session_counter.set(session_id);

        // Emit SessionCreated event
        log(
            self.vm(),
            SessionCreated {
                id: session_id.as_limbs()[0],
                creator: caller,
                name,
            },
        );

        // Add initial proposals (validated to be non-empty above)
        self.add_proposals_to_session(session_id, initial_proposals)?;

        Ok(session_id)
    }

    /// Get session details
    pub fn get_session(
        &self,
        session_id: U64,
    ) -> Result<(String, String, U256, U256, U8, bool, Address, U8), QuadraticVotingError> {
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

    /// Get proposal details from a session
    pub fn get_proposal(
        &self,
        session_id: U64,
        proposal_id: U8,
    ) -> Result<(String, String, U64), QuadraticVotingError> {
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
        session_id: U64,
        proposal_ids: Vec<U8>,
        vote_counts: Vec<U64>,
    ) -> Result<(), QuadraticVotingError> {
        let caller = self.vm().msg_sender();

        // Validate all inputs
        self.validate_vote_inputs(caller, session_id, &proposal_ids, &vote_counts)?;

        // Calculate total quadratic cost
        let total_credits_needed = self.calculate_quadratic_cost(&vote_counts);

        // Get and validate voter credits
        let voter_credits =
            self.get_and_validate_voter_credits(session_id, caller, total_credits_needed)?;

        // Process all votes
        self.process_votes(session_id, caller, &proposal_ids, &vote_counts)?;

        // Update voter credits
        self.update_voter_credits(session_id, caller, voter_credits, total_credits_needed);

        // Emit event
        log(
            self.vm(),
            VoteCast {
                session_id: session_id.as_limbs()[0],
                voter: caller,
                proposal_ids: proposal_ids.iter().map(|&x| x.as_limbs()[0] as u8).collect(),
                vote_counts: vote_counts.iter().map(|&x| x.as_limbs()[0]).collect(),
                total_credits_spent: total_credits_needed.as_limbs()[0],
            },
        );

        Ok(())
    }

    /// Get voter's credits for a specific session
    pub fn get_voter_session_credits(
        &self,
        session_id: U64,
        voter: Address,
    ) -> Result<U8, QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }

        // Return remaining credits (stored directly)
        Ok(session.voter_credits.get(voter))
    }

    /// Get vote details for a voter in a session
    pub fn get_vote(
        &self,
        session_id: U64,
        voter: Address,
        proposal_id: U8,
    ) -> Result<U64, QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }

        Ok(session.votes_per_proposal.get(voter).get(proposal_id))
    }

    /// Get all proposals in a session
    pub fn get_session_proposals(
        &self,
        session_id: U64,
    ) -> Result<Vec<(U8, String, String, U64)>, QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }

        let mut proposals = Vec::new();
        let proposal_count = session.proposal_count.get();

        // Limit to prevent gas issues
        let limit = if proposal_count > U8::from(100) {
            U8::from(100)
        } else {
            proposal_count
        };

        for i in 1..=limit.as_limbs()[0] {
            let id = U8::from(i);
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
    pub fn is_session_active(&self, session_id: U64) -> bool {
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

impl QuadraticVoting {
    /// Helper functions

    /// Add multiple proposals to a session
    fn add_proposals_to_session(
        &mut self,
        session_id: U64,
        proposals: Vec<(String, String)>,
    ) -> Result<(), QuadraticVotingError> {
        for (title, description) in proposals {
            let proposal_id = self.sessions.getter(session_id).proposal_count.get() + U8::from(1);

            // Store proposal in session
            self.sessions
                .setter(session_id)
                .proposals
                .setter(proposal_id)
                .title
                .set_str(&title);
            self.sessions
                .setter(session_id)
                .proposals
                .setter(proposal_id)
                .description
                .set_str(&description);
            self.sessions
                .setter(session_id)
                .proposals
                .setter(proposal_id)
                .vote_count
                .set(U64::ZERO);

            // Update proposal count
            self.sessions
                .setter(session_id)
                .proposal_count
                .set(proposal_id);

            // log ProposalCreated event
            log(
                self.vm(),
                ProposalCreated {
                    session_id: session_id.as_limbs()[0],
                    proposal_id: proposal_id.as_limbs()[0],
                    creator: self.vm().msg_sender(),
                    title,
                },
            );
        }
        Ok(())
    }

    /// Validate vote inputs including voter registration, session status, and input consistency
    fn validate_vote_inputs(
        &self,
        caller: Address,
        session_id: U64,
        proposal_ids: &[U8],
        vote_counts: &[U64],
    ) -> Result<(), QuadraticVotingError> {
        // Validate voter is registered
        if !self.voters.get(caller).is_registered.get() {
            return Err(QuadraticVotingError::VoterNotRegistered(
                VoterNotRegistered {},
            ));
        }

        // Validate session exists and is active
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }
        if !session.active.get() {
            return Err(QuadraticVotingError::SessionNotActive(SessionNotActive {}));
        }

        let current_block = U256::from(self.vm().block_number());
        if current_block >= session.end_time.get() {
            return Err(QuadraticVotingError::SessionNotActive(SessionNotActive {}));
        }

        // Validate input arrays have same length
        if proposal_ids.len() != vote_counts.len() {
            return Err(QuadraticVotingError::InvalidVoteCount(InvalidVoteCount {}));
        }

        Ok(())
    }

    /// Calculate the total quadratic cost for all votes
    fn calculate_quadratic_cost(&self, vote_counts: &[U64]) -> U64 {
        let mut total_credits_needed = U64::ZERO;
        for &vote_count in vote_counts {
            let cost = vote_count.saturating_mul(vote_count); // x^2 using saturating arithmetic
            total_credits_needed = total_credits_needed.saturating_add(cost);
        }
        total_credits_needed
    }

    /// Get voter's current credits for the session and validate they have enough
    fn get_and_validate_voter_credits(
        &self,
        session_id: U64,
        caller: Address,
        total_credits_needed: U64,
    ) -> Result<U8, QuadraticVotingError> {
        let session_data = self.sessions.get(session_id);
        let mut voter_credits = session_data.voter_credits.get(caller);

        // If this is the first vote in the session, allocate full credits
        if voter_credits == U8::ZERO {
            voter_credits = session_data.credits_per_voter.get();
        }

        // Convert total_credits_needed from U64 to U8 for comparison
        let credits_needed_u8 = U8::from(total_credits_needed.as_limbs()[0]);
        if voter_credits < credits_needed_u8 {
            return Err(QuadraticVotingError::InsufficientCredits(
                InsufficientCredits {},
            ));
        }

        Ok(voter_credits)
    }

    /// Process votes for each proposal, updating vote counts
    fn process_votes(
        &mut self,
        session_id: U64,
        caller: Address,
        proposal_ids: &[U8],
        vote_counts: &[U64],
    ) -> Result<(), QuadraticVotingError> {
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

            self.sessions
                .setter(session_id)
                .proposals
                .setter(proposal_id)
                .vote_count
                .set(new_proposal_votes);

            // Record the vote
            self.sessions
                .setter(session_id)
                .votes_per_proposal
                .setter(caller)
                .setter(proposal_id)
                .set(new_votes);
        }

        Ok(())
    }

    /// Update voter's remaining credits after voting
    fn update_voter_credits(
        &mut self,
        session_id: U64,
        caller: Address,
        voter_credits: U8,
        total_credits_spent: U64,
    ) {
        let credits_spent_u8 = U8::from(total_credits_spent);
        let new_remaining_credits = voter_credits.saturating_sub(credits_spent_u8);
        self.sessions
            .setter(session_id)
            .voter_credits
            .setter(caller)
            .set(new_remaining_credits);
    }
}
