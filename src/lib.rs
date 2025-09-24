//!
//! Quadratic Voting Contract for Arbitrum Stylus
//!
//! This contract implements quadratic voting where the cost of votes increases quadratically,
//! preventing plutocratic outcomes by making additional votes increasingly expensive.
//!
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

extern crate alloc;

use alloc::{string::String, vec::Vec, vec};
use stylus_sdk::{
    alloy_primitives::{Address, U256, U64, U8, B256},
    alloy_sol_types::sol,
    prelude::*,
};

// Constants to limit loop iterations and prevent contract bloat
const MAX_PROPOSALS_PER_SESSION: u8 = 10;
const MAX_VOTES_PER_TRANSACTION: usize = 5;

// ------------------------------------------------------------
// Helper conversions between Rust `&str` and fixed-length `B256`
// ------------------------------------------------------------
fn to_b256(s: &str) -> B256 {
    let mut bytes = [0u8; 32];
    let slice = s.as_bytes();
    let len = core::cmp::min(slice.len(), 32);
    bytes[..len].copy_from_slice(&slice[..len]);
    B256::from(bytes)
}

fn from_b256(b: B256) -> String {
    let arr: [u8; 32] = b.into();
    // Find the first 0 byte (padding) or fall back to full length
    let len = arr.iter().position(|&c| c == 0).unwrap_or(32);
    String::from_utf8_lossy(&arr[..len]).into_owned()
}

sol! {
    #[derive(Debug)]
    error InvalidSession();
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
    error InvalidProposalCount();

    event SessionCreated(uint64 indexed id, address indexed creator, bytes32 name);
    event VoterRegistered(address indexed voter, bytes32 email);
    
    event VoteCast(uint64 indexed session_id, address indexed voter, uint64 total_credits_spent);
}

#[derive(SolidityError, Debug)]
pub enum QuadraticVotingError {
    InvalidSession(InvalidSession),
    ProposalNotFound(ProposalNotFound),
    VoterNotRegistered(VoterNotRegistered),
    InsufficientCredits(InsufficientCredits),
    InvalidVoteCount(InvalidVoteCount),
    Unauthorized(Unauthorized),
    InvalidProposalCount(InvalidProposalCount),
}

