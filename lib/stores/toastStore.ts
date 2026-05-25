import { create } from "zustand";

interface ToastStore {
  message: string | null;
  duration: number;
  key: number;
  showToast: (message: string, duration?: number) => void;
  hideToast: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastStore>((set) => ({
  message: null,
  duration: 1500,
  key: 0,
  showToast: (message, duration = 1500) => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message, duration, key: Date.now() });
    hideTimer = setTimeout(() => {
      set({ message: null });
      hideTimer = null;
    }, duration);
  },
  hideToast: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message: null });
  },
}));
