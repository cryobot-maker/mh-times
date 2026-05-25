"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import {
  formatDateLabel,
  getPuzzleNumber,
  getRecentDates,
  isGameCompleted,
  type ArchiveGame,
} from "@/lib/archiveUtils";
import { cn } from "@/lib/utils";

interface ArchiveRecentListProps {
  game: ArchiveGame;
  refreshKey: number;
}

export function ArchiveRecentList({ game, refreshKey }: ArchiveRecentListProps) {
  const dates = getRecentDates(7);

  return (
    <div key={refreshKey}>
      <h2
        className="mb-4 text-[13px] font-bold uppercase tracking-[0.08em] text-[#6b6b6b]"
        style={{ fontFamily: "var(--font-franklin)" }}
      >
        Recent Puzzles
      </h2>
      <ul className="divide-y divide-[#e2e2e2] rounded border border-[#e2e2e2]">
        {dates.map((dateStr) => {
          const completed = isGameCompleted(game.slug, dateStr);
          const number = getPuzzleNumber(game.slug, dateStr);
          const href = `${game.path}?date=${dateStr}`;

          return (
            <li
              key={dateStr}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#121212]">
                  {formatDateLabel(dateStr)}
                </p>
                <p className="text-xs text-[#6b6b6b]">No. {number}</p>
              </div>
              {completed ? (
                <span
                  className="flex shrink-0 items-center gap-1 text-sm font-bold text-[#6aaa64]"
                  aria-label="Completed"
                >
                  <Check size={18} strokeWidth={2.5} />
                  <span className="sr-only sm:not-sr-only">Done</span>
                </span>
              ) : (
                <Link
                  href={href}
                  className={cn(
                    "shrink-0 rounded-full border border-[#121212] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#121212]",
                    "transition-colors hover:bg-[#121212] hover:text-white"
                  )}
                >
                  Play
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
