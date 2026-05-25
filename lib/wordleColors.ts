import type { WordleLetterStatus } from "@/types";

const STANDARD: Record<WordleLetterStatus, string> = {
  correct: "bg-[#6aaa64] border-[#6aaa64] text-white",
  present: "bg-[#c9b458] border-[#c9b458] text-white",
  absent: "bg-[#787c7e] border-[#787c7e] text-white",
};

const COLOR_BLIND: Record<WordleLetterStatus, string> = {
  correct: "bg-[#f5793a] border-[#f5793a] text-white",
  present: "bg-[#85c0f9] border-[#85c0f9] text-white",
  absent: "bg-[#787c7e] border-[#787c7e] text-white",
};

const STANDARD_BG: Record<WordleLetterStatus, string> = {
  correct: "bg-[#6aaa64] text-white",
  present: "bg-[#c9b458] text-white",
  absent: "bg-[#787c7e] text-white",
};

const COLOR_BLIND_BG: Record<WordleLetterStatus, string> = {
  correct: "bg-[#f5793a] text-white",
  present: "bg-[#85c0f9] text-white",
  absent: "bg-[#787c7e] text-white",
};

export function getWordleTileStyles(
  colorBlindMode: boolean
): Record<WordleLetterStatus, string> {
  return colorBlindMode ? COLOR_BLIND : STANDARD;
}

export function getWordleKeyboardStyles(
  colorBlindMode: boolean
): Record<WordleLetterStatus, string> {
  return colorBlindMode ? COLOR_BLIND_BG : STANDARD_BG;
}

export const WORDLE_SHARE_GREEN = "#6aaa64";
export const WORDLE_SHARE_ORANGE = "#f5793a";
