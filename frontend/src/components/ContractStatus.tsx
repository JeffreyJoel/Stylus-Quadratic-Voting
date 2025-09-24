'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ContractStatusProps {
  contractAddress?: string
}

export function ContractStatus({ contractAddress }: ContractStatusProps) {
  const isDeployed = contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000'
  
  if (isDeployed) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800 dark:text-green-100">
              Contract Connected
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-green-700 dark:text-green-300">
              Successfully connected to Stylus contract
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-yellow-800 dark:text-yellow-100">
            Contract Not Available
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-yellow-700 dark:text-yellow-300">
          <p>The Stylus Quadratic Voting contract is not currently available.</p>
        </div>
      </CardContent>
    </Card>
  )
}