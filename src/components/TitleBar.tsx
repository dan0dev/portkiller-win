import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X, Maximize2 } from 'lucide-react';

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    const checkMaximized = async () => {
      setIsMaximized(await appWindow.isMaximized());
    };
    checkMaximized();

    const unlisten = appWindow.onResized(async () => {
      setIsMaximized(await appWindow.isMaximized());
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = () => appWindow.toggleMaximize();
  const handleClose = () => appWindow.close();

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag on left mouse button and not on buttons
    if (e.button === 0 && (e.target as HTMLElement).closest('[data-tauri-drag-region]')) {
      appWindow.startDragging();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Double click to maximize/restore
    if ((e.target as HTMLElement).closest('[data-tauri-drag-region]')) {
      appWindow.toggleMaximize();
    }
  };

  return (
    <div
      className="h-8 bg-bg-secondary flex items-center justify-between select-none border-b border-white/[0.06]"
    >
      {/* Draggable title area */}
      <div
        data-tauri-drag-region
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className="flex-1 h-full flex items-center px-3 cursor-default"
      >
        <span className="text-xs text-text-muted font-medium pointer-events-none">
          PortKiller
        </span>
      </div>

      {/* Window controls */}
      <div className="flex h-full">
        <button
          onClick={handleMinimize}
          className="w-12 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Minus className="w-4 h-4 text-text-secondary" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-12 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          {isMaximized ? (
            <Maximize2 className="w-3.5 h-3.5 text-text-secondary" />
          ) : (
            <Square className="w-3 h-3 text-text-secondary" />
          )}
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-full flex items-center justify-center hover:bg-red-500 transition-colors group"
        >
          <X className="w-4 h-4 text-text-secondary group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}
