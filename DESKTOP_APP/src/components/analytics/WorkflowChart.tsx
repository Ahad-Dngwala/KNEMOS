import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

const API = 'http://127.0.0.1:8765'

export const WorkflowChart = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['heatmap'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/analytics/heatmap`)
      const json = await res.json()
      return json.data as { hour: number; intensity: number }[]
    },
    staleTime: 1000 * 60 * 15,
  })

  if (isLoading || !data) {
    return <div className="animate-pulse w-full h-64 bg-surface-3 rounded-xl" />
  }

  // Find max intensity for scaling
  const maxIntensity = Math.max(...data.map(d => d.intensity), 10)

  return (
    <div className="w-full glass-card p-8 rounded-2xl">
      <div className="flex items-end justify-between h-64 gap-2 mb-6">
        {data.map((point) => {
          // Calculate height percentage
          const height = Math.max((point.intensity / maxIntensity) * 100, 2)
          
          return (
            <div key={point.hour} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-surface-3 border border-border px-2 py-1 rounded text-[10px] whitespace-nowrap transition-opacity z-10 pointer-events-none">
                Activity: {point.intensity}
              </div>
              
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: point.hour * 0.02 }}
                className={`w-full rounded-sm max-w-[24px] ${point.intensity > 0 ? 'bg-mint' : 'bg-surface-3'} opacity-80 group-hover:opacity-100 transition-opacity`}
              />
            </div>
          )
        })}
      </div>

      <div className="flex justify-between text-[10px] text-text-secondary uppercase tracking-widest px-1">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  )
}
