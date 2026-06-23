'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Navbar = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
  <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-border transition-colors duration-300">
    <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-[-1px] text-foreground relative pr-4">
        <Image src="/KNEMOS.png" alt="KNEMOS Logo" width={24} height={24} className="w-6 h-6 object-contain dark:invert" />
        <span className="font-display">KNEMOS</span>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground"></div>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8 text-sm text-[#888]">
        <Link href="/updates" className="hover:text-foreground transition-colors">Updates</Link>
        <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
        <Link href="/download" className="hover:text-foreground transition-colors">Download</Link>
        
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-foreground hover:opacity-70 transition-opacity"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        <Link href="/signup" className="bg-foreground text-background px-4 py-1.5 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity">
          Sign Up
        </Link>
      </div>
    </div>
  </nav>
  )
}
