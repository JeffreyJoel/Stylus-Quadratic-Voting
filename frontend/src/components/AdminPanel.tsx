'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@/contexts/WalletContext'
import { QuadraticVotingService } from '@/lib/contract'
import { Settings, Users, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface CreditDistribution {
  address: string
  amount: number
}

export function AdminPanel() {
  const { account, signer } = useWallet()
  const [distributions, setDistributions] = useState<CreditDistribution[]>([
    { address: '', amount: 100 }
  ])
  const [submitting, setSubmitting] = useState(false)

  const addDistribution = () => {
    setDistributions([...distributions, { address: '', amount: 100 }])
  }

  const removeDistribution = (index: number) => {
    if (distributions.length > 1) {
      setDistributions(distributions.filter((_, i) => i !== index))
    }
  }

  const updateDistribution = (index: number, field: 'address' | 'amount', value: string | number) => {
    const updated = distributions.map((dist, i) => 
      i === index ? { ...dist, [field]: value } : dist
    )
    setDistributions(updated)
  }

  const validateAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleDistributeCredits = async () => {
    if (!signer || !account) {
      toast.error('Please connect your wallet')
      return
    }

    // Validation
    const validDistributions = distributions.filter(dist => 
      dist.address.trim() && validateAddress(dist.address) && dist.amount > 0
    )

    if (validDistributions.length === 0) {
      toast.error('Please add at least one valid distribution')
      return
    }

    const invalidAddresses = distributions.filter(dist => 
      dist.address.trim() && !validateAddress(dist.address)
    )

    if (invalidAddresses.length > 0) {
      toast.error('Some addresses are invalid. Please check the format.')
      return
    }

    try {
      setSubmitting(true)
      const service = new QuadraticVotingService(signer)
      
      const addresses = validDistributions.map(dist => dist.address)
      const amounts = validDistributions.map(dist => BigInt(dist.amount))
      
      await service.distributeCredits(addresses, amounts)
      
      toast.success(`Credits distributed to ${validDistributions.length} address(es)`)
      
      // Reset form
      setDistributions([{ address: '', amount: 100 }])
    } catch (error: unknown) {
      console.error('Failed to distribute credits:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to distribute credits'
      if (errorMessage?.includes('Unauthorized')) {
        toast.error('Only the contract admin can distribute credits')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const parseAddresses = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const newDistributions: CreditDistribution[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed) {
        // Support formats: "address" or "address,amount"
        const parts = trimmed.split(',')
        const address = parts[0].trim()
        const amount = parts[1] ? parseInt(parts[1].trim()) : 100
        
        if (address && amount > 0) {
          newDistributions.push({ address, amount })
        }
      }
    }
    
    if (newDistributions.length > 0) {
      setDistributions(newDistributions)
      toast.success(`Loaded ${newDistributions.length} addresses`)
    }
  }

  const totalCredits = distributions.reduce((sum, dist) => sum + (dist.amount || 0), 0)

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            Connect your wallet to access admin functions
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            Distribute voting credits to community members
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quick Import */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Quick Import (Optional)
            </label>
            <Textarea
              placeholder="Paste addresses here (one per line)&#10;Format: address or address,amount&#10;&#10;0x1234...5678&#10;0xabcd...ef01,200&#10;0x9876...5432,150"
              rows={4}
              onChange={(e) => {
                if (e.target.value.trim()) {
                  parseAddresses(e.target.value)
                  e.target.value = ''
                }
              }}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Paste wallet addresses (one per line). Optionally add credit amount: address,amount
            </p>
          </div>

          {/* Manual Entry */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Credit Distributions</h3>
              <Badge variant="secondary">
                Total: {totalCredits} credits
              </Badge>
            </div>
            
            <div className="space-y-3">
              {distributions.map((dist, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="0x..."
                      value={dist.address}
                      onChange={(e) => updateDistribution(index, 'address', e.target.value)}
                      disabled={submitting}
                      className={!dist.address || validateAddress(dist.address) ? '' : 'border-red-500'}
                    />
                    {dist.address && !validateAddress(dist.address) && (
                      <p className="text-xs text-red-500 mt-1">Invalid address format</p>
                    )}
                  </div>
                  <Input
                    type="number"
                    placeholder="100"
                    value={dist.amount}
                    onChange={(e) => updateDistribution(index, 'amount', parseInt(e.target.value) || 0)}
                    disabled={submitting}
                    className="w-24"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeDistribution(index)}
                    disabled={distributions.length <= 1 || submitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={addDistribution}
              disabled={submitting}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Address
            </Button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Admin Function
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Only the contract administrator can distribute credits. 
                  Credits will be added to existing balances.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleDistributeCredits}
            disabled={submitting || distributions.every(dist => !dist.address.trim())}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Distributing Credits...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Distribute {totalCredits} Credits to {distributions.filter(d => d.address.trim()).length} Address(es)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}