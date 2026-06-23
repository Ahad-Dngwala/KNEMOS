'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setErrorMsg(error.message)
      } else {
        setSent(true)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || 'An unexpected error occurred')
      } else {
        setErrorMsg('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 justify-center mb-10">
        <Image src="/KNEMOS.png" alt="KNEMOS" width={32} height={32} className="w-8 h-8" />
        <span className="font-bold text-lg tracking-widest text-foreground">KNEMOS</span>
      </div>

      {token ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border border-foreground mx-auto flex items-center justify-center bg-foreground text-background">
            <span className="text-2xl">✓</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display mb-2">Authenticated</h1>
            <p className="text-sm text-foreground/60">Your login was successful.</p>
          </div>

          <div className="border border-border p-6 text-left space-y-4">
            <p className="text-xs font-bold tracking-[2px] uppercase text-foreground">Your Auth Token</p>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={token}
                className="w-full border border-border px-4 py-3 text-sm outline-none text-foreground bg-foreground/5 font-mono"
              />
              <button
                onClick={handleCopyToken}
                className="bg-foreground text-background px-6 py-3 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-foreground/80 mt-6">
              <p className="text-xs font-bold tracking-[2px] uppercase text-foreground">Next Steps</p>
              <div className="flex gap-3">
                <span className="text-foreground font-bold flex-shrink-0">01</span>
                <span>Copy the token above.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-foreground font-bold flex-shrink-0">02</span>
                <span>Paste it into <strong>KNEMOS Desktop App → Settings → Auth Token</strong></span>
              </div>
              <div className="flex gap-3">
                <span className="text-foreground font-bold flex-shrink-0">03</span>
                <span>Paste it into <strong>KNEMOS Browser Extension → Settings</strong></span>
              </div>
              <div className="flex gap-3">
                <span className="text-foreground font-bold flex-shrink-0">04</span>
                <span><Link href="/download" className="underline text-foreground">Download KNEMOS</Link> if you haven't already.</span>
              </div>
            </div>
          </div>
        </div>
      ) : sent ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border border-foreground rotate-45 mx-auto flex items-center justify-center text-foreground">
            <span className="-rotate-45 text-2xl">✓</span>
          </div>
          <div>
            <p className="text-lg font-bold mb-2 text-foreground">Check your email</p>
            <p className="text-sm text-foreground/60">We sent a magic link to <strong>{email}</strong></p>
          </div>

          <div className="border border-border p-6 text-left space-y-4">
            <p className="text-xs font-bold tracking-[2px] uppercase text-foreground">Setup Instructions</p>
            
            <div className="space-y-3 text-sm text-foreground/80">
              <div className="flex gap-3">
                <span className="text-foreground font-bold flex-shrink-0">01</span>
                <span>After clicking the magic link, your auth token will be displayed on this page.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-foreground font-bold flex-shrink-0">02</span>
                <span>Copy the token and paste it into <strong>KNEMOS Desktop App → Settings → Auth Token</strong></span>
              </div>
              <div className="flex gap-3">
                <span className="text-foreground font-bold flex-shrink-0">03</span>
                <span>Paste the same token into your <strong>KNEMOS Browser Extension → Settings</strong></span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground font-display mb-2">Welcome Back</h1>
            <p className="text-sm text-foreground/60">Sign in to access your KNEMOS auth token.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-3 text-xs mb-6 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors text-foreground bg-background"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-3 text-sm tracking-widest uppercase disabled:opacity-50 hover:opacity-80 transition-opacity"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          <p className="text-center text-xs text-foreground/60 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-foreground underline">Sign up</Link>
          </p>
        </>
      )}
    </>
  )
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 relative transition-colors duration-300">
      <Link href="/" className="absolute top-8 left-8 text-xs font-bold tracking-[2px] uppercase text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2">
        <span>←</span> Back to Home
      </Link>
      
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="text-center text-xs">Loading...</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  )
}

