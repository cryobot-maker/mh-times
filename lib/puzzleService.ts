import {
  CONNECTIONS_PUZZLES,
  getConnectionsPuzzle,
  type ConnectionsPuzzle,
} from "./connectionsData";
import {
  LETTER_BOXED_PUZZLES,
  getLetterBoxedPuzzle,
  type LetterBoxedPuzzle,
} from "./letterBoxedData";
import {
  MINI_CROSSWORD_PUZZLES,
  getMiniCrossword,
  type MiniCrossword,
} from "./miniCrosswordData";
import {
  SPELLING_BEE_PUZZLES,
  getSpellingBeePuzzle,
  type SpellingBeePuzzle,
} from "./spellingBeeData";
import {
  STRANDS_PUZZLES,
  getStrandsPuzzle,
  type StrandsPuzzle,
} from "./strandsData";
import { WORDLE_ANSWERS, getWordleAnswer } from "./wordleData";
import { getDaysSinceJan12025, getTodayString } from "./gameUtils";
import { createClient, isSupabaseConfigured } from "./supabase";
import type { DailyPuzzle, PuzzleGameSlug } from "@/types";

const ROTATION_START = "2025-01-01";

export const PUZZLE_GAME_SLUGS: PuzzleGameSlug[] = [
  "wordle",
  "connections",
  "spelling-bee",
  "strands",
  "letter-boxed",
  "mini",
];

interface DailyPuzzleRow {
  id: string;
  game: string;
  puzzle_date: string;
  puzzle_data: Record<string, unknown>;
  created_at?: string;
}

function toDailyPuzzle(row: DailyPuzzleRow): DailyPuzzle {
  return {
    id: row.id,
    game: row.game as PuzzleGameSlug,
    puzzle_date:
      typeof row.puzzle_date === "string"
        ? row.puzzle_date.slice(0, 10)
        : String(row.puzzle_date),
    puzzle_data: row.puzzle_data,
  };
}

function pickByRotation<T>(items: T[], dateStr: string): T {
  const index =
    ((getDaysSinceJan12025(dateStr) % items.length) + items.length) %
    items.length;
  return items[index];
}

function getLocalWordlePuzzle(dateStr: string): Record<string, unknown> {
  const rotated = pickByRotation(WORDLE_ANSWERS, dateStr);
  return {
    answer: rotated,
    date: dateStr,
    fallbackAnswer: getWordleAnswer(dateStr),
  };
}

function getLocalConnectionsPuzzle(dateStr: string): ConnectionsPuzzle {
  const rotated = pickByRotation(CONNECTIONS_PUZZLES, dateStr);
  return { ...rotated, date: dateStr };
}

function getLocalSpellingBeePuzzle(dateStr: string): SpellingBeePuzzle {
  const rotated = pickByRotation(SPELLING_BEE_PUZZLES, dateStr);
  return { ...rotated, date: dateStr };
}

function getLocalStrandsPuzzle(dateStr: string): StrandsPuzzle {
  const rotated = pickByRotation(STRANDS_PUZZLES, dateStr);
  return { ...rotated, date: dateStr };
}

function getLocalLetterBoxedPuzzle(dateStr: string): LetterBoxedPuzzle {
  const rotated = pickByRotation(LETTER_BOXED_PUZZLES, dateStr);
  return { ...rotated, date: dateStr };
}

function getLocalMiniPuzzle(dateStr: string): MiniCrossword {
  const rotated = pickByRotation(MINI_CROSSWORD_PUZZLES, dateStr);
  return { ...rotated, date: dateStr };
}

export function getLocalPuzzleData(
  game: string,
  dateStr: string
): Record<string, unknown> {
  switch (game) {
    case "wordle":
      return getLocalWordlePuzzle(dateStr);
    case "connections":
      return getLocalConnectionsPuzzle(dateStr) as unknown as Record<
        string,
        unknown
      >;
    case "spelling-bee":
      return getLocalSpellingBeePuzzle(dateStr) as unknown as Record<
        string,
        unknown
      >;
    case "strands":
      return getLocalStrandsPuzzle(dateStr) as unknown as Record<string, unknown>;
    case "letter-boxed":
      return getLocalLetterBoxedPuzzle(dateStr) as unknown as Record<
        string,
        unknown
      >;
    case "mini":
      return getLocalMiniPuzzle(dateStr) as unknown as Record<string, unknown>;
    default:
      return {};
  }
}

