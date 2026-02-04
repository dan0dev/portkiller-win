import { useCallback, useEffect } from 'react';
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart';
import { useAppStore } from '../stores/appStore';

export function useSettings() {
  const { settings, updateSettings } = useAppStore();

  const setLaunchAtStartup = useCallback(async (enabled: boolean) => {
    try {
      if (enabled) {
        await enable();
      } else {
        await disable();
      }
      updateSettings({ launchAtStartup: enabled });
    } catch (error) {
      console.error('Failed to set launch at startup:', error);
    }
  }, [updateSettings]);

  // Sync autostart state on mount
  useEffect(() => {
    isEnabled().then((enabled) => {
      if (enabled !== settings.launchAtStartup) {
        updateSettings({ launchAtStartup: enabled });
      }
    }).catch(console.error);
  }, []);

  return {
    settings,
    updateSettings,
    setLaunchAtStartup,
  };
}
