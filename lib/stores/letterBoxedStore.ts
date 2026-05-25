import { create } from "zustand";
import { getTodayString, loadGameState, saveGameState } from "@/lib/gameUtils";
import {
  LETTER_BOXED_PUZZLES,
  type LetterBoxedPuzzle,
  type LetterSide,
} from "@/lib/letterBoxedData";
import { resolveLetterBoxedPuzzle, savePuzzleResult } from "@/lib/puzzleService";
import { useToastStore } from "@/lib/stores/toastStore";
import {
  allLettersUsed,
  getUsedKeysFromPaths,
  letterKey,
  loadLetterBoxedDictionary,
  parseLetterKey,
  pathToWord,
  type LetterId,
} from "@/lib/letterBoxedLogic";

function storageKey(date: string) {
  return `letterboxed-state-${date}`;
}

export interface LetterBoxedStats {
  played: number;
  bestSolve: number | null;
  currentStreak: number;
  maxStreak: number;
}

const DEFAULT_STATS: LetterBoxedStats = {
  played: 0,
  bestSolve: null,
  currentStreak: 0,
  maxStreak: 0,
};

const STATS_KEY = "letterboxed-stats";

function loadStats(): LetterBoxedStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats: LetterBoxedStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function updateStatsOnWin(
  stats: LetterBoxedStats,
  wordCount: number
): LetterBoxedStats {
  const next: LetterBoxedStats = {
    ...stats,
    played: stats.played + 1,
    currentStreak: stats.currentStreak + 1,
    maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
    bestSolve:
      stats.bestSolve === null
        ? wordCount
        : Math.min(stats.bestSolve, wordCount),
  };
  saveStats(next);
  return next;
}

interface PersistedState {
  puzzleDate: string;
  completedWords: string[];
  completedPaths: string[][];
  currentPath: string[];
  gameStatus: "playing" | "won";
}

function getSolutionWords(): string[] {
  return LETTER_BOXED_PUZZLES.flatMap((p) => p.solutions.flat());
}

interface LetterBoxedStore {
  puzzle: LetterBoxedPuzzle | null;
  puzzleDate: string;
  completedWords: string[];
  completedPaths: LetterId[][];
  currentPath: LetterId[];
  dictionary: Set<string> | null;
  gameStatus: "playing" | "won";
  flashKey: string | null;
  toast: { message: string; key: number } | null;
  confetti: boolean;
  showStats: boolean;
  stats: LetterBoxedStats;
  statsUpdated: boolean;
  initialized: boolean;

  init: (
    dateStr: string,
    puzzleData?: Record<string, unknown>
  ) => Promise<void>;
  selectLetter: (side: LetterSide, index: number) => void;
  deleteLetter: () => void;
  submitWord: () => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
  setShowStats: (open: boolean) => void;
  clearConfetti: () => void;
}

function persist(state: {
  puzzleDate: string;
  completedWords: string[];
  completedPaths: LetterId[][];
  currentPath: LetterId[];
  gameStatus: "playing" | "won";
}) {
  saveGameState<PersistedState>(storageKey(state.puzzleDate), {
    puzzleDate: state.puzzleDate,
    completedWords: state.completedWords,
    completedPaths: state.completedPaths.map((p) =>
      p.map((id) => letterKey(id.side, id.index))
    ),
    currentPath: state.currentPath.map((id) =>
      letterKey(id.side, id.index)
    ),
    gameStatus: state.gameStatus,
  });
}

function pathsFromKeys(keys: string[][]): LetterId[][] {
  return keys.map((row) => row.map((k) => parseLetterKey(k)));
}

