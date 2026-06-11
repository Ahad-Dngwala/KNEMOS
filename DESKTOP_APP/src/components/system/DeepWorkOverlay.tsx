import { motion, AnimatePresence } from 'framer-motion'
import { useSystemStore } from '../../store/system.store'
import { useWorkspaceStore } from '../../store/workspace.store'

export const DeepWorkOverlay = () => {
  const { deepWorkActive, setDeepWork } = useSystemStore()
  const { activeWorkspaceId, workspaces } = useWorkspaceStore()
  
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId)

  return (
    <AnimatePresence>
      {deepWorkActive && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-40 bg-surface/80 flex flex-col items-center justify-center border-4 border-mint/20"
        >
          {/* Subtle animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mint/5 rounded-full blur-[100px] animate-pulse-mint" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse-mint" style={{ animationDelay: '1s' }} />
          </div>

          <motion.div 
            initial={{ y: 20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            className="relative z-10 text-center max-w-lg mx-auto p-8 glass-card rounded-2xl border-mint/30 shadow-[0_0_40px_rgba(0,200,150,0.1)]"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-mint flex items-center justify-center animate-glow-mint">
              <svg className="w-8 h-8 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-2 tracking-tight text-white">Deep Work Mode</h2>
            <p className="text-text-secondary mb-6 text-sm">
              All non-essential applications are muted.
              {activeWorkspace && (
                <span className="block mt-2">
                  Focusing on <strong className="text-mint">{activeWorkspace.name}</strong>
                </span>
              )}
            </p>

            <button
              onClick={() => setDeepWork(false)}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-colors focus-ring"
            >
              Exit Focus Mode
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
