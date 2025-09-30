import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from '@/components/providers/AppProviders'
import { Navigation } from '@/components/layout/Navigation'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: "QuadraticVote | Democratic Governance Reimagined",
  description: "Experience the future of democratic decision-making with quadratic voting on Arbitrum Stylus. Where every voice matters and mathematical fairness ensures democratic outcomes.",
  keywords: ["quadratic voting", "governance", "democracy", "arbitrum", "stylus", "blockchain", "voting", "dao"],
  authors: [{ name: "QuadraticVote Team" }],
  creator: "QuadraticVote",
  publisher: "QuadraticVote",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quadraticvote.io",
    siteName: "QuadraticVote",
    title: "QuadraticVote | Democratic Governance Reimagined",
    description: "Experience the future of democratic decision-making with quadratic voting on Arbitrum Stylus.",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuadraticVote | Democratic Governance Reimagined",
    description: "Experience the future of democratic decision-making with quadratic voting on Arbitrum Stylus.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
          </div>
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
        </AppProviders>
      </body>
    </html>
  );
}
