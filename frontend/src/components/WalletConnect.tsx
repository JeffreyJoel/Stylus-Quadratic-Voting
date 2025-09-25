'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@/contexts/WalletContext'
import { Wallet, LogOut, Loader2, AlertTriangle, ExternalLink, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function WalletConnect() {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    chainId,
    walletName,
    availableWallets,
    connect, 
    disconnect, 
    switchToArbitrum 
  } = useWallet()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const ARBITRUM_LOCAL_CHAIN_ID = 412346
  const isCorrectNetwork = chainId === ARBITRUM_LOCAL_CHAIN_ID

  const handleConnect = async (walletName?: string) => {
    try {
      await connect(walletName)
      toast.success(`${walletName || 'Wallet'} connected successfully!`)
    } catch (error: any) {
      console.error('Connection error:', error) // DEBUG: will remove later
      
      if (error.message?.includes('No wallet detected') || error.message?.includes('No compatible wallet')) {
        toast.error('Please install a Web3 wallet (MetaMask, Coinbase, etc.)')
      } else if (error.message?.includes('rejected by user') || error.message?.includes('cancelled')) {
        toast.error('Connection cancelled by user')
      } else if (error.message?.includes('already pending')) {
        toast.error('Check your wallet - connection request is pending')
      } else {
        toast.error(error.message || 'Failed to connect wallet. Please try again.')
      }
    }
  }

  const handleDisconnect = () => {
    setIsDisconnecting(true)
    try {
      disconnect()
      toast.success('Wallet disconnected')
    } catch {
      toast.error('Failed to disconnect wallet')
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleSwitchNetwork = async () => {
    setIsSwitching(true)
    try {
      await switchToArbitrum()
      toast.success('Switched to Arbitrum Local network')
    } catch (error: any) {
      if (error.message?.includes('User rejected')) {
        toast.error('Network switch cancelled by user')
      } else {
        toast.error('Failed to switch network. Please try manually.')
      }
    } finally {
      setIsSwitching(false)
    }
  }

  if (isConnected && account) {
    return (
      <div className="w-full max-w-md space-y-3">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="text-center pb-3">
            <CardTitle className="flex items-center gap-2 justify-center text-green-800 dark:text-green-100">
              <Wallet className="h-5 w-5" />
              {walletName || 'Wallet'} Connected
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              {account.slice(0, 6)}...{account.slice(-4)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-300 font-mono break-all">
                {account}
              </p>
            </div>
            
            {/* Network Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network:</span>
              <Badge variant={isCorrectNetwork ? "default" : "destructive"}>
                {chainId ? `Chain ${chainId}` : 'Unknown'}
              </Badge>
            </div>

            <Button 
              onClick={handleDisconnect}
              variant="outline"
              disabled={isDisconnecting}
              size="sm"
              className="w-full"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Wrong Network Warning */}
        {!isCorrectNetwork && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Wrong Network
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Please switch to Arbitrum Local Devnode (Chain ID: {ARBITRUM_LOCAL_CHAIN_ID})
                  </p>
                  <Button
                    onClick={handleSwitchNetwork}
                    disabled={isSwitching}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    {isSwitching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Switching...
                      </>
                    ) : (
                      'Switch Network'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Wallet className="h-5 w-5" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>
          Connect your preferred wallet to participate in quadratic voting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableWallets.length > 1 ? (
          // Multiple wallets available - show dropdown
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="center">
              {availableWallets.map((wallet) => (
                <DropdownMenuItem 
                  key={wallet.name}
                  onClick={() => handleConnect(wallet.name)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-base">{wallet.icon}</span>
                  <span>{wallet.name}</span>
                  {!wallet.installed && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Install
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Single wallet or no wallet
          <Button 
            onClick={() => handleConnect()}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
        )}
        
        <div className="text-xs text-muted-foreground space-y-2">
          <p className="text-center font-medium">Available Wallets:</p>
          <div className="grid grid-cols-1 gap-1">
            {availableWallets.map((wallet) => (
              <div key={wallet.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-sm">{wallet.icon}</span>
                  <span>{wallet.name}</span>
                </span>
                {wallet.name === 'MetaMask' && (
                  <a 
                    href="https://metamask.io/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="pt-1 border-t">
            <p className="text-center text-xs">
              <span className="font-medium">Network:</span> Arbitrum Local Devnode (Chain ID: {ARBITRUM_LOCAL_CHAIN_ID})
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}