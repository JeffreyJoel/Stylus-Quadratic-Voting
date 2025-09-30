import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS } from '@/lib/wagmi'
import { toast } from 'react-hot-toast'
import { QUADRATIC_VOTING_ABI } from '@/lib/abi'

// Types for better TypeScript support
export interface SessionData {
  name: string
  description: string
  startTime: bigint
  endTime: bigint
  creditsPerVoter: bigint
  active: boolean
  creator: string
  proposalCount: bigint
}

export interface ProposalData {
  id: bigint
  title: string
  description: string
  voteCount: bigint
}

export interface SessionResults {
  totalProposals: bigint
  totalVotes: bigint
  totalCreditsSpent: bigint
  sessionEndTime: bigint
}

// Custom hook for reading session data
export function useSession(sessionId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: QUADRATIC_VOTING_ABI,
    functionName: 'getSession',
    args: [sessionId],
    query: {
      enabled: !!sessionId,
    },
  })
}

// Custom hook for reading session proposals
export function useSessionProposals(sessionId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: QUADRATIC_VOTING_ABI,
    functionName: 'getSessionProposals',
    args: [sessionId],
    query: {
      enabled: !!sessionId,
    },
  })
}

// Custom hook for reading session results
export function useSessionResults(sessionId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: QUADRATIC_VOTING_ABI,
    functionName: 'getSessionResults',
    args: [sessionId],
    query: {
      enabled: !!sessionId,
    },
  })
}

// Custom hook for voter registration
export function useRegisterVoter() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const registerVoter = async (email: string) => {
    try {
      const txHash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: QUADRATIC_VOTING_ABI,
        functionName: 'registerVoter',
        args: [email],
      })
      return txHash
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  return {
    registerVoter,
    hash,
    error,
    isPending,
  }
}

// Custom hook for session creation
export function useCreateSession() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const createSession = async (
    name: string,
    description: string,
    creditsPerVoter: number,
    durationSeconds: bigint,
    initialProposals: Array<{ title: string; description: string }> = []
  ) => {
    try {
      // Convert proposals to the format expected by the contract: (string,string)[]
      const proposalTuples = initialProposals.map((p) => [p.title, p.description] as const)

      const txHash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: QUADRATIC_VOTING_ABI,
        functionName: 'createSession',
        args: [name, description, creditsPerVoter, durationSeconds, proposalTuples],
      })
      return txHash
    } catch (error) {
      console.error('Session creation failed:', error)
      throw error
    }
  }

  return {
    createSession,
    hash,
    error,
    isPending,
  }
}

// Custom hook for voting
export function useVote() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const vote = async (sessionId: bigint, proposalIds: number[], voteCounts: bigint[]) => {
    try {
      const txHash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: QUADRATIC_VOTING_ABI,
        functionName: 'vote',
        args: [sessionId, proposalIds, voteCounts],
      })
      return txHash
    } catch (error) {
      console.error('Voting failed:', error)
      throw error
    }
  }

  return {
    vote,
    hash,
    error,
    isPending,
  }
}

// Custom hook for transaction waiting with notifications
export function useWaitForTransaction(hash?: `0x${string}`) {
  const queryClient = useQueryClient()

  const result = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  })

  // Handle success/error notifications
  useEffect(() => {
    if (result.isSuccess && result.data) {
      toast.success(`Transaction confirmed! Block: ${result.data.blockNumber}`)
      // Invalidate and refetch queries after successful transaction
      queryClient.invalidateQueries({ queryKey: ['contract'] })
    } else if (result.isError) {
      console.error('Transaction failed:', result.error)
      toast.error('Transaction failed')
    }
  }, [result.isSuccess, result.isError, result.data, result.error, queryClient])

  return result
}

// Utility hook for calculating quadratic cost
export function useQuadraticCostCalculator() {
  const calculateCost = (votes: bigint[]): bigint => {
    return votes.reduce((total, voteCount) => {
      return total + voteCount * voteCount
    }, BigInt(0))
  }

  return { calculateCost }
}
