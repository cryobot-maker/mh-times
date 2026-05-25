"use client";

import { Modal } from "@/components/Modal";

export function HowToPlayModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-[420px]">
      <h2
        className="mb-4 pr-8 text-2xl font-bold text-[#121212]"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        How to Play
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-[#121212]">
        Fill each row, column, and 3×3 box with the digits 1–9 without repeating
        any number. Tap a cell, then use the number pad or your keyboard to
        enter values. Use Notes mode for pencil marks when you&apos;re unsure.
      </p>

      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#6b6b6b]">
        Example conflict
      </p>
      <div className="mb-2 inline-grid grid-cols-3 gap-0 border-2 border-[#344861]">
        {[1, 2, 3, 4, 5, 2, 7, 8, 9].map((n, i) => (
          <div
            key={i}
            className={`flex h-10 w-10 items-center justify-center border border-[#c2c2c2] text-sm font-bold ${
              n === 2 && (i === 2 || i === 5)
                ? "bg-[#f8d7da] text-[#c0392b]"
                : "bg-white text-[#344861]"
            }`}
          >
            {n}
          </div>
        ))}
      </div>
      <p className="text-xs text-[#6b6b6b]">
        Two 2s in the same row are highlighted in red — fix conflicts before
        you finish.
      </p>
    </Modal>
  );
}
