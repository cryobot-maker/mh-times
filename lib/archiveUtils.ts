import { getDayNumber, getTodayString, loadGameState } from "./gameUtils";
import { getConnectionsPuzzle } from "./connectionsData";
import { getLetterBoxedPuzzle } from "./letterBoxedData";
import { getStrandsPuzzle } from "./strandsData";
import type { ConnectionsState, WordleState } from "@/types";

export type ArchiveGameSlug =
  | "wordle"
  | "connections"
  | "strands"
  | "spelling-bee"
  | "mini"
  | "letter-boxed";

export interface ArchiveGame {
  slug: ArchiveGameSlug;
  label: string;
  path: string;
}

export const ARCHIVE_GAMES: ArchiveGame[] = [
  { slug: "wordle", label: "Wordle", path: "/wordle" },
  { slug: "connections", label: "Connections", path: "/connections" },
  { slug: "strands", label: "Strands", path: "/strands" },
  { slug: "spelling-bee", label: "Spelling Bee", path: "/spelling-bee" },
  { slug: "mini", label: "Mini", path: "/mini" },
  { slug: "letter-boxed", label: "Letter Boxed", path: "/letter-boxed" },
];

function storageKey(slug: ArchiveGameSlug, date: string): string {
  const keys: Record<ArchiveGameSlug, string> = {
    wordle: `wordle-state-${date}`,
    connections: `connections-state-${date}`,
    strands: `strands-state-${date}`,
    "spelling-bee": `spelling-bee-state-${date}`,
    mini: `mini-state-${date}`,
    "letter-boxed": `letterboxed-state-${date}`,
  };
  return keys[slug];
}

export function isGameCompleted(
  slug: ArchiveGameSlug,
  dateStr: string
): boolean {
  if (typeof window === "undefined") return false;

  switch (slug) {
    case "wordle": {
      const s = loadGameState<WordleState>(storageKey(slug, dateStr));
      return s?.gameStatus === "won";
    }
    case "connections": {
      const s = loadGameState<ConnectionsState>(storageKey(slug, dateStr));
      return s?.gameStatus === "won";
    }
    case "strands": {
      const s = loadGameState<{ gameStatus: string }>(
        storageKey(slug, dateStr)
      );
      return s?.gameStatus === "won";
    }
    case "spelling-bee": {
      const s = loadGameState<{
        gameStatus?: string;
        score?: number;
        maxScore?: number;
      }>(storageKey(slug, dateStr));
      if (!s) return false;
      if (s.gameStatus === "completed") return true;
      return (
        typeof s.score === "number" &&
        typeof s.maxScore === "number" &&
        s.maxScore > 0 &&
        s.score >= s.maxScore
      );
    }
    case "mini": {
      const s = loadGameState<{ gameStatus: string }>(
        storageKey(slug, dateStr)
      );
      return s?.gameStatus === "won";
    }
    case "letter-boxed": {
      const s = loadGameState<{ gameStatus: string }>(
        storageKey(slug, dateStr)
      );
      return s?.gameStatus === "won";
    }
    default:
      return false;
  }
}

export function hasPlayedGame(
  slug: ArchiveGameSlug,
  dateStr: string
): boolean {
  if (typeof window === "undefined") return false;
  const key = storageKey(slug, dateStr);
  return localStorage.getItem(key) !== null;
}

export function getPuzzleNumber(
  slug: ArchiveGameSlug,
  dateStr: string
): number {
  switch (slug) {
    case "wordle":
      return getDayNumber(dateStr) + 1;
    case "connections":
      return getConnectionsPuzzle(dateStr).number;
    case "strands":
      return getStrandsPuzzle(dateStr).number;
    case "spelling-bee":
      return getDayNumber(dateStr) + 1;
    case "mini":
      return getDayNumber(dateStr) + 1;
    case "letter-boxed":
      return getLetterBoxedPuzzle(dateStr).number;
    default:
      return getDayNumber(dateStr);
  }
}

export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDateString(dateStr: string): {
  year: number;
  month: number;
  day: number;
} {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

export function getCalendarDays(
  year: number,
  month: number
): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function isFutureDate(dateStr: string): boolean {
  return dateStr > getTodayString();
}

export function getRecentDates(count: number): string[] {
  const dates: string[] = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    const cur = new Date(d);
    cur.setDate(d.getDate() - i);
    dates.push(
      toDateString(cur.getFullYear(), cur.getMonth(), cur.getDate())
    );
  }
  return dates;
}

/** Count completed game-days across all games in the last 7 days */
export function getWeekGamesPlayedCount(): number {
  if (typeof window === "undefined") return 0;
  let count = 0;
  const dates = getRecentDates(7);
  for (const dateStr of dates) {
    for (const game of ARCHIVE_GAMES) {
      if (isGameCompleted(game.slug, dateStr)) count++;
    }
  }
  return count;
}

export function isValidArchiveGame(
  value: string | null
): value is ArchiveGameSlug {
  return ARCHIVE_GAMES.some((g) => g.slug === value);
}
