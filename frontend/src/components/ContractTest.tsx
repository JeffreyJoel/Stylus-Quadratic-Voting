'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, Play, Network, Wallet, FileText } from 'lucide-react'
import { testContractConnection, testContractReads, testVoterRegistration, runAllContractTests } from '@/lib/contractTest'
import { toast } from 'react-hot-toast'

interface TestResult {
  success: boolean
  error?: string
  step?: string
  [key: string]: unknown
}

export function ContractTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    connection?: TestResult
    reads?: TestResult
    registration?: TestResult
    comprehensive?: TestResult
  }>({})

  const runConnectionTest = async () => {
    setTesting(true)
    try {
      const result = await testContractConnection()
      setResults(prev => ({ ...prev, connection: result }))
      
      if (result.success) {
        toast.success('Contract connection successful!')
      } else {
        toast.error(`Connection failed: ${result.error}`)
      }
    } catch (error) {
      toast.error('Connection test failed')
    } finally {
      setTesting(false)
    }
  }

  const runReadTest = async () => {
    setTesting(true)
    try {
      const result = await testContractReads()
      setResults(prev => ({ ...prev, reads: result }))
      
      if (result.success) {
        toast.success('Contract reads successful!')
      } else {
        toast.error(`Read test failed: ${result.error}`)
      }
    } catch (error) {
      toast.error('Read test failed')
    } finally {
      setTesting(false)
    }
  }

  const runRegistrationTest = async () => {
    setTesting(true)
    try {
      const result = await testVoterRegistration()
      setResults(prev => ({ ...prev, registration: result }))
      
      if (result.success) {
        toast.success('Voter registration successful!')
      } else {
        toast.error(`Registration failed: ${result.error}`)
      }
    } catch (error) {
      toast.error('Registration test failed')
    } finally {
      setTesting(false)
    }
  }

  const runComprehensiveTest = async () => {
    setTesting(true)
    try {
      const result = await runAllContractTests()
      setResults(prev => ({ ...prev, comprehensive: result }))
      
      if (result.success) {
        toast.success('All tests passed! Contract is ready.')
      } else {
        toast.error(`Test failed at ${result.step}: ${result.error}`)
      }
    } catch (error) {
      toast.error('Comprehensive test failed')
    } finally {
      setTesting(false)
    }
  }

  const TestResultBadge = ({ result }: { result?: TestResult }) => {
    if (!result) return <Badge variant="secondary">Not Run</Badge>
    if (result.success) return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Passed</Badge>
    return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Contract Connection Test
        </CardTitle>
        <CardDescription>
          Test the connection to your deployed Quadratic Voting contract
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contract Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium">Contract Address</p>
            <p className="text-xs font-mono text-muted-foreground">0x44ddf6171263d86f9cea1f0919f738ac6945b035</p>
          </div>
          <div>
            <p className="text-sm font-medium">Network</p>
            <p className="text-xs text-muted-foreground">Arbitrum Local Devnode (Chain ID: 412346)</p>
          </div>
        </div>

        {/* Individual Tests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Network className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium">Connection Test</h3>
                <p className="text-sm text-muted-foreground">Test provider and contract instance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TestResultBadge result={results.connection} />
              <Button 
                onClick={runConnectionTest} 
                disabled={testing}
                variant="outline"
                size="sm"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-medium">Read Operations</h3>
                <p className="text-sm text-muted-foreground">Test contract read functions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TestResultBadge result={results.reads} />
              <Button 
                onClick={runReadTest} 
                disabled={testing}
                variant="outline"
                size="sm"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-medium">Voter Registration</h3>
                <p className="text-sm text-muted-foreground">Test voter registration transaction</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TestResultBadge result={results.registration} />
              <Button 
                onClick={runRegistrationTest} 
                disabled={testing}
                variant="outline"
                size="sm"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Comprehensive Test */}
        <div className="pt-4 border-t">
          <Button 
            onClick={runComprehensiveTest} 
            disabled={testing}
            className="w-full"
            size="lg"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
          
          {results.comprehensive && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TestResultBadge result={results.comprehensive} />
                <span className="font-medium">Comprehensive Test Result</span>
              </div>
              {results.comprehensive.success ? (
                <p className="text-sm text-green-600">🎉 All tests passed! Your contract is ready for integration.</p>
              ) : (
                <p className="text-sm text-red-600">❌ Failed at step: {results.comprehensive.step}</p>
              )}
            </div>
          )}
        </div>

        {/* Results Display */}
        {Object.keys(results).length > 0 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Test Results</h4>
            <pre className="text-xs overflow-auto max-h-40 bg-background p-2 rounded border">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
