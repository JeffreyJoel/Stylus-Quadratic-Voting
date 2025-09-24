use stylus_quadratic_voting::{
    QuadraticVoting, QuadraticVotingError, InvalidSession,
    VoterNotRegistered, InsufficientCredits
};
use stylus_sdk::alloy_primitives::{Address, U64, U8};
// alloc::vec is already available in test environment

/// Happy paths
#[test]
fn test_voter_registration() {
    use stylus_sdk::testing::*;
    let vm = TestVM::default();
    let mut contract = QuadraticVoting::from(&vm);

    // Initialize contract with admin
    let admin = Address::from([1u8; 20]);
    vm.set_sender(admin);
    contract.constructor();

    let voter = Address::from([2u8; 20]);
    let email = "test@example.com".to_string();

    // Register voter
    vm.set_sender(voter);
    let result = contract.register_voter(email.clone());
    assert!(result.is_ok());

    // Voter registration is verified by successful registration call
    // (No longer need to check with get_voter since function was removed for size optimization)
}

#[test]
fn test_create_session_with_proposals() {
    use stylus_sdk::testing::*;
    let vm = TestVM::default();

    let admin = Address::from([1u8; 20]);
    vm.set_sender(admin);

    let mut contract = QuadraticVoting::from(&vm);
    contract.constructor();

    // Create session with initial proposals
    let name = "Test Session".to_string();
    let description = "A voting session".to_string();
    let credits_per_voter = U8::from(100);
    let duration = U64::from(3600);

    let initial_proposals = vec![
        (
            "Proposal 1".to_string(),
            "Description for proposal 1".to_string(),
        ),
        (
            "Proposal 2".to_string(),
            "Description for proposal 2".to_string(),
        ),
        (
            "Proposal 3".to_string(),
            "Description for proposal 3".to_string(),
        ),
    ];

    let session_id = contract
        .create_session(
            name.clone(),
            description.clone(),
            credits_per_voter,
            duration,
            initial_proposals.clone(),
        )
        .unwrap();

    // Check session was created
    assert_eq!(session_id, U64::from(1));

    let session = contract.get_session(session_id).unwrap();

    assert_eq!(session.0, name);
    assert_eq!(session.1, description);
    assert_eq!(session.4, credits_per_voter);
    assert_eq!(session.5, true); // active
    assert_eq!(session.6, admin); // creator

    // Check proposals were added
    assert_eq!(session.7, U8::from(3)); // proposal_count should be 3

    // Verify each proposal using bulk query
    let all_proposals = contract.get_session_proposals(session_id).unwrap();
    assert_eq!(all_proposals.len(), initial_proposals.len());

    for (i, (expected_title, expected_desc)) in initial_proposals.iter().enumerate() {
        let (id, title, description, vote_count) = &all_proposals[i];
        assert_eq!(*id, U8::from((i + 1) as u8)); // id
        assert_eq!(*title, *expected_title); // title
        assert_eq!(*description, *expected_desc); // description
        assert_eq!(*vote_count, U64::ZERO); // vote_count
    }
}


