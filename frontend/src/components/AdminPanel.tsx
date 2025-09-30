"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateSessionDialog } from "./CreateSessionDialog";
import { useAccount } from "wagmi";
import { Settings, AlertCircle } from "lucide-react";

export function AdminPanel() {
  const { address } = useAccount();

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            Connect your wallet to access administrative functions
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
            Create voting sessions and manage administrative functions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Session Creation (Admin Only) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Create Voting Session</h3>
            <p className="text-sm text-muted-foreground">
              Click the button below to create a new voting session with multiple proposals.
            </p>

            <CreateSessionDialog>
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" />
                Create Voting Session
              </button>
            </CreateSessionDialog>
          </div>

          {/* Contract Info */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Contract Information
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  This panel provides administrative access to your deployed smart
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
