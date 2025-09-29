"use client";

import { VoterPanel } from "@/components/VoterPanel";
import { ContractStatus } from "@/components/ContractStatus";
import { useWallet } from "@/contexts/WalletContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gavel, AlertCircle, CheckCircle2 } from "lucide-react";

export default function GovernancePage() {
  const { isConnected, account } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Gavel className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Governance & Voting
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Register as a voter and participate in quadratic voting governance
            </p>
          </div>

          {/* Connection Status */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isConnected ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Wallet:</span>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                  {isConnected && account && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Address:</span>
                      <span className="text-sm font-mono text-muted-foreground">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network:</span>
                    <span className="text-sm text-muted-foreground">
                      Arbitrum Local (Chain ID: 412346)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Contract:</span>
                    <span className="text-sm font-mono text-muted-foreground">
                      0x44dd...b035
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Contract Status */}
          <ContractStatus contractAddress="0x44ddf6171263d86f9cea1f0919f738ac6945b035" />

          {/* Voter Panel */}
          {isConnected ? (
            <VoterPanel />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Connect Wallet to Continue</CardTitle>
                <CardDescription>
                  Please connect your wallet to register as a voter and
                  participate in governance
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Instructions</CardTitle>
              <CardDescription>
                How to test the smart contract integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Connect Your Wallet</p>
                    <p className="text-sm text-muted-foreground">
                      Make sure you&apos;re connected to the Arbitrum local devnode
                      (localhost:8547)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Test Voter Registration</p>
                    <p className="text-sm text-muted-foreground">
                      Enter an email address and register as a voter to test the
                      contract connection
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Check Browser Console</p>
                    <p className="text-sm text-muted-foreground">
                      Open browser developer tools to see transaction details
                      and contract responses
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
