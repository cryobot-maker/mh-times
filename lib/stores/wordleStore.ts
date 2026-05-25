import { create } from "zustand";
import { getTodayString, loadGameState, saveGameState } from "@/lib/gameUtils";
import {
  evaluateGuess,
  getWinMessage,
  updateKeyboardStatus,
  validateHardMode,
} from "@/lib/wordleLogic";
import { loadValidWordsSet } from "@/lib/wordleData";
import { resolveWordleAnswer, savePuzzleResult } from "@/lib/puzzleService";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useToastStore } from "@/lib/stores/toastStore";
import type { WordleLetterStatus, WordleState } from "@/types";

export interface WordleStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
}

const DEFAULT_STATS: WordleStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
};

const STATS_KEY = "wordle-stats";
const LEGACY_SETTINGS_KEY = "wordle-settings";
const TUTORIAL_KEY = "wordle-tutorial-seen";

function storageKey(date: string) {
  return `wordle-state-${date}`;
}

function loadStats(): WordleStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats: WordleStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function getHardMode(): boolean {
  if (typeof window !== "undefined") {
    try {
      const legacy = localStorage.getItem(LEGACY_SETTINGS_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy) as { hardMode?: boolean };
        if (parsed.hardMode) {
          useSettingsStore.getState().setHardMode(true);
        }
        localStorage.removeItem(LEGACY_SETTINGS_KEY);
      }
    } catch {
      // ignore
    }
  }
  return useSettingsStore.getState().hardMode;
}

function persistState(state: {
  puzzleDate: string;
  guesses: string[];
  evaluations: WordleLetterStatus[][];
  currentGuess: string;
  gameStatus: WordleState["gameStatus"];
}) {
  saveGameState(storageKey(state.puzzleDate), {
    guesses: state.guesses,
    evaluations: state.evaluations,
    currentGuess: state.currentGuess,
    gameStatus: state.gameStatus,
    puzzleDate: state.puzzleDate,
  });
}

function updateStatsOnComplete(
  stats: WordleStats,
  won: boolean,
  guessCount: number
): WordleStats {
  const next = { ...stats, played: stats.played + 1 };
  if (won) {
    next.wins += 1;
    next.currentStreak += 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
    const idx = guessCount - 1;
    if (idx >= 0 && idx < 6) {
      next.distribution = [...next.distribution];
      next.distribution[idx] += 1;
    }
  } else {
    next.currentStreak = 0;
  }
  saveStats(next);
  return next;
}

interface WordleStore {
  puzzleDate: string;
  answer: string;
  guesses: string[];
  evaluations: WordleLetterStatus[][];
  currentGuess: string;
  gameStatus: WordleState["gameStatus"];
  hardMode: boolean;
  isArchive: boolean;
  validWords: Set<string> | null;
  keyboardStatus: Record<string, WordleLetterStatus>;
  stats: WordleStats;
  shakingRow: number | null;
  flippingRow: number | null;
  bouncingRow: number | null;
  revealedRows: number;
  showStats: boolean;
  showHowToPlay: boolean;
  statsUpdated: boolean;
  initialized: boolean;

  init: (
    dateStr: string,
    isArchive: boolean,
    puzzleData?: Record<string, unknown>
  ) => Promise<void>;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  setShowStats: (show: boolean) => void;
  setShowHowToPlay: (show: boolean) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
  setHardMode: (enabled: boolean) => void;
  markTutorialSeen: () => void;
  onFlipComplete: () => void;
}

