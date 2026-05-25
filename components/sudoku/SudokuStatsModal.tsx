"use client";

import { Modal } from "@/components/Modal";
import type { SudokuStats } from "@/lib/stores/sudokuStore";
import {
  difficultyLabel,
  formatDisplayDate,
  formatTimer,
} from "@/lib/sudokuLogic";
import type { SudokuDifficulty } from "@/lib/sudokuData";

interface SudokuStatsModalProps {
  open: boolean;
  onClose: () => void;
  stats: SudokuStats;
  elapsedMs: number;
  difficulty: SudokuDifficulty;
  puzzleDate: string;
  onShare: () => void;
  shareLabel: string;
}

function avgDisplay(ms: number | null): string {
  if (ms === null) return "—";
  return formatTimer(ms);
}

export function SudokuStatsModal({
  open,
  onClose,
  stats,
  elapsedMs,
  difficulty,
  puzzleDate,
  onShare,
  shareLabel,
}: SudokuStatsModalProps) {
  const winPct =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <Modal open={open} onClose={onClose} className="max-w-[420px]">
      <h2
        className="mb-2 pr-8 text-center text-2xl font-bold text-[#121212]"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        Congratulations!
      </h2>
      <p className="mb-6 text-center text-sm text-[#6b6b6b]">
        {formatDisplayDate(puzzleDate)}
      </p>

      <div className="mb-6 rounded-lg bg-[#f4f3ee] px-4 py-3 text-center">
        <p className="text-3xl font-bold text-[#121212]">
          {formatTimer(elapsedMs)}
        </p>
        <p className="mt-1 text-sm text-[#6b6b6b]">
          {difficultyLabel(difficulty)} Sudoku
        </p>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Played", value: stats.played },
          { label: "Win %", value: winPct },
          { label: "Current Streak", value: stats.currentStreak },
          { label: "Max Streak", value: stats.maxStreak },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-2xl font-bold text-[#121212]">{item.value}</p>
            <p className="text-[10px] text-[#6b6b6b]">{item.label}</p>
          </div>
        ))}
      </div>

      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6b6b6b]">
        Average time by difficulty
      </p>
      <div className="mb-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#121212]">Easy</span>
          <span className="font-semibold text-[#121212]">
            {avgDisplay(stats.avgTimeEasyMs)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#121212]">Medium</span>
          <span className="font-semibold text-[#121212]">
            {avgDisplay(stats.avgTimeMediumMs)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#121212]">Hard</span>
          <span className="font-semibold text-[#121212]">
            {avgDisplay(stats.avgTimeHardMs)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onShare}
        className="w-full rounded bg-[#89b4f7] py-3 text-sm font-bold uppercase tracking-wide text-white hover:brightness-95"
      >
        {shareLabel}
      </button>
    </Modal>
  );
}
