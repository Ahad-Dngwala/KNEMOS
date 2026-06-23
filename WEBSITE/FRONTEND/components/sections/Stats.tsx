'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

const stats = [
  { value: 40,   suffix: '+',  label: 'Browser tabs open, average session' },
  { value: 20,   suffix: ' min', label: 'Lost daily to context switching' },
  { value: 4.3,  suffix: ' GB', label: 'RAM wasted on idle background tabs' },
  { value: 40,   suffix: '%',  label: 'Deep work efficiency destroyed' },
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 1800
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, target)
      setCount(Math.round(current * 10) / 10)
      if (current >= target) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}

export const Stats = () => (
  <section className="bg-white py-12 px-6 relative">
    <div className="max-w-6xl mx-auto">
      <div className="w-full h-px bg-black mb-12"></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-black p-[2px] mb-12">
        {stats.map((s) => (
          <div key={s.label} className="bg-white px-5 py-[60px] text-center relative">
            <div className="text-5xl font-[100] tracking-[-2px] text-black mb-2.5 font-display">
              <CountUp target={s.value} suffix={s.suffix} />
            </div>
            <p className="text-xs tracking-[2px] uppercase font-medium text-black leading-snug">{s.label}</p>
            {/* Corner decoration similar to template */}
            <div className="absolute top-5 right-5 w-5 h-5 border border-black rotate-45"></div>
          </div>
        ))}
      </div>
    </div>
  </section>
)
