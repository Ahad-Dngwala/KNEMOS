import { useState } from 'react'
import { FocusScore } from './FocusScore.tsx'
import { WorkflowChart } from './WorkflowChart.tsx'
import { useQuery } from '@tanstack/react-query'

const API = 'http://127.0.0.1:8765'

export const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState<'focus' | 'workflow'>('focus')

  const { data: predictions } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/analytics/predictions`)
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
  })

  return (
    <div className="flex flex-col h-full bg-surface-2">
      {/* Dashboard Header */}
      <div className="px-8 py-6 border-b border-border bg-surface">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Productivity Analytics</h1>
        <p className="text-sm text-text-secondary">Powered by Wolfram Engine & Local AI</p>
        
        {/* Next Workspace Prediction */}
        {predictions && (
          <div className="mt-4 inline-flex items-center gap-3 bg-mint/5 border border-mint/20 rounded-full px-4 py-2">
            <span className="text-[10px] uppercase tracking-widest text-mint/80 font-bold">Predicted Next</span>
            <span className="text-sm font-medium text-white">{predictions.next_workspace}</span>
            <span className="text-xs font-mono text-mint/60">{(predictions.confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-8 pt-6">
        <div className="flex gap-1 bg-surface-3 p-1 rounded-lg w-fit mb-8">
          <button
            onClick={() => setActiveTab('focus')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'focus' 
                ? 'bg-surface shadow text-white' 
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Cognitive Focus
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'workflow' 
                ? 'bg-surface shadow text-white' 
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Workflow Heatmap
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-8 pb-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto h-full min-h-[400px] flex items-center justify-center">
          {activeTab === 'focus' ? <FocusScore /> : <WorkflowChart />}
        </div>
      </div>
    </div>
  )
}
