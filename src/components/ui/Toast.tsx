import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-accent-green" />,
  error: <XCircle className="w-4 h-4 text-accent-red" />,
  warning: <AlertCircle className="w-4 h-4 text-accent-yellow" />,
};

const backgrounds = {
  success: 'bg-accent-green/10 border-accent-green/20',
  error: 'bg-accent-red/10 border-accent-red/20',
  warning: 'bg-accent-yellow/10 border-accent-yellow/20',
};

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${backgrounds[toast.type]} backdrop-blur-sm shadow-lg`}
    >
      {icons[toast.type]}
      <span className="text-sm text-text-primary flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="w-3 h-3 text-text-muted" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
