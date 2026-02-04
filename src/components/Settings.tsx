import { motion } from 'framer-motion';
import { X, Monitor, Bell, Clock, Rocket } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { Toggle } from './ui/Toggle';

interface SettingsProps {
  onClose: () => void;
}

const refreshIntervals = [
  { value: 0, label: 'Manual' },
  { value: 2000, label: '2s' },
  { value: 5000, label: '5s' },
  { value: 10000, label: '10s' },
  { value: 30000, label: '30s' },
  { value: 60000, label: '1m' },
];

export function Settings({ onClose }: SettingsProps) {
  const { settings, updateSettings, setLaunchAtStartup } = useSettings();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-bg-elevated rounded-lg border border-white/[0.08] w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <h2 className="font-medium text-text-primary">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded transition-colors text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Auto Refresh */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Clock className="w-4 h-4" />
              <span>Auto Refresh</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {refreshIntervals.map((interval) => (
                <button
                  key={interval.value}
                  onClick={() => updateSettings({ refreshInterval: interval.value })}
                  className={`px-2 py-1.5 text-xs rounded transition-colors
                    ${settings.refreshInterval === interval.value
                      ? 'bg-accent-blue text-white'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10'
                    }`}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            <Toggle
              checked={settings.showNotifications}
              onChange={(checked) => updateSettings({ showNotifications: checked })}
              label="Show notifications for watched ports"
            />
          </div>

          {/* System */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Monitor className="w-4 h-4" />
              <span>System</span>
            </div>
            <Toggle
              checked={settings.minimizeToTray}
              onChange={(checked) => updateSettings({ minimizeToTray: checked })}
              label="Minimize to system tray"
            />
          </div>

          {/* Startup */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Rocket className="w-4 h-4" />
              <span>Startup</span>
            </div>
            <Toggle
              checked={settings.launchAtStartup}
              onChange={setLaunchAtStartup}
              label="Launch at Windows startup"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>PortKiller for Windows</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
