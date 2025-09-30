import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Calendar, Users, Plus, Minus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCreateSession, useWaitForTransaction } from "@/lib/hooks/useContract";
import { toast } from "react-hot-toast";

interface Proposal {
  id: number;
  title: string;
  description: string;
}

interface CreateSessionDialogProps {
  children?: React.ReactNode;
}

export function CreateSessionDialog({ children }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [voterAccess, setVoterAccess] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [proposals, setProposals] = useState<Proposal[]>([
    { id: 1, title: "", description: "" },
  ]);

  const { createSession, hash, error, isPending } = useCreateSession();
  const { isLoading: isWaitingForTx } = useWaitForTransaction(hash);

  const addProposal = () => {
    setProposals([
      ...proposals,
      { id: proposals.length + 1, title: "", description: "" },
    ]);
  };

  const removeProposal = (id: number) => {
    if (proposals.length > 1) {
      setProposals(proposals.filter((p) => p.id !== id));
    }
  };

  const updateProposal = (
    id: number,
    field: "title" | "description",
    value: string
  ) => {
    setProposals(
      proposals.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast.error("Please enter a session name");
      return;
    }

    if (!sessionDescription.trim()) {
      toast.error("Please enter a session description");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    const validProposals = proposals.filter(p => p.title.trim() && p.description.trim());
    if (validProposals.length === 0) {
      toast.error("Please add at least one proposal with title and description");
      return;
    }

    try {
      // Calculate duration in seconds
      const startTime = new Date(startDate).getTime() / 1000;
      const endTime = new Date(endDate).getTime() / 1000;
      const durationSeconds = BigInt(Math.max(0, endTime - startTime));

      if (durationSeconds <= 0) {
        toast.error("End date must be after start date");
        return;
      }

      // Convert proposals to the format expected by the contract
      const proposalTuples = validProposals.map((p) => [p.title.trim(), p.description.trim()] as const);

      await createSession(
        sessionName.trim(),
        sessionDescription.trim(),
        100, // Default credits per voter
        durationSeconds,
        validProposals // Pass the proposals in the expected format
      );

      toast.success("Session creation transaction sent!");

      // Reset form and close dialog
      setSessionName("");
      setSessionDescription("");
      setVoterAccess("all");
      setStartDate("");
      setEndDate("");
      setProposals([{ id: 1, title: "", description: "" }]);
      setOpen(false);
    } catch (error: unknown) {
      console.error("Failed to create session:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create session";
      toast.error(errorMessage);
    }
  };

  const isLoading = isPending || isWaitingForTx;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Voting Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Voting Session</DialogTitle>
          <DialogDescription>
            Set up your voting session details and proposals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="session-name">Session Name</Label>
            <Input
              id="session-name"
              placeholder="Enter voting session name"
              className="text-lg mt-1"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <Label>Voting Period</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voter-access">Voter Access</Label>
            <Select value={voterAccess} onValueChange={setVoterAccess} disabled={isLoading}>
              <SelectTrigger id="voter-access">
                <SelectValue placeholder="Select voter access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="token">Token Holders</SelectItem>
                <SelectItem value="whitelist">Whitelisted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-description">Session Description</Label>
            <Textarea
              id="session-description"
              placeholder="Add a description for your voting session..."
              className="min-h-[100px]"
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Proposals</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProposal}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Proposal
              </Button>
            </div>

            {proposals.map((proposal, index) => (
              <Card key={proposal.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Proposal {index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProposal(proposal.id)}
                    disabled={proposals.length === 1 || isLoading}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <div className="space-y-2 px-6 pb-4">
                  <Input
                    placeholder="Proposal Title"
                    value={proposal.title}
                    onChange={(e) =>
                      updateProposal(proposal.id, "title", e.target.value)
                    }
                    disabled={isLoading}
                  />
                  <Textarea
                    placeholder="Proposal Description"
                    value={proposal.description}
                    onChange={(e) =>
                      updateProposal(
                        proposal.id,
                        "description",
                        e.target.value
                      )
                    }
                    disabled={isLoading}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreateSession}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isWaitingForTx ? "Confirming..." : "Creating..."}
              </>
            ) : (
              "Create Voting Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
