import { useCallback } from 'react';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { useAppStore } from '../stores/appStore';

export function useNotifications() {
  const { settings } = useAppStore();

  const notify = useCallback(async (title: string, body: string) => {
    if (!settings.showNotifications) return;

    try {
      let permissionGranted = await isPermissionGranted();

      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }

      if (permissionGranted) {
        sendNotification({ title, body });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, [settings.showNotifications]);

  const notifyPortChange = useCallback((port: number, status: 'started' | 'stopped', processName?: string) => {
    if (status === 'started') {
      notify(
        `Port ${port} Started`,
        processName ? `Process: ${processName}` : 'A process started listening on this port'
      );
    } else {
      notify(
        `Port ${port} Stopped`,
        'The port is no longer in use'
      );
    }
  }, [notify]);

  const notifyProcessKilled = useCallback((pid: number, processName: string) => {
    notify('Process Killed', `${processName} (PID: ${pid}) has been terminated`);
  }, [notify]);

  return {
    notify,
    notifyPortChange,
    notifyProcessKilled,
  };
}
