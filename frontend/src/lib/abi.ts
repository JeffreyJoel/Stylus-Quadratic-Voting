export const QUADRATIC_VOTING_ABI = [
  // Initialize the contract
  {
    type: "function",
    name: "initialize",
    inputs: [
      { name: "defaultCredits", type: "uint256" },
      { name: "votingDuration", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  // Distribute credits (admin only)
  {
    type: "function",
    name: "distribute_credits",
    inputs: [
      { name: "voters", type: "address[]" },
      { name: "amounts", type: "uint256[]" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  // Set voting duration (admin only)
  {
    type: "function",
    name: "set_voting_duration",
    inputs: [
      { name: "duration", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  // Create a new proposal
  {
    type: "function",
    name: "create_proposal",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" }
    ],
    outputs: [
      { name: "", type: "uint256" }
    ],
    stateMutability: "nonpayable"
  },
  // Get proposal details
  {
    type: "function",
    name: "get_proposal",
    inputs: [
      { name: "id", type: "uint256" }
    ],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
      { name: "", type: "bool" }
    ],
    stateMutability: "view"
  },
  // Get all proposals
  {
    type: "function",
    name: "get_all_proposals",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "votingEndsAt", type: "uint256" },
          { name: "totalVotesFor", type: "uint256" },
          { name: "totalVotesAgainst", type: "uint256" },
          { name: "executed", type: "bool" }
        ]
      }
    ],
    stateMutability: "view"
  },
  // Cast a vote
  {
    type: "function",
    name: "vote",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "votesFor", type: "uint64" },
      { name: "votesAgainst", type: "uint64" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  // Get a voter's vote on a proposal
  {
    type: "function",
    name: "get_vote",
    inputs: [
      { name: "voter", type: "address" },
      { name: "proposalId", type: "uint256" }
    ],
    outputs: [
      { name: "", type: "address" },
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
      { name: "", type: "uint256" }
    ],
    stateMutability: "view"
  },
  // Calculate quadratic vote cost
  {
    type: "function",
    name: "calculate_vote_cost",
    inputs: [
      { name: "votesFor", type: "uint64" },
      { name: "votesAgainst", type: "uint64" }
    ],
    outputs: [
      { name: "", type: "uint256" }
    ],
    stateMutability: "view"
  },
  // Get voter credit information
  {
    type: "function",
    name: "get_voter_credits",
    inputs: [
      { name: "voter", type: "address" }
    ],
    outputs: [
      { name: "", type: "address" },
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
      { name: "", type: "uint256" }
    ],
    stateMutability: "view"
  },
  // Get remaining credits
  {
    type: "function",
    name: "get_remaining_credits",
    inputs: [
      { name: "voter", type: "address" }
    ],
    outputs: [
      { name: "", type: "uint256" }
    ],
    stateMutability: "view"
  },
  // Get proposal results
  {
    type: "function",
    name: "get_proposal_results",
    inputs: [
      { name: "proposalId", type: "uint256" }
    ],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" }
    ],
    stateMutability: "view"
  },
  // Check if proposal is active
  {
    type: "function",
    name: "is_proposal_active",
    inputs: [
      { name: "proposalId", type: "uint256" }
    ],
    outputs: [
      { name: "", type: "bool" }
    ],
    stateMutability: "view"
  },
  // Events
  {
    type: "event",
    name: "ProposalCreated",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "title", type: "string", indexed: false }
    ]
  },
  {
    type: "event",
    name: "CreditsDistributed",
    inputs: [
      { name: "voter", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "VoteCast",
    inputs: [
      { name: "voter", type: "address", indexed: true },
      { name: "proposal_id", type: "uint256", indexed: true },
      { name: "votes_for", type: "uint64", indexed: false },
      { name: "votes_against", type: "uint64", indexed: false },
      { name: "credits_spent", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "VotingDurationChanged",
    inputs: [
      { name: "old_duration", type: "uint256", indexed: false },
      { name: "new_duration", type: "uint256", indexed: false }
    ]
  }
] as const;