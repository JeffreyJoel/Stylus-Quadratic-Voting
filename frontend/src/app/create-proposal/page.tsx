"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWallet } from "@/contexts/WalletContext";
import { QuadraticVotingService } from "@/lib/contract";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { WalletConnect } from "@/components/WalletConnect";
import { ContractStatus } from "@/components/ContractStatus";
import { CONTRACT_ADDRESS } from "@/lib/contract";

export default function CreateProposalPage() {
  const { account, signer } = useWallet();
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateProposal = async () => {
    if (!signer || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!proposalTitle.trim() || !proposalDescription.trim()) {
      toast.error("Please enter proposal title and description");
      return;
    }

    if (!sessionId.trim()) {
      toast.error("Please enter a session ID");
      return;
    }

    try {
      setCreating(true);
      const service = new QuadraticVotingService(signer);

      console.log("🚀 Creating proposal with params:", {
        sessionId: parseInt(sessionId),
        title: proposalTitle,
        description: proposalDescription,
      });

      // Note: This would need a contract function like addProposalToSession
      // For now, we'll show a message that this feature needs implementation
      toast.error("Proposal creation feature needs to be implemented in the smart contract");
      
      // Reset form on success (when implemented)
      // setProposalTitle("");
      // setProposalDescription("");
      // setSessionId("");
      
    } catch (error: unknown) {
      console.error("Failed to create proposal:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create proposal";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Proposal
            </CardTitle>
            <CardDescription>
              Connect your wallet to create proposals for voting sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create Proposal</h1>
          <p className="text-muted-foreground">
            Add a new proposal to an existing voting session
          </p>
        </div>

        {/* Contract Status */}
        <div className="max-w-2xl mx-auto">
          <ContractStatus contractAddress={CONTRACT_ADDRESS} />
        </div>

        {/* Create Proposal Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Proposal
            </CardTitle>
            <CardDescription>
              Create a proposal that voters can vote on in an active session
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Session ID</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  disabled={creating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The ID of the voting session to add this proposal to
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Proposal Title</label>
                <Input
                  placeholder="Increase community funding for parks"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  disabled={creating}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Proposal Description</label>
                <Textarea
                  placeholder="Detailed description of the proposal, including rationale and expected outcomes..."
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  disabled={creating}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleCreateProposal}
                disabled={
                  creating ||
                  !proposalTitle.trim() ||
                  !proposalDescription.trim() ||
                  !sessionId.trim()
                }
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Proposal...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Proposal
                  </>
                )}
              </Button>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Feature Under Development
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    The smart contract currently creates proposals during session creation. 
                    A separate "add proposal to session" function needs to be implemented 
                    for this feature to work.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