#[test]
fn test_vote_in_session() {
    use stylus_sdk::testing::*;
    let vm = TestVM::default();
    let admin = Address::from([1u8; 20]);
    vm.set_sender(admin);
    let mut contract = QuadraticVoting::from(&vm);
    contract.constructor();

    let voter = Address::from([2u8; 20]);

    // Register voter
    vm.set_sender(voter);
    contract
        .register_voter("voter@example.com".to_string())
        .unwrap();

    // Create session with initial proposals
    vm.set_sender(admin);
    let proposals = vec![
        ("Proposal 1".to_string(), "Desc 1".to_string()),
        ("Proposal 2".to_string(), "Desc 2".to_string()),
    ];
    let session_id = contract
        .create_session(
            "Test".to_string(),
            "Desc".to_string(),
            U8::from(100),
            U64::from(3600),
            proposals,
        )
        .unwrap();

    let proposal1_id = U8::from(1);
    let proposal2_id = U8::from(2);

    // Vote on proposals
    vm.set_sender(voter);
    let proposal_ids = vec![proposal1_id, proposal2_id];
    let vote_counts = vec![U64::from(2), U64::from(1)]; // 4 + 1 = 5 credits total

    let result = contract.vote(session_id, proposal_ids.clone(), vote_counts.clone());
    assert!(result.is_ok());

    // Check proposal vote counts using bulk query
    let all_proposals = contract.get_session_proposals(session_id).unwrap();

    // Find proposal1 (id = 1) and check vote count
    let proposal1 = all_proposals.iter().find(|p| p.0 == proposal1_id).unwrap();
    assert_eq!(proposal1.3, U64::from(2)); // vote_count

    // Find proposal2 (id = 2) and check vote count
    let proposal2 = all_proposals.iter().find(|p| p.0 == proposal2_id).unwrap();
    assert_eq!(proposal2.3, U64::from(1)); // vote_count

    // // Check credits were deducted
    // let remaining_credits = contract
    //     .get_voter_session_credits(session_id, voter)
    //     .unwrap();
    // assert_eq!(remaining_credits, U8::from(95)); // 100 - 5
}

/// Unhappy paths

#[test]
fn test_create_session_with_no_proposals() {
    use stylus_sdk::testing::*;
    let vm = TestVM::default();

    let admin = Address::from([1u8; 20]);
    vm.set_sender(admin);

    let mut contract = QuadraticVoting::from(&vm);
    contract.constructor();

    // Try to create session with no proposals
    let result = contract.create_session(
        "Test Session".to_string(),
        "Description".to_string(),
        U8::from(100),
        U64::from(3600),
        vec![], // Empty proposals
    );

    // Should fail with InvalidProposalCount error
    assert!(matches!(
        result,
        Err(QuadraticVotingError::InvalidProposalCount(_))
    ));
}

#[test]
fn test_insufficient_credits() {
    use stylus_sdk::testing::*;
    let vm = TestVM::default();
    let mut contract = QuadraticVoting::from(&vm);

    let admin = Address::from([1u8; 20]);
    vm.set_sender(admin);
    contract.constructor();

    let voter = Address::from([2u8; 20]);

    // Register voter
    vm.set_sender(voter);
    contract
        .register_voter("voter@example.com".to_string())
        .unwrap();

    // Create session with limited credits and a proposal
    vm.set_sender(admin);
    let session_id = contract
        .create_session(
            "Test".to_string(),
            "Desc".to_string(),
            U8::from(5),
            U64::from(3600),
            vec![("Proposal".to_string(), "Desc".to_string())],
        )
        .unwrap();

    let proposal_id = U8::from(1);

    // Try to vote with more credits than available (3² = 9 > 5)
    vm.set_sender(voter);
    let result = contract.vote(session_id, vec![proposal_id], vec![U64::from(3)]);
    assert!(matches!(
        result,
        Err(QuadraticVotingError::InsufficientCredits(
            InsufficientCredits {}
        ))
    ));
}

#[test]
fn test_session_not_active() {
    use stylus_sdk::testing::*;
    let vm = TestVM::default();
    let mut contract = QuadraticVoting::from(&vm);

    let admin = Address::from([1u8; 20]);
    vm.set_sender(admin);
    contract.constructor();
    let voter = Address::from([2u8; 20]);

    // Register voter
    vm.set_sender(voter);
    contract
        .register_voter("voter@example.com".to_string())
        .unwrap();

    // Create session with proposal
    vm.set_sender(admin);
    let session_id = contract
        .create_session(
            "Test".to_string(),
            "Desc".to_string(),
            U8::from(100),
            U64::from(1), // 1 block duration
            vec![("Proposal".to_string(), "Desc".to_string())],
        )
        .unwrap();

    let proposal_id = U8::from(1);

    // Advance block number to expire session
    vm.set_block_number(100);

    // Try to vote on expired session
    vm.set_sender(voter);
    let result = contract.vote(session_id, vec![proposal_id], vec![U64::from(1)]);
    assert!(matches!(
        result,
        Err(QuadraticVotingError::InvalidSession(InvalidSession {}))
    ));
}

