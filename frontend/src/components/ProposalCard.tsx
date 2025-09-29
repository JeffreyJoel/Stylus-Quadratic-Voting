'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useWallet } from '@/contexts/WalletContext'
import { QuadraticVotingService } from '@/lib/contract'
import { Proposal } from '@/types/contract'
import { 
  Clock, 
  User, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  Plus,
  Minus
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface ProposalCardProps {
  proposal: Proposal
  onVoteSuccess?: () => void
  userCredits?: number
}

interface VoteState {
  votesFor: number
  votesAgainst: number
  cost: number
}

export function ProposalCard({ proposal, onVoteSuccess, userCredits = 0 }: ProposalCardProps) {
  const { account, signer } = useWallet()
  const [isActive, setIsActive] = useState(false)
  const [currentVote, setCurrentVote] = useState<VoteState>({ votesFor: 0, votesAgainst: 0, cost: 0 })
  const [pendingVote, setPendingVote] = useState<VoteState>({ votesFor: 0, votesAgainst: 0, cost: 0 })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const checkActiveAndLoadVote = async () => {
      if (!signer || !account) return

      try {
        setLoading(true)
        const service = new QuadraticVotingService(signer)
        
        // Check if proposal is active
        const active = await service.isProposalActive(proposal.id)
        setIsActive(active)
        
        // Load current user vote
        const vote = await service.getVote(account, proposal.id)
        const votesFor = Number(vote.votesFor)
        const votesAgainst = Number(vote.votesAgainst)
        const cost = Number(vote.creditsSpent)
        
        const voteState = { votesFor, votesAgainst, cost }
        setCurrentVote(voteState)
        setPendingVote(voteState)
      } catch (error) {
        console.error('Failed to load proposal data:', error)
      } finally {
        setLoading(false)
      }
    }

    checkActiveAndLoadVote()
  }, [proposal.id, account, signer])

  const calculateCost = async (votesFor: number, votesAgainst: number) => {
    if (!signer) return 0
    try {
      const service = new QuadraticVotingService(signer)
      const cost = await service.calculateVoteCost(BigInt(votesFor), BigInt(votesAgainst))
      return Number(cost)
    } catch (error) {
      console.error('Failed to calculate cost:', error)
      return 0
    }
  }

  const updatePendingVote = async (newVotesFor: number, newVotesAgainst: number) => {
    const cost = await calculateCost(newVotesFor, newVotesAgainst)
    setPendingVote({
      votesFor: newVotesFor,
      votesAgainst: newVotesAgainst,
      cost
    })
  }

  const handleVoteChange = (type: 'for' | 'against', increment: boolean) => {
    const newVotesFor = type === 'for' 
      ? Math.max(0, pendingVote.votesFor + (increment ? 1 : -1))
      : pendingVote.votesFor
    const newVotesAgainst = type === 'against'
      ? Math.max(0, pendingVote.votesAgainst + (increment ? 1 : -1))
      : pendingVote.votesAgainst

    updatePendingVote(newVotesFor, newVotesAgainst)
  }

  const handleSubmitVote = async () => {
    if (!signer || !account) {
      toast.error('Please connect your wallet')
      return
    }

    if (pendingVote.cost > userCredits + currentVote.cost) {
      toast.error('Insufficient credits for this vote')
      return
    }

    try {
      setSubmitting(true)
      const service = new QuadraticVotingService(signer)
      
      await service.vote(BigInt(1), [proposal.id], [BigInt(pendingVote.votesFor)])
      
      setCurrentVote(pendingVote)
      toast.success('Vote submitted successfully!')
      onVoteSuccess?.()
    } catch (error: unknown) {
      console.error('Failed to submit vote:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit vote'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const resetVote = () => {
    setPendingVote(currentVote)
  }

  const totalVotes = Number(proposal.totalVotesFor) + Number(proposal.totalVotesAgainst)
  const forPercentage = totalVotes > 0 ? (Number(proposal.totalVotesFor) / totalVotes) * 100 : 0
  const againstPercentage = totalVotes > 0 ? (Number(proposal.totalVotesAgainst) / totalVotes) * 100 : 0

  const hasChanges = 
    pendingVote.votesFor !== currentVote.votesFor || 
    pendingVote.votesAgainst !== currentVote.votesAgainst

  const netCostChange = pendingVote.cost - currentVote.cost

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading proposal...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${!isActive ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Proposal #{Number(proposal.id)}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}
            </CardDescription>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              'Ended'
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Voting Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Support</span>
            </div>
            <span className="font-bold text-green-600">
              {Number(proposal.totalVotesFor)} votes ({forPercentage.toFixed(1)}%)
            </span>
          </div>
          <Progress value={forPercentage} className="bg-red-100" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Against</span>
            </div>
            <span className="font-bold text-red-600">
              {Number(proposal.totalVotesAgainst)} votes ({againstPercentage.toFixed(1)}%)
            </span>
          </div>
          <Progress value={againstPercentage} className="bg-green-100" />
        </div>

        {/* Voting Interface */}
        {isActive && account && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Cast Your Vote</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Vote For */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-700 dark:text-green-400">
                  Support
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoteChange('for', false)}
                    disabled={pendingVote.votesFor <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-bold min-w-8 text-center">{pendingVote.votesFor}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoteChange('for', true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Vote Against */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-red-700 dark:text-red-400">
                  Against
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoteChange('against', false)}
                    disabled={pendingVote.votesAgainst <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-bold min-w-8 text-center">{pendingVote.votesAgainst}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoteChange('against', true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Cost Display */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>Cost for this vote:</span>
                <span className="font-bold">{pendingVote.cost} credits</span>
              </div>
              {netCostChange !== 0 && (
                <div className="flex justify-between items-center text-sm mt-1">
                  <span>Net change:</span>
                  <span className={`font-bold ${netCostChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {netCostChange > 0 ? '+' : ''}{netCostChange} credits
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {hasChanges && (
              <div className="flex gap-2">
                <Button
                  onClick={resetVote}
                  variant="outline"
                  className="flex-1"
                  disabled={submitting}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleSubmitVote}
                  className="flex-1"
                  disabled={submitting || netCostChange > userCredits}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Vote'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {!isActive && (
          <div className="text-center py-4 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Voting has ended for this proposal</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}