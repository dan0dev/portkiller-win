import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull, Star, Eye, Copy, Check, Loader2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../stores/appStore';
import { useToast } from '../../hooks/useToast';
import type { PortInfo, ProcessInfo } from '../../types';

interface DetailPanelProps {
  port: PortInfo | null;
  onClose: () => void;
  onKillProcess: (pid: number) => Promise<boolean>;
}

export function DetailPanel({ port, onClose, onKillProcess }: DetailPanelProps) {
  const [processInfo, setProcessInfo] = useState<ProcessInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isKilling, setIsKilling] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { addToast } = useToast();

  const {
    favorites,
    addFavorite,
    removeFavorite,
    watchedPorts,
    addWatched,
    removeWatched,
  } = useAppStore();

  const isFavorite = port ? favorites.includes(port.port) : false;
  const isWatched = port ? watchedPorts.includes(port.port) : false;

  useEffect(() => {
    if (port) {
      setIsLoading(true);
      invoke<ProcessInfo>('get_process_info', { pid: port.pid })
        .then(setProcessInfo)
        .catch((error) => {
          console.error('Failed to get process info:', error);
          addToast('warning', 'Could not load full process details');
        })
        .finally(() => setIsLoading(false));
    } else {
      setProcessInfo(null);
    }
  }, [port?.pid]);

  const handleKill = async () => {
    if (!port || isKilling) return;

    setIsKilling(true);
    try {
      const success = await onKillProcess(port.pid);
      if (success) {
        addToast('success', `Killed process ${port.process_name || 'Unknown'} (PID: ${port.pid})`);
        onClose();
      } else {
        addToast('error', `Failed to kill process ${port.process_name || 'Unknown'}`);
        setIsKilling(false);
      }
    } catch (error) {
      addToast('error', `Error killing process: ${error}`);
      setIsKilling(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      addToast('success', 'Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      addToast('error', 'Failed to copy to clipboard');
    }
  };

  const toggleFavorite = () => {
    if (!port) return;
    if (isFavorite) {
      removeFavorite(port.port);
      addToast('success', `Removed port ${port.port} from favorites`);
    } else {
      addFavorite(port.port);
      addToast('success', `Added port ${port.port} to favorites`);
    }
  };

  const toggleWatch = () => {
    if (!port) return;
    if (isWatched) {
      removeWatched(port.port);
      addToast('success', `Stopped watching port ${port.port}`);
    } else {
      addWatched(port.port);
      addToast('success', `Now watching port ${port.port}`);
    }
  };

  return (
    <AnimatePresence>
      {port && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-full panel flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-mono text-2xl font-semibold text-text-primary">{port.port}</div>
                <div className="text-sm text-text-secondary truncate mt-0.5">
                  {port.process_name || 'Unknown'}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={toggleFavorite}
                disabled={isKilling}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50
                  ${isFavorite ? 'bg-accent-yellow/20 text-accent-yellow' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorited' : 'Favorite'}
              </button>
              <button
                onClick={toggleWatch}
                disabled={isKilling}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50
                  ${isWatched ? 'bg-accent-blue/20 text-accent-blue' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                {isWatched ? 'Watching' : 'Watch'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
              </div>
            ) : (
              <>
                {/* Process Info */}
                <div>
                  <h3 className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">Process</h3>
                  <div className="space-y-1">
                    <InfoRow
                      label="Name"
                      value={port.process_name || 'Unknown'}
                      onCopy={() => handleCopy(port.process_name, 'name')}
                      copied={copiedField === 'name'}
                    />
                    <InfoRow
                      label="PID"
                      value={port.pid.toString()}
                      onCopy={() => handleCopy(port.pid.toString(), 'pid')}
                      copied={copiedField === 'pid'}
                      mono
                    />
                    <InfoRow label="Type" value={port.process_type} />
                    {processInfo?.memory_usage && (
                      <InfoRow label="Memory" value={processInfo.memory_usage} />
                    )}
                  </div>
                </div>

                {/* Network Info */}
                <div>
                  <h3 className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">Network</h3>
                  <div className="space-y-1">
                    <InfoRow label="Protocol" value={port.protocol} />
                    <InfoRow
                      label="Address"
                      value={`${port.local_address}:${port.port}`}
                      onCopy={() => handleCopy(`${port.local_address}:${port.port}`, 'address')}
                      copied={copiedField === 'address'}
                      mono
                    />
                    <InfoRow label="State" value={port.state} />
                  </div>
                </div>

                {/* Command Line */}
                {processInfo?.command_line && (
                  <div>
                    <h3 className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2">Command</h3>
                    <div className="relative group">
                      <pre className="text-xs bg-white/5 rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all text-text-secondary font-mono">
                        {processInfo.command_line}
                      </pre>
                      <button
                        onClick={() => handleCopy(processInfo.command_line, 'command')}
                        className="absolute top-2 right-2 p-1 bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedField === 'command' ? (
                          <Check className="w-3 h-3 text-accent-green" />
                        ) : (
                          <Copy className="w-3 h-3 text-text-muted" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.06]">
            <button
              onClick={handleKill}
              disabled={isKilling}
              className="w-full flex items-center justify-center gap-2 py-2 bg-accent-red/90 hover:bg-accent-red text-white rounded-md text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isKilling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Killing...
                </>
              ) : (
                <>
                  <Skull className="w-4 h-4" />
                  Kill Process
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  mono?: boolean;
}

function InfoRow({ label, value, onCopy, copied, mono }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-1 group">
      <span className="text-xs text-text-muted">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs text-text-primary ${mono ? 'font-mono' : ''}`}>{value}</span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="p-0.5 hover:bg-white/5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <Check className="w-3 h-3 text-accent-green" />
            ) : (
              <Copy className="w-3 h-3 text-text-muted" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