export const useLetterBoxedStore = create<LetterBoxedStore>((set, get) => ({
  puzzle: null,
  puzzleDate: getTodayString(),
  completedWords: [],
  completedPaths: [],
  currentPath: [],
  dictionary: null,
  gameStatus: "playing",
  flashKey: null,
  toast: null,
  confetti: false,
  showStats: false,
  stats: DEFAULT_STATS,
  statsUpdated: false,
  initialized: false,

  init: async (dateStr, puzzleData) => {
    const puzzle = resolveLetterBoxedPuzzle(dateStr, puzzleData);
    const stats = loadStats();
    const dict = await loadLetterBoxedDictionary(getSolutionWords());
    const saved = loadGameState<PersistedState>(storageKey(dateStr));

    if (saved) {
      const completedPaths = pathsFromKeys(saved.completedPaths ?? []);
      set({
        puzzle,
        puzzleDate: dateStr,
        completedWords: saved.completedWords ?? [],
        completedPaths,
        currentPath: (saved.currentPath ?? []).map((k) => parseLetterKey(k)),
        gameStatus: saved.gameStatus ?? "playing",
        dictionary: dict,
        stats,
        statsUpdated: saved.gameStatus === "won",
        confetti: saved.gameStatus === "won",
        initialized: true,
      });
      return;
    }

    set({
      puzzle,
      puzzleDate: dateStr,
      completedWords: [],
      completedPaths: [],
      currentPath: [],
      gameStatus: "playing",
      dictionary: dict,
      stats,
      statsUpdated: false,
      confetti: false,
      initialized: true,
    });
  },

  selectLetter: (side, index) => {
    const state = get();
    if (!state.puzzle || state.gameStatus === "won") return;

    const letter = state.puzzle.sides[side][index];
    const id: LetterId = { side, index };
    const key = letterKey(side, index);

    if (state.currentPath.length === 0 && state.completedWords.length > 0) {
      const required =
        state.completedWords[state.completedWords.length - 1].slice(-1);
      if (letter !== required) {
        set({ flashKey: key });
        setTimeout(() => set({ flashKey: null }), 200);
        return;
      }
    }

    const last = state.currentPath[state.currentPath.length - 1];
    if (last && last.side === side) {
      set({ flashKey: key });
      setTimeout(() => set({ flashKey: null }), 200);
      return;
    }

    const currentPath = [...state.currentPath, id];
    set({ currentPath, flashKey: null });
    persist({
      puzzleDate: state.puzzleDate,
      completedWords: state.completedWords,
      completedPaths: state.completedPaths,
      currentPath,
      gameStatus: state.gameStatus,
    });
  },

  deleteLetter: () => {
    const state = get();
    if (state.currentPath.length === 0) return;
    const currentPath = state.currentPath.slice(0, -1);
    set({ currentPath });
    persist({
      puzzleDate: state.puzzleDate,
      completedWords: state.completedWords,
      completedPaths: state.completedPaths,
      currentPath,
      gameStatus: state.gameStatus,
    });
  },

  submitWord: () => {
    const state = get();
    if (!state.puzzle || !state.dictionary || state.gameStatus === "won")
      return;

    const word = pathToWord(state.puzzle.sides, state.currentPath);
    if (state.currentPath.length < 3) {
      get().showToast("Words must be at least 3 letters");
      return;
    }
    if (!state.dictionary.has(word)) {
      get().showToast("Not a valid word");
      return;
    }
    if (state.completedWords.includes(word)) {
      get().showToast("Already used");
      return;
    }

    const completedWords = [...state.completedWords, word];
    const completedPaths = [
      ...state.completedPaths,
      [...state.currentPath],
    ];
    const usedKeys = getUsedKeysFromPaths(completedPaths);
    const won = allLettersUsed(usedKeys);

    const updates: Partial<LetterBoxedStore> = {
      completedWords,
      completedPaths,
      currentPath: [],
      gameStatus: won ? "won" : "playing",
      confetti: won,
    };

    if (won && !state.statsUpdated) {
      updates.stats = updateStatsOnWin(state.stats, completedWords.length);
      updates.statsUpdated = true;
    }

    if (won) {
      void savePuzzleResult("letter-boxed", state.puzzleDate, {
        won: true,
        wordCount: completedWords.length,
      });
    }

    set(updates);
    persist({
      puzzleDate: state.puzzleDate,
      completedWords,
      completedPaths,
      currentPath: [],
      gameStatus: won ? "won" : "playing",
    });
  },

  showToast: (message) => {
    useToastStore.getState().showToast(message, 2000);
  },

  dismissToast: () => useToastStore.getState().hideToast(),

  setShowStats: (open) => set({ showStats: open }),

  clearConfetti: () => set({ confetti: false }),
}));
