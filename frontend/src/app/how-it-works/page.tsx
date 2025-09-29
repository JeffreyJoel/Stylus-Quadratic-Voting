'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight,
  Calculator,
  Users,
  Shield,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Globe
} from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Calculator className="w-4 h-4 mr-2" />
            Mathematical Democracy
          </Badge>
          <h1 className="text-hero mb-6">How Quadratic Voting Works</h1>
          <p className="text-subheading text-muted-foreground">
            Understanding the mathematics and mechanisms behind fair democratic decision-making
          </p>
        </div>

        {/* The Problem Section */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-display mb-6">The Problem with Traditional Voting</h2>
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              Current voting systems fail to capture the intensity of preferences, leading to suboptimal outcomes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-destructive/20">
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/20 rounded-xl flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Binary Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  One person, one vote treats all preferences equally. Someone who mildly prefers option A has the same voting power as someone who desperately needs option A.
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/20 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Wealth Domination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Resource-based systems (like token voting) allow wealthy actors to completely dominate outcomes, effectively buying elections.
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/20 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Minority Suppression</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Passionate minorities with strong preferences are consistently outvoted by apathetic majorities, leading to tyranny of the majority.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The Solution Section */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-display mb-6">The Quadratic Voting Solution</h2>
            <p className="text-body text-muted-foreground max-w-3xl mx-auto">
              Quadratic voting allows people to express the intensity of their preferences through a clever pricing mechanism
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <h3 className="text-title mb-8">The Core Formula</h3>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-4 text-primary">
                      Cost = Votes²
                    </div>
                    <p className="text-muted-foreground">
                      The cost to cast votes increases quadratically
                    </p>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>1 vote</span>
                  <span className="font-mono">1 credit</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>2 votes</span>
                  <span className="font-mono">4 credits</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>3 votes</span>
                  <span className="font-mono">9 credits</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>4 votes</span>
                  <span className="font-mono">16 credits</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-title mb-8">Why It Works</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Prevents Domination</h4>
                    <p className="text-muted-foreground">
                      The quadratic cost makes it increasingly expensive to cast many votes, preventing wealthy actors from buying unlimited influence.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Expresses Intensity</h4>
                    <p className="text-muted-foreground">
                      Participants can signal how much they care about an issue by spending more credits for additional votes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Optimal Allocation</h4>
                    <p className="text-muted-foreground">
                      Mathematically proven to maximize social welfare by allowing efficient preference aggregation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Step by Step */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-display mb-6">Step-by-Step Process</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <CardTitle>Receive Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every participant receives an equal allocation of voting credits (e.g., 100 credits) to spend across all proposals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <CardTitle>Choose Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Browse available proposals and decide which ones you care about most. You can vote on multiple proposals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <CardTitle>Allocate Votes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Decide how many votes to cast on each proposal. More votes = quadratically higher cost, so choose wisely.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <CardTitle>Results Counted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All votes are tallied on-chain transparently. Proposals with the most total votes (weighted by intensity) win.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Example Scenario */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-display mb-6">Real-World Example</h2>
            <p className="text-body text-muted-foreground">
              See how quadratic voting works in practice
            </p>
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Community Park Budget Allocation</CardTitle>
              <CardDescription>
                A neighborhood has $100,000 to spend on park improvements. Three proposals are on the table.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-background/60 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Proposal A: New Playground</h4>
                  <p className="text-sm text-muted-foreground mb-3">$60,000 - Modern playground equipment for children</p>
                  <div className="space-y-1 text-sm">
                    <div>Parents with young kids: <strong>5 votes each</strong></div>
                    <div>Others: <strong>1 vote each</strong></div>
                    <div className="font-semibold text-primary">Total: 847 votes</div>
                  </div>
                </div>

                <div className="bg-background/60 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Proposal B: Dog Park</h4>
                  <p className="text-sm text-muted-foreground mb-3">$25,000 - Fenced area for dogs to play</p>
                  <div className="space-y-1 text-sm">
                    <div>Dog owners: <strong>8 votes each</strong></div>
                    <div>Others: <strong>0-2 votes</strong></div>
                    <div className="font-semibold text-primary">Total: 623 votes</div>
                  </div>
                </div>

                <div className="bg-background/60 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Proposal C: Walking Path</h4>
                  <p className="text-sm text-muted-foreground mb-3">$40,000 - Paved walking/jogging trail</p>
                  <div className="space-y-1 text-sm">
                    <div>Elderly residents: <strong>6 votes each</strong></div>
                    <div>Joggers: <strong>4 votes each</strong></div>
                    <div>Others: <strong>2 votes each</strong></div>
                    <div className="font-semibold text-primary">Total: 735 votes</div>
                  </div>
                </div>
              </div>

              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <h4 className="font-semibold text-success mb-2">Result: All three projects get funding!</h4>
                <p className="text-sm text-muted-foreground">
                  Unlike simple majority voting (which would only fund the playground), quadratic voting revealed that the community values all three improvements. The budget is allocated proportionally: $40k playground, $23k dog park, $37k walking path.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Technical Implementation */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-display mb-6">Technical Implementation</h2>
            <p className="text-body text-muted-foreground">
              Built on cutting-edge blockchain technology for transparency and security
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  <CardTitle>Arbitrum Stylus</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• High-performance smart contracts in Rust</li>
                  <li>• Lower gas fees than Ethereum mainnet</li>
                  <li>• Inherits Ethereum&apos;s security guarantees</li>
                  <li>• Fast transaction finalization</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <CardTitle>Security Features</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• All votes recorded immutably on-chain</li>
                  <li>• Cryptographic proof of vote integrity</li>
                  <li>• Open source and auditable code</li>
                  <li>• No central point of failure</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-title mb-4">Ready to Experience Quadratic Voting?</h2>
              <p className="text-body text-muted-foreground mb-8">
                Connect your wallet and participate in democratic governance that actually works.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/governance">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
                    Try Quadratic Voting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    Learn More About Us
                    <BarChart3 className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}