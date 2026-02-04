import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Star, Eye, X, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useToast } from '../../hooks/useToast';
import { Badge } from '../ui/Badge';
import type { PortInfo, ProcessType } from '../../types';

interface PortTreeViewProps {
  ports: PortInfo[];
  selectedPort: PortInfo | null;
  onSelectPort: (port: PortInfo | null) => void;
  onKillProcess: (pid: number) => Promise<boolean>;
}

interface GroupedPorts {
  [key: string]: PortInfo[];
}

export function PortTreeView({
  ports,
  selectedPort,
  onSelectPort,
  onKillProcess,
}: PortTreeViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Web', 'Dev', 'Database']));

  const groupedPorts = useMemo(() => {
    const groups: GroupedPorts = {};
    for (const port of ports) {
      const type = port.process_type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(port);
    }
    return groups;
  }, [ports]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const typeOrder: ProcessType[] = ['Web', 'Dev', 'Database', 'System', 'Other'];

  if (ports.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        <div className="text-center">
          <p className="text-base">No ports found</p>
          <p className="text-sm mt-1">Try adjusting your filters or refreshing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-1">
      {typeOrder.map((type) => {
        const typePorts = groupedPorts[type];
        if (!typePorts || typePorts.length === 0) return null;

        const isExpanded = expandedGroups.has(type);

        return (
          <div key={type} className="rounded-md overflow-hidden">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(type)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.05] rounded-md transition-colors"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.1 }}
              >
                <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              </motion.div>
              <Badge type={type} />
              <span className="text-xs text-text-muted">
                {typePorts.length}
              </span>
            </button>

            {/* Group Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="overflow-hidden"
                >
                  <div className="mt-0.5">
                    {typePorts.map((port) => (
                      <TreePortRow
                        key={`${port.port}-${port.pid}`}
                        port={port}
                        isSelected={selectedPort?.port === port.port && selectedPort?.pid === port.pid}
                        onSelect={() => onSelectPort(port)}
                        onKillProcess={onKillProcess}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

interface TreePortRowProps {
  port: PortInfo;
  isSelected: boolean;
  onSelect: () => void;
  onKillProcess: (pid: number) => Promise<boolean>;
}

function TreePortRow({ port, isSelected, onSelect, onKillProcess }: TreePortRowProps) {
  const [isKilling, setIsKilling] = useState(false);
  const { addToast } = useToast();
  const {
    favorites,
    addFavorite,
    removeFavorite,
    watchedPorts,
    addWatched,
    removeWatched,
  } = useAppStore();

  const isFavorite = favorites.includes(port.port);
  const isWatched = watchedPorts.includes(port.port);

  const handleKill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isKilling) return;

    setIsKilling(true);
    try {
      const success = await onKillProcess(port.pid);
      if (success) {
        addToast('success', `Killed process ${port.process_name || 'Unknown'} (PID: ${port.pid})`);
      } else {
        addToast('error', `Failed to kill process ${port.process_name || 'Unknown'}`);
        setIsKilling(false);
      }
    } catch (error) {
      addToast('error', `Error killing process: ${error}`);
      setIsKilling(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFavorite(port.port);
      addToast('success', `Removed port ${port.port} from favorites`);
    } else {
      addFavorite(port.port);
      addToast('success', `Added port ${port.port} to favorites`);
    }
  };

  const toggleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWatched) {
      removeWatched(port.port);
      addToast('success', `Stopped watching port ${port.port}`);
    } else {
      addWatched(port.port);
      addToast('success', `Now watching port ${port.port}`);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-1.5 pl-9 cursor-pointer transition-colors rounded-md
        ${isSelected ? 'bg-accent-blue/10' : 'hover:bg-white/[0.02]'}
        ${isKilling ? 'opacity-50' : ''}`}
    >
      <div className={`w-2 h-2 rounded-full ${isKilling ? 'bg-accent-yellow' : 'bg-accent-green'}`} />

      <div className="flex items-center gap-1.5 min-w-[70px]">
        <span className="font-mono text-sm font-medium text-text-primary">{port.port}</span>
        {isFavorite && <Star className="w-3 h-3 text-accent-yellow fill-accent-yellow" />}
        {isWatched && <Eye className="w-3 h-3 text-accent-blue" />}
      </div>

      <span className="flex-1 truncate text-sm text-text-secondary">
        {port.process_name || 'Unknown'}
      </span>

      <span className="font-mono text-xs text-text-muted">{port.pid}</span>

      <div className="flex items-center gap-0.5">
        <button
          onClick={toggleFavorite}
          disabled={isKilling}
          className="p-1 rounded hover:bg-white/5 transition-colors opacity-40 hover:opacity-100 disabled:opacity-20"
        >
          <Star className={`w-3 h-3 ${isFavorite ? 'text-accent-yellow fill-accent-yellow opacity-100' : ''}`} />
        </button>
        <button
          onClick={toggleWatch}
          disabled={isKilling}
          className="p-1 rounded hover:bg-white/5 transition-colors opacity-40 hover:opacity-100 disabled:opacity-20"
        >
          <Eye className={`w-3 h-3 ${isWatched ? 'text-accent-blue opacity-100' : ''}`} />
        </button>
        <button
          onClick={handleKill}
          disabled={isKilling}
          className="p-1 rounded hover:bg-accent-red/10 transition-colors opacity-40 hover:opacity-100 disabled:opacity-100"
        >
          {isKilling ? (
            <Loader2 className="w-3 h-3 text-accent-red animate-spin" />
          ) : (
            <X className="w-3 h-3 hover:text-accent-red" />
          )}
        </button>
      </div>
    </div>
  );
}
