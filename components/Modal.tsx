"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            className={cn(
              "relative max-h-[90vh] w-full max-w-[400px] overflow-y-auto rounded-lg bg-white p-8",
              className
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 text-[#6b6b6b] transition-colors hover:text-[#121212]"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
