'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
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

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 relative transition-colors duration-300">
      <Link href="/" className="absolute top-8 left-8 text-xs font-bold tracking-[2px] uppercase text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2">
        <span>←</span> Back to Home
      </Link>
      
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-2 justify-center mb-10">
          <Image src="/KNEMOS.png" alt="KNEMOS" width={32} height={32} className="w-8 h-8" />
          <span className="font-bold text-lg tracking-widest text-foreground">KNEMOS</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 border border-foreground rotate-45 mx-auto mb-8 flex items-center justify-center text-foreground">
              <span className="-rotate-45 text-2xl">✓</span>
            </div>
            <p className="text-lg font-bold mb-2 text-foreground">Check your email</p>
            <p className="text-sm text-[#888]">We sent a magic link to <strong>{email}</strong></p>
            <p className="text-sm text-[#888] mt-2">After clicking the link, you will be redirected to download KNEMOS.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground font-display mb-2">Create Account</h1>
              <p className="text-sm text-foreground/60">Enter your email to get started. No password required.</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 border border-red-200 p-3 text-xs mb-6 text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
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
                className="w-full bg-foreground text-background py-3 text-sm tracking-widest uppercase disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Continue with Email'}
              </button>
            </form>

            <p className="text-center text-xs text-[#888] mt-6">
              Already have an account?{' '}
              <Link href="/signin" className="text-foreground underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
