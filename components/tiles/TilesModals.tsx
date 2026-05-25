"use client";

import { Modal } from "@/components/Modal";
import { StatsModal } from "@/components/StatsModal";
import { formatDisplayDate } from "@/lib/tilesLogic";
import type { TilesStats } from "@/lib/stores/tilesStore";
import { TOTAL_PAIRS } from "@/lib/tilesData";

interface TilesHowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export function TilesHowToPlayModal({ open, onClose }: TilesHowToPlayModalProps) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-[400px]">
      <h2
        className="mb-4 pr-8 text-center text-xl font-bold text-[#121212]"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        How to Play
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#121212]">
        <p>
          Click two tiles that go together to match them. Each puzzle has a
          theme — find all 8 pairs that share that relationship.
        </p>
        <p>Match all 8 pairs to win.</p>
        <p>
          Wrong guesses don&apos;t cost a move — only correct matches count
          toward your move total.
        </p>
        <p>
          Tap a selected tile again to deselect it. Use Shuffle to rearrange
          remaining tiles without using a move.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full rounded bg-[#121212] py-3 text-sm font-bold uppercase tracking-wide text-white hover:brightness-95"
      >
        Got it
      </button>
    </Modal>
  );
}

interface TilesStatsModalProps {
  open: boolean;
  onClose: () => void;
  stats: TilesStats;
  puzzleDate: string;
  movesUsed: number;
  matchedPairs: number;
  onShare: () => void;
  shareLabel: string;
}

export function TilesStatsModal({
  open,
  onClose,
  stats,
  puzzleDate,
  movesUsed,
  matchedPairs,
  onShare,
  shareLabel,
}: TilesStatsModalProps) {
  const winPct =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <StatsModal
      open={open}
      onClose={onClose}
      gameName="Tiles"
      stats={{
        played: stats.played,
        winPct,
        currentStreak: stats.currentStreak,
        maxStreak: stats.maxStreak,
      }}
      showShare
      onShare={onShare}
      shareLabel={shareLabel}
      extraContent={
        <div className="mb-6 rounded-lg border border-[#e2e2e2] bg-[#f9f9f9] px-4 py-3 text-center text-sm text-[#121212]">
          <p className="font-bold" style={{ fontFamily: "var(--font-karnak)" }}>
            {formatDisplayDate(puzzleDate)}
          </p>
          <p className="mt-2">
            <span className="font-bold">{matchedPairs}</span> / {TOTAL_PAIRS}{" "}
            pairs found
          </p>
          <p className="mt-1">
            Solved in <span className="font-bold">{movesUsed}</span> moves
          </p>
          <p className="mt-2 text-xs text-[#6b6b6b]">
            Streak: {stats.currentStreak} day
            {stats.currentStreak === 1 ? "" : "s"}
          </p>
        </div>
      }
    />
  );
}
