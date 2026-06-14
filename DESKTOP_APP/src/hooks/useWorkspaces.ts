import { useQuery } from '@tanstack/react-query'
import { authenticatedFetch } from '../store/auth.store'
import { UserWorkspace } from '../store/workspace.store'

const API = 'http://127.0.0.1:8765'

/**
 * useWorkspaces.ts
 *
 * React Query hook to fetch a read-only list of user workspaces. This hook
 * is suitable for components that want a cached view of workspaces without
 * directly mutating store state. Uses a 5-minute stale time to reduce
 * frequent network requests.
 */
export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async (): Promise<UserWorkspace[]> => {
      const res = await authenticatedFetch(`${API}/api/workspace/list`)
      if (!res.ok) throw new Error('Failed to fetch workspaces')
      const data = await res.json()
      return data.workspaces
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  })
}
