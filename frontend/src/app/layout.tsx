import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Quadratic Voting - Arbitrum Stylus",
  description: "Decentralized quadratic voting system built with Arbitrum Stylus and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <WalletProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
