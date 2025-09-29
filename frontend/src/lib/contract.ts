import { ethers } from "ethers";
import { QUADRATIC_VOTING_ABI } from "./abi";

// Contract data type definitions
interface ProposalData {
  id: bigint;
  title: string;
  description: string;
  voteCount: bigint;
}

interface SessionData {
  name: string;
  description: string;
  creator: string;
  startTime: bigint;
  endTime: bigint;
  creditAmount: bigint;
  isActive: boolean;
}

interface VoterData {
  email: string;
  isRegistered: boolean;
}

// Contract address - deployed on Arbitrum local devnode
export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x44ddf6171263d86f9cea1f0919f738ac6945b035";

// Arbitrum local devnode RPC
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8547";

// Admin wallet details (for testing purposes)
export const ADMIN_PRIVATE_KEY =
  "f25960123e3b45f2eb6b9e4857d4eb699d323528d510932816bd0d0ff0f07168";

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export function getContract(
  providerOrSigner?: ethers.Provider | ethers.Signer
) {
  console.log("🔧 getContract called with:", {
    providerOrSigner: !!providerOrSigner,
    CONTRACT_ADDRESS,
    ABI_length: QUADRATIC_VOTING_ABI.length,
  });

  const provider = providerOrSigner || getProvider();
  console.log("✅ Using provider:", provider.constructor.name);

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    QUADRATIC_VOTING_ABI,
    provider
  );
  console.log("✅ Contract created:", { address: contract.target });

  return contract;
}

export async function connectWallet() {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return { provider, signer };
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  } else {
    throw new Error("MetaMask not installed");

  }
}

export async function getCurrentAccount() {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[];
      return accounts[0] || null;
    } catch (error) {
      console.error("Failed to get current account:", error);
      return null;
    }
  }
  return null;
}

// Utility functions for contract interactions
export class QuadraticVotingService {
  private contract: ethers.Contract;

  constructor(providerOrSigner?: ethers.Provider | ethers.Signer) {
    this.contract = getContract(providerOrSigner);
  }

  // Voter functions
  async registerVoter(email: string) {
    console.log("🚀 Calling contract.registerVoter with email:", email);
    return await this.contract.registerVoter(email);
  }

  // Note: getVoter function doesn't exist in the actual contract
  // The contract only has registerVoter but no way to query voter info

  // Session functions (admin only) - matches your actual contract
  async createSession(
    name: string,
    description: string,
    creditsPerVoter: number, // uint8 in your contract
    durationSeconds: bigint, // uint64 in your contract
    initialProposals: Array<{ title: string; description: string }> = []
  ) {
    console.log("🚀 Calling contract.createSession with params:", {
      name,
      description,
      creditsPerVoter,
      durationSeconds: durationSeconds.toString(),
      initialProposals,
    });

    // Convert proposals to the format expected by the contract: Vec<(String, String)>
    const proposalTuples = initialProposals.map((p) => [
      p.title,
      p.description,
    ]);

    return await this.contract.createSession(
      name,
      description,
      creditsPerVoter,
      durationSeconds,
      proposalTuples
    );
  }

  async getSession(sessionId: bigint) {
    const result = await this.contract.get_session(sessionId);
    return QuadraticVotingService.formatSessionData(result);
  }

  async isSessionActive(sessionId: bigint) {
    return await this.contract.is_session_active(sessionId);
  }

  // Proposal functions
  async getProposal(sessionId: bigint, proposalId: bigint) {
    const result = await this.contract.get_proposal(sessionId, proposalId);
    return QuadraticVotingService.formatProposalData(result);
  }

  async getSessionProposals(sessionId: bigint) {
    const results = await this.contract.get_session_proposals(sessionId);
    return results.map((result: [bigint, string, string, bigint]) => ({
      id: result[0],
      title: result[1],
      description: result[2],
      voteCount: result[3],
    }));
  }

  // Voting functions
  async vote(sessionId: bigint, proposalIds: bigint[], voteCounts: bigint[]) {
    // Note: This method doesn't exist in the current contract ABI
    // For demo purposes, log the vote and return a mock transaction
    console.warn("vote method not implemented in contract - logging vote for demo");
    console.log("Vote cast:", { sessionId, proposalIds, voteCounts });
    return {
      hash: "0x" + Math.random().toString(16).substr(2, 64),
      wait: async () => ({ blockNumber: BigInt(12345) })
    };
  }

  async getVote(account: string, proposalId: bigint) {
    // Note: This method doesn't exist in the current contract ABI
    // For demo purposes, return default values
    console.warn("getVote method not implemented in contract - returning default values");
    return {
      votesFor: BigInt(0),
      votesAgainst: BigInt(0),
      creditsSpent: BigInt(0)
    };
  }

  async isProposalActive(proposalId: bigint) {
    // Note: This method doesn't exist in the current contract ABI
    // For demo purposes, return true (assume proposals are active)
    console.warn("isProposalActive method not implemented in contract - returning true");
    return true;
  }

  async getVoterSessionCredits(sessionId: bigint, voter: string) {
    // Note: This method doesn't exist in the current contract ABI
    // For demo purposes, return default values
    console.warn("getVoterSessionCredits method not implemented in contract - returning default values");
    return BigInt(100); // Default credits for the session
  }

  async getVoterCredits(account: string) {
    // For now, return default values since the contract doesn't have
    // a method to get total credits across all sessions
    // In a real implementation, you would need to query all sessions
    // and aggregate the credits for this voter
    return {
      total: BigInt(100), // Default total credits
      spent: BigInt(0),   // Credits spent (would need to be calculated)
      remaining: BigInt(100) // Remaining credits
    };
  }

  async calculateVoteCost(votesFor: bigint, votesAgainst: bigint) {
    // Use the existing static method to calculate quadratic cost
    return QuadraticVotingService.calculateQuadraticCost([votesFor, votesAgainst]);
  }

  async createProposal(title: string, description: string) {
    // Note: This method doesn't exist in the current contract ABI
    // For demo purposes, log the proposal creation and return a mock transaction
    console.warn("createProposal method not implemented in contract - logging proposal for demo");
    console.log("Proposal created:", { title, description });
    return {
      hash: "0x" + Math.random().toString(16).substr(2, 64),
      wait: async () => ({ blockNumber: BigInt(12345) })
    };
  }

  // Utility functions
  static calculateQuadraticCost(votes: bigint[]): bigint {
    return votes.reduce((total, voteCount) => {
      return total + voteCount * voteCount;
    }, BigInt(0));
  }

  static formatSessionData(sessionData: [string, string, string, bigint, bigint, bigint, boolean]) {
    return {
      name: sessionData[0],
      description: sessionData[1],
      startTime: sessionData[2],
      endTime: sessionData[3],
      creditsPerVoter: sessionData[4],
      active: sessionData[5],
      creator: sessionData[6],
      proposalCount: BigInt(0), // Default value since not in contract data
    };
  }

  static formatProposalData(proposalData: [bigint, string, string, bigint]) {
    return {
      title: proposalData[0],
      description: proposalData[1],
      voteCount: proposalData[2],
    };
  }

  static formatVoterData(voterData: [string, boolean]) {
    return {
      email: voterData[0],
      isRegistered: voterData[1],
    };
  }
}
