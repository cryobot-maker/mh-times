import type { LetterBoxedPuzzle, LetterSide } from "./letterBoxedData";

export const LINE_COLORS = [
  "#6aaa64",
  "#c9b458",
  "#b4d8fb",
  "#ba81c5",
  "#f9df6d",
];

export interface LetterId {
  side: LetterSide;
  index: number;
}

export function letterKey(side: LetterSide, index: number): string {
  return `${side}-${index}`;
}

export function parseLetterKey(key: string): LetterId {
  const [side, index] = key.split("-");
  return { side: side as LetterSide, index: Number(index) };
}

export function getLetter(
  sides: LetterBoxedPuzzle["sides"],
  id: LetterId
): string {
  return sides[id.side][id.index];
}

export function getDotCenter(
  side: LetterSide,
  index: number,
  boxSize: number
): { x: number; y: number } {
  const positions = [boxSize * 0.2, boxSize * 0.5, boxSize * 0.8];
  switch (side) {
    case "top":
      return { x: positions[index], y: 0 };
    case "right":
      return { x: boxSize, y: positions[index] };
    case "bottom":
      return { x: positions[index], y: boxSize };
    case "left":
      return { x: 0, y: positions[index] };
  }
}

export function pathToWord(
  sides: LetterBoxedPuzzle["sides"],
  path: LetterId[]
): string {
  return path.map((id) => getLetter(sides, id)).join("");
}

export function getAllLetterKeys(): string[] {
  const sides: LetterSide[] = ["top", "right", "bottom", "left"];
  return sides.flatMap((side) =>
    [0, 1, 2].map((index) => letterKey(side, index))
  );
}

export function getUsedKeysFromWords(
  sides: LetterBoxedPuzzle["sides"],
  words: string[]
): Set<string> {
  const used = new Set<string>();
  const allKeys = getAllLetterKeys();
  for (const word of words) {
    const upper = word.toUpperCase();
    for (const key of allKeys) {
      const { side, index } = parseLetterKey(key);
      const letter = getLetter(sides, { side, index });
      if (upper.includes(letter)) {
        used.add(key);
      }
    }
  }
  return used;
}

/** Each dot must appear in at least one completed word (letter used on that side) */
export function getUsedKeysFromPaths(paths: LetterId[][]): Set<string> {
  const used = new Set<string>();
  for (const path of paths) {
    for (const id of path) {
      used.add(letterKey(id.side, id.index));
    }
  }
  return used;
}

export function allLettersUsed(usedKeys: Set<string>): boolean {
  return usedKeys.size >= 12;
}

let validWordsCache: Set<string> | null = null;

export async function loadLetterBoxedDictionary(
  extraWords: string[] = []
): Promise<Set<string>> {
  if (!validWordsCache) {
    const base = new Set<string>();
    try {
      const res = await fetch("/valid-words.json");
      if (res.ok) {
        const json = (await res.json()) as string[];
        json.forEach((w) => {
          if (w.length >= 3) base.add(w.toUpperCase());
        });
      }
    } catch {
      ["THE", "AND", "FOR", "ARE", "CAT", "DOG", "RUN"].forEach((w) =>
        base.add(w)
      );
    }
    validWordsCache = base;
  }
  extraWords.forEach((w) => validWordsCache!.add(w.toUpperCase()));
  return validWordsCache;
}
