'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export const Showcase = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Subtle scale effect on scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  // Parallax the inner video/image slightly
  const y = useTransform(scrollYProgress, [0, 1], [-50, 50])
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1])

  return (
    <section ref={containerRef} className="bg-white dark:bg-black py-32 px-6 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-[3px] uppercase text-[#888] dark:text-[#aaa] mb-4">See It In Action</h2>
          <div className="w-[1px] h-12 bg-black dark:bg-[#333] mx-auto"></div>
        </div>

        <motion.div 
          style={{ scale }}
          className="relative w-full aspect-video bg-[#0a0a0a] rounded-xl overflow-hidden border border-[#222] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)]"
        >
          {/* Top Window Bar */}
          <div className="absolute top-0 left-0 w-full h-10 bg-[#111] border-b border-[#222] flex items-center px-4 z-20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#333]"></div>
              <div className="w-3 h-3 rounded-full bg-[#333]"></div>
              <div className="w-3 h-3 rounded-full bg-[#333]"></div>
            </div>
            <div className="mx-auto text-[10px] font-mono tracking-widest text-[#555]">KNEMOS - SEMANTIC WORKSPACE</div>
          </div>

          {/* Placeholder Content - Replace with an actual <video> tag later */}
          <motion.div style={{ y }} className="absolute inset-0 flex items-center justify-center opacity-80 pt-10">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            
            {/* Glowing orb in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white opacity-[0.03] blur-[100px] rounded-full"></div>
            
            <div className="text-center z-10">
              <div className="w-16 h-16 border border-[#333] mx-auto mb-6 flex items-center justify-center rotate-45">
                <div className="w-2 h-2 bg-white"></div>
              </div>
              <h3 className="text-white text-2xl font-display font-[100] tracking-widest uppercase mb-4">Professional Video Reel</h3>
              <p className="text-[#666] text-xs font-mono max-w-sm mx-auto">
                ( Insert high-quality looping .mp4 or .webm here to showcase the actual desktop software in action )
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
