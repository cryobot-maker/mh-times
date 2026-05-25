"use client";

import { useMemo } from "react";

const COLORS = ["#89b4f7", "#6aaa64", "#f7da21", "#c9b458", "#b4d8fb"];

export function SudokuConfetti({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.5}s`,
        duration: `${1 + Math.random() * 1.5}s`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 6,
      })),
    []
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[300] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-sudoku-confetti rounded-sm"
          style={{
            left: p.left,
            top: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
