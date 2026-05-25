"use client";

import { useEffect, useMemo, useState } from "react";
import type { LetterBoxedPuzzle, LetterSide } from "@/lib/letterBoxedData";
import {
  getDotCenter,
  getLetter,
  getUsedKeysFromPaths,
  letterKey,
  LINE_COLORS,
  type LetterId,
} from "@/lib/letterBoxedLogic";
import { LetterBoxedAnimatedLine } from "./LetterBoxedAnimatedLine";
import { cn } from "@/lib/utils";

const SIDES: LetterSide[] = ["top", "right", "bottom", "left"];

interface LetterBoxedBoxProps {
  puzzle: LetterBoxedPuzzle;
  currentPath: LetterId[];
  completedPaths: LetterId[][];
  gameStatus: "playing" | "won";
  flashKey: string | null;
  onSelect: (side: LetterSide, index: number) => void;
}

function useBoxSize() {
  const [size, setSize] = useState(280);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setSize(mq.matches ? 280 : 320);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return size;
}

export function LetterBoxedBox({
  puzzle,
  currentPath,
  completedPaths,
  gameStatus,
  flashKey,
  onSelect,
}: LetterBoxedBoxProps) {
  const boxSize = useBoxSize();
  const dotClass =
    "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#121212] bg-white font-bold uppercase transition-colors duration-75 touch-manipulation h-[38px] w-[38px] min-h-[38px] min-w-[38px] text-sm md:h-11 md:w-11 md:min-h-[44px] md:min-w-[44px] md:text-base";

  const usedKeys = useMemo(() => {
    if (gameStatus !== "won") return new Set<string>();
    return getUsedKeysFromPaths(completedPaths);
  }, [completedPaths, gameStatus]);

  const currentKeys = new Set(
    currentPath.map((id) => letterKey(id.side, id.index))
  );

  const lineSegments = useMemo(() => {
    const segments: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
      key: string;
      animate: boolean;
    }[] = [];

    completedPaths.forEach((path, wordIndex) => {
      const color = LINE_COLORS[wordIndex % LINE_COLORS.length];
      for (let i = 1; i < path.length; i++) {
        const a = getDotCenter(path[i - 1].side, path[i - 1].index, boxSize);
        const b = getDotCenter(path[i].side, path[i].index, boxSize);
        segments.push({
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
          color,
          key: `done-${wordIndex}-${i}`,
          animate: false,
        });
      }
    });

    for (let i = 1; i < currentPath.length; i++) {
      const a = getDotCenter(
        currentPath[i - 1].side,
        currentPath[i - 1].index,
        boxSize
      );
      const b = getDotCenter(
        currentPath[i].side,
        currentPath[i].index,
        boxSize
      );
      segments.push({
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        color: "#121212",
        key: `cur-${i}`,
        animate: true,
      });
    }

    return segments;
  }, [boxSize, completedPaths, currentPath]);

  return (
    <div
      className="relative mx-auto p-[18px] md:p-[22px]"
      style={{ touchAction: "manipulation" }}
    >
      <div
        className="relative md:h-[320px] md:w-[320px]"
        style={{ width: boxSize, height: boxSize }}
      >
        <div
          className="absolute inset-0 rounded-[2px] border-[3px] border-[#121212] bg-white"
          aria-hidden
        />

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${boxSize} ${boxSize}`}
          width={boxSize}
          height={boxSize}
        >
          {lineSegments.map((seg) => (
            <LetterBoxedAnimatedLine
              key={seg.key}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              color={seg.color}
              opacity={seg.color === "#121212" ? 0.6 : 1}
              animate={seg.animate}
            />
          ))}
        </svg>

        {SIDES.map((side) =>
          [0, 1, 2].map((index) => {
            const key = letterKey(side, index);
            const letter = getLetter(puzzle.sides, { side, index });
            const pos = getDotCenter(side, index, boxSize);
            const isSelected = currentKeys.has(key);
            const isUsed = usedKeys.has(key);
            const isFlashing = flashKey === key;

            const pctX = (pos.x / boxSize) * 100;
            const pctY = (pos.y / boxSize) * 100;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(side, index)}
                className={cn(
                  dotClass,
                  "hover:bg-[#f4f3ee] active:bg-[#d9edff]",
                  isSelected && "!bg-[#121212] text-white hover:!bg-[#121212]",
                  isUsed && "!bg-[#6aaa64] text-white hover:!bg-[#6aaa64]",
                  isFlashing && "!bg-red-500 text-white"
                )}
                style={{
                  left: `${pctX}%`,
                  top: `${pctY}%`,
                  fontFamily: "Arial, sans-serif",
                  touchAction: "manipulation",
                }}
                aria-label={`Letter ${letter}`}
              >
                {letter}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
