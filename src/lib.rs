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

    #[derive(Debug)]
    error InvalidProposalCount();

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
    InvalidProposalCount(InvalidProposalCount),
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
        mapping(address => mapping(uint256 => uint256)) votes_per_proposal;
        mapping(address => uint256) voter_credits;
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
    #[constructor]
    pub fn constructor(&mut self) -> Result<(), QuadraticVotingError> {
        let admin = self.vm().tx_origin();
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
        initial_proposals: Vec<(String, String)>,
    ) -> Result<U256, QuadraticVotingError> {
        let caller = self.vm().msg_sender();

        if caller != self.admin.get() {
            return Err(QuadraticVotingError::Unauthorized(Unauthorized {}));
        }

        if initial_proposals.is_empty() {
            return Err(QuadraticVotingError::InvalidProposalCount(InvalidProposalCount {}));
        }

        let current_block = U256::from(self.vm().block_number());
        let session_id = self.session_counter.get() + U256::from(1);

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
            .set(current_block + duration_seconds);
        self.sessions
            .setter(session_id)
            .credits_per_voter
            .set(credits_per_voter);
        self.sessions.setter(session_id).active.set(true);
        self.sessions
            .setter(session_id)
            .proposal_count
            .set(U256::ZERO);
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

        // Add initial proposals if provided
        if !initial_proposals.is_empty() {
            self.add_proposals_to_session(session_id, initial_proposals)?;
        }

        Ok(session_id)
    }

    /// Get session details
    pub fn get_session(
        &self,
        session_id: U256,
    ) -> Result<(String, String, U256, U256, U256, bool, Address, U256), QuadraticVotingError> {
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
        session_id: U256,
        proposal_id: U256,
    ) -> Result<(String, String, U256), QuadraticVotingError> {
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
            return Err(QuadraticVotingError::VoterNotRegistered(
                VoterNotRegistered {},
            ));
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
            return Err(QuadraticVotingError::InsufficientCredits(
                InsufficientCredits {},
            ));
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

        // Update voter credits for this session (store remaining credits)
        let new_remaining_credits = voter_credits.saturating_sub(total_credits_needed);
        self.sessions
            .setter(session_id)
            .voter_credits
            .setter(caller)
            .set(new_remaining_credits);

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
    pub fn get_voter_session_credits(
        &self,
        session_id: U256,
        voter: Address,
    ) -> Result<U256, QuadraticVotingError> {
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
        session_id: U256,
        voter: Address,
        proposal_id: U256,
    ) -> Result<U256, QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::SessionNotFound(SessionNotFound {}));
        }

        Ok(session.votes_per_proposal.get(voter).get(proposal_id))
    }

    /// Get all proposals in a session
    pub fn get_session_proposals(
        &self,
        session_id: U256,
    ) -> Result<Vec<(U256, String, String, U256)>, QuadraticVotingError> {
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

impl QuadraticVoting {
    /// Helper functions

    /// Add multiple proposals to a session
    fn add_proposals_to_session(
        &mut self,
        session_id: U256,
        proposals: Vec<(String, String)>,
    ) -> Result<(), QuadraticVotingError> {
        for (title, description) in proposals {
            let proposal_id = self.sessions.getter(session_id).proposal_count.get() + U256::from(1);

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
                .set(U256::ZERO);

            // Update proposal count
            self.sessions
                .setter(session_id)
                .proposal_count
                .set(proposal_id);

            // Emit ProposalCreated event
            log(
                self.vm(),
                ProposalCreated {
                    session_id,
                    proposal_id,
                    creator: self.vm().msg_sender(),
                    title,
                },
            );
        }
        Ok(())
    }
}
