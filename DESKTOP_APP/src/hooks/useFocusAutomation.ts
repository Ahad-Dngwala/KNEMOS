import { useEffect, useRef } from 'react'


// If no mouse/keyboard activity for 5 minutes (300000ms), trigger idle flow.
// For testing, we use a much shorter time if deepWorkActive is toggled manually, but this hook handles auto.
const IDLE_TIMEOUT_MS = 5 * 60 * 1000

export const useFocusAutomation = () => {
  const lastActive = useRef<number>(Date.now())
  const isIdle = useRef<boolean>(false)

  useEffect(() => {
    const handleActivity = () => {
      lastActive.current = Date.now()
      
      // If we were idle and came back, that's a "return" event
      if (isIdle.current) {
        isIdle.current = false
        // User returned! We could trigger an auto-focus clean up here.
        // For KnemOS: "detect when user returns after being away... quietly minimize non-relevant items"
        handleUserReturn()
      }
    }

    const checkIdle = setInterval(() => {
      if (!isIdle.current && Date.now() - lastActive.current > IDLE_TIMEOUT_MS) {
        isIdle.current = true
      }
    }, 10000)

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      clearInterval(checkIdle)
    }
  }, [])

  const handleUserReturn = () => {
    // 1. Notify backend to minimize background noise
    fetch('http://127.0.0.1:8765/api/workspace/focus', { method: 'POST' })
      .catch(() => {})

    // 2. Optionally trigger Deep Work mode in UI automatically if there's high distraction
  }
}
