"use client";

import type { ParsedMiniPuzzle } from "@/lib/miniCrosswordLogic";
import {
  cellKey,
  getWordCells,
  type MiniDirection,
} from "@/lib/miniCrosswordLogic";
import { cn } from "@/lib/utils";

interface MiniGridProps {
  parsed: ParsedMiniPuzzle;
  entries: Record<string, string>;
  focusRow: number;
  focusCol: number;
  direction: MiniDirection;
  completionFlash: boolean;
  onSelectCell: (row: number, col: number) => void;
}

export function MiniGrid({
  parsed,
  entries,
  focusRow,
  focusCol,
  direction,
  completionFlash,
  onSelectCell,
}: MiniGridProps) {
  const wordCells = getWordCells(parsed, focusRow, focusCol, direction);
  const wordKeys = new Set(wordCells.map((c) => cellKey(c.row, c.col)));
  const focusKey = cellKey(focusRow, focusCol);

  return (
    <div
      className="mx-auto grid w-full max-w-full grid-cols-5 gap-0 px-1 md:w-[260px] md:max-w-[260px] md:px-0"
      role="grid"
      aria-label="Crossword grid"
      style={{ touchAction: "manipulation" }}
    >
      {Array.from({ length: parsed.size }).map((_, row) =>
        Array.from({ length: parsed.size }).map((_, col) => {
          const isBlack = parsed.black[row][col];
          const key = cellKey(row, col);
          const isFocus = focusKey === key;
          const inWord = wordKeys.has(key);
          const number = parsed.numbers[row][col];
          const letter = entries[key] ?? "";

          if (isBlack) {
            return (
              <div
                key={key}
                className="aspect-square w-full bg-[#121212] md:aspect-auto md:h-[52px] md:w-[52px]"
                aria-hidden
              />
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectCell(row, col)}
              className={cn(
                "relative flex aspect-square w-full min-h-[44px] items-center justify-center border border-[#b9b9b9] bg-white text-lg font-bold uppercase text-[#121212] transition-colors duration-75 touch-manipulation",
                "active:bg-[#d9edff] md:aspect-auto md:h-[52px] md:w-[52px] md:text-xl",
                inWord && !isFocus && "bg-[#d9edff]",
                isFocus && "z-10 border-2 border-[#121212] bg-[#a7d8ff]",
                completionFlash && "!bg-[#6aaa64]"
              )}
              style={{ touchAction: "manipulation" }}
              aria-label={`Cell row ${row + 1} column ${col + 1}`}
            >
              {number != null && (
                <span className="absolute left-0.5 top-0.5 text-[8px] font-normal leading-none md:left-1 md:text-[9px]">
                  {number}
                </span>
              )}
              <span>{letter}</span>
            </button>
          );
        })
      )}
    </div>
  );
}
