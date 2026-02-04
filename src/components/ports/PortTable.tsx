import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PortRow } from './PortRow';
import type { PortInfo, SortConfig, SortField } from '../../types';

interface PortTableProps {
  ports: PortInfo[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  selectedPort: PortInfo | null;
  onSelectPort: (port: PortInfo | null) => void;
  onKillProcess: (pid: number) => Promise<boolean>;
}

export function PortTable({
  ports,
  sortConfig,
  onSort,
  selectedPort,
  onSelectPort,
  onKillProcess,
}: PortTableProps) {
  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  if (ports.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        <div className="text-center">
          <p className="text-base">No ports found</p>
          <p className="text-sm mt-1 text-text-muted">Try adjusting your filters or refreshing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Table Header */}
      <div className="sticky top-0 bg-bg-secondary border-b border-white/[0.06] z-10">
        <div className="grid grid-cols-[50px_90px_1fr_90px_90px_70px] gap-4 px-4 py-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">
          <div></div>
          <button
            onClick={() => onSort('port')}
            className="flex items-center gap-1 hover:text-text-secondary transition-colors text-left"
          >
            Port {getSortIcon('port')}
          </button>
          <button
            onClick={() => onSort('process_name')}
            className="flex items-center gap-1 hover:text-text-secondary transition-colors text-left"
          >
            Process {getSortIcon('process_name')}
          </button>
          <button
            onClick={() => onSort('pid')}
            className="flex items-center gap-1 hover:text-text-secondary transition-colors text-left"
          >
            PID {getSortIcon('pid')}
          </button>
          <button
            onClick={() => onSort('process_type')}
            className="flex items-center gap-1 hover:text-text-secondary transition-colors text-left"
          >
            Type {getSortIcon('process_type')}
          </button>
          <div></div>
        </div>
      </div>

      {/* Table Body */}
      <div>
        {ports.map((port, index) => (
          <motion.div
            key={`${port.port}-${port.pid}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.01, duration: 0.1 }}
          >
            <PortRow
              port={port}
              isSelected={selectedPort?.port === port.port && selectedPort?.pid === port.pid}
              onSelect={() => onSelectPort(port)}
              onKillProcess={onKillProcess}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
