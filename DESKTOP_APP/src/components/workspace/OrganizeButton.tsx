import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWorkspaceStore } from '../../store/workspace.store'
import { toast } from 'react-hot-toast'

const API = 'http://127.0.0.1:8765'

export const OrganizeButton = () => {
  const qc = useQueryClient()
  const setWorkspaces = useWorkspaceStore(s => s.setWorkspaces)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${API}/api/workspace/organize`, { method: 'POST' })
      if (!r.ok) throw new Error('Failed to organize workspaces')
      return r.json()
    },
    onSuccess: (data) => {
      setWorkspaces(data.workspaces)
      qc.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success(
        `Organized ${data.total_items} items into ${data.clusters_found} workspaces`
      )
    },
    onError: () => toast.error('Could not connect to AI backend'),
  })

  return (
    <motion.button
      onClick={() => mutate()}
      disabled={isPending}
      whileHover={{ scale: isPending ? 1 : 1.02 }}
      whileTap={{ scale: isPending ? 1 : 0.98 }}
      className={`w-full py-3 px-4 rounded-md text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-lg border relative overflow-hidden
        ${isPending
          ? 'bg-surface-3 text-text-secondary border-border cursor-wait'
          : 'bg-mint/10 text-mint border-mint/30 hover:bg-mint hover:text-black hover:border-mint hover:shadow-[0_0_20px_rgba(0,200,150,0.4)]'
        }`}
    >
      {isPending && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isPending ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Organizing...
          </>
        ) : 'Auto Organize'}
      </span>
    </motion.button>
  )
}
