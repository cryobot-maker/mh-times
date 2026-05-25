"use client";

import { X } from "lucide-react";
import type { StrandsStats } from "@/lib/stores/strandsStore";

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
          className="absolute right-4 top-4 text-[#6b6b6b]"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function StrandsStatsModal({
  open,
  onClose,
  stats,
  wordsFound,
  hintsUsed,
  onShare,
  shareLabel,
}: {
  open: boolean;
  onClose: () => void;
  stats: StrandsStats;
  wordsFound: number;
  hintsUsed: number;
  onShare: () => void;
  shareLabel: string;
}) {
  const winPct =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <h2
        className="mb-6 text-center text-2xl font-bold"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        Puzzle Complete!
      </h2>
      <p className="mb-2 text-center text-[#121212]">
        Solved with <strong>{wordsFound}</strong> words found
      </p>
      <p className="mb-6 text-center text-sm text-[#6b6b6b]">
        Hints used: {hintsUsed}
      </p>
      <div className="mb-6 grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Played", value: stats.played },
          { label: "Win %", value: winPct },
          { label: "Streak", value: stats.currentStreak },
          { label: "Max", value: stats.maxStreak },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-[#6b6b6b]">{item.label}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onShare}
        className="w-full rounded bg-[#121212] py-3 text-sm font-bold text-white"
      >
        {shareLabel}
      </button>
    </ModalBackdrop>
  );
}
