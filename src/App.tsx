import { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './stores/appStore';
import { usePorts } from './hooks/usePorts';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useToast } from './hooks/useToast';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent, focusSearchInput } from './components/layout/MainContent';
import { DetailPanel } from './components/layout/DetailPanel';
import { Settings } from './components/Settings';
import { ToastContainer } from './components/ui/Toast';

function App() {
  const { ports, isRefreshing, scanPorts, killProcess } = usePorts();
  const {
    selectedPort,
    setSelectedPort,
    showSettings,
    setShowSettings,
  } = useAppStore();
  const { toasts, dismissToast } = useToast();

  const handleKillSelected = useCallback(async () => {
    if (selectedPort) {
      await killProcess(selectedPort.pid);
      setSelectedPort(null);
    }
  }, [selectedPort, killProcess, setSelectedPort]);

  useKeyboardShortcuts({
    onRefresh: scanPorts,
    onKillSelected: handleKillSelected,
    onSearch: focusSearchInput,
  });

  return (
    <div className="h-screen flex overflow-hidden bg-bg-primary">
      {/* Sidebar */}
      <Sidebar onOpenSettings={() => setShowSettings(true)} />

      {/* Main Content */}
      <MainContent
        ports={ports}
        isRefreshing={isRefreshing}
        onRefresh={scanPorts}
        onKillProcess={killProcess}
      />

      {/* Detail Panel */}
      <DetailPanel
        port={selectedPort}
        onClose={() => setSelectedPort(null)}
        onKillProcess={killProcess}
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
