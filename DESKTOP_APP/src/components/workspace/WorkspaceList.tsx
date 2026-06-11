import { motion } from 'framer-motion'
import { useWorkspaceStore } from '../../store/workspace.store'
import { useWorkspaces } from '../../hooks/useWorkspaces'
import { WorkspaceCard } from './WorkspaceCard'
import { useEffect } from 'react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export const WorkspaceList = () => {
  const { workspaces, setWorkspaces } = useWorkspaceStore()
  const { data, isLoading } = useWorkspaces()

  // Sync react-query data with zustand on initial load
  useEffect(() => {
    if (data && workspaces.length === 0) {
      setWorkspaces(data)
    }
  }, [data, workspaces.length, setWorkspaces])

  if (isLoading && workspaces.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-surface-3 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (workspaces.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary text-xs">
        <p>No workspaces yet.</p>
        <p className="mt-1 opacity-50">Click Auto Organize to start.</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-1 pb-4"
    >
      {workspaces.map(ws => (
        <motion.div key={ws.id} variants={item}>
          <WorkspaceCard workspace={ws} />
        </motion.div>
      ))}
    </motion.div>
  )
}
