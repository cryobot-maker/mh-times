import { create } from "zustand";
import { getTodayString, loadGameState, saveGameState } from "@/lib/gameUtils";
import {
  buildShareGrid,
  findMatchingCategory,
  isOneAway,
  shuffleArray,
} from "@/lib/connectionsLogic";
import {
  getAllWords,
  type ConnectionsCategory,
  type ConnectionsColor,
  type ConnectionsPuzzle,
} from "@/lib/connectionsData";
import { resolveConnectionsPuzzle, savePuzzleResult } from "@/lib/puzzleService";
import type { ConnectionsState } from "@/types";

export interface ConnectionsStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
}

const DEFAULT_STATS: ConnectionsStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
};

const STATS_KEY = "connections-stats";
const TUTORIAL_KEY = "connections-tutorial-seen";

function storageKey(date: string) {
  return `connections-state-${date}`;
}

function loadStats(): ConnectionsStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats: ConnectionsStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function updateStatsOnComplete(stats: ConnectionsStats, won: boolean): ConnectionsStats {
  const next = { ...stats, played: stats.played + 1 };
  if (won) {
    next.wins += 1;
    next.currentStreak += 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
  } else {
    next.currentStreak = 0;
  }
  saveStats(next);
  return next;
}

export interface SolvedGroup {
  name: string;
  color: ConnectionsColor;
  words: string[];
}

interface PersistedConnectionsState extends ConnectionsState {
  words: string[];
  solvedGroups: SolvedGroup[];
  solveOrder: ConnectionsColor[];
}

interface ConnectionsStore {
  puzzle: ConnectionsPuzzle | null;
  puzzleDate: string;
  words: string[];
  selectedIndices: number[];
  solvedGroups: SolvedGroup[];
  solveOrder: ConnectionsColor[];
  mistakes: number;
  gameStatus: ConnectionsState["gameStatus"];
  stats: ConnectionsStats;
  shaking: boolean;
  solvingWords: string[] | null;
  toast: { message: string; key: number } | null;
  showStats: boolean;
  showHowToPlay: boolean;
  statsUpdated: boolean;
  initialized: boolean;

