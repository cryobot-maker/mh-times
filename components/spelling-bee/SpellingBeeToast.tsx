"use client";

import { AnimatePresence, motion } from "framer-motion";

export function SpellingBeeToast({
  message,
  toastKey,
  large,
}: {
  message: string | null;
  toastKey: number;
  large?: boolean;
}) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-[250] -translate-x-1/2">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={toastKey}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={
              large
                ? "rounded bg-[#121212] px-6 py-3 text-xl font-bold text-white"
                : "rounded bg-[#121212] px-4 py-2 text-sm font-bold text-white"
            }
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
