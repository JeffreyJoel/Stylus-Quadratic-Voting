'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowRight, 
  Users, 
  Target, 
  Lightbulb, 
  Shield, 
  Globe, 
  Github,
  Heart,
  Award,
  Zap,
  BookOpen,
  Code
} from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Heart className="w-4 h-4 mr-2" />
            Our Mission
          </Badge>
          <h1 className="text-hero mb-6">About QuadraticVote</h1>
          <p className="text-subheading text-muted-foreground">
            We're building the future of democratic governance through mathematical innovation and blockchain technology
          </p>
        </div>

        {/* Mission Statement */}
        <section className="max-w-4xl mx-auto mb-20">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-title mb-6">Our Mission</h2>
              <p className="text-body text-muted-foreground leading-relaxed">
                To democratize governance by creating tools that amplify every voice while preventing the concentration 
                of power. We believe that mathematical fairness, combined with blockchain transparency, can solve the 
                fundamental problems of traditional voting systems and create truly representative decision-making processes.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Core Values */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-display mb-6">Our Core Values</h2>
            <p className="text-body text-muted-foreground">
              The principles that guide everything we build
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every vote, every decision, every line of code is open and verifiable. We believe democracy requires 
                  complete transparency to function properly.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Inclusivity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Everyone deserves a voice in decisions that affect them. Our systems are designed to empower 
                  minorities while respecting majority preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We push the boundaries of what's possible in governance technology, always seeking better ways 
                  to capture and aggregate human preferences.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The Problem We Solve */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-display mb-8">The Problem We're Solving</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-heading mb-3">Democratic Deficit</h3>
                  <p className="text-muted-foreground">
                    Traditional voting systems fail to capture the intensity of preferences, leading to outcomes 
                    that don't reflect what people actually want or need.
                  </p>
                </div>
                <div>
                  <h3 className="text-heading mb-3">Wealth Concentration</h3>
                  <p className="text-muted-foreground">
                    In many governance systems, those with more resources have disproportionate influence, 
                    effectively allowing them to buy outcomes.
                  </p>
                </div>
                <div>
                  <h3 className="text-heading mb-3">Minority Suppression</h3>
                  <p className="text-muted-foreground">
                    Passionate minorities are consistently outvoted by apathetic majorities, even when the 
                    minority cares much more about the outcome.
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Traditional Voting Fails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-destructive/60 rounded-full" />
                    <span>90% mildly prefer A, 10% desperately need B</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-destructive/60 rounded-full" />
                    <span>Result: A wins despite causing real harm</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-destructive/60 rounded-full" />
                    <span>Social welfare is not maximized</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Our Solution */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardHeader>
                <CardTitle className="text-success">Quadratic Voting Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success/60 rounded-full" />
                    <span>90% cast 1 vote each for A (cost: 90 credits)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success/60 rounded-full" />
                    <span>10% cast 10 votes each for B (cost: 1000 credits)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success/60 rounded-full" />
                    <span>Result: B wins (100 vs 90 votes)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success/60 rounded-full" />
                    <span>Social welfare is maximized!</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-display mb-8">Our Solution</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-heading mb-3">Mathematical Fairness</h3>
                  <p className="text-muted-foreground">
                    Quadratic voting uses a proven mathematical formula to balance individual preferences 
                    with collective welfare, preventing both tyranny of the majority and minority.
                  </p>
                </div>
                <div>
                  <h3 className="text-heading mb-3">Blockchain Transparency</h3>
                  <p className="text-muted-foreground">
                    Every vote is recorded immutably on the blockchain, providing complete transparency 
                    and eliminating the possibility of fraud or manipulation.
                  </p>
                </div>
                <div>
                  <h3 className="text-heading mb-3">Accessible Technology</h3>
                  <p className="text-muted-foreground">
                    We build user-friendly interfaces that make advanced governance accessible to everyone, 
                    not just technical experts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-display mb-6">Built on Cutting-Edge Technology</h2>
            <p className="text-body text-muted-foreground">
              We leverage the best tools available to create secure, efficient, and user-friendly governance systems
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">Arbitrum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Layer 2 scaling solution providing fast, cheap transactions while inheriting Ethereum's security.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Code className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle className="text-lg">Stylus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  High-performance smart contracts written in Rust for optimal efficiency and security.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-lg">Next.js</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Modern React framework providing server-side rendering and optimal performance.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">TypeScript</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Type-safe development ensuring robust, maintainable code for critical governance systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Open Source Commitment */}
        <section className="max-w-4xl mx-auto mb-20">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Github className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-title mb-4">Open Source & Auditable</h2>
                <p className="text-body text-muted-foreground">
                  We believe that governance tools must be completely transparent and verifiable. That's why our entire 
                  codebase is open source and available for audit by anyone.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm">MIT Licensed</span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-sm">Full Documentation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm">Community Driven</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm">Security Audited</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Future Vision */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-display mb-6">Our Vision for the Future</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              We envision a world where every organization, from small communities to entire nations, 
              uses fair and transparent governance systems
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Short Term (2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <span>Launch on Arbitrum mainnet with full security audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <span>Mobile app for easier participation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <span>Integration with major DAO governance systems</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Long Term (2026+)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <span>Multi-chain deployment across all major networks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <span>Integration with traditional government systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <span>Advanced features like liquid democracy and delegation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-title mb-4">Join the Democratic Revolution</h2>
              <p className="text-body text-muted-foreground mb-8">
                Help us build a more democratic world where every voice is heard and mathematical fairness ensures optimal outcomes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/governance">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
                    Try Quadratic Voting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a 
                  href="https://github.com/JeffreyJoel/Stylus-Quadratic-Voting" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    View Source Code
                    <Github className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}