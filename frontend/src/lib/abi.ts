// ABI based on your EXACT generated smart contract interface
export const QUADRATIC_VOTING_ABI = [
  // Register voter (from your generated ABI)
  {
    type: "function",
    name: "registerVoter",
    inputs: [{ name: "email", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // Create session (from your generated ABI)
  {
    type: "function",
    name: "createSession",
    inputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "credits_per_voter", type: "uint8" },
      { name: "duration_seconds", type: "uint64" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // Get session results (from your generated ABI)
  {
    type: "function",
    name: "getSessionResults",
    inputs: [{ name: "session_id", type: "uint64" }],
    outputs: [
      { name: "", type: "uint8" },
      { name: "", type: "uint8" },
      { name: "", type: "uint64" },
      { name: "", type: "uint64" },
    ],
    stateMutability: "view",
  },

  // Get session proposals (from your generated ABI)
  {
    type: "function",
    name: "getSessionProposals",
    inputs: [{ name: "session_id", type: "uint64" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "", type: "uint8" },
          { name: "", type: "string" },
          { name: "", type: "string" },
          { name: "", type: "uint64" },
        ],
      },
    ],
    stateMutability: "view",
  },

  // Error types from your generated ABI
  {
    type: "error",
    name: "InvalidSession",
    inputs: [],
  },
  {
    type: "error",
    name: "ProposalNotFound",
    inputs: [],
  },
  {
    type: "error",
    name: "VoterNotRegistered",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientCredits",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidVoteCount",
    inputs: [],
  },
  {
    type: "error",
    name: "Unauthorized",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidProposalCount",
    inputs: [],
  },
];
