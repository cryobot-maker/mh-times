"use client";

import type { WordleLetterStatus } from "@/types";
import { getWordleKeyboardStyles } from "@/lib/wordleColors";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { cn } from "@/lib/utils";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

interface WordleKeyboardProps {
  keyboardStatus: Record<string, WordleLetterStatus>;
  onKey: (key: string) => void;
  disabled?: boolean;
}

export function WordleKeyboard({
  keyboardStatus,
  onKey,
  disabled,
}: WordleKeyboardProps) {
  const colorBlindMode = useSettingsStore((s) => s.colorBlindMode);
  const keyStatusBg = getWordleKeyboardStyles(colorBlindMode);

  return (
    <div className="wordle-keyboard pb-safe">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="wordle-keyboard-row">
          {row.map((key) => {
            const isWide = key === "ENTER" || key === "BACK";
            const status = keyboardStatus[key];
            const bg = status
              ? keyStatusBg[status]
              : "bg-[#d3d6da] text-[#121212]";

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onKey(
                    key === "BACK"
                      ? "Backspace"
                      : key === "ENTER"
                        ? "Enter"
                        : key
                  )
                }
                className={cn(
                  "wordle-key",
                  isWide && "wordle-key-wide",
                  bg,
                  "hover:brightness-90 active:brightness-90",
                  disabled && "pointer-events-none opacity-60"
                )}
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {key === "BACK" ? "⌫" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
