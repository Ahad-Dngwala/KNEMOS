'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { MagneticButton } from '@/components/ui/MagneticButton'

const TERMINAL_LOGS = [
  '> systemctl start knemos.service',
  '[ OK ] Booting runtime environment...',
  '[ .. ] Initializing local embedding models',
  '[ OK ] Model qwen2.5:3b loaded in memory',
  '[ .. ] Connecting to SQLite vectors...',
  '[ OK ] IPC bridge ready on port 8765',
  '> knemos status',
  'SYSTEM: Deep Focus Active. Listening.'
]

export const Hero = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, -200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -100])
  const y3 = useTransform(scrollY, [0, 1000], [0, -300])

  const [logIndex, setLogIndex] = useState(0)
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    if (logIndex >= TERMINAL_LOGS.length) return

    const currentLine = TERMINAL_LOGS[logIndex]
    let charIndex = 0

    const typingInterval = setInterval(() => {
      if (charIndex <= currentLine.length) {
        setTypedText(currentLine.slice(0, charIndex))
        charIndex++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setLogIndex(prev => prev + 1)
        }, logIndex === 0 || logIndex === 6 ? 600 : 200) // Pause longer after commands
      }
    }, 30)

    return () => clearInterval(typingInterval)
  }, [logIndex])

  const visibleLogs = TERMINAL_LOGS.slice(0, logIndex)

  return (
    <section className="relative min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden pt-20">

      {/* Parallax Floating geometric shapes */}
      <div className="floating-objects absolute inset-0 pointer-events-none opacity-40">
        <motion.div style={{ y: y1 }} className="absolute top-20 left-[10%] w-[100px] h-[100px] border border-black/20 rounded-full"></motion.div>
        <motion.div style={{ y: y2 }} className="absolute top-40 right-[15%] w-[80px] h-[80px] border border-black/20 rounded-full"></motion.div>
        <motion.div style={{ y: y3 }} className="absolute bottom-40 left-[20%] w-[120px] h-[120px] border border-black/20"></motion.div>
        <motion.div style={{ y: y1 }} className="absolute top-[40%] right-[10%] w-[1px] h-[200px] bg-black/20"></motion.div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 text-xs text-[#888] tracking-[0.25em] uppercase mb-8 border border-[#E8E8E8] px-4 py-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          OSC AI Build 1.0 — Future of Productivity
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-[clamp(48px,8vw,88px)] font-[100] tracking-[-3px] text-black leading-[0.9] mb-8 font-display relative"
        >
          Less Context
          <br />
          Switching.
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[60px] h-[2px] bg-black"></div>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm tracking-[0.3em] uppercase text-[#888888] mb-6"
        >
          AI-Powered Semantic Workspace Operating System
        </motion.p>

        {/* Body: Replaced with Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-lg mx-auto bg-black text-[#00ff00] font-mono text-[11px] sm:text-xs p-5 rounded-md text-left mb-10 h-[220px] overflow-hidden border border-[#333] shadow-2xl relative"
        >
          <div className="absolute top-0 left-0 w-full h-6 bg-[#111] border-b border-[#333] flex items-center px-3 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            <div className="mx-auto text-[#666] text-[10px] tracking-widest uppercase">knemos.exe</div>
          </div>
          <div className="mt-4 flex flex-col gap-1.5 opacity-90">
            {visibleLogs.map((log, i) => (
              <div key={i} className={log.startsWith('>') ? 'text-white' : log.startsWith('[ OK ]') ? 'text-[#27c93f]' : 'text-[#888]'}>
                {log}
              </div>
            ))}
            {logIndex < TERMINAL_LOGS.length && (
              <div className={TERMINAL_LOGS[logIndex].startsWith('>') ? 'text-white' : 'text-[#888]'}>
                {typedText}<span className="inline-block w-2 h-3 bg-[#00ff00] ml-1 animate-pulse"></span>
              </div>
            )}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          {/* Primary */}
          <MagneticButton>
            <Link
              href="/download"
              className="cta-button inline-block"
            >
              Download for Windows
            </Link>
          </MagneticButton>

          {/* Secondary */}
          <a
            href="https://github.com/Ahad-Dngwala/KNEMOS"
            className="text-xs uppercase tracking-[2px] font-bold text-[#888] hover:text-black transition-colors flex items-center gap-1"
          >
            View on GitHub <span>→</span>
          </a>
        </motion.div>
      </div>

      {/* Template's scroll indicator / decoration */}
      <div className="hero-decoration"></div>
    </section>
  )
}
