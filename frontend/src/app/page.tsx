'use client'

import { WalletConnect } from '@/components/WalletConnect'
import { CreditDisplay } from '@/components/CreditDisplay'
import { ProposalCreation } from '@/components/ProposalCreation'
import { ProposalCard } from '@/components/ProposalCard'
import { AdminPanel } from '@/components/AdminPanel'
import { ContractStatus } from '@/components/ContractStatus'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@/contexts/WalletContext'
import { QuadraticVotingService, CONTRACT_ADDRESS } from '@/lib/contract'
import { Proposal } from '@/types/contract'
import { Vote, Users, Settings, RefreshCw, Github } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

export default function Home() {
  const { account, signer, isConnected } = useWallet()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(false)
  const [userCredits, setUserCredits] = useState(0)

  const fetchProposals = useCallback(async () => {
    if (!signer) return

    try {
      setLoading(true)
      const service = new QuadraticVotingService(signer)
      const allProposals = await service.getAllProposals()
      
      setProposals(allProposals)
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
      // Silently handle contract errors for frontend demo
      setProposals([])
    } finally {
      setLoading(false)
    }
  }, [signer])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  const handleRefresh = () => {
    fetchProposals()
  }

  const handleCreditsChange = (credits: { remaining: bigint }) => {
    setUserCredits(Number(credits.remaining))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Vote className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Quadratic Voting</h1>
                <p className="text-sm text-muted-foreground">
                  Built on Arbitrum Stylus
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isConnected && (
                <Badge variant="secondary" className="hidden sm:flex">
                  {proposals.length} Proposal{proposals.length !== 1 ? 's' : ''}
                </Badge>
              )}
              
              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline ml-2">Refresh</span>
                </Button>
              )}
              
              {/* Wallet Status in Header */}
              <div className="max-w-sm">
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section for Non-Connected Users */}
        {!isConnected && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                Welcome to Quadratic Voting
              </h2>
              <p className="text-muted-foreground max-w-lg text-lg">
                Experience democratic decision-making with quadratic voting, where the cost of additional votes increases quadratically, ensuring fair representation while allowing strong preferences to be expressed.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Fair Representation</h3>
                <p className="text-sm text-muted-foreground">
                  Quadratic pricing prevents wealthy participants from dominating outcomes
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                  <Vote className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Express Intensity</h3>
                <p className="text-sm text-muted-foreground">
                  Show how much you care about issues with multiple votes
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Transparent</h3>
                <p className="text-sm text-muted-foreground">
                  All votes are recorded on-chain for complete transparency
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Application */}
        {isConnected && (
          <div className="space-y-8">
            {/* Credit Display */}
            <div className="max-w-md">
              <CreditDisplay onCreditsChange={handleCreditsChange} />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="proposals" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="proposals" className="flex items-center gap-2">
                  <Vote className="h-4 w-4" />
                  <span className="hidden sm:inline">Proposals</span>
                </TabsTrigger>
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Create</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              </TabsList>

              {/* Proposals Tab */}
              <TabsContent value="proposals" className="space-y-6">
                {proposals.length === 0 ? (
                  <div className="text-center py-12">
                    <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to create a proposal for the community to vote on!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {proposals.map((proposal) => (
                      <ProposalCard
                        key={proposal.id.toString()}
                        proposal={proposal}
                        userCredits={userCredits}
                        onVoteSuccess={handleRefresh}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Create Proposal Tab */}
              <TabsContent value="create">
                <div className="max-w-2xl">
                  <ProposalCreation onProposalCreated={handleRefresh} />
                </div>
              </TabsContent>

              {/* Admin Tab */}
              <TabsContent value="admin">
                <div className="max-w-2xl">
                  <AdminPanel />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Vote className="h-4 w-4" />
              Quadratic Voting on Arbitrum Stylus
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/JeffreyJoel/Stylus-Quadratic-Voting"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                View Source
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
