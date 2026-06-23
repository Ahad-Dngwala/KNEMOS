'use client'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { MouseEvent } from 'react'

const features = [
  { num: '01', title: 'Semantic Clustering', desc: 'AI groups tabs automatically.' },
  { num: '02', title: 'Memory Lane', desc: 'Search screen history in natural language.' },
  { num: '03', title: 'Deep Work Mode', desc: 'Minimizes off-context apps dynamically.' },
  { num: '04', title: 'RAM Recovery', desc: 'Live counter of memory reclaimed from tabs.' },
  { num: '05', title: 'Wolfram Analytics', desc: 'Algorithmic cognitive focus scores.' },
  { num: '06', title: 'Context Export', desc: 'One-click Markdown snapshot of workspaces.' },
]

const FeatureCard = ({ f, i }: { f: any, i: number }) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const isDark = i % 2 !== 0

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden p-[60px_20px] border-r border-b border-black transition-all duration-300 group cursor-default ${
        isDark ? 'bg-black text-white hover:text-black' : 'bg-white text-black hover:text-white'
      }`}
    >
      {/* Glare effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'},
              transparent 80%
            )
          `,
        }}
      />
      
      <div className="relative z-10">
        <div className="text-5xl font-[100] mb-5 font-display text-inherit transition-colors">{f.num}</div>
        <h4 className="text-sm tracking-[2px] uppercase font-medium mb-3 text-inherit transition-colors">{f.title}</h4>
        <p className="text-xs text-[#888] group-hover:text-inherit transition-colors">{f.desc}</p>
      </div>
    </div>
  )
}

export const Features = () => (
  <section id="features" className="bg-white py-20 px-6 text-center">
    <div className="max-w-6xl mx-auto">
      
      <div className="flex items-center justify-center gap-[30px] mb-[60px]">
        <div className="w-[15px] h-[15px] bg-black"></div>
        <h2 className="text-5xl font-[100] tracking-[-1px] font-display text-black">Features</h2>
        <div className="w-[15px] h-[15px] bg-black"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border-l border-t border-black">
        {features.map((f, i) => (
          <FeatureCard key={f.num} f={f} i={i} />
        ))}
      </div>
    </div>
  </section>
)
