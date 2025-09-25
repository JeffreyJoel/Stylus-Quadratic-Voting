'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WalletConnect } from '@/components/WalletConnect'
import { useWallet } from '@/contexts/WalletContext'
import { 
  Menu, 
  X, 
  Vote, 
  Moon, 
  Sun, 
  BookOpen, 
  Users,
  BarChart3,
  Home,
  Info,
  Gavel
} from 'lucide-react'
import { useTheme } from 'next-themes'

const navigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home
  },
  {
    name: 'How It Works',
    href: '/how-it-works',
    icon: BookOpen
  },
  {
    name: 'About',
    href: '/about',
    icon: Info
  },
  {
    name: 'Governance',
    href: '/governance',
    icon: Gavel,
    requiresConnection: true
  }
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { isConnected } = useWallet()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
              <Vote className="h-6 w-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl blur" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                QuadraticVote
              </h1>
              <p className="text-xs text-muted-foreground">Powered by Arbitrum</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const canAccess = !item.requiresConnection || isConnected

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : canAccess
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      : 'text-muted-foreground/50 cursor-not-allowed'
                  }`}
                  onClick={(e) => {
                    if (!canAccess) {
                      e.preventDefault()
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Wallet Connect - Desktop */}
            <div className="hidden md:block">
              <WalletConnect />
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const canAccess = !item.requiresConnection || isConnected

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : canAccess
                        ? 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        : 'text-muted-foreground/50 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (!canAccess) {
                        e.preventDefault()
                      } else {
                        setIsOpen(false)
                      }
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {item.requiresConnection && !isConnected && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        Connect Wallet
                      </span>
                    )}
                  </Link>
                )
              })}
              
              {/* Mobile Wallet Connect */}
              <div className="pt-4 border-t">
                <WalletConnect />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}