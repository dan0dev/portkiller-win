import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, List, GitBranch, Search } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { PortTable } from '../ports/PortTable';
import { PortTreeView } from '../ports/PortTreeView';
import type { PortInfo, SortConfig } from '../../types';

interface MainContentProps {
  ports: PortInfo[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onKillProcess: (pid: number) => Promise<boolean>;
}

export function MainContent({ ports, isRefreshing, onRefresh, onKillProcess }: MainContentProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    viewMode,
    setViewMode,
    sortConfig,
    setSortConfig,
    selectedPort,
    setSelectedPort,
  } = useAppStore();

  const filteredPorts = useMemo(() => {
    let result = [...ports];

    if (filterType) {
      result = result.filter((p) => p.process_type === filterType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.port.toString().includes(query) ||
          p.process_name.toLowerCase().includes(query) ||
          p.pid.toString().includes(query)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.field];
      const bVal = b[sortConfig.field];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return result;
  }, [ports, filterType, searchQuery, sortConfig]);

  const handleSort = (field: SortConfig['field']) => {
    setSortConfig({
      field,
      direction:
        sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header - darker */}
      <header className="header h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-52 pl-8 pr-3 py-1.5 bg-white/5 border border-white/5 rounded-md text-sm
                       placeholder-text-muted focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-white/5 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white/10 text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'tree'
                  ? 'bg-white/10 text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <GitBranch className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">
            {filteredPorts.length} port{filteredPorts.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-sm text-text-primary transition-colors disabled:opacity-50"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            Refresh
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-bg-primary">
        {viewMode === 'list' ? (
          <PortTable
            ports={filteredPorts}
            sortConfig={sortConfig}
            onSort={handleSort}
            selectedPort={selectedPort}
            onSelectPort={setSelectedPort}
            onKillProcess={onKillProcess}
          />
        ) : (
          <PortTreeView
            ports={filteredPorts}
            selectedPort={selectedPort}
            onSelectPort={setSelectedPort}
            onKillProcess={onKillProcess}
          />
        )}
      </div>
    </div>
  );
}

export const focusSearchInput = () => {
  const input = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
  input?.focus();
};
