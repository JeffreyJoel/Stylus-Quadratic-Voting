interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    on: (eventName: string, callback: (...args: unknown[]) => void) => void
    removeListener: (eventName: string, callback: (...args: unknown[]) => void) => void
    removeAllListeners?: (event?: string) => void
    isMetaMask?: boolean
    isCoinbaseWallet?: boolean
    isPhantom?: boolean
    selectedAddress?: string | null
    chainId?: string
    providers?: unknown[]
  }
}