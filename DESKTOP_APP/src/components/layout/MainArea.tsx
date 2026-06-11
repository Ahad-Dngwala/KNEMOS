import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard'

export const MainArea = () => {
  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col bg-surface-2 relative">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-mint/5 rounded-full blur-[120px] pointer-events-none" />
      
      <AnalyticsDashboard />
    </div>
  )
}
