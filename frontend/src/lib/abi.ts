import { parseAbi } from "viem";

export const QUADRATIC_VOTING_ABI = parseAbi([
  "function registerVoter(string email) external",
  "function createSession(string name, string description, uint8 credits_per_voter, uint64 duration_seconds, (string,string)[] initial_proposals) external returns (uint64)",
  "function getSession(uint64 session_id) external view returns (string, string, uint256, uint256, uint8, bool, address, uint8)",
  "function vote(uint64 session_id, uint8[] proposal_ids, uint64[] vote_counts) external",
  "function getSessionResults(uint64 session_id) external view returns (uint8, uint8, uint64, uint64)",
  "function getSessionProposals(uint64 session_id) external view returns ((uint8,string,string,uint64)[])",
  "error InvalidSession()",
  "error ProposalNotFound()",
  "error VoterNotRegistered()",
  "error InsufficientCredits()",
  "error InvalidVoteCount()",
  "error Unauthorized()",
  "error InvalidProposalCount()"
]);
