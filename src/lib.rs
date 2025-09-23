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

/// Import items from the SDK. The prelude contains common traits and macros.
use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::sol,
    prelude::*,
};

sol! {
    #[derive(Debug)]
    error ProposalNotFound();
    #[derive(Debug)]
    error ProposalExpired();
    #[derive(Debug)]
    error InsufficientCredits();
    #[derive(Debug)]
    error InvalidVoteCount();
    #[derive(Debug)]
    error Unauthorized();
    #[derive(Debug)]
    error ProposalAlreadyExecuted();
    #[derive(Debug)]
    error ArithmeticOverflow();

    event ProposalCreated(uint256 indexed id, address indexed creator, string title);
    event CreditsDistributed(address indexed voter, uint256 amount);
    event VoteCast(address indexed voter, uint256 indexed proposal_id, uint64 votes_for, uint64 votes_against, uint256 credits_spent);
    event VotingDurationChanged(uint256 old_duration, uint256 new_duration);
}

#[derive(SolidityError, Debug)]
pub enum QuadraticVotingError {
    ProposalNotFound(ProposalNotFound),
    ProposalExpired(ProposalExpired),
    InsufficientCredits(InsufficientCredits),
    InvalidVoteCount(InvalidVoteCount),
    Unauthorized(Unauthorized),
    ProposalAlreadyExecuted(ProposalAlreadyExecuted),
    ArithmeticOverflow(ArithmeticOverflow),
}


sol_storage! {
    #[entrypoint]
    pub struct QuadraticVoting {
        // Proposals storage - proposal_id => individual fields
        mapping(uint256 => uint256) proposal_id;
        // Skip title and description for now
        mapping(uint256 => address) proposal_creator;
        mapping(uint256 => uint256) proposal_created_at;
        mapping(uint256 => uint256) proposal_voting_ends_at;
        mapping(uint256 => uint256) proposal_total_votes_for;
        mapping(uint256 => uint256) proposal_total_votes_against;
        mapping(uint256 => bool) proposal_executed;
        // Votes storage - (voter, proposal_id) => individual fields
        mapping(address => mapping(uint256 => address)) vote_voter;
        mapping(address => mapping(uint256 => uint256)) vote_proposal_id;
        mapping(address => mapping(uint256 => uint256)) vote_votes_for;
        mapping(address => mapping(uint256 => uint256)) vote_votes_against;
        mapping(address => mapping(uint256 => uint256)) vote_credits_spent;
        // Voter credits - voter_address => individual fields
        mapping(address => address) voter_credits_addr;
        mapping(address => uint256) voter_credits_total;
        mapping(address => uint256) voter_credits_spent;
        mapping(address => uint256) voter_credits_remaining;
        // Contract state
        uint256 proposal_counter;
        address admin;
        uint256 voting_duration; // in blocks
    }
}



#[public]
impl QuadraticVoting {
    /// Initialize the contract with admin, default credits, and voting duration
    pub fn initialize(
        &mut self,
        default_credits: U256,
        voting_duration: U256,
    ) -> Result<(), QuadraticVotingError> {
        // Only allow initialization once
        if !self.admin.get().is_zero() {
            return Err(QuadraticVotingError::Unauthorized(Unauthorized {}));
        }

        let admin = self.vm().msg_sender();

        self.admin.set(admin);
        self.voting_duration.set(voting_duration);
        self.proposal_counter.set(U256::ZERO);

        // Initialize admin with credits
        self.voter_credits_addr.setter(admin).set(admin);
        self.voter_credits_total.setter(admin).set(default_credits);
        self.voter_credits_spent.setter(admin).set(U256::ZERO);
        self.voter_credits_remaining
            .setter(admin)
            .set(default_credits);

        Ok(())
    }