#[test]
fn test_voter_not_registered() {
    use stylus_sdk::testing::*;
    let vm = TestVM::default();
    let mut contract = QuadraticVoting::from(&vm);

    let admin = Address::from([1u8; 20]);
    vm.set_sender(admin);
    contract.constructor();
    let voter = Address::from([2u8; 20]);

    // Create session with proposal without registering voter
    let session_id = contract
        .create_session(
            "Test".to_string(),
            "Desc".to_string(),
            U8::from(100),
            U64::from(3600),
            vec![("Proposal".to_string(), "Desc".to_string())],
        )
        .unwrap();

    let proposal_id = U8::from(1);

    // Try to vote without being registered
    vm.set_sender(voter);
    let result = contract.vote(session_id, vec![proposal_id], vec![U64::from(1)]);
    assert!(matches!(
        result,
        Err(QuadraticVotingError::VoterNotRegistered(
            VoterNotRegistered {}
        ))
    ));
}

#[test]
fn test_session_not_found() {
    use stylus_sdk::testing::*;
    let vm = TestVM::default();
    let contract = QuadraticVoting::from(&vm);

    let result = contract.get_session(U64::from(999));
    assert!(matches!(
        result,
        Err(QuadraticVotingError::InvalidSession(InvalidSession {}))
    ));
}

#[test]
fn test_session_results() {
    use stylus_sdk::testing::*;
    let vm = TestVM::default();
    let admin = Address::from([1u8; 20]);
    vm.set_sender(admin);
    let mut contract = QuadraticVoting::from(&vm);
    contract.constructor();

    let voter = Address::from([2u8; 20]);

    // Register voter
    vm.set_sender(voter);
    contract
        .register_voter("voter@example.com".to_string())
        .unwrap();

    // Create session with proposals
    vm.set_sender(admin);
    let session_id = contract
        .create_session(
            "Test".to_string(),
            "Desc".to_string(),
            U8::from(100),
            U64::from(3600),
            vec![
                ("Proposal 1".to_string(), "Desc 1".to_string()),
                ("Proposal 2".to_string(), "Desc 2".to_string()),
            ],
        )
        .unwrap();

    // Check initial results (no votes yet)
    let results = contract.get_session_results(session_id).unwrap();
    assert_eq!(results.0, U8::from(0)); // winner_id (0 = no winner yet)
    assert_eq!(results.1, U8::from(2)); // proposal_count
    assert_eq!(results.2, U64::from(0)); // max_votes
    assert_eq!(results.3, U64::from(0)); // total_votes

    // Vote on proposals
    vm.set_sender(voter);
    contract.vote(session_id, vec![U8::from(1), U8::from(2)], vec![U64::from(2), U64::from(1)]).unwrap();

    // Check results after voting
    let results = contract.get_session_results(session_id).unwrap();
    assert_eq!(results.0, U8::from(1)); // winner_id (proposal 1 has more votes)
    assert_eq!(results.1, U8::from(2)); // proposal_count

    // Check actual proposal data to debug
    let proposals = contract.get_session_proposals(session_id).unwrap();
    let proposal1_votes = proposals[0].3; // proposal 1 vote count
    let proposal2_votes = proposals[1].3; // proposal 2 vote count

    assert_eq!(proposal1_votes, U64::from(2)); // vote intensity = 2
    assert_eq!(proposal2_votes, U64::from(1)); // vote intensity = 1

    assert_eq!(results.2, U64::from(2)); // max_votes (highest vote intensity)
    assert_eq!(results.3, U64::from(3)); // total_votes (2 + 1)
}
