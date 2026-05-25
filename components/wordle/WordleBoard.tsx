"use client";

import { motion } from "framer-motion";
import { WordleTile } from "./WordleTile";
import type { WordleLetterStatus } from "@/types";

const ROWS = 6;
const COLS = 5;

interface WordleBoardProps {
  guesses: string[];
  evaluations: WordleLetterStatus[][];
  currentGuess: string;
  revealedRows: number;
  flippingRow: number | null;
  bouncingRow: number | null;
  shakingRow: number | null;
  popCol: number;
  onFlipComplete: () => void;
}

export function WordleBoard({
  guesses,
  evaluations,
  currentGuess,
  revealedRows,
  flippingRow,
  bouncingRow,
  shakingRow,
  popCol,
  onFlipComplete,
}: WordleBoardProps) {
  return (
    <div className="wordle-board-wrap">
      <div className="wordle-tile-grid">
        {Array.from({ length: ROWS }).map((_, rowIndex) => {
          const isActiveRow = rowIndex === guesses.length;
          const isShaking = shakingRow === rowIndex;
          const isFlipping = flippingRow === rowIndex;
          const isBouncing = bouncingRow === rowIndex;
          const guess = guesses[rowIndex] ?? "";
          const evalRow = evaluations[rowIndex];
          const isRevealed = rowIndex < revealedRows;

          return (
            <motion.div
              key={rowIndex}
              className="wordle-tile-row"
              style={{ perspective: 1000 }}
              animate={isShaking ? { x: [-4, 4, -4, 4, 0] } : {}}
              transition={
                isShaking ? { duration: 0.4, ease: "easeInOut" } : {}
              }
            >
              {Array.from({ length: COLS }).map((_, colIndex) => {
                let letter = "";
                let status: WordleLetterStatus | "empty" | "filled" = "empty";

                if (rowIndex < guesses.length) {
                  letter = guess[colIndex] ?? "";
                  if (isRevealed && evalRow) {
                    status = evalRow[colIndex];
                  } else if (letter) {
                    status = "filled";
                  }
                } else if (isActiveRow) {
                  letter = currentGuess[colIndex] ?? "";
                  status = letter ? "filled" : "empty";
                }

                return (
                  <WordleTile
                    key={colIndex}
                    letter={letter}
                    status={status}
                    isFlipping={isFlipping && rowIndex < guesses.length}
                    flipDelay={colIndex * 100}
                    shouldBounce={isBouncing}
                    popTrigger={
                      isActiveRow && colIndex === popCol ? popCol + 1 : 0
                    }
                    isLastInRow={colIndex === COLS - 1}
                    onFlipComplete={
                      isFlipping && colIndex === COLS - 1
                        ? onFlipComplete
                        : undefined
                    }
                  />
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
