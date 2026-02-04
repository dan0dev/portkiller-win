import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Star,
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import type { ProcessType } from '../../types';

interface SidebarProps {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const {
    ports,
    filterType,
    setFilterType,
    favorites,
    watchedPorts,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useAppStore();

  const categories = [
    { id: null, label: 'All Ports' },
    { id: 'Web', label: 'Web' },
    { id: 'Database', label: 'Database' },
    { id: 'Dev', label: 'Development' },
    { id: 'System', label: 'System' },
    { id: 'Other', label: 'Other' },
  ] as const;

  const getTypeCount = (type: ProcessType | null) => {
    if (type === null) return ports.length;
    return ports.filter((p) => p.process_type === type).length;
  };

  const favoritePorts = ports.filter((p) => favorites.includes(p.port));
  const watchedActivePorts = ports.filter((p) => watchedPorts.includes(p.port));

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 56 : 200 }}
      className="h-full glass-sidebar flex flex-col"
    >
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-white/[0.06]">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Network className="w-4 h-4 text-text-secondary" />
              <span className="font-medium text-sm text-text-primary">PortKiller</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-text-muted"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {/* Categories */}
        <div className="mb-4">
          {!sidebarCollapsed && (
            <div className="sidebar-section-title">Categories</div>
          )}
          {categories.map((cat) => {
            const isActive = filterType === cat.id;
            const count = getTypeCount(cat.id);
            return (
              <button
                key={cat.id ?? 'all'}
                onClick={() => setFilterType(cat.id)}
                className={`w-full sidebar-item ${isActive ? 'active' : ''}`}
              >
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 text-left"
                      >
                        {cat.label}
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-text-muted"
                      >
                        {count}
                      </motion.span>
                    </>
                  )}
                </AnimatePresence>
                {sidebarCollapsed && (
                  <span className="text-xs text-text-muted">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Favorites */}
        {!sidebarCollapsed && (
          <div className="mb-4">
            <div className="sidebar-section-title">Favorites</div>
            {favoritePorts.length === 0 ? (
              <div className="px-3 py-1.5 text-xs text-text-muted">No favorites</div>
            ) : (
              favoritePorts.map((port) => (
                <div key={port.port} className="sidebar-item">
                  <Star className="w-3 h-3 text-accent-yellow fill-accent-yellow" />
                  <span className="flex-1 font-mono text-xs">{port.port}</span>
                  <span className="text-xs text-text-muted truncate max-w-[60px]">
                    {port.process_name}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Watched */}
        {!sidebarCollapsed && (
          <div className="mb-4">
            <div className="sidebar-section-title">Watched</div>
            {watchedPorts.length === 0 ? (
              <div className="px-3 py-1.5 text-xs text-text-muted">No watched ports</div>
            ) : (
              watchedPorts.map((watchedPort) => {
                const activePort = watchedActivePorts.find((p) => p.port === watchedPort);
                return (
                  <div key={watchedPort} className="sidebar-item">
                    <Eye className={`w-3 h-3 ${activePort ? 'text-accent-green' : 'text-text-muted'}`} />
                    <span className="flex-1 font-mono text-xs">{watchedPort}</span>
                    <span className={`text-xs ${activePort ? 'text-accent-green' : 'text-text-muted'}`}>
                      {activePort ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/[0.06]">
        <button
          onClick={onOpenSettings}
          className="w-full sidebar-item"
        >
          <Settings className="w-4 h-4" />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>
      </div>
    </motion.aside>
  );
}
