import type { SpellingBeePuzzle } from "./spellingBeeData";
import { getUniqueValidWords } from "./spellingBeeData";

export const RANK_THRESHOLDS = [
  { pct: 0, label: "Beginner" },
  { pct: 0.02, label: "Good Start" },
  { pct: 0.05, label: "Moving Up" },
  { pct: 0.08, label: "Good" },
  { pct: 0.15, label: "Solid" },
  { pct: 0.25, label: "Nice" },
  { pct: 0.4, label: "Great" },
  { pct: 0.5, label: "Amazing" },
  { pct: 0.7, label: "Genius" },
  { pct: 1, label: "Queen Bee" },
];

export function scoreWord(word: string, isPangram: boolean): number {
  const len = word.length;
  let points = 0;
  if (len === 4) points = 1;
  else if (len === 5) points = 5;
  else if (len >= 6) points = 6 + (len - 6);
  if (isPangram) points += 7;
  return points;
}

export function calculateMaxScore(puzzle: SpellingBeePuzzle): number {
  const unique = getUniqueValidWords(puzzle);
  const pangramSet = new Set(puzzle.pangrams.map((p) => p.toUpperCase()));
  let total = 0;
  unique.forEach((word) => {
    total += scoreWord(word, pangramSet.has(word));
  });
  return total;
}

export function getRankLabel(score: number, maxScore: number): string {
  if (maxScore <= 0) return RANK_THRESHOLDS[0].label;
  const pct = score / maxScore;
  let rank: string = RANK_THRESHOLDS[0].label;
  for (const tier of RANK_THRESHOLDS) {
    if (pct >= tier.pct) rank = tier.label;
  }
  return rank;
}

export function getProgressPct(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.min(100, (score / maxScore) * 100);
}

export function isPangram(word: string, puzzle: SpellingBeePuzzle): boolean {
  const upper = word.toUpperCase();
  return puzzle.pangrams.some((p) => p.toUpperCase() === upper);
}

export function hasCenterLetter(word: string, center: string): boolean {
  return word.toUpperCase().includes(center.toUpperCase());
}

export function canUseLetters(
  word: string,
  center: string,
  outer: string[]
): boolean {
  const allowed = new Set(
    [center, ...outer].map((l) => l.toUpperCase())
  );
  return word
    .toUpperCase()
    .split("")
    .every((ch) => allowed.has(ch));
}

export type SubmitResult =
  | { ok: true; word: string; points: number; isPangram: boolean }
  | { ok: false; error: "too-short" | "missing-center" | "not-in-list" | "already-found" | "invalid-letters" };

export function validateSubmission(
  word: string,
  puzzle: SpellingBeePuzzle,
  foundWords: string[]
): SubmitResult {
  const upper = word.toUpperCase().trim();
  if (upper.length < 4) return { ok: false, error: "too-short" };
  if (!hasCenterLetter(upper, puzzle.centerLetter))
    return { ok: false, error: "missing-center" };
  if (!canUseLetters(upper, puzzle.centerLetter, [...puzzle.outerLetters]))
    return { ok: false, error: "invalid-letters" };
  const validSet = getUniqueValidWords(puzzle);
  if (!validSet.has(upper)) return { ok: false, error: "not-in-list" };
  if (foundWords.map((w) => w.toUpperCase()).includes(upper))
    return { ok: false, error: "already-found" };

  const pangram = isPangram(upper, puzzle);
  return {
    ok: true,
    word: upper,
    points: scoreWord(upper, pangram),
    isPangram: pangram,
  };
}

export const SUBMIT_ERROR_MESSAGES: Record<
  Exclude<SubmitResult, { ok: true }>["error"],
  string
> = {
  "too-short": "Too short",
  "missing-center": "Missing center letter",
  "not-in-list": "Not in word list",
  "already-found": "Already found",
  "invalid-letters": "Not in word list",
};
