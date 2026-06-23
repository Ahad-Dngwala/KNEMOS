'use client'
import { motion } from 'framer-motion'

const ITEMS = [
  '100% LOCAL PROCESSING',
  'ZERO CLOUD TELEMETRY',
  'RUST NATIVE',
  'OFFLINE OCR',
  'DEEP WORK AUTOMATION',
  'AI MEMORY',
  'SQLITE VECTOR DB',
  'NO SUBSCRIPTIONS',
]

export const Marquee = () => {
  return (
    <div className="w-full overflow-hidden bg-black text-white py-4 flex whitespace-nowrap border-y border-[#333]">
      <motion.div
        className="flex gap-10 font-mono text-xs font-bold tracking-[3px] uppercase"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          ease: 'linear',
          duration: 20,
          repeat: Infinity,
        }}
      >
        {/* Render the items multiple times to create a seamless loop */}
        {[...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
          <div key={i} className="flex items-center gap-10">
            <span>{item}</span>
            <span className="text-[#555] opacity-50 text-[8px]">●</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
