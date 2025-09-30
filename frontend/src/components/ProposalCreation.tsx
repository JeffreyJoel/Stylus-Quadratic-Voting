'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Info } from 'lucide-react'

interface ProposalCreationProps {
  onProposalCreated?: () => void
}

export function ProposalCreation({ onProposalCreated }: ProposalCreationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Proposal Creation
        </CardTitle>
        <CardDescription>
          How proposals are created in this quadratic voting system
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Proposals Created During Session Creation
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                In this implementation, proposals are created as part of the voting session creation process.
                The contract administrator adds all proposals when setting up a new voting session.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">To create proposals:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
            <li>Go to the <strong>Admin Panel</strong> (requires admin privileges)</li>
            <li>Click <strong>"Create Voting Session"</strong></li>
            <li>Add proposal titles and descriptions in the session creation form</li>
            <li>Submit the session with all proposals included</li>
          </ol>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Contract Limitation
              </p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                The current smart contract does not support adding individual proposals to existing sessions.
                This is a design choice to ensure voting integrity and prevent manipulation during active sessions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}