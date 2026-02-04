import { useCallback, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useAppStore } from '../stores/appStore';
import type { PortInfo } from '../types';
import { useNotifications } from './useNotifications';

export function usePorts() {
  const {
    ports,
    setPorts,
    settings,
    isRefreshing,
    setIsRefreshing,
    watchedPorts,
  } = useAppStore();

  const { notifyPortChange } = useNotifications();
  const previousPortsRef = useRef<Map<number, PortInfo>>(new Map());

  const scanPorts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await invoke<PortInfo[]>('scan_ports');

      // Check for watched port changes
      if (settings.showNotifications) {
        const previousPorts = previousPortsRef.current;
        const currentPortNumbers = new Set(result.map(p => p.port));

        for (const watchedPort of watchedPorts) {
          const wasActive = previousPorts.has(watchedPort);
          const isActive = currentPortNumbers.has(watchedPort);

          if (!wasActive && isActive) {
            const portInfo = result.find(p => p.port === watchedPort);
            notifyPortChange(watchedPort, 'started', portInfo?.process_name);
          } else if (wasActive && !isActive) {
            notifyPortChange(watchedPort, 'stopped');
          }
        }
      }

      // Update previous ports reference
      previousPortsRef.current = new Map(result.map(p => [p.port, p]));

      setPorts(result);
    } catch (error) {
      console.error('Failed to scan ports:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [setPorts, setIsRefreshing, settings.showNotifications, watchedPorts, notifyPortChange]);

  const killProcess = useCallback(async (pid: number, force = false) => {
    try {
      await invoke('kill_process', { pid, force });
      // Refresh ports after killing
      await scanPorts();
      return true;
    } catch (error) {
      console.error('Failed to kill process:', error);
      return false;
    }
  }, [scanPorts]);

  // Auto-refresh
  useEffect(() => {
    if (settings.refreshInterval > 0) {
      const interval = setInterval(scanPorts, settings.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [settings.refreshInterval, scanPorts]);

  // Listen for tray refresh events
  useEffect(() => {
    const unlisten = listen('tray-refresh', () => {
      scanPorts();
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [scanPorts]);

  // Initial scan
  useEffect(() => {
    scanPorts();
  }, []);

  return {
    ports,
    isRefreshing,
    scanPorts,
    killProcess,
  };
}
