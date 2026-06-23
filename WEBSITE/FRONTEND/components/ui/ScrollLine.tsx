'use client'
import { motion, useScroll, useSpring } from 'framer-motion'

export const ScrollLine = () => {
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      className="fixed top-0 right-0 w-1 bg-black z-[9999] origin-top hidden md:block"
      style={{ scaleY, height: '100vh' }}
    />
  )
}