export const useWordleStore = create<WordleStore>((set, get) => ({
  puzzleDate: getTodayString(),
  answer: "",
  guesses: [],
  evaluations: [],
  currentGuess: "",
  gameStatus: "playing",
  hardMode: false,
  isArchive: false,
  validWords: null,
  keyboardStatus: {},
  stats: DEFAULT_STATS,
  shakingRow: null,
  flippingRow: null,
  bouncingRow: null,
  revealedRows: 0,
  showStats: false,
  showHowToPlay: false,
  statsUpdated: false,
  initialized: false,

  init: async (dateStr, isArchive, puzzleData) => {
    const validWords = await loadValidWordsSet();
    useSettingsStore.getState().hydrate();
    const hardMode = getHardMode();
    const stats = loadStats();
    const answer = resolveWordleAnswer(dateStr, puzzleData);
    const saved = loadGameState<WordleState>(storageKey(dateStr));

    const tutorialSeen =
      typeof window !== "undefined" &&
      localStorage.getItem(TUTORIAL_KEY) === "true";

    if (saved) {
      const keyboardStatus = saved.guesses.reduce(
        (acc, guess, i) =>
          updateKeyboardStatus(acc, guess, saved.evaluations[i]),
        {} as Record<string, WordleLetterStatus>
      );

      set({
        puzzleDate: dateStr,
        answer,
        guesses: saved.guesses,
        evaluations: saved.evaluations,
        currentGuess: saved.currentGuess,
        gameStatus: saved.gameStatus,
        hardMode,
        isArchive,
        validWords,
        keyboardStatus,
        stats,
        revealedRows: saved.guesses.length,
        showStats: saved.gameStatus !== "playing",
        showHowToPlay: !tutorialSeen,
        statsUpdated: saved.gameStatus !== "playing",
        initialized: true,
      });
      return;
    }

    set({
      puzzleDate: dateStr,
      answer,
      guesses: [],
      evaluations: [],
      currentGuess: "",
      gameStatus: "playing",
      hardMode,
      isArchive,
      validWords,
      keyboardStatus: {},
      stats,
      revealedRows: 0,
      showStats: false,
      showHowToPlay: !tutorialSeen,
      statsUpdated: false,
      initialized: true,
    });
  },

  addLetter: (letter) => {
    const { gameStatus, currentGuess, flippingRow } = get();
    if (gameStatus !== "playing" || flippingRow !== null) return;
    if (currentGuess.length >= 5) return;
    set({ currentGuess: currentGuess + letter });
  },

  removeLetter: () => {
    const { gameStatus, currentGuess, flippingRow } = get();
    if (gameStatus !== "playing" || flippingRow !== null) return;
    set({ currentGuess: currentGuess.slice(0, -1) });
  },

  submitGuess: () => {
    const state = get();
    if (state.gameStatus !== "playing" || state.flippingRow !== null) return;

    const guess = state.currentGuess.toUpperCase();

    if (guess.length < 5) {
      get().showToast("Not enough letters");
      return;
    }

    if (!state.validWords?.has(guess)) {
      get().showToast("Not in word list");
      set({ shakingRow: state.guesses.length });
      setTimeout(() => set({ shakingRow: null }), 400);
      return;
    }

    if (
      state.hardMode &&
      !validateHardMode(guess, state.guesses, state.evaluations)
    ) {
      get().showToast("Must use revealed hints");
      set({ shakingRow: state.guesses.length });
      setTimeout(() => set({ shakingRow: null }), 400);
      return;
    }

    const evaluation = evaluateGuess(state.answer, guess);
    const newGuesses = [...state.guesses, guess];
    const newEvaluations = [...state.evaluations, evaluation];
    const keyboardStatus = updateKeyboardStatus(
      state.keyboardStatus,
      guess,
      evaluation
    );
    const rowIndex = state.guesses.length;
    const won = guess === state.answer;
    const lost = !won && newGuesses.length >= 6;
    const gameStatus = won ? "won" : lost ? "lost" : "playing";

    set({
      guesses: newGuesses,
      evaluations: newEvaluations,
      currentGuess: "",
      keyboardStatus,
      flippingRow: rowIndex,
      gameStatus,
    });

    persistState({
      puzzleDate: state.puzzleDate,
      guesses: newGuesses,
      evaluations: newEvaluations,
      currentGuess: "",
      gameStatus,
    });
  },

  onFlipComplete: () => {
    const state = get();
    if (state.flippingRow === null) return;

    const rowIndex = state.flippingRow;
    const newRevealed = rowIndex + 1;

    set({ revealedRows: newRevealed, flippingRow: null });

    if (state.gameStatus === "won") {
      set({ bouncingRow: rowIndex });
      get().showToast(getWinMessage(rowIndex));
      setTimeout(() => set({ bouncingRow: null }), 1200);

      if (!state.statsUpdated) {
        const stats = updateStatsOnComplete(state.stats, true, rowIndex + 1);
        set({ stats, statsUpdated: true });
      }
      void savePuzzleResult("wordle", state.puzzleDate, {
        won: true,
        guesses: state.guesses.length,
      });
      setTimeout(() => set({ showStats: true }), 600);
    } else if (state.gameStatus === "lost") {
      get().showToast(`The word was ${state.answer}`);
      if (!state.statsUpdated) {
        const stats = updateStatsOnComplete(state.stats, false, 0);
        set({ stats, statsUpdated: true });
      }
      void savePuzzleResult("wordle", state.puzzleDate, {
        won: false,
        guesses: state.guesses.length,
      });
      setTimeout(() => set({ showStats: true }), 600);
    }
  },

  setShowStats: (show) => set({ showStats: show }),
  setShowHowToPlay: (show) => set({ showHowToPlay: show }),

  showToast: (message) => {
    useToastStore.getState().showToast(message);
  },

  dismissToast: () => {
    useToastStore.getState().hideToast();
  },

  setHardMode: (enabled) => {
    useSettingsStore.getState().setHardMode(enabled);
    set({ hardMode: enabled });
  },

  markTutorialSeen: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TUTORIAL_KEY, "true");
    }
    set({ showHowToPlay: false });
  },
}));
