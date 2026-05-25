"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { WordleLetterStatus } from "@/types";
import {
  getWordleTileClass,
  type WordleTileState,
} from "@/lib/wordleColors";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { cn } from "@/lib/utils";

interface WordleTileProps {
  letter: string;
  status?: WordleTileState;
  isFlipping: boolean;
  flipDelay: number;
  shouldBounce: boolean;
  popTrigger: number;
  onFlipComplete?: () => void;
  isLastInRow?: boolean;
}

export function WordleTile({
  letter,
  status = "empty",
  isFlipping,
  flipDelay,
  shouldBounce,
  popTrigger,
  onFlipComplete,
  isLastInRow,
}: WordleTileProps) {
  const colorBlindMode = useSettingsStore((s) => s.colorBlindMode);
  const [revealed, setRevealed] = useState(false);
  const evaluated =
    status === "correct" || status === "present" || status === "absent";

  useEffect(() => {
    if (!isFlipping) {
      setRevealed(evaluated);
      return;
    }
    setRevealed(false);
    const revealTimer = setTimeout(() => {
      setRevealed(true);
    }, flipDelay + 250);

    const completeTimer = setTimeout(() => {
      if (isLastInRow && onFlipComplete) onFlipComplete();
    }, flipDelay + 500);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [isFlipping, flipDelay, evaluated, isLastInRow, onFlipComplete, status]);

  const displayStatus: WordleTileState =
    revealed && evaluated ? (status as WordleLetterStatus) : status;

  const tileClass = getWordleTileClass(colorBlindMode, displayStatus);

  return (
    <div className={cn("wordle-tile", tileClass)}>
      <motion.span
        className="wordle-tile-letter"
        initial={false}
        animate={
          isFlipping
            ? { rotateY: [0, 90, 0] }
            : shouldBounce
              ? { y: [0, -20, 0] }
              : popTrigger > 0
                ? { scale: [1, 1.12, 1] }
                : {}
        }
        transition={
          isFlipping
            ? {
                rotateY: {
                  duration: 0.5,
                  times: [0, 0.5, 1],
                  delay: flipDelay / 1000,
                  ease: "easeInOut",
                },
              }
            : shouldBounce
              ? {
                  y: {
                    duration: 0.4,
                    delay: flipDelay / 1000,
                    ease: "easeOut",
                  },
                }
              : popTrigger > 0
                ? { scale: { duration: 0.08 } }
                : {}
        }
        style={{
          display: "inline-block",
          transformStyle: "preserve-3d",
        }}
      >
        {letter}
      </motion.span>
    </div>
  );
}
