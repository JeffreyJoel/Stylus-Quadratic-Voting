"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { wagmiConfig } from "./wagmi";
import { useEffect, useState } from "react";

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function CustomPrivyProvider({ children }: PrivyProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render PrivyProvider during SSR or if no app ID is configured
  if (!mounted || !process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        loginMethods: ["wallet", "email", "google", "github"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        supportedChains: [wagmiConfig.chains[0]], // Use our configured Arbitrum local chain
        defaultChain: wagmiConfig.chains[0],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "/logo.svg", // Add your logo path
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
