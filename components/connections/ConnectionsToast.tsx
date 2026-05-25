"use client";

import { AnimatePresence, motion } from "framer-motion";

export function ConnectionsToast({
  message,
  toastKey,
}: {
  message: string | null;
  toastKey: number;
}) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 z-50 -translate-x-1/2">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={toastKey}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded bg-[#121212] px-4 py-2 text-sm font-bold text-white"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
