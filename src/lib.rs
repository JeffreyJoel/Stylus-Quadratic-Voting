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
    /// @notice Initialize the contract with admin privileges
    /// @dev Sets the contract deployer as admin and initializes session counter
    #[constructor]
    pub fn constructor(&mut self) {
        let admin = self.vm().msg_sender();
        self.admin.set(admin);
        self.session_counter.set(U64::ZERO);
    }

    /// @notice Register a voter with their email address
    /// @dev Registers a new voter if they haven't registered before
    /// @param email The voter's email address (stored as bytes32)
    /// @return Result indicating success or specific error
    pub fn register_voter(&mut self, email: String) -> Result<(), QuadraticVotingError> {
        let caller = self.vm().msg_sender();

        if self.voters.get(caller).is_registered.get() {
            return Err(QuadraticVotingError::Unauthorized(Unauthorized {}));
        }

        self.voters.setter(caller).email.set(to_b256(&email));
        self.voters.setter(caller).is_registered.set(true);

        log(
            self.vm(),
            VoterRegistered {
                voter: caller,
                email: to_b256(&email),
            },
        );

        Ok(())
    }

    /// @notice Create a new voting session with proposals
    /// @dev Only admin can create sessions. Initializes session storage and adds proposals
    /// @param name Session name (stored as bytes32)
    /// @param description Session description (stored as bytes32)
    /// @param credits_per_voter Base credits allocated to each voter for this session
    /// @param duration_seconds How long the session will remain active
    /// @param initial_proposals Array of (title, description) pairs for proposals
    /// @return The unique session ID assigned to this session
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

        log(
            self.vm(),
            SessionCreated {
                id: session_id.as_limbs()[0],
                creator: caller,
                name: to_b256(&name),
            },
        );

        self.add_proposals_to_session(session_id, initial_proposals)?;

        Ok(session_id)
    }

    /// @notice Get comprehensive session details
    /// @dev Returns all session metadata including timing, credits, and proposal count
    /// @param session_id The session to query
    /// @return Tuple containing (name, description, start_time, end_time, credits_per_voter, active, creator, proposal_count)
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


    /// @notice Cast votes for multiple proposals using quadratic voting
    /// @dev Implements quadratic cost voting where vote_cost = vote_intensity²
    /// @param session_id The session to vote in
    /// @param proposal_ids Array of proposal IDs to vote for
    /// @param vote_counts Corresponding vote intensities (cost = intensity²)
    /// @return Result indicating success or specific error
    pub fn vote(
        &mut self,
        session_id: U64,
        proposal_ids: Vec<U8>,
        vote_counts: Vec<U64>,
    ) -> Result<(), QuadraticVotingError> {
        let caller = self.vm().msg_sender();

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

        let mut total_credits_needed = U64::ZERO;
        for &vote_count in vote_counts.iter() {
            let cost = vote_count.saturating_mul(vote_count);
            total_credits_needed = total_credits_needed.saturating_add(cost);
        }

        let mut voter_credits = session_data.voter_credits.get(caller);
        if voter_credits == U8::ZERO {
            voter_credits = session_data.credits_per_voter.get();
        }
        let credits_needed_u8 = U8::from(total_credits_needed.as_limbs()[0]);
        if voter_credits < credits_needed_u8 {
            return Err(QuadraticVotingError::InsufficientCredits(InsufficientCredits {}));
        }

        let mut vote_updates = Vec::new();
        for (i, &proposal_id) in proposal_ids.iter().enumerate() {
            let vote_count = vote_counts[i];

            let current_votes = session_data.votes_per_proposal.get(caller).get(proposal_id);
            let current_proposal_votes = session_data.proposals.get(proposal_id).vote_count.get();

            let new_votes = vote_count;
            let new_proposal_votes = current_proposal_votes
                .saturating_sub(current_votes)
                .saturating_add(new_votes);

            vote_updates.push((proposal_id, new_votes, new_proposal_votes));
        }

        for (proposal_id, new_votes, new_proposal_votes) in vote_updates {
            self.sessions
                .setter(session_id)
                .proposals
                .setter(proposal_id)
                .vote_count
                .set(new_proposal_votes);

            self.sessions
                .setter(session_id)
                .votes_per_proposal
                .setter(caller)
                .setter(proposal_id)
                .set(new_votes);
        }

        let new_remaining_credits = voter_credits.saturating_sub(credits_needed_u8);
        self.sessions
            .setter(session_id)
            .voter_credits
            .setter(caller)
            .set(new_remaining_credits);

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


    /// @notice Get voting results summary for a session
    /// @dev Returns winner ID, proposal count, max votes, and total votes across all proposals
    /// @param session_id The session to get results for
    /// @return Tuple containing (winner_proposal_id, total_proposals, max_votes_received, total_votes_cast)
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

    /// @notice Get all proposals in a session with their current vote counts
    /// @dev Returns detailed information for all proposals, limited to MAX_PROPOSALS_PER_SESSION
    /// @param session_id The session to query
    /// @return Array of tuples containing (proposal_id, title, description, current_vote_count)
    pub fn get_session_proposals(
        &self,
        session_id: U64,
    ) -> Result<Vec<(U8, String, String, U64)>, QuadraticVotingError> {
        let session = self.sessions.get(session_id);
        if session.creator.get() == Address::ZERO {
            return Err(QuadraticVotingError::InvalidSession(InvalidSession {}));
        }

        let proposal_count = session.proposal_count.get();

        let limit = if proposal_count > U8::from(MAX_PROPOSALS_PER_SESSION) {
            U8::from(MAX_PROPOSALS_PER_SESSION)
        } else {
            proposal_count
        };

        let mut proposals = Vec::with_capacity(limit.as_limbs()[0] as usize);

        for i in 1..=limit.as_limbs()[0] {
            let id = U8::from(i);
            let proposal = session.proposals.get(id);

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
    /// @dev Internal helper to add proposals to a newly created session
    /// @param session_id The session to add proposals to
    /// @param proposals Array of (title, description) tuples
    fn add_proposals_to_session(
        &mut self,
        session_id: U64,
        proposals: Vec<(String, String)>,
    ) -> Result<(), QuadraticVotingError> {
        if proposals.len() > MAX_PROPOSALS_PER_SESSION as usize {
            return Err(QuadraticVotingError::InvalidProposalCount(InvalidProposalCount {}));
        }

        for (title, description) in proposals {
            let proposal_id = self.sessions.getter(session_id).proposal_count.get() + U8::from(1);

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

            self.sessions
                .setter(session_id)
                .proposal_count
                .set(proposal_id);
        }
        Ok(())
    }



}
