"use client";

import { useWallet } from "@/contexts/WalletContext";
import { AdminPanel } from "@/components/AdminPanel";
import { ContractStatus } from "@/components/ContractStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import { Settings, Shield, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminPage() {
  const { isConnected, account } = useWallet();

  // Check if connected wallet is the admin wallet
  // For now, allow any connected wallet to test admin functions
  // TODO: Replace with actual admin address derived from the private key
  const isAdmin = !!account; // Temporarily allow any connected wallet

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Administrative interface for managing voting sessions, proposals,
              and contract functions
            </p>
          </div>

          {/* Admin Access Control */}
          {!isConnected ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Admin Access Required
                </CardTitle>
                <CardDescription>
                  Connect your admin wallet to access administrative functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletConnect />
              </CardContent>
            </Card>
          ) : !isAdmin ? (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Access Denied:</strong> This page is restricted to
                contract administrators only.
                <br />
                <span className="text-sm text-red-600 dark:text-red-400">
                  Connected: {account} | Admin verification needed
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Admin Access Granted:</strong> You have full
                administrative privileges.
              </AlertDescription>
            </Alert>
          )}

          {/* Contract Status */}
          <div className="mb-6">
            <ContractStatus contractAddress={CONTRACT_ADDRESS} />
          </div>
        </div>

        {/* Admin Panel Content */}
        {isConnected && isAdmin ? (
          <div className="max-w-4xl mx-auto">
            <AdminPanel />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Admin Panel Locked
              </h3>
              <p className="text-sm text-muted-foreground">
                {!isConnected
                  ? "Connect your admin wallet to access administrative functions"
                  : "Only the contract administrator can access this panel"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
