"use client";

import { X } from "lucide-react";
import { CONNECTIONS_COLOR_BG } from "@/lib/connectionsData";
import type { ConnectionsStats } from "@/lib/stores/connectionsStore";
import { cn } from "@/lib/utils";

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
        className="relative max-h-[90vh] w-full max-w-[400px] overflow-y-auto rounded-lg bg-white p-8"
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

export function ConnectionsStatsModal({
  open,
  onClose,
  stats,
  gameStatus,
  onShare,
  shareLabel,
}: {
  open: boolean;
  onClose: () => void;
  stats: ConnectionsStats;
  gameStatus: "playing" | "won" | "lost";
  onShare: () => void;
  shareLabel: string;
}) {
  const winPct =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <h2
        className="mb-6 text-center text-2xl font-bold text-[#121212]"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        Statistics
      </h2>
      <div className="mb-6 grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Played", value: stats.played },
          { label: "Win %", value: winPct },
          { label: "Current Streak", value: stats.currentStreak },
          { label: "Max Streak", value: stats.maxStreak },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-3xl font-bold text-[#121212]">{item.value}</p>
            <p className="text-xs text-[#6b6b6b]">{item.label}</p>
          </div>
        ))}
      </div>
      {gameStatus !== "playing" && (
        <button
          type="button"
          onClick={onShare}
          className="w-full rounded bg-[#121212] py-3 text-sm font-bold uppercase tracking-wide text-white hover:brightness-95"
        >
          {shareLabel}
        </button>
      )}
    </ModalBackdrop>
  );
}

export function ConnectionsHowToPlayModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const levels = [
    { color: "yellow" as const, label: "Straightforward" },
    { color: "green" as const, label: "Easy" },
    { color: "blue" as const, label: "Medium" },
    { color: "purple" as const, label: "Tricky" },
  ];

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <h2
        className="mb-4 text-center text-2xl font-bold"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        How To Play
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-[#121212]">
        Find groups of four items that share something in common. Select four
        items and tap Submit. You have four mistakes before the game ends.
      </p>
      <p className="mb-3 text-sm font-bold text-[#121212]">Category difficulty</p>
      <div className="space-y-2">
        {levels.map((lvl) => (
          <div
            key={lvl.color}
            className={cn(
              "rounded px-3 py-2 text-sm font-bold uppercase text-[#121212]"
            )}
            style={{ backgroundColor: CONNECTIONS_COLOR_BG[lvl.color] }}
          >
            {lvl.label}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-[#6b6b6b]">
        Categories are not reordered — yellow is easiest, purple is hardest.
      </p>
    </ModalBackdrop>
  );
}
