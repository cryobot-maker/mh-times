"use client";

import type { MiniWord } from "@/lib/miniCrosswordLogic";
import type { MiniDirection } from "@/lib/miniCrosswordLogic";
import { cn } from "@/lib/utils";

interface MiniCluesPanelProps {
  acrossWords: MiniWord[];
  downWords: MiniWord[];
  activeTab: MiniDirection;
  direction: MiniDirection;
  focusRow: number;
  focusCol: number;
  onTabChange: (tab: MiniDirection) => void;
  onSelectClue: (direction: MiniDirection, number: number) => void;
}

function isActiveClue(
  word: MiniWord,
  direction: MiniDirection,
  focusRow: number,
  focusCol: number
): boolean {
  return (
    word.direction === direction &&
    word.cells.some((c) => c.row === focusRow && c.col === focusCol)
  );
}

export function MiniCluesPanel({
  acrossWords,
  downWords,
  activeTab,
  direction,
  focusRow,
  focusCol,
  onTabChange,
  onSelectClue,
}: MiniCluesPanelProps) {
  const words = activeTab === "across" ? acrossWords : downWords;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => onTabChange("across")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide",
            activeTab === "across"
              ? "bg-[#121212] text-white"
              : "border border-[#e2e2e2] text-[#121212]"
          )}
        >
          ACROSS
        </button>
        <button
          type="button"
          onClick={() => onTabChange("down")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide",
            activeTab === "down"
              ? "bg-[#121212] text-white"
              : "border border-[#e2e2e2] text-[#121212]"
          )}
        >
          CLUES DOWN
        </button>
      </div>

      <ul className="max-h-[280px] flex-1 overflow-y-auto md:max-h-[320px]">
        {words.map((word) => {
          const active = isActiveClue(word, direction, focusRow, focusCol);
          return (
            <li key={word.id}>
              <button
                type="button"
                onClick={() => onSelectClue(word.direction, word.number)}
                className={cn(
                  "w-full px-2 py-2 text-left text-sm leading-snug text-[#121212]",
                  active && "bg-[#f4f3ee] font-semibold"
                )}
              >
                <span className="font-bold">{word.number}.</span> {word.clue}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
