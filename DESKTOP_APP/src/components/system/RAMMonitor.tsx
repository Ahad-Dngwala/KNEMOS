import { useSystemStore } from '../../store/system.store'

export const RAMMonitor = () => {
  const { ramStats } = useSystemStore()

  if (!ramStats) {
    return (
      <div className="border-t border-border p-4 animate-pulse">
        <div className="h-4 bg-surface-3 rounded w-1/2 mb-2" />
        <div className="h-2 bg-surface-3 rounded w-full" />
      </div>
    )
  }

  const { used_gb, total_gb, percent, saved_gb } = ramStats

  // Color logic based on RAM pressure
  const barColor = percent > 85 ? 'bg-danger' : percent > 65 ? 'bg-yellow-500' : 'bg-mint'

  return (
    <div className="border-t border-border p-4 glass-card mx-2 mb-2 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-text-secondary uppercase tracking-widest">RAM Usage</p>
        <span className="text-xs font-mono font-bold text-white">
          {used_gb.toFixed(1)} / {total_gb.toFixed(1)} GB
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Savings Metric */}
      <div className="flex items-center justify-between bg-mint/5 px-2 py-1.5 rounded text-[10px] border border-mint/10">
        <span className="text-mint/80 uppercase tracking-wide">AI Recovered</span>
        <span className="text-mint font-mono font-bold">+{saved_gb.toFixed(1)} GB</span>
      </div>
    </div>
  )
}
