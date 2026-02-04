import { useState } from 'react';
import { Star, Eye, X, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useToast } from '../../hooks/useToast';
import { Badge } from '../ui/Badge';
import type { PortInfo } from '../../types';

interface PortRowProps {
  port: PortInfo;
  isSelected: boolean;
  onSelect: () => void;
  onKillProcess: (pid: number) => Promise<boolean>;
}

export function PortRow({ port, isSelected, onSelect, onKillProcess }: PortRowProps) {
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
      className={`grid grid-cols-[50px_90px_1fr_90px_90px_70px] gap-4 px-4 py-2 items-center cursor-pointer transition-colors border-b border-white/[0.04]
        ${isSelected ? 'bg-accent-blue/10' : 'hover:bg-white/[0.02]'}
        ${isKilling ? 'opacity-50' : ''}`}
    >
      {/* Status */}
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full ${isKilling ? 'bg-accent-yellow' : 'bg-accent-green'}`} />
      </div>

      {/* Port */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono font-medium text-text-primary">{port.port}</span>
        {isFavorite && <Star className="w-3 h-3 text-accent-yellow fill-accent-yellow" />}
        {isWatched && <Eye className="w-3 h-3 text-accent-blue" />}
      </div>

      {/* Process */}
      <div className="truncate text-sm text-text-secondary">
        {port.process_name || 'Unknown'}
      </div>

      {/* PID */}
      <div className="font-mono text-sm text-text-muted">{port.pid}</div>

      {/* Type */}
      <div>
        <Badge type={port.process_type} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-0.5">
        <button
          onClick={toggleFavorite}
          disabled={isKilling}
          className="p-1 rounded hover:bg-white/5 transition-colors opacity-40 hover:opacity-100 disabled:opacity-20"
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-accent-yellow fill-accent-yellow opacity-100' : ''}`} />
        </button>
        <button
          onClick={toggleWatch}
          disabled={isKilling}
          className="p-1 rounded hover:bg-white/5 transition-colors opacity-40 hover:opacity-100 disabled:opacity-20"
        >
          <Eye className={`w-3.5 h-3.5 ${isWatched ? 'text-accent-blue opacity-100' : ''}`} />
        </button>
        <button
          onClick={handleKill}
          disabled={isKilling}
          className="p-1 rounded hover:bg-accent-red/10 transition-colors opacity-40 hover:opacity-100 disabled:opacity-100"
        >
          {isKilling ? (
            <Loader2 className="w-3.5 h-3.5 text-accent-red animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5 hover:text-accent-red" />
          )}
        </button>
      </div>
    </div>
  );
}