    /// Distribute credits to voters (admin only)
    pub fn distribute_credits(
        &mut self,
        voters: Vec<Address>,
        amounts: Vec<U256>,
    ) -> Result<(), QuadraticVotingError> {
        let caller = self.vm().msg_sender();
        if caller != self.admin.get() {
            return Err(QuadraticVotingError::Unauthorized(Unauthorized {}));
        }

        if voters.len() != amounts.len() {
            return Err(QuadraticVotingError::InvalidVoteCount(InvalidVoteCount {}));
        }

        for (voter, amount) in voters.iter().zip(amounts.iter()) {
            let existing_total = self.voter_credits_total.get(*voter);
            let existing_remaining = self.voter_credits_remaining.get(*voter);

            let new_total = existing_total.saturating_add(*amount);
            let new_remaining = existing_remaining.saturating_add(*amount);

            self.voter_credits_addr.setter(*voter).set(*voter);
            self.voter_credits_total.setter(*voter).set(new_total);
            self.voter_credits_remaining
                .setter(*voter)
                .set(new_remaining);
            // spent_credits remains unchanged

            // Emit CreditsDistributed event
            log(
                self.vm(),
                CreditsDistributed {
                    voter: *voter,
                    amount: *amount,
                },
            );
        }

        Ok(())
    }

    /// Set voting duration for new proposals (admin only)
    pub fn set_voting_duration(&mut self, duration: U256) -> Result<(), QuadraticVotingError> {
        let caller = self.vm().msg_sender();
        if caller != self.admin.get() {
            return Err(QuadraticVotingError::Unauthorized(Unauthorized {}));
        }

        let old_duration = self.voting_duration.get();
        self.voting_duration.set(duration);

        // Emit VotingDurationChanged event
        log(
            self.vm(),
            VotingDurationChanged {
                old_duration,
                new_duration: duration,
            },
        );

        Ok(())
    }

    /// Create a new proposal
    pub fn create_proposal(
        &mut self,
        title: String,
        _description: String,
    ) -> Result<U256, QuadraticVotingError> {
        // For now, we'll skip storing title and description to avoid string storage complexity
        // In a real implementation, you'd need to handle string storage properly
        let caller = self.vm().msg_sender();
        let current_block = U256::from(self.vm().block_number());
        let proposal_id = self.proposal_counter.get() + U256::from(1);
        let voting_ends_at = current_block + self.voting_duration.get();

        self.proposal_id.setter(proposal_id).set(proposal_id);
        // Skip title and description for now
        self.proposal_creator.setter(proposal_id).set(caller);
        self.proposal_created_at
            .setter(proposal_id)
            .set(current_block);
        self.proposal_voting_ends_at
            .setter(proposal_id)
            .set(voting_ends_at);
        self.proposal_total_votes_for
            .setter(proposal_id)
            .set(U256::ZERO);
        self.proposal_total_votes_against
            .setter(proposal_id)
            .set(U256::ZERO);
        self.proposal_executed.setter(proposal_id).set(false);
        self.proposal_counter.set(proposal_id);

        // Emit ProposalCreated event
        log(
            self.vm(),
            ProposalCreated {
                id: proposal_id,
                creator: caller,
                title: title.clone(),
            },
        );

        Ok(proposal_id)
    }

    /// Get proposal details
    pub fn get_proposal(
        &self,
        id: U256,
    ) -> Result<(U256, Address, U256, U256, U256, U256, bool), QuadraticVotingError> {
        let proposal_id = self.proposal_id.get(id);
        if proposal_id == U256::ZERO {
            return Err(QuadraticVotingError::ProposalNotFound(ProposalNotFound {}));
        }

        Ok((
            self.proposal_id.get(id),
            self.proposal_creator.get(id),
            self.proposal_created_at.get(id),
            self.proposal_voting_ends_at.get(id),
            self.proposal_total_votes_for.get(id),
            self.proposal_total_votes_against.get(id),
            self.proposal_executed.get(id),
        ))
    }

    /// Get all proposals (limited to prevent gas issues)
    pub fn get_all_proposals(&self) -> Vec<(U256, Address, U256, U256, U256, U256, bool)> {
        let mut proposals = Vec::new();
        let counter = self.proposal_counter.get();

        // Limit to first 100 proposals for gas efficiency
        let limit = if counter > U256::from(100) {
            U256::from(100)
        } else {
            counter
        };

        for i in 1..=limit.as_limbs()[0] {
            let id = U256::from(i);
            let proposal_id = self.proposal_id.get(id);
            if proposal_id != U256::ZERO {
                proposals.push((
                    self.proposal_id.get(id),
                    self.proposal_creator.get(id),
                    self.proposal_created_at.get(id),
                    self.proposal_voting_ends_at.get(id),
                    self.proposal_total_votes_for.get(id),
                    self.proposal_total_votes_against.get(id),
                    self.proposal_executed.get(id),
                ));
            }
        }

        proposals
    }

