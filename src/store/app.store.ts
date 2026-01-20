/**
 * App Store
 *
 * Global application state for UI and runtime state.
 * Non-persistent state that resets on app restart.
 *
 * Usage:
 *   import { useAppStore } from '@store/app.store';
 *   const { isOnline, showToast } = useAppStore();
 */

import { create } from 'zustand';

// Toast notification type
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface AppState {
  // Network state
  isOnline: boolean;

  // UI state
  isAppReady: boolean;
  activeToast: Toast | null;

  // Modal state (for global modals)
  modalVisible: boolean;
  modalContent: string | null;

  // Actions
  setOnline: (isOnline: boolean) => void;
  setAppReady: (isReady: boolean) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: () => void;
  showModal: (content: string) => void;
  hideModal: () => void;
}

let toastId = 0;

export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  isAppReady: false,
  activeToast: null,
  modalVisible: false,
  modalContent: null,

  setOnline: (isOnline) => set({ isOnline }),

  setAppReady: (isReady) => set({ isAppReady: isReady }),

  showToast: (toast) =>
    set({
      activeToast: {
        ...toast,
        id: `toast-${++toastId}`,
        duration: toast.duration ?? 3000,
      },
    }),

  hideToast: () => set({ activeToast: null }),

  showModal: (content) => set({ modalVisible: true, modalContent: content }),

  hideModal: () => set({ modalVisible: false, modalContent: null }),
}));