  init: (dateStr: string, puzzleData?: Record<string, unknown>) => void;
  toggleSelect: (index: number) => void;
  shuffle: () => void;
  deselectAll: () => void;
  submit: () => void;
  setShowStats: (show: boolean) => void;
  setShowHowToPlay: (show: boolean) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
  markTutorialSeen: () => void;
  finishSolveAnimation: (category: ConnectionsCategory) => void;
  getShareText: () => string;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function persist(state: {
  puzzleDate: string;
  words: string[];
  selectedIndices: number[];
  solvedGroups: SolvedGroup[];
  solveOrder: ConnectionsColor[];
  mistakes: number;
  gameStatus: ConnectionsState["gameStatus"];
}) {
  saveGameState<PersistedConnectionsState>(storageKey(state.puzzleDate), {
    words: state.words,
    selectedIndices: state.selectedIndices,
    selectedTiles: state.selectedIndices,
    solvedGroups: state.solvedGroups,
    solveOrder: state.solveOrder,
    mistakes: state.mistakes,
    gameStatus: state.gameStatus,
    puzzleDate: state.puzzleDate,
  });
}

export const useConnectionsStore = create<ConnectionsStore>((set, get) => ({
  puzzle: null,
  puzzleDate: getTodayString(),
  words: [],
  selectedIndices: [],
  solvedGroups: [],
  solveOrder: [],
  mistakes: 0,
  gameStatus: "playing",
  stats: DEFAULT_STATS,
  shaking: false,
  solvingWords: null,
  toast: null,
  showStats: false,
  showHowToPlay: false,
  statsUpdated: false,
  initialized: false,

  init: (dateStr, puzzleData?: Record<string, unknown>) => {
    const puzzle = resolveConnectionsPuzzle(dateStr, puzzleData);
    const stats = loadStats();
    const saved = loadGameState<PersistedConnectionsState>(storageKey(dateStr));

    const tutorialSeen =
      typeof window !== "undefined" &&
      localStorage.getItem(TUTORIAL_KEY) === "true";

    if (saved && saved.words !== undefined) {
      set({
        puzzle,
        puzzleDate: dateStr,
        words: saved.words,
        selectedIndices: saved.selectedIndices ?? saved.selectedTiles ?? [],
        solvedGroups: saved.solvedGroups ?? [],
        solveOrder: saved.solveOrder ?? [],
        mistakes: saved.mistakes,
        gameStatus: saved.gameStatus,
        stats,
        showStats: saved.gameStatus !== "playing",
        showHowToPlay: !tutorialSeen,
        statsUpdated: saved.gameStatus !== "playing",
        initialized: true,
        shaking: false,
        solvingWords: null,
      });
      return;
    }

    const allWords = shuffleArray(getAllWords(puzzle));
    set({
      puzzle,
      puzzleDate: dateStr,
      words: allWords,
      selectedIndices: [],
      solvedGroups: [],
      solveOrder: [],
      mistakes: 0,
      gameStatus: "playing",
      stats,
      showStats: false,
      showHowToPlay: !tutorialSeen,
      statsUpdated: false,
      initialized: true,
      shaking: false,
      solvingWords: null,
    });
  },

  toggleSelect: (index) => {
    const { gameStatus, selectedIndices, solvingWords, shaking } = get();
    if (gameStatus !== "playing" || solvingWords || shaking) return;

    const pos = selectedIndices.indexOf(index);
    if (pos >= 0) {
      set({ selectedIndices: selectedIndices.filter((i) => i !== index) });
    } else if (selectedIndices.length < 4) {
      set({ selectedIndices: [...selectedIndices, index] });
    }
  },

  shuffle: () => {
    const { gameStatus, words, solvingWords } = get();
    if (gameStatus !== "playing" || solvingWords) return;
    set({ words: shuffleArray(words), selectedIndices: [] });
  },

  deselectAll: () => set({ selectedIndices: [] }),

  submit: () => {
    const state = get();
    if (state.gameStatus !== "playing" || state.solvingWords || state.shaking)
      return;
    if (state.selectedIndices.length !== 4 || !state.puzzle) return;

    const selectedWords = state.selectedIndices.map((i) => state.words[i]);
    const match = findMatchingCategory(
      selectedWords,
      state.puzzle.categories
    );

    if (match) {
      set({ solvingWords: selectedWords, selectedIndices: [] });
      setTimeout(() => {
        get().finishSolveAnimation(match);
      }, 700);
      return;
    }

    const oneAway = isOneAway(selectedWords, state.puzzle.categories);
    set({ shaking: true, selectedIndices: state.selectedIndices });

    if (oneAway) get().showToast("One away...");

    setTimeout(() => {
      const mistakes = get().mistakes + 1;
      const lost = mistakes >= 4;
      const next: Partial<ConnectionsStore> = {
        shaking: false,
        selectedIndices: [],
        mistakes,
      };

      if (lost && state.puzzle) {
        const remaining = state.puzzle.categories.filter(
          (c) =>
            !get().solvedGroups.some(
              (s) => s.name === c.name
            )
        );
        next.gameStatus = "lost";
        next.solvedGroups = [
          ...get().solvedGroups,
          ...remaining.map((c) => ({
            name: c.name,
            color: c.color,
            words: [...c.words],
          })),
        ];
        next.words = [];
        next.showStats = true;
        if (!get().statsUpdated) {
          next.stats = updateStatsOnComplete(get().stats, false);
          next.statsUpdated = true;
        }
        get().showToast("Better luck tomorrow!");
      }

      set(next);
      const current = get();
      persist({
        puzzleDate: state.puzzleDate,
        words: lost ? [] : current.words,
        selectedIndices: [],
        solvedGroups: current.solvedGroups,
        solveOrder: current.solveOrder,
        mistakes,
        gameStatus: lost ? "lost" : "playing",
      });
    }, 500);
  },

  finishSolveAnimation: (category) => {
    const state = get();
    if (!state.puzzle || !state.solvingWords) return;

    const solvedWords = new Set(state.solvingWords);
    const words = state.words.filter((w) => !solvedWords.has(w));
    const solvedGroups: SolvedGroup[] = [
      ...state.solvedGroups,
      {
        name: category.name,
        color: category.color,
        words: [...category.words],
      },
    ];
    const solveOrder = [...state.solveOrder, category.color];
    const won = solvedGroups.length === 4;
    const gameStatus = won ? "won" : "playing";

    const updates: Partial<ConnectionsStore> = {
      words,
      solvedGroups,
      solveOrder,
      solvingWords: null,
      gameStatus,
    };

    if (won) {
      updates.showStats = true;
      if (!state.statsUpdated) {
        updates.stats = updateStatsOnComplete(state.stats, true);
        updates.statsUpdated = true;
      }
      void savePuzzleResult("connections", state.puzzleDate, {
        won: true,
        mistakes: state.mistakes,
      });
    }

    set(updates);
    persist({
      puzzleDate: state.puzzleDate,
      words,
      selectedIndices: [],
      solvedGroups,
      solveOrder,
      mistakes: state.mistakes,
      gameStatus,
    });
  },

  setShowStats: (show) => set({ showStats: show }),
  setShowHowToPlay: (show) => set({ showHowToPlay: show }),

  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer);
    const key = Date.now();
    set({ toast: { message, key } });
    toastTimer = setTimeout(() => get().dismissToast(), 1500);
  },

  dismissToast: () => set({ toast: null }),

  markTutorialSeen: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TUTORIAL_KEY, "true");
    }
    set({ showHowToPlay: false });
  },

  getShareText: () => {
    const { solveOrder, mistakes, gameStatus } = get();
    return buildShareGrid(solveOrder, mistakes, gameStatus === "won");
  },
}));