export function buildLocalDailyPuzzle(
  game: string,
  dateStr: string
): DailyPuzzle {
  return {
    id: `local-${game}-${dateStr}`,
    game: game as PuzzleGameSlug,
    puzzle_date: dateStr,
    puzzle_data: getLocalPuzzleData(game, dateStr),
  };
}

/** Pick puzzle JSON for cron upsert (rotation from Jan 1, 2025) */
export function getRotatedPuzzleForDate(
  game: string,
  dateStr: string
): Record<string, unknown> {
  return getLocalPuzzleData(game, dateStr);
}

async function fetchPuzzleFromSupabase(
  game: string,
  dateStr: string
): Promise<DailyPuzzle | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("daily_puzzles")
      .select("id, game, puzzle_date, puzzle_data, created_at")
      .eq("game", game)
      .eq("puzzle_date", dateStr)
      .maybeSingle();

    if (error || !data) return null;
    return toDailyPuzzle(data as DailyPuzzleRow);
  } catch {
    return null;
  }
}

export async function getPuzzleByDate(
  game: string,
  date: string
): Promise<DailyPuzzle | null> {
  const remote = await fetchPuzzleFromSupabase(game, date);
  if (remote) return remote;
  return buildLocalDailyPuzzle(game, date);
}

export async function getTodaysPuzzle(
  game: string
): Promise<DailyPuzzle | null> {
  return getPuzzleByDate(game, getTodayString());
}

function resultStorageKey(game: string, date: string): string {
  return `puzzle-result-${game}-${date}`;
}

export async function savePuzzleResult(
  game: string,
  date: string,
  result: object
): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.from("puzzle_results").upsert(
          {
            game,
            puzzle_date: date,
            result,
          },
          { onConflict: "game,puzzle_date" }
        );
        if (!error) return;
      }
    } catch {
      // fall through to localStorage
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(resultStorageKey(game, date), JSON.stringify(result));
  }
}

/** Legacy getters — still used as store fallbacks */
export function resolveWordleAnswer(
  dateStr: string,
  puzzleData?: Record<string, unknown>
): string {
  if (typeof puzzleData?.answer === "string") {
    return puzzleData.answer.toUpperCase();
  }
  return getWordleAnswer(dateStr);
}

export function resolveConnectionsPuzzle(
  dateStr: string,
  puzzleData?: Record<string, unknown>
): ConnectionsPuzzle {
  if (puzzleData && Array.isArray(puzzleData.categories)) {
    return puzzleData as unknown as ConnectionsPuzzle;
  }
  return getConnectionsPuzzle(dateStr);
}

export function resolveSpellingBeePuzzle(
  dateStr: string,
  puzzleData?: Record<string, unknown>
): SpellingBeePuzzle {
  if (puzzleData && typeof puzzleData.centerLetter === "string") {
    return puzzleData as unknown as SpellingBeePuzzle;
  }
  return getSpellingBeePuzzle(dateStr);
}

export function resolveStrandsPuzzle(
  dateStr: string,
  puzzleData?: Record<string, unknown>
): StrandsPuzzle {
  if (puzzleData && Array.isArray(puzzleData.grid)) {
    return puzzleData as unknown as StrandsPuzzle;
  }
  return getStrandsPuzzle(dateStr);
}

export function resolveLetterBoxedPuzzle(
  dateStr: string,
  puzzleData?: Record<string, unknown>
): LetterBoxedPuzzle {
  if (puzzleData && puzzleData.sides) {
    return puzzleData as unknown as LetterBoxedPuzzle;
  }
  return getLetterBoxedPuzzle(dateStr);
}

export function resolveMiniPuzzle(
  dateStr: string,
  puzzleData?: Record<string, unknown>
): MiniCrossword {
  if (puzzleData && Array.isArray(puzzleData.grid)) {
    return puzzleData as unknown as MiniCrossword;
  }
  return getMiniCrossword(dateStr);
}

export { ROTATION_START };
