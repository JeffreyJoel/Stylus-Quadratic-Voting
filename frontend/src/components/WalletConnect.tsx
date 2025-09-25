'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@/contexts/WalletContext'
import { Wallet, LogOut, Loader2, ChevronDown, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
    disconnect
  } = useWallet()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleConnect = async (walletName?: string) => {
    try {
      await connect(walletName)
      toast.success(`${walletName || 'Wallet'} connected successfully!`)
    } catch (error: any) {
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

  const copyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account)
        setCopied(true)
        toast.success('Address copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Failed to copy address')
      }
    }
  }

  // Connected State - Clean header-style display
  if (isConnected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-success/10 border-success/20 hover:bg-success/20"
          >
            <div className="w-2 h-2 bg-success rounded-full" />
            <span className="hidden sm:inline font-mono text-sm">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <Badge variant="secondary" className="text-xs">
                {walletName || 'Connected'}
              </Badge>
            </div>
            <div className="font-mono text-sm text-muted-foreground break-all">
              {account}
            </div>
          </div>
          
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy Address'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDisconnect} 
            disabled={isDisconnecting}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            {isDisconnecting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Not Connected State - Clean connect button
  return (
    <div className="flex items-center gap-2">
      {availableWallets.length > 1 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              disabled={isConnecting}
              className="bg-primary hover:bg-primary/90"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                  <ChevronDown className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {availableWallets.map((wallet) => (
              <DropdownMenuItem 
                key={wallet.name}
                onClick={() => handleConnect(wallet.name)}
                className="cursor-pointer"
              >
                <span className="mr-2">{wallet.icon}</span>
                {wallet.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          onClick={() => handleConnect()}
          disabled={isConnecting}
          className="bg-primary hover:bg-primary/90"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
      )}
    </div>
  )
}