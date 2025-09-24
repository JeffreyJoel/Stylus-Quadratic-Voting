import { ethers } from 'ethers'
import { QUADRATIC_VOTING_ABI } from './abi'

// Contract address - to be updated when deployed
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

// Arbitrum local devnode RPC
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8547'

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL)
}

export function getContract(providerOrSigner?: ethers.Provider | ethers.Signer) {
  const provider = providerOrSigner || getProvider()
  return new ethers.Contract(CONTRACT_ADDRESS, QUADRATIC_VOTING_ABI, provider)
}

export async function connectWallet() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      return { provider, signer }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  } else {
    throw new Error('MetaMask not installed')
  }
}

export async function getCurrentAccount() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
      return accounts[0] || null
    } catch (error) {
      console.error('Failed to get current account:', error)
      return null
    }
  }
  return null
}

// Utility functions for contract interactions
export class QuadraticVotingService {
  private contract: ethers.Contract
  
  constructor(providerOrSigner?: ethers.Provider | ethers.Signer) {
    this.contract = getContract(providerOrSigner)
  }

  // Admin functions
  async initialize(defaultCredits: bigint, votingDuration: bigint) {
    return await this.contract.initialize(defaultCredits, votingDuration)
  }

  async distributeCredits(voters: string[], amounts: bigint[]) {
    return await this.contract.distribute_credits(voters, amounts)
  }

  // Proposal functions
  async createProposal(title: string, description: string) {
    return await this.contract.create_proposal(title, description)
  }

  async getProposal(id: bigint) {
    const result = await this.contract.get_proposal(id)
    return {
      id: result[0],
      creator: result[1],
      createdAt: result[2],
      votingEndsAt: result[3],
      totalVotesFor: result[4],
      totalVotesAgainst: result[5],
      executed: result[6]
    }
  }

  async getAllProposals() {
    const results = await this.contract.get_all_proposals()
    return results.map((result: [bigint, string, bigint, bigint, bigint, bigint, boolean]) => ({
      id: result[0],
      creator: result[1],
      createdAt: result[2],
      votingEndsAt: result[3],
      totalVotesFor: result[4],
      totalVotesAgainst: result[5],
      executed: result[6]
    }))
  }

  // Voting functions
  async vote(proposalId: bigint, votesFor: number, votesAgainst: number) {
    return await this.contract.vote(proposalId, votesFor, votesAgainst)
  }

  async getVote(voter: string, proposalId: bigint) {
    const result = await this.contract.get_vote(voter, proposalId)
    return {
      voter: result[0],
      proposalId: result[1],
      votesFor: result[2],
      votesAgainst: result[3],
      creditsSpent: result[4]
    }
  }

  async calculateVoteCost(votesFor: number, votesAgainst: number) {
    return await this.contract.calculate_vote_cost(votesFor, votesAgainst)
  }

  // Credit functions
  async getVoterCredits(voter: string) {
    const result = await this.contract.get_voter_credits(voter)
    return {
      address: result[0],
      total: result[1],
      spent: result[2],
      remaining: result[3]
    }
  }

  async getRemainingCredits(voter: string) {
    return await this.contract.get_remaining_credits(voter)
  }

  // Results functions
  async getProposalResults(proposalId: bigint) {
    const result = await this.contract.get_proposal_results(proposalId)
    return {
      votesFor: result[0],
      votesAgainst: result[1]
    }
  }

  async isProposalActive(proposalId: bigint) {
    return await this.contract.is_proposal_active(proposalId)
  }
}