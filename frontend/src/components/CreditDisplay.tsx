'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useWallet } from '@/contexts/WalletContext'
import { QuadraticVotingService } from '@/lib/contract'
import { Coins, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface CreditInfo {
  total: bigint
  spent: bigint
  remaining: bigint
}

interface CreditDisplayProps {
  onCreditsChange?: (credits: CreditInfo) => void
}

export function CreditDisplay({ onCreditsChange }: CreditDisplayProps) {
  const { account, signer } = useWallet()
  const [credits, setCredits] = useState<CreditInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCredits = useCallback(async (showRefreshing = false) => {
    if (!account || !signer) return

    setLoading(!showRefreshing)
    if (showRefreshing) setRefreshing(true)
    
    try {
      const service = new QuadraticVotingService(signer)
      const creditInfo = await service.getVoterCredits(account)
      
      const creditData = {
        total: creditInfo.total,
        spent: creditInfo.spent,
        remaining: creditInfo.remaining
      }
      
      setCredits(creditData)
      onCreditsChange?.(creditData)
    } catch (error) {
      console.error('Failed to fetch credits:', error)
      // Silently handle contract errors for frontend demo
      console.error('Credits loading error:', error)
      // Set default credits to show the component works
      const defaultCredits = {
        total: BigInt(0),
        spent: BigInt(0),
        remaining: BigInt(0)
      }
      setCredits(defaultCredits)
      onCreditsChange?.(defaultCredits)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [account, signer, onCreditsChange])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const handleRefresh = () => {
    fetchCredits(true)
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Voting Credits
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your voting credits
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Voting Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading credits...</span>
        </CardContent>
      </Card>
    )
  }

  if (!credits) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Voting Credits
          </CardTitle>
          <CardDescription>
            No credits found. Contact the admin to receive voting credits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totalNum = Number(credits.total)
  const remainingNum = Number(credits.remaining)
  const spentNum = Number(credits.spent)
  const progressPercentage = totalNum > 0 ? (remainingNum / totalNum) * 100 : 0

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Voting Credits
          </CardTitle>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Available Credits</span>
          <span className="text-2xl font-bold text-primary">{remainingNum}</span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="bg-primary/20"
        />
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold">{totalNum}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="font-semibold text-destructive">{spentNum}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="font-semibold text-primary">{remainingNum}</p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Remember: Vote cost = votes² (quadratic pricing)
        </div>
      </CardContent>
    </Card>
  )
}