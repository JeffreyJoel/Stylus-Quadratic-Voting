"use client";

import { Hero } from "@/components/layout/Hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  Globe,
  Users,
  Shield,
  TrendingUp,
  CheckCircle2,
  Github,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-display mb-6">How Quadratic Voting Works</h2>
            <p className="text-subheading text-muted-foreground">
              A revolutionary approach to democratic decision-making that
              balances individual preferences with collective welfare
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-heading mb-4">Receive Credits</h3>
              <p className="text-body text-muted-foreground">
                Every participant receives an equal allocation of voting credits
                to spend on proposals they care about.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-heading mb-4">Vote with Intensity</h3>
              <p className="text-body text-muted-foreground">
                Allocate multiple votes to show how much you care. Each
                additional vote costs quadratically more credits.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-heading mb-4">Fair Outcomes</h3>
              <p className="text-body text-muted-foreground">
                The quadratic cost prevents domination by wealthy actors while
                allowing passionate minorities to be heard.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/how-it-works">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Deep Dive into the Mathematics
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-display mb-6">
                Why Quadratic Voting Matters
              </h2>
              <p className="text-subheading text-muted-foreground max-w-3xl mx-auto">
                Traditional voting systems have fundamental flaws. Quadratic
                voting addresses these issues through mathematical innovation.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-title mb-8">
                  Problems with Traditional Voting
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-destructive rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        Binary Choices Only
                      </h4>
                      <p className="text-muted-foreground">
                        Traditional voting treats all preferences as equal
                        intensity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-destructive rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Wealth Domination</h4>
                      <p className="text-muted-foreground">
                        Resource-based systems allow wealthy actors to control
                        outcomes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-destructive rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        Minority Suppression
                      </h4>
                      <p className="text-muted-foreground">
                        Passionate minorities are drowned out by apathetic
                        majorities
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-title mb-8">Quadratic Voting Solutions</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center mt-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Express Intensity</h4>
                      <p className="text-muted-foreground">
                        Show how much you care with multiple votes at increasing
                        cost
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center mt-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Prevent Domination</h4>
                      <p className="text-muted-foreground">
                        Quadratic costs make it expensive to monopolize
                        decisions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center mt-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Empower Minorities</h4>
                      <p className="text-muted-foreground">
                        Passionate groups can pool resources to influence
                        outcomes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-display mb-6">
              Built on Cutting-Edge Technology
            </h2>
            <p className="text-subheading text-muted-foreground">
              Leveraging Arbitrum Stylus for secure, efficient, and
              cost-effective governance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Arbitrum One</h3>
              <p className="text-sm text-muted-foreground">
                Ethereum Layer 2 for fast, cheap transactions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Stylus</h3>
              <p className="text-sm text-muted-foreground">
                High-performance smart contracts in Rust
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Ethereum Security</h3>
              <p className="text-sm text-muted-foreground">
                Inherits Ethereum's battle-tested security
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Open Source</h3>
              <p className="text-sm text-muted-foreground">
                Fully auditable and transparent codebase
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-display mb-6">
              Ready to Experience Democratic Innovation?
            </h2>
            <p className="text-subheading text-muted-foreground mb-12">
              Join the future of governance where every voice matters and
              mathematical fairness ensures democratic outcomes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/governance">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary"
                >
                  Start Voting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6"
                >
                  Learn More
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                <Link href="/" className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">QuadraticVote</span>
                </Link>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Democratizing governance through mathematical innovation.
                  Built on Arbitrum Stylus for the next generation of
                  decentralized decision-making.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com/JeffreyJoel/Stylus-Quadratic-Voting"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-5 w-5" />
                    <span>View Source</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <Link
                    href="/how-it-works"
                    className="block hover:text-foreground transition-colors"
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/governance"
                    className="block hover:text-foreground transition-colors"
                  >
                    Governance
                  </Link>
                  <Link
                    href="/about"
                    className="block hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Technology</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <a
                    href="https://arbitrum.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-foreground transition-colors"
                  >
                    Arbitrum
                  </a>
                  <a
                    href="https://docs.arbitrum.io/stylus/stylus-gentle-introduction"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-foreground transition-colors"
                  >
                    Stylus
                  </a>
                  <a
                    href="https://ethereum.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-foreground transition-colors"
                  >
                    Ethereum
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 QuadraticVote. Built with ❤️ for democratic innovation.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>Powered by Arbitrum Stylus</span>
                <Badge variant="secondary" className="text-xs">
                  Open Source
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