    /// Cast a vote on a proposal
    pub fn vote(
        &mut self,
        proposal_id: U256,
        votes_for: u64,
        votes_against: u64,
    ) -> Result<(), QuadraticVotingError> {
        let caller = self.vm().msg_sender();
        let current_block = U256::from(self.vm().block_number());

        // Validate proposal exists and is active
        let proposal_id_check = self.proposal_id.get(proposal_id);
        if proposal_id_check == U256::ZERO {
            return Err(QuadraticVotingError::ProposalNotFound(ProposalNotFound {}));
        }
        let voting_ends_at = self.proposal_voting_ends_at.get(proposal_id);
        if current_block >= voting_ends_at {
            return Err(QuadraticVotingError::ProposalExpired(ProposalExpired {}));
        }

        // Calculate quadratic cost
        let credits_needed = self.calculate_vote_cost(votes_for, votes_against)?;

        // Get existing vote to calculate credit refund
        let existing_credits_spent = self.vote_credits_spent.get(caller).get(proposal_id);
        let existing_votes_for = self.vote_votes_for.get(caller).get(proposal_id);
        let existing_votes_against = self.vote_votes_against.get(caller).get(proposal_id);

        // Check voter has sufficient credits
        let voter_remaining = self.voter_credits_remaining.get(caller);
        if voter_remaining < credits_needed {
            return Err(QuadraticVotingError::InsufficientCredits(
                InsufficientCredits {},
            ));
        }

        // Update voter credits
        let voter_spent = self.voter_credits_spent.get(caller);
        let voter_total = self.voter_credits_total.get(caller);
        let new_spent = voter_spent
            .saturating_sub(existing_credits_spent)
            .saturating_add(credits_needed);
        let new_remaining = voter_total.saturating_sub(new_spent);

        self.voter_credits_spent.setter(caller).set(new_spent);
        self.voter_credits_remaining
            .setter(caller)
            .set(new_remaining);

        // Update proposal totals (subtract old vote, add new vote)
        let current_for = self.proposal_total_votes_for.get(proposal_id);
        let current_against = self.proposal_total_votes_against.get(proposal_id);

        let new_for = current_for
            .saturating_sub(U256::from(existing_votes_for))
            .saturating_add(U256::from(votes_for));
        let new_against = current_against
            .saturating_sub(U256::from(existing_votes_against))
            .saturating_add(U256::from(votes_against));

        self.proposal_total_votes_for
            .setter(proposal_id)
            .set(new_for);
        self.proposal_total_votes_against
            .setter(proposal_id)
            .set(new_against);

        // Record the vote
        self.vote_voter
            .setter(caller)
            .setter(proposal_id)
            .set(caller);
        self.vote_proposal_id
            .setter(caller)
            .setter(proposal_id)
            .set(proposal_id);
        self.vote_votes_for
            .setter(caller)
            .setter(proposal_id)
            .set(U256::from(votes_for));
        self.vote_votes_against
            .setter(caller)
            .setter(proposal_id)
            .set(U256::from(votes_against));
        self.vote_credits_spent
            .setter(caller)
            .setter(proposal_id)
            .set(credits_needed);

        // Emit VoteCast event
        log(
            self.vm(),
            VoteCast {
                voter: caller,
                proposal_id,
                votes_for,
                votes_against,
                credits_spent: credits_needed,
            },
        );

        Ok(())
    }

    /// Get a voter's vote on a specific proposal
    pub fn get_vote(&self, voter: Address, proposal_id: U256) -> (Address, U256, U256, U256, U256) {
        (
            self.vote_voter.get(voter).get(proposal_id),
            self.vote_proposal_id.get(voter).get(proposal_id),
            self.vote_votes_for.get(voter).get(proposal_id),
            self.vote_votes_against.get(voter).get(proposal_id),
            self.vote_credits_spent.get(voter).get(proposal_id),
        )
    }

    /// Calculate the quadratic cost of votes (pure function)
    pub fn calculate_vote_cost(
        &self,
        votes_for: u64,
        votes_against: u64,
    ) -> Result<U256, QuadraticVotingError> {
        let for_cost = U256::from(votes_for as u128).pow(U256::from(2));
        let against_cost = U256::from(votes_against as u128).pow(U256::from(2));

        match for_cost.checked_add(against_cost) {
            Some(total_cost) => Ok(total_cost),
            None => Err(QuadraticVotingError::ArithmeticOverflow(
                ArithmeticOverflow {},
            )),
        }
    }

