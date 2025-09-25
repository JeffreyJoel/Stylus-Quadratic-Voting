"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { ethers } from "ethers";

// Extend the existing Window.ethereum type with additional wallet properties
interface ExtendedEthereum {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isPhantom?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  removeAllListeners?: (event?: string) => void;
  selectedAddress?: string | null;
  chainId?: string;
  providers?: any[];
}

interface WalletInfo {
  name: string;
  icon: string;
  installed: boolean;
  provider?: any;
}

interface WalletContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  isConnecting: boolean;
  isConnected: boolean;
  chainId: number | null;
  walletName: string | null;
  availableWallets: WalletInfo[];
  connect: (walletName?: string) => Promise<void>;
  disconnect: () => void;
  switchToArbitrum: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  signTypedData: (domain: any, types: any, value: any) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Arbitrum Local Devnode Chain ID
const ARBITRUM_LOCAL_CHAIN_ID = 412346;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);

  const isConnected = Boolean(account && provider && signer);

  // Detect available wallets using EIP-6963 standard
  const detectWallets = useCallback((): WalletInfo[] => {
    const wallets: WalletInfo[] = [];

    if (typeof window !== "undefined") {
      // Primary wallet detection
      const ethereum = window.ethereum as ExtendedEthereum | undefined;
      if (ethereum) {
        if (ethereum.isMetaMask) {
          wallets.push({
            name: "MetaMask",
            icon: "🦊",
            installed: true,
            provider: ethereum,
          });
        } else if (ethereum.isCoinbaseWallet) {
          wallets.push({
            name: "Coinbase Wallet",
            icon: "🛡️",
            installed: true,
            provider: ethereum,
          });
        } else if (ethereum.isPhantom) {
          wallets.push({
            name: "Phantom",
            icon: "👻",
            installed: true,
            provider: ethereum,
          });
        } else {
          // Generic EIP-1193 wallet
          wallets.push({
            name: "Browser Wallet",
            icon: "🔗",
            installed: true,
            provider: ethereum,
          });
        }
      }

      // Multiple provider detection (EIP-6963 support)
      if (ethereum?.providers && Array.isArray(ethereum.providers)) {
        ethereum.providers.forEach((provider: any) => {
          if (provider.isMetaMask) {
            wallets.push({
              name: "MetaMask",
              icon: "🦊",
              installed: true,
              provider,
            });
          } else if (provider.isCoinbaseWallet) {
            wallets.push({
              name: "Coinbase Wallet",
              icon: "🛡️",
              installed: true,
              provider,
            });
          }
        });
      }
    }

    // Add WalletConnect as always available option
    wallets.push({
      name: "WalletConnect",
      icon: "🔗",
      installed: true, // WalletConnect doesn't require installation
      provider: null, // Will be handled differently
    });

    // Remove duplicates
    const uniqueWallets = wallets.filter(
      (wallet, index, self) =>
        index === self.findIndex((w) => w.name === wallet.name)
    );

    console.log("Detected wallets:", uniqueWallets); // DEBUG: will remove later
    return uniqueWallets;
  }, []);

  const [availableWallets] = useState<WalletInfo[]>(detectWallets());

  // Professional wallet connection with multi-wallet support
  const connect = useCallback(
    async (requestedWalletName?: string) => {
      console.log("🔗 Wallet connect called with:", requestedWalletName);
      setIsConnecting(true);

      try {
        let targetProvider = window.ethereum as ExtendedEthereum | undefined;
        let selectedWalletName = "Browser Wallet";

        console.log("🔍 Available ethereum provider:", !!targetProvider);

        // If specific wallet requested, find its provider
        if (requestedWalletName) {
          const wallet = availableWallets.find(
            (w) => w.name === requestedWalletName
          );
          if (wallet && wallet.provider) {
            targetProvider = wallet.provider;
            selectedWalletName = wallet.name;
          } else if (requestedWalletName === "WalletConnect") {
            throw new Error(
              "WalletConnect not implemented yet - use browser extension wallets for now"
            );
          }
        } else {
          // Auto-detect best available wallet
          const ethereum = window.ethereum as ExtendedEthereum | undefined;
          if (ethereum?.isMetaMask) {
            selectedWalletName = "MetaMask";
          } else if (ethereum?.isCoinbaseWallet) {
            selectedWalletName = "Coinbase Wallet";
          } else if (ethereum?.isPhantom) {
            selectedWalletName = "Phantom";
          }
        }

        if (!targetProvider) {
          throw new Error(
            `No ${
              requestedWalletName || "compatible"
            } wallet detected. Please install a Web3 wallet.`
          );
        }

        console.log(`Connecting to ${selectedWalletName}...`); // DEBUG: will remove later

        // Request account access with proper error handling
        const accounts = (await targetProvider.request({
          method: "eth_requestAccounts",
        })) as string[];

        if (!accounts || accounts.length === 0) {
          throw new Error(
            "No accounts available. Please unlock your wallet and try again."
          );
        }

        // Create provider and signer
        console.log("🔧 Creating browser provider...");
        const browserProvider = new ethers.BrowserProvider(targetProvider);

        console.log("🔧 Getting signer...");
        const walletSigner = await browserProvider.getSigner();

        console.log("🔧 Getting network...");
        const network = await browserProvider.getNetwork();

        console.log("✅ Connection successful:", {
          account: accounts[0],
          chainId: Number(network.chainId),
          walletName: selectedWalletName,
        });

        // Set state
        setAccount(accounts[0]);
        setProvider(browserProvider);
        setSigner(walletSigner);
        setChainId(Number(network.chainId));
        setWalletName(selectedWalletName);

        // Store connection preference
        localStorage.setItem("selectedWallet", selectedWalletName);
        localStorage.setItem("walletConnected", "true");

        console.log(
          `Successfully connected to ${selectedWalletName}:`,
          accounts[0]
        ); // DEBUG: will remove later

        // Network check (don't throw error, just warn)
        if (Number(network.chainId) !== ARBITRUM_LOCAL_CHAIN_ID) {
          console.warn(
            `Connected to chain ${network.chainId}, expected ${ARBITRUM_LOCAL_CHAIN_ID}`
          ); // DEBUG: will remove later
        }
      } catch (error: any) {
        console.error("Failed to connect wallet:", error); // DEBUG: will remove later

        // Reset state on error
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
        setWalletName(null);

        // Enhanced error messages
        if (error.code === 4001) {
          throw new Error("Connection rejected by user");
        } else if (error.code === -32002) {
          throw new Error(
            "Connection request already pending. Check your wallet."
          );
        } else if (error.message?.includes("No wallet")) {
          throw error;
        } else {
          throw new Error(
            `Failed to connect: ${error.message || "Unknown error"}`
          );
        }
      } finally {
        setIsConnecting(false);
      }
    },
    [availableWallets]
  );

  const disconnect = useCallback(() => {
    console.log(`Disconnecting from ${walletName}...`); // DEBUG: will remove later

    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setWalletName(null);

    // Clear stored connection data
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("selectedWallet");

    // Clear WalletConnect if it was being used
    localStorage.removeItem("walletconnect");
  }, [walletName]);

  const switchToArbitrum = useCallback(async () => {
    if (!provider) {
      throw new Error("No wallet connected");
    }

    try {
      console.log("Switching to Arbitrum Local network..."); // DEBUG: will remove later

      await provider.send("wallet_switchEthereumChain", [
        { chainId: `0x${ARBITRUM_LOCAL_CHAIN_ID.toString(16)}` },
      ]);
    } catch (switchError: any) {
      console.log("Switch error:", switchError); // DEBUG: will remove later

      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await provider.send("wallet_addEthereumChain", [
            {
              chainId: `0x${ARBITRUM_LOCAL_CHAIN_ID.toString(16)}`,
              chainName: "Arbitrum Local Devnode",
              rpcUrls: ["http://localhost:8547"],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ]);
        } catch (addError) {
          throw new Error("Failed to add Arbitrum Local network to wallet");
        }
      } else if (switchError.code === 4001) {
        throw new Error("Network switch rejected by user");
      } else {
        throw new Error(`Failed to switch network: ${switchError.message}`);
      }
    }
  }, [provider]);

  // Professional message signing with EIP-191 standard
  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!signer) {
        throw new Error("No wallet connected");
      }

      try {
        console.log("Signing message:", message); // DEBUG: will remove later

        const signature = await signer.signMessage(message);
        console.log("Message signed successfully"); // DEBUG: will remove later
        return signature;
      } catch (error: any) {
        console.error("Message signing failed:", error); // DEBUG: will remove later

        if (error.code === 4001) {
          throw new Error("Message signing rejected by user");
        } else {
          throw new Error(`Failed to sign message: ${error.message}`);
        }
      }
    },
    [signer]
  );

  // EIP-712 Typed Data Signing for structured data
  const signTypedData = useCallback(
    async (domain: any, types: any, value: any): Promise<string> => {
      if (!signer) {
        throw new Error("No wallet connected");
      }

      try {
        console.log("Signing typed data:", { domain, types, value }); // DEBUG: will remove later

        // Use EIP-712 typed data signing
        const signature = await signer.signTypedData(domain, types, value);
        console.log("Typed data signed successfully"); // DEBUG: will remove later
        return signature;
      } catch (error: any) {
        console.error("Typed data signing failed:", error); // DEBUG: will remove later

        if (error.code === 4001) {
          throw new Error("Signature rejected by user");
        } else {
          throw new Error(`Failed to sign typed data: ${error.message}`);
        }
      }
    },
    [signer]
  );

  // Listen for account and chain changes
  useEffect(() => {
    const ethereum = window.ethereum as ExtendedEthereum | undefined;
    if (!ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        // Account changed, reconnect
        if (isConnected) {
          connect();
        }
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainId = args[0] as string;
      const newChainId = parseInt(chainId, 16);
      setChainId(newChainId);
      // Optionally reconnect when chain changes
      if (isConnected) {
        connect();
      }
    };

    const handleDisconnect = () => {
      disconnect();
    };

    // Add event listeners
    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
    ethereum.on("disconnect", handleDisconnect);

    // Cleanup
    return () => {
      if (ethereum?.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
        ethereum.removeListener("disconnect", handleDisconnect);
      }
    };
  }, [account, isConnected, connect, disconnect]);

  // Check if wallet was previously connected on page load (but don't auto-connect)
  useEffect(() => {
    const checkPreviousConnection = async () => {
      const ethereum = window.ethereum as ExtendedEthereum | undefined;
      if (!ethereum) return;

      try {
        const accounts = (await ethereum.request({
          method: "eth_accounts",
        })) as string[];

        const wasConnected = localStorage.getItem("walletConnected") === "true";
        const savedWallet = localStorage.getItem("selectedWallet");

        console.log("Checking previous connection:", {
          accounts: accounts.length,
          wasConnected,
          savedWallet,
        }); // DEBUG: will remove later

        // Only restore connection if user has previously connected and granted permissions
        if (accounts.length > 0 && wasConnected && savedWallet) {
          console.log(`Restoring connection to ${savedWallet}...`); // DEBUG: will remove later
          await connect(savedWallet);
        }
      } catch (error) {
        console.error("Failed to check previous connection:", error); // DEBUG: will remove later
      }
    };

    checkPreviousConnection();
  }, [connect]);

  // Store connection state in localStorage
  useEffect(() => {
    if (isConnected) {
      localStorage.setItem("walletConnected", "true");
    } else {
      localStorage.removeItem("walletConnected");
    }
  }, [isConnected]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        isConnecting,
        isConnected,
        chainId,
        walletName,
        availableWallets,
        connect,
        disconnect,
        switchToArbitrum,
        signMessage,
        signTypedData,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
