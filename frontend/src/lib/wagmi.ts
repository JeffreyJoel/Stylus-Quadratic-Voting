import { createConfig, http } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'

// Contract configuration
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x44ddf6171263d86f9cea1f0919f738ac6945b035";


// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});

// Re-export wagmi hooks for easier imports
export {
  useAccount,
  useBalance,
  useBlockNumber,
  useChainId,
  useChains,
  useClient,
  useConfig,
  useConnect,
  useConnections,
  useConnectorClient,
  useDisconnect,
  useEnsAddress,
  useEnsAvatar,
  useEnsName,
  useEnsResolver,
  useFeeHistory,
  useGasPrice,
  useProof,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useReconnect,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useSimulateContract,
  useSwitchAccount,
  useSwitchChain,
  useToken,
  useTransaction,
  useTransactionConfirmations,
  useTransactionReceipt,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWatchAsset,
  useWatchBlocks,
  useWatchBlockNumber,
  useWatchPendingTransactions,
  useWriteContract,
} from 'wagmi'
