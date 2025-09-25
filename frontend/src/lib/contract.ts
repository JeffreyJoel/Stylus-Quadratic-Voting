import { ethers } from "ethers";
import { QUADRATIC_VOTING_ABI } from "./abi";

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

  // Session functions (admin only)
  async createSession(
    name: string,
    description: string,
    creditsPerVoter: bigint,
    durationSeconds: bigint,
    initialProposals: Array<{ title: string; description: string }>
  ) {
    // Convert proposals to tuple format expected by contract
    const proposalTuples = initialProposals.map((p) => [
      p.title,
      p.description,
    ]);
    return await this.contract.create_session(
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
    return results.map((result: any) => ({
      id: result[0],
      title: result[1],
      description: result[2],
      voteCount: result[3],
    }));
  }

  // Voting functions
  async vote(sessionId: bigint, proposalIds: bigint[], voteCounts: bigint[]) {
    return await this.contract.vote(sessionId, proposalIds, voteCounts);
  }

  async getVote(sessionId: bigint, voter: string, proposalId: bigint) {
    return await this.contract.get_vote(sessionId, voter, proposalId);
  }

  async getVoterSessionCredits(sessionId: bigint, voter: string) {
    return await this.contract.get_voter_session_credits(sessionId, voter);
  }

  // Utility functions
  static calculateQuadraticCost(votes: bigint[]): bigint {
    return votes.reduce((total, voteCount) => {
      return total + voteCount * voteCount;
    }, 0n);
  }

  static formatSessionData(sessionData: any) {
    return {
      name: sessionData[0],
      description: sessionData[1],
      startTime: sessionData[2],
      endTime: sessionData[3],
      creditsPerVoter: sessionData[4],
      active: sessionData[5],
      creator: sessionData[6],
      proposalCount: sessionData[7],
    };
  }

  static formatProposalData(proposalData: any) {
    return {
      title: proposalData[0],
      description: proposalData[1],
      voteCount: proposalData[2],
    };
  }

  static formatVoterData(voterData: any) {
    return {
      email: voterData[0],
      isRegistered: voterData[1],
    };
  }
}
