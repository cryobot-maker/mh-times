"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { formatCountdown, getCountdownToMidnightET } from "@/lib/wordleLogic";
import { cn } from "@/lib/utils";

export interface GameStatsDisplay {
  played: number;
  winPct: number;
  currentStreak: number;
  maxStreak: number;
}

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  gameName: string;
  stats: GameStatsDisplay;
  guessDistribution?: number[];
  winningGuessIndex?: number;
  onShare?: () => void;
  shareLabel?: string;
  showShare?: boolean;
  extraContent?: React.ReactNode;
}

export function StatsModal({
  open,
  onClose,
  gameName,
  stats,
  guessDistribution,
  winningGuessIndex = -1,
  onShare,
  shareLabel = "Share",
  showShare = false,
  extraContent,
}: StatsModalProps) {
  const [countdown, setCountdown] = useState(getCountdownToMidnightET());

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setCountdown(getCountdownToMidnightET()), 1000);
    return () => clearInterval(id);
  }, [open]);

  const maxDist = guessDistribution
    ? Math.max(...guessDistribution, 1)
    : 1;

  return (
    <Modal open={open} onClose={onClose}>
      <h2
        className="mb-6 pr-8 text-center text-2xl font-bold text-[#121212]"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        {gameName} Statistics
      </h2>

      <div className="mb-6 grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Played", value: stats.played },
          { label: "Win %", value: stats.winPct },
          { label: "Current Streak", value: stats.currentStreak },
          { label: "Max Streak", value: stats.maxStreak },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-3xl font-bold text-[#121212]">{item.value}</p>
            <p className="text-xs text-[#6b6b6b]">{item.label}</p>
          </div>
        ))}
      </div>

      {guessDistribution && guessDistribution.length > 0 && (
        <>
          <p className="mb-2 text-sm font-bold text-[#121212]">
            GUESS DISTRIBUTION
          </p>
          <div className="mb-6 space-y-1">
            {guessDistribution.map((count, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs font-bold"
              >
                <span className="w-3 text-[#6b6b6b]">{i + 1}</span>
                <div className="flex-1">
                  <div
                    className={cn(
                      "flex h-5 min-w-[8px] items-center justify-end rounded-sm px-1 text-white",
                      i === winningGuessIndex
                        ? "bg-[#6aaa64]"
                        : "bg-[#787c7e]"
                    )}
                    style={{
                      width: `${Math.max((count / maxDist) * 100, count > 0 ? 8 : 4)}%`,
                    }}
                  >
                    {count > 0 ? count : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {extraContent}

      <p className="mb-4 text-center text-sm text-[#6b6b6b]">
        NEXT PUZZLE IN{" "}
        <span className="font-bold text-[#121212]">
          {formatCountdown(countdown)}
        </span>
      </p>

      {showShare && onShare && (
        <button
          type="button"
          onClick={onShare}
          className="w-full rounded bg-[#6aaa64] py-3 text-sm font-bold uppercase tracking-wide text-white hover:brightness-95"
        >
          {shareLabel}
        </button>
      )}
    </Modal>
  );
}
