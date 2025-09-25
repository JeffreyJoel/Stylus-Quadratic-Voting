'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useWallet } from '@/contexts/WalletContext'
import { QuadraticVotingService } from '@/lib/contract'
import { Plus, Loader2, FileText } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface ProposalCreationProps {
  onProposalCreated?: () => void
}

export function ProposalCreation({ onProposalCreated }: ProposalCreationProps) {
  const { account, signer } = useWallet()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signer || !account) {
      toast.error('Please connect your wallet')
      return
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in both title and description')
      return
    }

    try {
      setSubmitting(true)
      const service = new QuadraticVotingService(signer)
      
      await service.createProposal(title.trim(), description.trim())
      
      toast.success('Proposal created successfully!')
      
      // Reset form
      setTitle('')
      setDescription('')
      setShowForm(false)
      
      // Notify parent component
      onProposalCreated?.()
    } catch (error: unknown) {
      console.error('Failed to create proposal:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create proposal'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setShowForm(false)
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Proposal
          </CardTitle>
          <CardDescription>
            Connect your wallet to create a new voting proposal
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!showForm) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Plus className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Create New Proposal</h3>
          <p className="text-muted-foreground mb-6">
            Share your ideas and let the community vote using quadratic voting
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create New Proposal
        </CardTitle>
        <CardDescription>
          Create a proposal for the community to vote on
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              placeholder="Enter proposal title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description *
            </label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of your proposal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/1000 characters
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Important Notes:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Once created, proposals cannot be edited or deleted</li>
              <li>• The voting period is set by the contract administrator</li>
              <li>• All community members with credits can vote</li>
              <li>• Quadratic voting means vote cost = votes² (1 vote = 1 credit, 2 votes = 4 credits)</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim() || !description.trim()}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}