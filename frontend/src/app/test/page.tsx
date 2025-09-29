'use client'

import { ContractTest } from '@/components/ContractTest'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Contract Integration Test</h1>
            <p className="text-muted-foreground">
              Test the connection and functionality of your deployed Quadratic Voting contract
            </p>
          </div>
          
          <ContractTest />
          
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              🔧 Development Testing Page
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This page is for testing contract integration during development. 
              Make sure your Arbitrum local devnode is running on localhost:8547 before running tests.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
