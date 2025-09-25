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
import { useWallet } from "@/contexts/WalletContext";
import { QuadraticVotingService } from "@/lib/contract";
import { Settings, Loader2, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

export function AdminPanel() {
  const { account, signer } = useWallet();

  // Session creation state
  const [sessionName, setSessionName] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [creditsPerVoter, setCreditsPerVoter] = useState(100);
  const [durationHours, setDurationHours] = useState(24);
  const [creatingSession, setCreatingSession] = useState(false);

  // Test session creation (admin function)
  const handleCreateSession = async () => {
    if (!signer || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!sessionName.trim() || !sessionDescription.trim()) {
      toast.error("Please enter session name and description");
      return;
    }

    try {
      setCreatingSession(true);
      const service = new QuadraticVotingService(signer);

      console.log("🚀 Creating session with params:", {
        name: sessionName,
        description: sessionDescription,
        creditsPerVoter,
        durationSeconds: durationHours * 3600,
      });

      // Create session without initial proposals (proposals will be added separately)
      const tx = await service.createSession(
        sessionName,
        sessionDescription,
        creditsPerVoter, // uint8 (max 255)
        BigInt(durationHours * 3600), // uint64 - duration in seconds
        [] // Empty proposals array - proposals will be created separately
      );

      toast.success("Session creation transaction sent!");
      console.log("Transaction hash:", tx.hash);

      const receipt = await tx.wait();
      toast.success(
        `Session created successfully! Block: ${receipt.blockNumber}`
      );

      // Reset form
      setSessionName("");
      setSessionDescription("");
      setCreditsPerVoter(100);
      setDurationHours(24);
    } catch (error: unknown) {
      console.error("Failed to create session:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create session";

      if (errorMessage?.includes("Unauthorized")) {
        toast.error("Only the contract admin can create sessions");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setCreatingSession(false);
    }
  };

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
            Admin Panel
          </CardTitle>
          <CardDescription>
            Create voting sessions and manage administrative functions. Use
            &ldquo;Create Proposal&rdquo; to add proposals to sessions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Session Creation (Admin Only) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Create Voting Session</h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Session Name</label>
                <Input
                  placeholder="Community Budget Vote"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  disabled={creatingSession}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Vote on how to allocate community funds"
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  disabled={creatingSession}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">
                    Credits per Voter
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="255"
                    value={creditsPerVoter}
                    onChange={(e) =>
                      setCreditsPerVoter(parseInt(e.target.value) || 100)
                    }
                    disabled={creatingSession}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Duration (hours)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={durationHours}
                    onChange={(e) =>
                      setDurationHours(parseInt(e.target.value) || 24)
                    }
                    disabled={creatingSession}
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateSession}
                disabled={
                  creatingSession ||
                  !sessionName.trim() ||
                  !sessionDescription.trim()
                }
                className="w-full"
                variant="secondary"
              >
                {creatingSession ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Create Voting Session
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
