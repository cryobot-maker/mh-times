"use client";

import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/lib/stores/toastStore";

export function useToast() {
  const showToast = useToastStore((s) => s.showToast);
  return useCallback(
    (message: string, duration?: number) => showToast(message, duration),
    [showToast]
  );
}

export function Toast() {
  const message = useToastStore((s) => s.message);
  const toastKey = useToastStore((s) => s.key);

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-24 z-[200] flex justify-center px-4">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={toastKey}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="rounded bg-[#121212] px-4 py-2 text-sm font-bold text-white"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
