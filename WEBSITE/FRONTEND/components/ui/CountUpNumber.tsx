'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'

export const CountUpNumber = ({ value, suffix = '' }: { value: number, suffix?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const springValue = useSpring(0, {
    bounce: 0,
    duration: 2000,
  })

  const displayValue = useTransform(springValue, (current) => {
    // If original value has decimals, keep 1 decimal place, else round to int
    if (value % 1 !== 0) {
      return current.toFixed(1)
    }
    return Math.floor(current).toString()
  })

  useEffect(() => {
    if (isInView) {
      springValue.set(value)
    }
  }, [isInView, springValue, value])

  return (
    <span ref={ref}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  )
}
