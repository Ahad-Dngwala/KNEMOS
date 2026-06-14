'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function DeepLinkHandler() {
  const params = useSearchParams()
  const token = params.get('token')

  useEffect(() => {
    if (token) {
      setTimeout(() => {
        window.location.href = `knemos://auth?token=${token}`
      }, 1500)
    }
  }, [token])

  return null
}

export default function DownloadPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch {
        setIsAuthenticated(false)
      } finally {
        setLoadingAuth(false)
      }
    }
    checkAuth()
  }, [])

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-24 px-6 relative text-black">
      <Suspense fallback={null}>
        <DeepLinkHandler />
      </Suspense>
      
      {/* Back Button */}
      <Link href="/" className="absolute top-8 left-8 text-xs font-bold tracking-[2px] uppercase hover:text-[#888] transition-colors flex items-center gap-2">
        <span>←</span> Back to Home
      </Link>

      <div className="max-w-4xl w-full mt-8">
        
        <div className="text-center mb-16 relative">
          <h1 className="text-6xl font-[100] tracking-[-2px] font-display text-black mb-4">Download KNEMOS</h1>
          <div className="w-[30px] h-[30px] border border-black rotate-45 mx-auto"></div>
        </div>

        {/* Auth Status Banner */}
        <div className="mb-8 border border-black p-4 flex items-center justify-between bg-white">
          {!loadingAuth && !isAuthenticated ? (
            <>
              <div>
                <p className="text-sm font-bold text-black">Sign in required to download</p>
                <p className="text-xs text-[#666] mt-1">Create a free account to access all downloads.</p>
              </div>
              <div className="flex gap-4">
                <Link href="/signin" className="text-xs uppercase tracking-[2px] font-bold border border-black px-4 py-2 hover:bg-[#f5f5f5] transition-colors text-black">
                  Sign In
                </Link>
                <Link href="/signup" className="text-xs uppercase tracking-[2px] font-bold bg-black text-white px-4 py-2 hover:bg-[#111] transition-colors">
                  Sign Up Free
                </Link>
              </div>
            </>
          ) : !loadingAuth && isAuthenticated ? (
            <>
              <div>
                <p className="text-sm font-bold text-black flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Authenticated
                </p>
                <p className="text-xs text-[#666] mt-1">You have access to all downloads.</p>
              </div>
              <div>
                <button 
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                  }}
                  className="text-xs uppercase tracking-[2px] font-bold border border-black px-4 py-2 hover:bg-[#f5f5f5] transition-colors text-black"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm font-bold text-black">Checking auth...</p>
            </div>
          )}
        </div>

        {/* Desktop App */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-[2px] mb-[2px]">
          <div className="bg-white p-12 border border-black relative group hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-[100] tracking-[-1px] font-display text-black mb-4">Desktop App</h3>
            <p className="text-sm text-[#666] leading-relaxed mb-8">
              The core operating layer for Windows 10/11. Requires local installation of Ollama and Tesseract OCR for maximum offline privacy.
            </p>
            {isAuthenticated ? (
              <a 
                href="https://github.com/Ahad-Dngwala/KnemOS/releases/download/v1.0.0/KNEMOS-Setup.exe" 
                download="KNEMOS-Setup.exe"
                className="inline-block px-8 py-3 bg-black text-white text-xs uppercase tracking-[2px] font-bold hover:bg-[#111] transition-colors"
              >
                Download .exe
              </a>
            ) : (
              <div className="space-y-2">
                <button 
                  disabled
                  className="inline-block px-8 py-3 bg-[#ccc] text-white text-xs uppercase tracking-[2px] font-bold cursor-not-allowed opacity-60"
                >
                  Download .exe
                </button>
                {!loadingAuth && (
                  <p className="text-xs text-[#888]">
                    <Link href="/signin" className="underline hover:text-black">Sign in</Link> to download
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="bg-black text-white p-12 flex flex-col justify-center items-center text-center">
            <div className="text-5xl font-[100] font-display mb-4">01</div>
            <h4 className="text-xs uppercase tracking-[2px] font-bold">Core System</h4>
          </div>
        </div>

        {/* Browser Extension */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-[2px] mb-[2px]">
          <div className="bg-black text-white p-12 flex flex-col justify-center items-center text-center">
            <div className="text-5xl font-[100] font-display mb-4">02</div>
            <h4 className="text-xs uppercase tracking-[2px] font-bold">Extension</h4>
          </div>
          <div className="bg-white p-12 border border-black relative group hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-[100] tracking-[-1px] font-display text-black mb-4">Browser Extension</h3>
            <p className="text-sm text-[#666] leading-relaxed mb-8">
              Chrome & Edge extension to feed your active tabs into the KNEMOS semantic memory pipeline. Optional, but highly recommended.
            </p>
            {isAuthenticated ? (
              <a 
                href="/downloads/KNEMOS-Extension.zip" 
                download
                className="inline-block px-8 py-3 border-2 border-black text-xs uppercase tracking-[2px] font-bold text-black hover:bg-black hover:text-white transition-colors"
              >
                Download .zip
              </a>
            ) : (
              <div className="space-y-2">
                <button 
                  disabled
                  className="inline-block px-8 py-3 border-2 border-[#ccc] text-xs uppercase tracking-[2px] font-bold text-[#ccc] cursor-not-allowed opacity-60"
                >
                  Install Extension
                </button>
                {!loadingAuth && (
                  <p className="text-xs text-[#888]">
                    <Link href="/signin" className="underline hover:text-black">Sign in</Link> to access
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