    /// Get voter credit information
    pub fn get_voter_credits(&self, voter: Address) -> (Address, U256, U256, U256) {
        (
            self.voter_credits_addr.get(voter),
            self.voter_credits_total.get(voter),
            self.voter_credits_spent.get(voter),
            self.voter_credits_remaining.get(voter),
        )
    }

    /// Get remaining credits for a voter
    pub fn get_remaining_credits(&self, voter: Address) -> U256 {
        self.voter_credits_remaining.get(voter)
    }

    /// Get proposal results (votes for, votes against)
    pub fn get_proposal_results(
        &self,
        proposal_id: U256,
    ) -> Result<(U256, U256), QuadraticVotingError> {
        let proposal_id_check = self.proposal_id.get(proposal_id);
        if proposal_id_check == U256::ZERO {
            return Err(QuadraticVotingError::ProposalNotFound(ProposalNotFound {}));
        }
        Ok((
            self.proposal_total_votes_for.get(proposal_id),
            self.proposal_total_votes_against.get(proposal_id),
        ))
    }

    /// Check if a proposal is still active
    pub fn is_proposal_active(&self, proposal_id: U256) -> bool {
        let proposal_id_check = self.proposal_id.get(proposal_id);
        if proposal_id_check == U256::ZERO {
            return false;
        }

        let current_block = U256::from(self.vm().block_number());
        let voting_ends_at = self.proposal_voting_ends_at.get(proposal_id);
        let executed = self.proposal_executed.get(proposal_id);

        current_block < voting_ends_at && !executed
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
        let default_credits = U256::from(1000);
        let voting_duration = U256::from(100);

        vm.set_sender(admin);

        // Initialize contract
        let result = contract.initialize(default_credits, voting_duration);
        assert!(result.is_ok());

        // Check admin was set
        assert_eq!(contract.admin.get(), admin);

        // Check voting duration was set
        assert_eq!(contract.voting_duration.get(), voting_duration);

        // Check admin has credits
        let admin_credits = contract.get_voter_credits(admin);
        assert_eq!(admin_credits.1, default_credits); // total_credits
        assert_eq!(admin_credits.3, default_credits); // remaining_credits
    }

    #[test]
    fn test_create_proposal() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        // Initialize contract first
        let admin = Address::from([1u8; 20]);
        vm.set_sender(admin);
        contract
            .initialize(U256::from(1000), U256::from(100))
            .unwrap();

        // Create a proposal
        let title = "Test Proposal".to_string();
        let description = "This is a test proposal".to_string();

        let proposal_id = contract
            .create_proposal(title.clone(), description.clone())
            .unwrap();

        // Check proposal was created
        assert_eq!(proposal_id, U256::from(1));

