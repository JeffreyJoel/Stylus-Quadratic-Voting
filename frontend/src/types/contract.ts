import { BigNumberish, type ContractTransaction } from 'ethers'

export interface Proposal {
  id: bigint
  creator: string
  createdAt: bigint
  votingEndsAt: bigint
  totalVotesFor: bigint
  totalVotesAgainst: bigint
  executed: boolean
}

export interface Vote {
  voter: string
  proposalId: bigint
  votesFor: bigint
  votesAgainst: bigint
  creditsSpent: bigint
}

export interface VoterCredits {
  address: string
  total: bigint
  spent: bigint
  remaining: bigint
}

export interface ContractCall {
  initialize: (defaultCredits: BigNumberish, votingDuration: BigNumberish) => Promise<ContractTransaction>
  distribute_credits: (voters: string[], amounts: BigNumberish[]) => Promise<ContractTransaction>
  create_proposal: (title: string, description: string) => Promise<ContractTransaction>
  vote: (proposalId: BigNumberish, votesFor: number, votesAgainst: number) => Promise<ContractTransaction>
  get_proposal: (id: BigNumberish) => Promise<[bigint, string, bigint, bigint, bigint, bigint, boolean]>
  get_all_proposals: () => Promise<Array<[bigint, string, bigint, bigint, bigint, bigint, boolean]>>
  get_vote: (voter: string, proposalId: BigNumberish) => Promise<[string, bigint, bigint, bigint, bigint]>
  calculate_vote_cost: (votesFor: number, votesAgainst: number) => Promise<bigint>
  get_voter_credits: (voter: string) => Promise<[string, bigint, bigint, bigint]>
  get_proposal_results: (proposalId: BigNumberish) => Promise<[bigint, bigint]>
  is_proposal_active: (proposalId: BigNumberish) => Promise<boolean>
}

export interface QuadraticVotingContract extends ContractCall {
  address: string
}