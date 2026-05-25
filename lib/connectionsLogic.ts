import type { ConnectionsCategory, ConnectionsColor } from "./connectionsData";
import { CONNECTIONS_COLOR_EMOJI } from "./connectionsData";

export function shuffleArray<T>(arr: T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function findMatchingCategory(
  selectedWords: string[],
  categories: ConnectionsCategory[]
): ConnectionsCategory | null {
  const sorted = [...selectedWords].sort().join(",");
  for (const cat of categories) {
    const catSorted = [...cat.words].sort().join(",");
    if (sorted === catSorted) return cat;
  }
  return null;
}

export function isOneAway(
  selectedWords: string[],
  categories: ConnectionsCategory[]
): boolean {
  for (const cat of categories) {
    const matches = selectedWords.filter((w) =>
      cat.words.includes(w as (typeof cat.words)[number])
    ).length;
    if (matches === 3) return true;
  }
  return false;
}

export function buildShareGrid(
  solveOrder: ConnectionsColor[],
  mistakes: number,
  won: boolean
): string {
  const lines = solveOrder.map((c) => CONNECTIONS_COLOR_EMOJI[c].repeat(4));
  const header = won
    ? `Connections\n${mistakes} mistake${mistakes === 1 ? "" : "s"}\n`
    : `Connections\nX/4\n`;
  return header + lines.join("\n");
}
