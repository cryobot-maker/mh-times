"use client";

import { useEffect, useRef } from "react";

interface MiniHiddenInputProps {
  focusToken: number;
  onInput: (value: string) => void;
  onBackspace: () => void;
}

/** Off-screen input to summon the device keyboard on mobile */
export function MiniHiddenInput({
  focusToken,
  onInput,
  onBackspace,
}: MiniHiddenInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusToken > 0) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [focusToken]);

  return (
    <input
      ref={inputRef}
      type="text"
      autoCapitalize="characters"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
      onChange={(e) => {
        const val = e.target.value;
        if (!val) return;
        const ch = val.slice(-1).toUpperCase();
        if (/^[A-Z]$/.test(ch)) onInput(ch);
        e.target.value = "";
      }}
      onKeyDown={(e) => {
        if (e.key === "Backspace") {
          e.preventDefault();
          onBackspace();
        }
      }}
    />
  );
}
