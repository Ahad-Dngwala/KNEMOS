import { MemoryResultData } from '../../store/memory.store'

interface Props {
  result: MemoryResultData;
}

export const MemoryResult = ({ result }: Props) => {
  const date = new Date(result.timestamp * 1000)
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  
  return (
    <div className="p-3 mb-2 glass-card rounded-md hover:bg-surface-3 transition-colors group cursor-pointer border border-border hover:border-mint/30">
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[10px] text-mint font-mono font-bold uppercase tracking-wider">
          {result.similarity.toFixed(2)} Match
        </span>
        <span className="text-[10px] text-text-secondary">
          {dateString} · {timeString}
        </span>
      </div>
      
      <p className="text-xs text-text-primary line-clamp-3 mb-2 leading-relaxed">
        {result.text_preview || "No text preview available."}
      </p>

      {result.screenshot_path && (
        <div className="relative h-20 w-full rounded overflow-hidden border border-border group-hover:border-mint/20 transition-colors">
          <div className="absolute inset-0 bg-surface flex items-center justify-center text-[10px] text-text-secondary">
            Screenshot Available
          </div>
        </div>
      )}
    </div>
  )
}
