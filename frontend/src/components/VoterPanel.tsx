"use client";

import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { QuadraticVotingService } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner"; // Temporarily disabled
import { Users, Loader2, Vote, Calendar, Clock } from "lucide-react";

export function VoterPanel() {
  const { account, signer } = useWallet();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voterInfo, setVoterInfo] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Register as voter
  const handleRegisterVoter = async () => {
    if (!signer || !account) {
      console.error("Please connect your wallet");
      alert("Please connect your wallet");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address");
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
        `Voter registration successful! Block: ${receipt.blockNumber}`
      );

      // Refresh voter info after successful registration
      await fetchVoterInfo();
      setEmail("");
    } catch (error: unknown) {
      console.error("Failed to register voter:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to register voter";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch voter info (placeholder since contract doesn't have getVoter)
  const fetchVoterInfo = useCallback(async () => {
    console.log(
      "ℹ️ Contract doesn't have getVoter function - showing wallet info only"
    );
    if (account) {
      setVoterInfo({
        address: account,
        isRegistered: "Check after registration",
        email: "Not queryable from contract",
      });
    }
  }, [account]);

  // Load voting sessions (placeholder for now)
  const loadVotingSessions = useCallback(async () => {
    if (!account) return;

    try {
      setLoadingSessions(true);
      // TODO: Implement session loading when we have session management
      // For now, show placeholder data
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading

      setSessions([
        {
          id: 1,
          name: "Community Budget Allocation",
          description: "Vote on how to allocate community funds for Q1 2025",
          status: "Active",
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          creditsPerVoter: 100,
          proposalCount: 5,
        },
        {
          id: 2,
          name: "Protocol Upgrade Proposal",
          description:
            "Vote on proposed protocol improvements and new features",
          status: "Upcoming",
          endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          creditsPerVoter: 150,
          proposalCount: 3,
        },
      ]);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setSessions([]); // Set empty array on error
    } finally {
      setLoadingSessions(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      fetchVoterInfo();
      loadVotingSessions();
    } else {
      setVoterInfo(null);
      setSessions([]);
    }
  }, [account, fetchVoterInfo, loadVotingSessions]);

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connect Wallet to Participate
          </CardTitle>
          <CardDescription>
            Connect your wallet to register as a voter and participate in
            governance
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voter Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Voter Status
          </CardTitle>
          <CardDescription>
            Your current voter registration and participation status
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">Current Status</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Address:</span> {account}
              </p>
              {voterInfo && (
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
              )}
            </div>
          </div>

          {/* Voter Registration */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Register to Vote</h3>
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="your.email@example.com"
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
        </CardContent>
      </Card>

      {/* Active Voting Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Voting Sessions
          </CardTitle>
          <CardDescription>
            Participate in active voting sessions and view upcoming votes
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading sessions...
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{session.name}</h4>
                    <Badge
                      variant={
                        session.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {session.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Ends: {session.endTime.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Vote className="h-4 w-4" />
                      {session.proposalCount} proposals
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {session.creditsPerVoter} credits
                    </div>
                  </div>

                  <Button
                    variant={
                      session.status === "Active" ? "default" : "outline"
                    }
                    disabled={session.status !== "Active"}
                    className="w-full"
                  >
                    {session.status === "Active" ? "Vote Now" : "Coming Soon"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Active Sessions
              </h3>
              <p className="text-sm text-muted-foreground">
                There are currently no voting sessions available. Check back
                later!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
