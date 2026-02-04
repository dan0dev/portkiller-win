import { useEffect, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';

interface ShortcutHandlers {
  onRefresh: () => void;
  onKillSelected: () => void;
  onSearch: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const { selectedPort, setShowSettings, showSettings } = useAppStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      // Allow Escape to blur input
      if (event.key === 'Escape') {
        (event.target as HTMLElement).blur();
      }
      return;
    }

    // Ctrl/Cmd + R: Refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      handlers.onRefresh();
      return;
    }

    // Ctrl/Cmd + K: Focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      handlers.onSearch();
      return;
    }

    // Ctrl/Cmd + ,: Open settings
    if ((event.ctrlKey || event.metaKey) && event.key === ',') {
      event.preventDefault();
      setShowSettings(!showSettings);
      return;
    }

    // Delete/Backspace: Kill selected process
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedPort) {
      event.preventDefault();
      handlers.onKillSelected();
      return;
    }

    // Escape: Close settings or clear selection
    if (event.key === 'Escape') {
      if (showSettings) {
        setShowSettings(false);
      }
      return;
    }
  }, [selectedPort, setShowSettings, showSettings, handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
