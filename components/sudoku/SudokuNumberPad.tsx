"use client";

import {
  Eraser,
  Lightbulb,
  Pencil,
  Undo2,
} from "lucide-react";
import { useSudokuStore } from "@/lib/stores/sudokuStore";
import { countDigitOnBoard } from "@/lib/sudokuLogic";
import { cn } from "@/lib/utils";

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function SudokuNumberPad() {
  const board = useSudokuStore((s) => s.board);
  const pencilMode = useSudokuStore((s) => s.pencilMode);
  const gameStatus = useSudokuStore((s) => s.gameStatus);
  const paused = useSudokuStore((s) => s.paused);
  const hintsLeft = useSudokuStore((s) => s.getHintsLeft());
  const togglePencilMode = useSudokuStore((s) => s.togglePencilMode);
  const undo = useSudokuStore((s) => s.undo);
  const eraseSelected = useSudokuStore((s) => s.eraseSelected);
  const applyHint = useSudokuStore((s) => s.applyHint);
  const inputDigit = useSudokuStore((s) => s.inputDigit);

  const disabled = gameStatus !== "playing" || paused;

  const actions = [
    {
      id: "undo",
      label: "Undo",
      icon: Undo2,
      onClick: undo,
      active: false,
    },
    {
      id: "erase",
      label: "Erase",
      icon: Eraser,
      onClick: eraseSelected,
      active: false,
    },
    {
      id: "notes",
      label: "Notes",
      icon: Pencil,
      onClick: togglePencilMode,
      active: pencilMode,
    },
    {
      id: "hint",
      label: "Hint",
      hintCount: hintsLeft > 0 ? `${hintsLeft} left` : null,
      icon: Lightbulb,
      onClick: () => applyHint(),
      active: false,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[504px] px-4 md:px-0">
      <div className="mb-3 grid grid-cols-4 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={disabled || (action.id === "hint" && hintsLeft <= 0)}
            onClick={action.onClick}
            className={cn(
              "sudoku-action-btn",
              action.active && "sudoku-action-btn-active"
            )}
          >
            <action.icon size={18} strokeWidth={1.75} />
            <span className="flex flex-col items-center leading-tight">
              <span>{action.label}</span>
              {"hintCount" in action && action.hintCount && (
                <span className="text-[9px] font-normal opacity-80">
                  {action.hintCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-9 gap-1.5">
        {DIGITS.map((digit) => {
          const placed = countDigitOnBoard(board, digit);
          const remaining = 9 - placed;
          return (
            <button
              key={digit}
              type="button"
              disabled={disabled}
              onClick={() => inputDigit(digit)}
              className={cn(
                "sudoku-num-btn",
                remaining === 0 && "sudoku-num-btn-dim"
              )}
            >
              <span className="sudoku-num-btn-digit">{digit}</span>
              <span className="sudoku-num-btn-badge">{remaining}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
