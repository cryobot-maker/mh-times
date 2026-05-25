"use client";

import { Modal } from "@/components/Modal";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { getWordleTileStyles } from "@/lib/wordleColors";
import { cn } from "@/lib/utils";

export function HowToPlayModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const colorBlindMode = useSettingsStore((s) => s.colorBlindMode);
  const styles = getWordleTileStyles(colorBlindMode);

  return (
    <Modal open={open} onClose={onClose}>
      <h2
        className="mb-4 pr-8 text-center text-2xl font-bold"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        How To Play
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-[#121212]">
        Guess the Wordle in 6 tries. Each guess must be a valid 5-letter word.
        Hit Enter to submit. After each guess, the color of the tiles will
        change to show how close your guess was to the word.
      </p>

      <div className="mb-4">
        <p className="mb-2 text-sm font-bold">Examples</p>
        <div className="mb-2 flex gap-1">
          {["W", "E", "A", "R", "Y"].map((l, i) => (
            <div
              key={i}
              className={cn(
                "flex h-10 w-10 items-center justify-center border-2 text-lg font-bold uppercase",
                i === 0
                  ? styles.correct
                  : "border-[#d3d6da] bg-white text-[#121212]"
              )}
            >
              {l}
            </div>
          ))}
        </div>
        <p className="text-sm text-[#6b6b6b]">
          <strong className="text-[#121212]">W</strong> is in the word and in
          the correct spot.
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex gap-1">
          {["P", "I", "L", "L", "S"].map((l, i) => (
            <div
              key={i}
              className={cn(
                "flex h-10 w-10 items-center justify-center border-2 text-lg font-bold uppercase",
                i === 1
                  ? styles.present
                  : "border-[#d3d6da] bg-white text-[#121212]"
              )}
            >
              {l}
            </div>
          ))}
        </div>
        <p className="text-sm text-[#6b6b6b]">
          <strong className="text-[#121212]">I</strong> is in the word but in
          the wrong spot.
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex gap-1">
          {["V", "A", "G", "U", "E"].map((l, i) => (
            <div
              key={i}
              className={cn(
                "flex h-10 w-10 items-center justify-center border-2 text-lg font-bold uppercase",
                i === 3
                  ? styles.absent
                  : "border-[#d3d6da] bg-white text-[#121212]"
              )}
            >
              {l}
            </div>
          ))}
        </div>
        <p className="text-sm text-[#6b6b6b]">
          <strong className="text-[#121212]">U</strong> is not in the word in
          any spot.
        </p>
      </div>

      <p className="text-sm text-[#6b6b6b]">
        A new puzzle is released each day at midnight Eastern Time.
      </p>
    </Modal>
  );
}
