import type { SpellingBeePuzzle } from "./spellingBeeData";

let cacheByLetters: Record<string, string[]> | null = null;

export function puzzleLetterSignature(puzzle: SpellingBeePuzzle): string {
  return [puzzle.centerLetter, ...puzzle.outerLetters].sort().join("");
}

export async function loadSpellingBeeDictionary(): Promise<
  Record<string, string[]>
> {
  if (cacheByLetters) return cacheByLetters;
  try {
    const res = await fetch("/spelling-bee-by-letters.json");
    if (res.ok) {
      cacheByLetters = (await res.json()) as Record<string, string[]>;
      return cacheByLetters;
    }
  } catch {
    // fallback to puzzle lists only
  }
  cacheByLetters = {};
  return cacheByLetters;
}

export async function getValidWordsForPuzzle(
  puzzle: SpellingBeePuzzle
): Promise<Set<string>> {
  const sig = puzzleLetterSignature(puzzle);
  const cache = await loadSpellingBeeDictionary();
  const fromDict = cache[sig] ?? [];
  const merged = new Set<string>();
  puzzle.validWords.forEach((w) => merged.add(w.toUpperCase()));
  puzzle.pangrams.forEach((w) => merged.add(w.toUpperCase()));
  fromDict.forEach((w) => merged.add(w.toUpperCase()));
  return merged;
}
