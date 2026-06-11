import { TitleBar } from './components/layout/TitleBar'
import { Sidebar } from './components/layout/Sidebar'
import { MainArea } from './components/layout/MainArea'
import { DeepWorkOverlay } from './components/system/DeepWorkOverlay'
import { useWebSocket } from './hooks/useWebSocket'

export default function App() {
  // Connect to FastAPI WebSocket on mount
  useWebSocket()

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary overflow-hidden font-sans">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <MainArea />
      </div>

      <DeepWorkOverlay />
    </div>
  )
}
