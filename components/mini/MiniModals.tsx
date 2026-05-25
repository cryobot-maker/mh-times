"use client";

import { X } from "lucide-react";
import { formatTimer } from "@/lib/miniCrosswordLogic";
import type { MiniStats } from "@/lib/stores/miniStore";

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

export function MiniStatsModal({
  open,
  onClose,
  stats,
  solveTimeSeconds,
}: {
  open: boolean;
  onClose: () => void;
  stats: MiniStats;
  solveTimeSeconds: number;
}) {
  const avgTime =
    stats.solveCount > 0
      ? Math.round(stats.totalTimeSeconds / stats.solveCount)
      : null;

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <h2
        className="mb-2 text-center text-2xl font-bold text-[#121212]"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        Puzzle Complete!
      </h2>
      <p className="mb-6 text-center text-sm text-[#6b6b6b]">
        You solved it in {formatTimer(solveTimeSeconds)}
      </p>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-[#121212]">{stats.solvedToday}</p>
          <p className="text-xs text-[#6b6b6b]">Solved today</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#121212]">
            {avgTime != null ? formatTimer(avgTime) : "—"}
          </p>
          <p className="text-xs text-[#6b6b6b]">Average time</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#121212]">
            {stats.currentStreak}
          </p>
          <p className="text-xs text-[#6b6b6b]">Streak</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#121212]">
            {stats.bestTimeSeconds != null
              ? formatTimer(stats.bestTimeSeconds)
              : "—"}
          </p>
          <p className="text-xs text-[#6b6b6b]">Best time</p>
        </div>
      </div>
    </ModalBackdrop>
  );
}
