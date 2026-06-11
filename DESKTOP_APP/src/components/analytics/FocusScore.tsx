import { useSystemStore } from '../../store/system.store'
import { motion } from 'framer-motion'

export const FocusScore = () => {
  const { focusScore } = useSystemStore()

  if (!focusScore) {
    return (
      <div className="w-full max-w-md mx-auto aspect-square flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-48 h-48 rounded-full border-8 border-surface-3 mb-8" />
          <div className="w-32 h-6 bg-surface-3 rounded mb-4" />
          <div className="w-48 h-4 bg-surface-3 rounded" />
        </div>
      </div>
    )
  }

  const { score, grade, focus_minutes, context_switches, trend } = focusScore

  // SVG Circle calculation
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving': return '';
      case 'declining': return '';
      default: return '';
    }
  }

  const getGradeColor = () => {
    switch (grade) {
      case 'A': return 'text-mint border-mint shadow-[0_0_20px_rgba(0,200,150,0.2)]'
      case 'B': return 'text-yellow-400 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]'
      case 'C': return 'text-danger border-danger shadow-[0_0_20px_rgba(255,75,75,0.2)]'
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <div className="relative w-64 h-64 mb-12">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="var(--color-surface-3)"
            strokeWidth="8"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="var(--color-mint)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-text-secondary uppercase tracking-[0.2em] mb-1">Score</span>
          <span className="text-6xl font-black text-white tracking-tighter">{score}</span>
        </div>

        <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full border-2 bg-surface flex items-center justify-center ${getGradeColor()}`}>
          <span className="text-2xl font-black">{grade}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-2">Focus Time</p>
          <p className="text-xl font-mono text-white">{Math.floor(focus_minutes / 60)}h {focus_minutes % 60}m</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-2">Switches</p>
          <p className="text-xl font-mono text-white">{context_switches}</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-2">Trend</p>
          <p className="text-xl font-bold text-white capitalize flex items-center justify-center gap-2">
            {trend} <span className="text-mint">{getTrendIcon()}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