        let proposal = contract.get_proposal(proposal_id).unwrap();
        assert_eq!(proposal.0, proposal_id); // id
        assert_eq!(proposal.1, admin); // creator
        assert_eq!(proposal.4, U256::ZERO); // total_votes_for
        assert_eq!(proposal.5, U256::ZERO); // total_votes_against
    }

    #[test]
    fn test_calculate_vote_cost() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let contract = QuadraticVoting::from(&vm);

        // Test quadratic cost calculation
        // 1 vote for, 1 vote against: 1² + 1² = 2
        let cost = contract.calculate_vote_cost(1, 1).unwrap();
        assert_eq!(cost, U256::from(2));

        // 2 votes for, 2 votes against: 4 + 4 = 8
        let cost = contract.calculate_vote_cost(2, 2).unwrap();
        assert_eq!(cost, U256::from(8));

        // 3 votes for, 0 votes against: 9 + 0 = 9
        let cost = contract.calculate_vote_cost(3, 0).unwrap();
        assert_eq!(cost, U256::from(9));
    }

    #[test]
    fn test_vote_functionality() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        // Initialize contract
        let admin = Address::from([1u8; 20]);
        let voter = Address::from([2u8; 20]);

        vm.set_sender(admin);
        contract
            .initialize(U256::from(1000), U256::from(100))
            .unwrap();

        // Distribute credits to voter
        contract
            .distribute_credits(vec![voter], vec![U256::from(100)])
            .unwrap();

        // Create proposal
        vm.set_sender(admin);
        let proposal_id = contract
            .create_proposal("Test".to_string(), "Desc".to_string())
            .unwrap();

        // Switch to voter and cast vote
        vm.set_sender(voter);
        let result = contract.vote(proposal_id, 2, 1); // 2² + 1² = 5 credits
        assert!(result.is_ok());

        // Check vote was recorded
        let vote = contract.get_vote(voter, proposal_id);
        assert_eq!(vote.2, U256::from(2)); // votes_for
        assert_eq!(vote.3, U256::from(1)); // votes_against
        assert_eq!(vote.4, U256::from(5)); // credits_spent

        // Check proposal totals
        let (votes_for, votes_against) = contract.get_proposal_results(proposal_id).unwrap();
        assert_eq!(votes_for, U256::from(2));
        assert_eq!(votes_against, U256::from(1));

        // Check credits were deducted
        let credits = contract.get_voter_credits(voter);
        assert_eq!(credits.2, U256::from(5)); // spent_credits
        assert_eq!(credits.3, U256::from(95)); // remaining_credits
    }

    #[test]
    fn test_insufficient_credits() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        // Initialize contract
        let admin = Address::from([1u8; 20]);
        let voter = Address::from([2u8; 20]);
        vm.set_sender(admin);
        contract
            .initialize(U256::from(1000), U256::from(100))
            .unwrap();

        // Give voter only 5 credits
        contract
            .distribute_credits(vec![voter], vec![U256::from(5)])
            .unwrap();

        // Create proposal
        vm.set_sender(admin);
        let proposal_id = contract
            .create_proposal("Test".to_string(), "Desc".to_string())
            .unwrap();

        // Try to vote with 3 votes for (cost = 9 credits) - should fail
        vm.set_sender(voter);
        let result = contract.vote(proposal_id, 3, 0);
        assert!(matches!(
            result,
            Err(QuadraticVotingError::InsufficientCredits(
                InsufficientCredits {}
            ))
        ));
    }

    #[test]
    fn test_vote_update() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        // Initialize contract
        let admin = Address::from([1u8; 20]);
        let voter = Address::from([2u8; 20]);
        vm.set_sender(admin);
        contract
            .initialize(U256::from(1000), U256::from(100))
            .unwrap();

        // Give voter credits
        contract
            .distribute_credits(vec![voter], vec![U256::from(100)])
            .unwrap();

        // Create proposal
        vm.set_sender(admin);
        let proposal_id = contract
            .create_proposal("Test".to_string(), "Desc".to_string())
            .unwrap();

        // First vote: 2 for, 1 against (cost = 5)
        vm.set_sender(voter);
        contract.vote(proposal_id, 2, 1).unwrap();

        // Update vote: 1 for, 2 against (cost = 5)
        contract.vote(proposal_id, 1, 2).unwrap();

        // Check credits (should be same since costs are equal)
        let credits = contract.get_voter_credits(voter);
        assert_eq!(credits.2, U256::from(5)); // spent_credits
        assert_eq!(credits.3, U256::from(95)); // remaining_credits

        // Check proposal totals were updated
        let (votes_for, votes_against) = contract.get_proposal_results(proposal_id).unwrap();
        assert_eq!(votes_for, U256::from(1));
        assert_eq!(votes_against, U256::from(2));
    }

    #[test]
    fn test_admin_only_functions() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let mut contract = QuadraticVoting::from(&vm);

        let admin = Address::from([1u8; 20]);
        let non_admin = Address::from([2u8; 20]);
        vm.set_sender(admin);
        contract
            .initialize(U256::from(1000), U256::from(100))
            .unwrap();

        // Try to distribute credits as non-admin
        vm.set_sender(non_admin);
        let result = contract.distribute_credits(vec![non_admin], vec![U256::from(100)]);
        assert!(matches!(
            result,
            Err(QuadraticVotingError::Unauthorized(Unauthorized {}))
        ));

        // Try to set voting duration as non-admin
        let result = contract.set_voting_duration(U256::from(200));
        assert!(matches!(
            result,
            Err(QuadraticVotingError::Unauthorized(Unauthorized {}))
        ));
    }

    #[test]
    fn test_proposal_not_found() {
        use stylus_sdk::testing::*;
        let vm = TestVM::default();
        let contract = QuadraticVoting::from(&vm);

        let result = contract.get_proposal(U256::from(999));
        assert!(matches!(
            result,
            Err(QuadraticVotingError::ProposalNotFound(ProposalNotFound {}))
        ));
    }
}
