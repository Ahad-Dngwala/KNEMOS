import { getCurrentWindow } from '@tauri-apps/api/window'

export const TitleBar = () => {
  const win = getCurrentWindow()
  
  return (
    <div
      data-tauri-drag-region
      className="h-9 flex items-center justify-between px-4 bg-surface border-b border-border flex-shrink-0 select-none z-50 relative"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
          <span className="text-black text-[9px] font-black">K</span>
        </div>
        <span className="text-xs font-bold tracking-[0.2em]">KnemOS</span>
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={() => win.minimize()} 
          className="w-7 h-7 hover:bg-border flex items-center justify-center text-text-secondary hover:text-white rounded text-sm transition-colors"
        >
          
        </button>
        <button 
          onClick={() => win.toggleMaximize()} 
          className="w-7 h-7 hover:bg-border flex items-center justify-center text-text-secondary hover:text-white rounded text-sm transition-colors"
        >
          
        </button>
        <button 
          onClick={() => win.close()} 
          className="w-7 h-7 hover:bg-danger/20 flex items-center justify-center text-text-secondary hover:text-danger rounded text-sm transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  )
}
