"use client";

import { X } from "lucide-react";
import type { LetterBoxedStats } from "@/lib/stores/letterBoxedStore";

function ModalBackdrop({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] rounded-lg bg-white p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-[#6b6b6b] hover:text-[#121212]"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function LetterBoxedStatsModal({
  open,
  onClose,
  stats,
}: {
  open: boolean;
  onClose: () => void;
  stats: LetterBoxedStats;
}) {
  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <h2
        className="mb-6 text-center text-2xl font-bold text-[#121212]"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        Statistics
      </h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-[#121212]">{stats.played}</p>
          <p className="text-xs text-[#6b6b6b]">Played</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#121212]">
            {stats.bestSolve ?? "—"}
          </p>
          <p className="text-xs text-[#6b6b6b]">Best solve</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#121212]">
            {stats.currentStreak}
          </p>
          <p className="text-xs text-[#6b6b6b]">Current streak</p>
        </div>
      </div>
    </ModalBackdrop>
  );
}
