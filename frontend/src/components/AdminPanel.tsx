"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { QuadraticVotingService } from "@/lib/contract";
import { Settings, Users, Loader2, AlertCircle } from "lucide-react";
import React, { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export function AdminPanel() {
  const { account, signer } = useWallet();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voterInfo, setVoterInfo] = useState<any>(null);

  // Test voter registration
  const handleRegisterVoter = async () => {
    if (!signer || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setSubmitting(true);
      const service = new QuadraticVotingService(signer);

      console.log("Registering voter with email:", email);
      const tx = await service.registerVoter(email);

      toast.success("Registration transaction sent!");
      console.log("Transaction hash:", tx.hash);

      const receipt = await tx.wait();
      toast.success(
        `Voter registered successfully! Block: ${receipt.blockNumber}`
      );

      // Fetch updated voter info
      await fetchVoterInfo();

      setEmail("");
    } catch (error: unknown) {
      console.error("Failed to register voter:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to register voter";

      if (errorMessage?.includes("Unauthorized")) {
        toast.error("Voter already registered");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Note: The actual contract doesn't have a getVoter function
  // So we'll just show the wallet address and registration status will be shown after registration
  const fetchVoterInfo = useCallback(async () => {
    console.log(
      "ℹ️ Contract doesn't have getVoter function - showing wallet info only"
    );

    if (!account) {
      setVoterInfo(null);
      return;
    }

    // Set basic info since we can't query voter details from contract
    setVoterInfo({
      address: account,
      email: "Unknown (contract doesn't expose this)",
      isRegistered: "Unknown (register to test)",
    });
  }, [account]);

  // Fetch voter info on component mount and account change
  React.useEffect(() => {
    fetchVoterInfo();
  }, [fetchVoterInfo]);

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Contract Test Panel
          </CardTitle>
          <CardDescription>
            Connect your wallet to test smart contract functions
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Contract Test Panel
          </CardTitle>
          <CardDescription>
            Test voter registration and contract connection
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Voter Status */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">Current Voter Status</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Address:</span> {account}
              </p>
              {voterInfo ? (
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    {voterInfo.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Registration Status:</span>{" "}
                    <Badge variant="secondary">{voterInfo.isRegistered}</Badge>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Loading voter info...
                </p>
              )}
            </div>
          </div>

          {/* Voter Registration Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Voter Registration</h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <Button
                onClick={handleRegisterVoter}
                disabled={submitting || !email.trim()}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Register as Voter
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Contract Testing
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  This panel tests the connection to your deployed smart
                  contract. Contract Address:
                  0x44ddf6171263d86f9cea1f0919f738ac6945b035
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
