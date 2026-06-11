import { useState, useEffect } from 'react'
import { useMemoryStore } from '../../store/memory.store'
import { useMemorySearch } from '../../hooks/useMemorySearch'
import { MemoryResult } from './MemoryResult'

export const MemorySearch = () => {
  const { query, setQuery } = useMemoryStore()
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  
  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: results, isLoading, isError } = useMemorySearch(debouncedQuery)

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search semantic memory..."
          className="w-full bg-surface-3 border border-border rounded text-xs px-3 py-2 text-white placeholder:text-text-secondary focus-ring transition-colors"
        />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <svg className="animate-spin h-3 w-3 text-mint" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {isError && (
          <div className="text-xs text-danger text-center py-4 bg-danger/10 rounded">
            Error searching memory
          </div>
        )}
        
        {results?.length === 0 && debouncedQuery && !isLoading && (
          <div className="text-xs text-text-secondary text-center py-4">
            No memories found.
          </div>
        )}

        {results?.map(result => (
          <MemoryResult key={result.id} result={result} />
        ))}
        
        {!debouncedQuery && (
          <div className="text-[10px] text-text-secondary/50 text-center py-4 px-2 italic">
            Search your past screen states using natural language.
          </div>
        )}
      </div>
    </div>
  )
}
