'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAccount } from 'wagmi'
import { 
  ArrowRight, 
  Users, 
  BarChart3, 
  Shield, 
  Zap,
  CheckCircle,
  TrendingUp,
  Globe,
  Lock
} from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  const { isConnected } = useAccount()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <Badge variant="outline" className="text-sm px-4 py-2 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-4 h-4 mr-2" />
              Powered by Arbitrum Stylus
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-16 animate-slide-up">
            <h1 className="text-hero mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Democratic Governance
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            <p className="text-subheading text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience the future of democratic decision-making with quadratic voting. 
              Where every voice matters, but extremism is naturally balanced through 
              mathematical fairness.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-20 animate-slide-up delay-200">
            <Link href={isConnected ? '/governance' : '#'}>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transform hover:scale-105 transition-all duration-300"
                disabled={!isConnected}
              >
                {isConnected ? 'Enter Governance' : 'Connect Wallet to Start'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 hover:bg-muted/50">
                Learn How It Works
                <BarChart3 className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Fair Representation */}
            <div className="group p-8 rounded-2xl glass-card hover:bg-card/90 transition-all duration-500 animate-slide-up delay-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-heading mb-4">Fair Representation</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                Quadratic pricing prevents wealthy participants from dominating outcomes, 
                ensuring every community member has meaningful influence.
              </p>
            </div>

            {/* Express Intensity */}
            <div className="group p-8 rounded-2xl glass-card hover:bg-card/90 transition-all duration-500 animate-slide-up delay-400">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-heading mb-4">Express Intensity</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                Show how much you care about issues with multiple votes. 
                The quadratic cost system naturally balances passion with pragmatism.
              </p>
            </div>

            {/* Transparent & Secure */}
            <div className="group p-8 rounded-2xl glass-card hover:bg-card/90 transition-all duration-500 animate-slide-up delay-500">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-heading mb-4">Transparent & Secure</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                All votes recorded on-chain with cryptographic security. 
                Open source, auditable, and resistant to manipulation.
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center animate-slide-up delay-600">
            <h3 className="text-heading mb-8 text-muted-foreground">
              Built on Proven Technology
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
                <span className="font-medium">Arbitrum</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <span className="font-medium">Stylus</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                  <Lock className="h-6 w-6 text-green-500" />
                </div>
                <span className="font-medium">Ethereum Security</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-orange-500" />
                </div>
                <span className="font-medium">Open Source</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}