sol_storage! {
    pub struct Proposal {
        bytes32 title;
        bytes32 description;
        uint64 vote_count;
    }
    pub struct Voter {
        bytes32 email;
        bool is_registered;
    }

    pub struct VotingSession {
        bytes32 name;
        bytes32 description;
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

        self.voters.setter(caller).email.set(to_b256(&email));
        self.voters.setter(caller).is_registered.set(true);

        // Emit VoterRegistered event
        log(
            self.vm(),
            VoterRegistered {
                voter: caller,
                email: to_b256(&email),
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
        self.sessions.setter(session_id).name.set(to_b256(&name));
        self.sessions
            .setter(session_id)
            .description
            .set(to_b256(&description));
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
                name: to_b256(&name),
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
            return Err(QuadraticVotingError::InvalidSession(InvalidSession {}));
        }

        Ok((
            from_b256(session.name.get()),
            from_b256(session.description.get()),
            session.start_time.get(),
            session.end_time.get(),
            session.credits_per_voter.get(),
            session.active.get(),
            session.creator.get(),
            session.proposal_count.get(),
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

        // Validate inputs and read session data
        if proposal_ids.len() > MAX_VOTES_PER_TRANSACTION {
            return Err(QuadraticVotingError::InvalidVoteCount(InvalidVoteCount {}));
        }
        if proposal_ids.len() != vote_counts.len() {
            return Err(QuadraticVotingError::InvalidVoteCount(InvalidVoteCount {}));
        }
        if !self.voters.get(caller).is_registered.get() {
            return Err(QuadraticVotingError::VoterNotRegistered(VoterNotRegistered {}));
        }

        let session_data = self.sessions.get(session_id);
        if session_data.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::InvalidSession(InvalidSession {}));
        }
        if !session_data.active.get() {
            return Err(QuadraticVotingError::InvalidSession(InvalidSession {}));
        }
        let current_block = U256::from(self.vm().block_number());
        if current_block >= session_data.end_time.get() {
            return Err(QuadraticVotingError::InvalidSession(InvalidSession {}));
        }

        // Calculate total quadratic cost and validate credits in one pass
        let mut total_credits_needed = U64::ZERO;
        for &vote_count in vote_counts.iter() {
            let cost = vote_count.saturating_mul(vote_count); // x^2 using saturating arithmetic
            total_credits_needed = total_credits_needed.saturating_add(cost);
        }

        // Get and validate voter credits (optimized)
        let mut voter_credits = session_data.voter_credits.get(caller);
        if voter_credits == U8::ZERO {
            voter_credits = session_data.credits_per_voter.get();
        }
        let credits_needed_u8 = U8::from(total_credits_needed.as_limbs()[0]);
        if voter_credits < credits_needed_u8 {
            return Err(QuadraticVotingError::InsufficientCredits(InsufficientCredits {}));
        }

        // Process all votes in a single pass (optimized)
        // Pre-calculate all vote updates to avoid borrowing conflicts
        let mut vote_updates = Vec::new();
        for (i, &proposal_id) in proposal_ids.iter().enumerate() {
            let vote_count = vote_counts[i];

            // Read current state
            let current_votes = session_data.votes_per_proposal.get(caller).get(proposal_id);
            let current_proposal_votes = session_data.proposals.get(proposal_id).vote_count.get();

            // Calculate new values
            let new_votes = vote_count;
            let new_proposal_votes = current_proposal_votes
                .saturating_sub(current_votes)
                .saturating_add(new_votes);

            vote_updates.push((proposal_id, new_votes, new_proposal_votes));
        }

        // Apply all updates (no more session_data borrows)
        for (proposal_id, new_votes, new_proposal_votes) in vote_updates {
            // Update proposal vote count
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

        // Update voter credits (single operation)
        let new_remaining_credits = voter_credits.saturating_sub(credits_needed_u8);
        self.sessions
            .setter(session_id)
            .voter_credits
            .setter(caller)
            .set(new_remaining_credits);

        // Emit event
        log(
            self.vm(),
            VoteCast {
                session_id: session_id.as_limbs()[0],
                voter: caller,
                total_credits_spent: total_credits_needed.as_limbs()[0],
            },
        );

        Ok(())
    }


    /// Get session voting results summary
    pub fn get_session_results(
        &self,
        session_id: U64,
    ) -> Result<(U8, U8, U64, U64), QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::InvalidSession(InvalidSession {}));
        }

        let proposal_count = session.proposal_count.get();
        let mut total_votes = U64::ZERO;
        let mut winner_id = U8::ZERO;
        let mut max_votes = U64::ZERO;

        // Find winner and total votes
        for i in 1..=proposal_count.as_limbs()[0] {
            let proposal_id = U8::from(i);
            let proposal = session.proposals.get(proposal_id);
            let vote_count = proposal.vote_count.get();

            total_votes = total_votes.saturating_add(vote_count);

            if vote_count > max_votes {
                max_votes = vote_count;
                winner_id = proposal_id;
            }
        }

        Ok((winner_id, proposal_count, max_votes, total_votes))
    }

    /// Get all proposals in a session (efficient bulk query)
    pub fn get_session_proposals(
        &self,
        session_id: U64,
    ) -> Result<Vec<(U8, String, String, U64)>, QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::InvalidSession(InvalidSession {}));
        }

        let proposal_count = session.proposal_count.get();

        // Apply our constant limit efficiently
        let limit = if proposal_count > U8::from(MAX_PROPOSALS_PER_SESSION) {
            U8::from(MAX_PROPOSALS_PER_SESSION)
        } else {
            proposal_count
        };

        // Pre-allocate vector to avoid reallocations
        let mut proposals = Vec::with_capacity(limit.as_limbs()[0] as usize);

        // Iterate only through existing proposals (1 to proposal_count)
        for i in 1..=limit.as_limbs()[0] {
            let id = U8::from(i);
            let proposal = session.proposals.get(id);

            // Direct push without redundant empty check (proposals are created sequentially)
            proposals.push((
                id,
                from_b256(proposal.title.get()),
                from_b256(proposal.description.get()),
                proposal.vote_count.get(),
            ));
        }

        Ok(proposals)
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
        // Limit number of proposals that can be added
        if proposals.len() > MAX_PROPOSALS_PER_SESSION as usize {
            return Err(QuadraticVotingError::InvalidProposalCount(InvalidProposalCount {}));
        }

        for (title, description) in proposals {
            let proposal_id = self.sessions.getter(session_id).proposal_count.get() + U8::from(1);

            // Store proposal in session
            self.sessions
                .setter(session_id)
                .proposals
                .setter(proposal_id)
                .title
                .set(to_b256(&title));
            self.sessions
                .setter(session_id)
                .proposals
                .setter(proposal_id)
                .description
                .set(to_b256(&description));
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
        }
        Ok(())
    }



}
