'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'Does it really run 100% locally?',
    a: 'Yes. KNEMOS uses local LLMs via Ollama, local vector databases via ChromaDB/SQLite, and local OCR via Tesseract. Zero data leaves your machine. We do not even collect telemetry.'
  },
  {
    q: 'Does it work on macOS or Linux?',
    a: 'Currently, KNEMOS is optimized for Windows 10/11 because it relies heavily on Windows native APIs for deep window management and context tracking. A macOS version is on our long-term roadmap.'
  },
  {
    q: 'What hardware do I need?',
    a: 'For the best experience with the local AI Memory Assistant, we recommend at least 16GB of RAM and an NVIDIA GPU with 6GB+ VRAM. However, the core workspace organization features will run fine on standard laptops.'
  },
  {
    q: 'How does Deep Work Mode work?',
    a: 'When you activate Deep Work, KNEMOS analyzes the tabs and apps you need for your current task. It aggressively minimizes everything else and actively prevents you from opening distracting websites until your focus timer completes.'
  }
]

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="bg-[#fafafa] dark:bg-black py-32 px-6 border-t border-[#EAEAEA] dark:border-[#333] transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-[20px] mb-12">
          <div className="w-[10px] h-[10px] bg-black dark:bg-white"></div>
          <h2 className="text-4xl font-[100] tracking-[-1px] font-display text-black dark:text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className="border border-[#E0E0E0] dark:border-[#333] bg-white dark:bg-[#111] transition-colors hover:border-black dark:hover:border-white">
                <button
                  className="w-full text-left p-6 flex justify-between items-center bg-transparent"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span className="font-bold text-sm tracking-[0.5px] pr-8 text-black dark:text-white">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 relative flex-shrink-0"
                  >
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black dark:bg-white -translate-y-1/2" />
                    <div className="absolute top-0 left-1/2 w-[2px] h-full bg-black dark:bg-white -translate-x-1/2" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-sm text-[#666] dark:text-[#999] leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
