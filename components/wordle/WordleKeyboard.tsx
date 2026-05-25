"use client";

import type { WordleLetterStatus } from "@/types";
import { getWordleKeyboardClass } from "@/lib/wordleColors";
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

  return (
    <div className="wordle-keyboard pb-safe">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="wordle-keyboard-row">
          {row.map((keyLabel) => {
            const isWide = keyLabel === "ENTER" || keyLabel === "BACK";
            const status = keyboardStatus[keyLabel];
            const label = keyLabel === "BACK" ? "⌫" : keyLabel;

            return (
              <button
                key={`${rowIdx}-${keyLabel}`}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onKey(
                    keyLabel === "BACK"
                      ? "Backspace"
                      : keyLabel === "ENTER"
                        ? "Enter"
                        : keyLabel
                  )
                }
                className={cn(
                  "wl-btn",
                  isWide && "wl-btn-wide",
                  getWordleKeyboardClass(colorBlindMode, status),
                  "hover:brightness-90 active:brightness-90",
                  disabled && "pointer-events-none opacity-60"
                )}
              >
                <span className="wl-btn-label">{label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
