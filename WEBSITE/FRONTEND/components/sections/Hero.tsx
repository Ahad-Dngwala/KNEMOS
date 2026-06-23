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
  const y1 = useTransform(scrollY, [0, 1000], [0, -400])
  const y2 = useTransform(scrollY, [0, 1000], [0, -150])
  const y3 = useTransform(scrollY, [0, 1000], [0, -600])

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
    <section className="relative bg-background flex flex-col items-center justify-center overflow-hidden pt-[130px] pb-[100px] transition-colors duration-300">

      {/* Parallax Floating geometric shapes */}
      <div className="floating-objects absolute inset-0 pointer-events-none opacity-100">
        <motion.div style={{ y: y1 }} className="absolute top-20 left-[10%] w-[100px] h-[100px] border-[3px] border-foreground/60 rounded-full"></motion.div>
        <motion.div style={{ y: y2 }} className="absolute top-40 right-[15%] w-[80px] h-[80px] border-[3px] border-foreground/60 rounded-full"></motion.div>
        <motion.div style={{ y: y3 }} className="absolute bottom-40 left-[20%] w-[120px] h-[120px] border-[3px] border-foreground/60"></motion.div>
        <motion.div style={{ y: y1 }} className="absolute top-[40%] right-[10%] w-[3px] h-[200px] bg-foreground/60"></motion.div>
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
          className="text-[clamp(48px,8vw,88px)] font-[100] tracking-[-3px] text-foreground leading-[0.9] mb-8 font-display relative"
        >
          Less Context
          <br />
          Switching.
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[60px] h-[2px] bg-foreground"></div>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm tracking-[0.3em] uppercase text-[#888888] mb-12"
        >
          AI-Powered Semantic Workspace Operating System
        </motion.p>

        {/* Body: Replaced with Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-lg mx-auto bg-[#0a0a0a] text-[#aaaaaa] font-mono text-[11px] sm:text-xs p-5 rounded-md text-left mb-12 h-[220px] overflow-hidden border border-[#222] shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative mt-8"
        >
          <div className="absolute top-0 left-0 w-full h-6 bg-[#111] border-b border-[#222] flex items-center px-3 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
            <div className="mx-auto text-[#555] text-[10px] tracking-widest uppercase">knemos.exe</div>
          </div>
          <div className="mt-4 flex flex-col gap-1.5 opacity-90">
            {visibleLogs.map((log, i) => (
              <div key={i} className={log.startsWith('>') ? 'text-white' : log.startsWith('[ OK ]') ? 'text-[#dddddd]' : 'text-[#777777]'}>
                {log}
              </div>
            ))}
            {logIndex < TERMINAL_LOGS.length && (
              <div className={TERMINAL_LOGS[logIndex].startsWith('>') ? 'text-white' : 'text-[#777777]'}>
                {typedText}<span className="inline-block w-2 h-3 bg-white ml-1 animate-pulse"></span>
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
            className="text-xs uppercase tracking-[2px] font-bold text-foreground/50 hover:text-foreground transition-colors flex items-center gap-1"
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
