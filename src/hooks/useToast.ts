import { create } from 'zustand';
import type { ToastData, ToastType } from '../components/ui/Toast';

interface ToastStore {
  toasts: ToastData[];
  addToast: (type: ToastType, message: string) => void;
  dismissToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
