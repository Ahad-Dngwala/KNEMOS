import { WorkspaceList } from '../workspace/WorkspaceList'
import { OrganizeButton } from '../workspace/OrganizeButton'
import { MemorySearch } from '../memory/MemorySearch'
import { RAMMonitor } from '../system/RAMMonitor'
import { useSystemStore } from '../../store/system.store'

export const Sidebar = () => {
  const { deepWorkActive, setDeepWork, focusScore } = useSystemStore()

  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-surface-2 border-r border-border h-full relative z-20 shadow-2xl overflow-hidden">

      {/* Organize button */}
      <div className="p-4 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <OrganizeButton />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Workspace list */}
        <div className="p-4">
          <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] mb-4 px-1 font-bold">Semantic Workspaces</p>
          <WorkspaceList />
        </div>

        {/* Memory Lane search */}
        <div className="border-t border-border p-4 bg-surface/30">
          <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] mb-3 px-1 font-bold text-mint/80">Memory Lane</p>
          <div className="h-64">
            <MemorySearch />
          </div>
        </div>
      </div>

      {/* Fixed bottom section */}
      <div className="bg-surface-2 border-t border-border mt-auto shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-10 relative">
        {/* Focus Score Mini */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-text-secondary uppercase tracking-widest">Cognitive Focus</p>
            <span className="text-xs font-mono text-white font-bold">{focusScore?.score ?? '--'}</span>
          </div>
          <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-mint transition-all duration-1000 ease-out"
              style={{ width: `${focusScore?.score ?? 0}%` }}
            />
          </div>
        </div>

        {/* RAM Monitor */}
        <RAMMonitor />

        {/* Deep Work Toggle */}
        <div className="p-4 border-t border-border bg-surface/50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Deep Work</span>
              <span className="text-[10px] text-text-secondary">Dim unrelated contexts</span>
            </div>
            
            <button
              onClick={() => setDeepWork(!deepWorkActive)}
              className={`relative w-12 h-6 rounded-full transition-colors focus-ring
                ${deepWorkActive ? 'bg-mint' : 'bg-surface-3 border border-border'}`}
            >
              <span 
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md
                  ${deepWorkActive ? 'left-6.5' : 'left-0.5'}`} 
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
