'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Wallet, LogOut, Loader2, ChevronDown, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function WalletConnect() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const address = user?.wallet?.address

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <Button disabled className="bg-muted">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  const handleConnect = async () => {
    try {
      await login()
      toast.success('Wallet connected successfully!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage?.includes('rejected by user') || errorMessage?.includes('cancelled')) {
        toast.error('Connection cancelled by user')
      } else if (errorMessage?.includes('already pending')) {
        toast.error('Check your wallet - connection request is pending')
      } else {
        toast.error(errorMessage || 'Failed to connect wallet. Please try again.')
      }
    }
  }

  const handleDisconnect = async () => {
    try {
      await logout()
      toast.success('Wallet disconnected')
    } catch {
      toast.error('Failed to disconnect wallet')
    }
  }

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address)
        setCopied(true)
        toast.success('Address copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Failed to copy address')
      }
    }
  }

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <Button disabled className="bg-muted">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  // Connected State - Clean header-style display
  if (authenticated && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-success/10 border-success/20 hover:bg-success/20"
          >
            <div className="w-2 h-2 bg-success rounded-full" />
            <span className="hidden sm:inline font-mono text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <Badge variant="secondary" className="text-xs">
                {user?.wallet?.walletClientType || 'Connected'}
              </Badge>
            </div>
            <div className="font-mono text-sm text-muted-foreground break-all">
              {address}
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
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Not Connected State - Clean connect button
  return (
    <Button
      onClick={handleConnect}
      className="bg-primary hover:bg-primary/90"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  )
}