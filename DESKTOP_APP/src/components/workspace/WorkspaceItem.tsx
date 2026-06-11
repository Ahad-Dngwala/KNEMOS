import { Globe, Monitor, FileText, Cpu, Square } from 'lucide-react'
import { WorkspaceItem as IWorkspaceItem } from '../../store/workspace.store'

interface Props {
  item: IWorkspaceItem;
}

export const WorkspaceItem = ({ item }: Props) => {
  const getIcon = () => {
    switch (item.source) {
      case 'browser_tab': return <Globe size={10} />;
      case 'window': return <Monitor size={10} />;
      case 'file': return <FileText size={10} />;
      case 'process': return <Cpu size={10} />;
      default: return <Square size={10} />;
    }
  }

  return (
    <div className="flex items-center gap-2 py-1 px-1.5 hover:bg-surface-3 rounded truncate transition-colors">
      <span className="text-text-secondary opacity-70 shrink-0">{getIcon()}</span>
      <span className="text-xs text-text-secondary truncate" title={item.title}>
        {item.title}
      </span>
    </div>
  )
}
