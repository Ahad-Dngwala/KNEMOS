import { useQuery } from '@tanstack/react-query'
import { MemoryResultData } from '../store/memory.store'

const API = 'http://127.0.0.1:8765'

export const useMemorySearch = (query: string) => {
  return useQuery({
    queryKey: ['memorySearch', query],
    queryFn: async (): Promise<MemoryResultData[]> => {
      if (!query.trim()) return []
      
      const res = await fetch(`${API}/api/memory/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 10 }),
      })
      
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      return data.results
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 30, // 30 seconds
  })
}
