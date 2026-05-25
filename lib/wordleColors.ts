import type { WordleLetterStatus } from "@/types";

export type WordleTileState = WordleLetterStatus | "empty" | "filled";

const TILE_STANDARD: Record<WordleLetterStatus, string> = {
  correct: "wl-tile-correct",
  present: "wl-tile-present",
  absent: "wl-tile-absent",
};

const TILE_COLOR_BLIND: Record<WordleLetterStatus, string> = {
  correct: "wl-tile-correct-cb",
  present: "wl-tile-present-cb",
  absent: "wl-tile-absent-cb",
};

const BTN_STANDARD: Record<WordleLetterStatus, string> = {
  correct: "wl-btn-correct",
  present: "wl-btn-present",
  absent: "wl-btn-absent",
};

const BTN_COLOR_BLIND: Record<WordleLetterStatus, string> = {
  correct: "wl-btn-correct-cb",
  present: "wl-btn-present-cb",
  absent: "wl-btn-absent-cb",
};

export function getWordleTileClass(
  colorBlindMode: boolean,
  status: WordleTileState
): string {
  if (status === "empty") return "wl-tile-empty";
  if (status === "filled") return "wl-tile-filled";
  const map = colorBlindMode ? TILE_COLOR_BLIND : TILE_STANDARD;
  return map[status];
}

export function getWordleKeyboardClass(
  colorBlindMode: boolean,
  status?: WordleLetterStatus
): string {
  if (!status) return "wl-btn-default";
  const map = colorBlindMode ? BTN_COLOR_BLIND : BTN_STANDARD;
  return map[status];
}

/** @deprecated Use getWordleTileClass */
export function getWordleTileStyles(
  colorBlindMode: boolean
): Record<WordleLetterStatus, string> {
  const map = colorBlindMode ? TILE_COLOR_BLIND : TILE_STANDARD;
  return map;
}

/** @deprecated Use getWordleKeyboardClass */
export function getWordleKeyboardStyles(
  colorBlindMode: boolean
): Record<WordleLetterStatus, string> {
  const map = colorBlindMode ? BTN_COLOR_BLIND : BTN_STANDARD;
  return map;
}

export const WORDLE_SHARE_GREEN = "#6aaa64";
export const WORDLE_SHARE_ORANGE = "#f5793a";
