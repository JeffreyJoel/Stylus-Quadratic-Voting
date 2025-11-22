import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { arbitrum, arbitrumSepolia, mainnet } from '@reown/appkit/networks'

// Get the project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect will not work.')
}

// Define Arbitrum Local Devnode network
const arbitrumLocal = {
  chainId: 412346,
  name: 'Arbitrum Local Devnode',
  currency: 'ETH',
  explorerUrl: '',
  rpcUrl: 'http://localhost:8547'
}

// Metadata for the app
const metadata = {
  name: 'Quadratic Voting',
  description: 'Decentralized Quadratic Voting on Arbitrum Stylus',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the AppKit instance
let appKit: ReturnType<typeof createAppKit> | null = null

export function getAppKit() {
  if (!appKit && typeof window !== 'undefined') {
    appKit = createAppKit({
      adapters: [new EthersAdapter()],
      networks: [arbitrumLocal as any, arbitrum, arbitrumSepolia, mainnet],
      metadata,
      projectId,
      features: {
        analytics: false, // Optional - Enable analytics
        email: false, // Optional - Enable email login
        socials: [], // Optional - Enable social logins
      },
      themeMode: 'light',
      themeVariables: {
        '--w3m-accent': '#3b82f6', // Blue accent color
        '--w3m-border-radius-master': '8px',
      }
    })
  }
  return appKit
}

export { projectId }
