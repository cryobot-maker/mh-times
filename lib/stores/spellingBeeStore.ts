import { create } from "zustand";
import { getTodayString, loadGameState, saveGameState } from "@/lib/gameUtils";
import {
  calculateMaxScoreFromWords,
  getRankLabel,
  SUBMIT_ERROR_MESSAGES,
  validateSubmission,
} from "@/lib/spellingBeeLogic";
import { getValidWordsForPuzzle } from "@/lib/spellingBeeDictionary";
import {
  type SpellingBeePuzzle,
} from "@/lib/spellingBeeData";
import { resolveSpellingBeePuzzle } from "@/lib/puzzleService";
import type { SpellingBeeState } from "@/types";

function storageKey(date: string) {
  return `spelling-bee-state-${date}`;
}

interface PersistedState extends SpellingBeeState {
  outerOrder: number[];
  maxScore: number;
}

interface SpellingBeeStore {
  puzzle: SpellingBeePuzzle | null;
  puzzleDate: string;
  foundWords: string[];
  currentWord: string;
  outerOrder: number[];
  score: number;
  maxScore: number;
  shaking: boolean;
  toast: { message: string; key: number; large?: boolean } | null;
  pangramFlash: boolean;
  rankFlash: boolean;
  confetti: boolean;
  flyingWord: string | null;
  pointsPopup: number | null;
  lastRank: string;
  shuffleSpin: boolean;
  initialized: boolean;
  validWordSet: Set<string> | null;

  init: (dateStr: string, puzzleData?: Record<string, unknown>) => Promise<void>;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  shuffle: () => void;
  submit: () => void;
  showToast: (message: string, large?: boolean) => void;
  dismissToast: () => void;
  clearFlying: () => void;
  clearPointsPopup: () => void;
  clearPangramFlash: () => void;
  clearConfetti: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function persist(state: {
  puzzleDate: string;
  foundWords: string[];
  currentWord: string;
  score: number;
  outerOrder: number[];
  maxScore: number;
}) {
  saveGameState<PersistedState>(storageKey(state.puzzleDate), {
    foundWords: state.foundWords,
    currentWord: state.currentWord,
    score: state.score,
    pangrams: [],
    gameStatus: "playing",
    puzzleDate: state.puzzleDate,
    outerOrder: state.outerOrder,
    maxScore: state.maxScore,
  });
}

export const useSpellingBeeStore = create<SpellingBeeStore>((set, get) => ({
  puzzle: null,
  puzzleDate: getTodayString(),
  foundWords: [],
  currentWord: "",
  outerOrder: [0, 1, 2, 3, 4, 5],
  score: 0,
  maxScore: 0,
  shaking: false,
  toast: null,
  pangramFlash: false,
  rankFlash: false,
  confetti: false,
  flyingWord: null,
  pointsPopup: null,
  lastRank: "Beginner",
  shuffleSpin: false,
  initialized: false,
  validWordSet: null,

  init: async (dateStr, puzzleData) => {
    const puzzle = resolveSpellingBeePuzzle(dateStr, puzzleData);
    const validWordSet = await getValidWordsForPuzzle(puzzle);
    const maxScore = calculateMaxScoreFromWords(
      validWordSet,
      puzzle.pangrams
    );
    const saved = loadGameState<PersistedState>(storageKey(dateStr));

    if (saved) {
      const rank = getRankLabel(saved.score, saved.maxScore ?? maxScore);
      set({
        puzzle,
        puzzleDate: dateStr,
        foundWords: saved.foundWords,
        currentWord: saved.currentWord ?? "",
        outerOrder: saved.outerOrder ?? [0, 1, 2, 3, 4, 5],
        score: saved.score,
        maxScore: saved.maxScore ?? maxScore,
        lastRank: rank,
        validWordSet,
        initialized: true,
      });
      return;
    }

    set({
      puzzle,
      puzzleDate: dateStr,
      foundWords: [],
      currentWord: "",
      outerOrder: [0, 1, 2, 3, 4, 5],
      score: 0,
      maxScore,
      lastRank: "Beginner",
      validWordSet,
      initialized: true,
    });
  },

  addLetter: (letter) => {
    const { puzzle, currentWord } = get();
    if (!puzzle) return;
    const upper = letter.toUpperCase();
    const allowed = [puzzle.centerLetter, ...puzzle.outerLetters].map((l) =>
      l.toUpperCase()
    );
    if (!allowed.includes(upper)) return;
    set({ currentWord: currentWord + upper });
  },

  removeLetter: () => {
    const { currentWord } = get();
    set({ currentWord: currentWord.slice(0, -1) });
  },

  shuffle: () => {
    const { outerOrder } = get();
    const next = [...outerOrder];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    set({ outerOrder: next, shuffleSpin: true });
    setTimeout(() => set({ shuffleSpin: false }), 300);
  },

  submit: () => {
    const state = get();
    if (!state.puzzle) return;

    if (!state.validWordSet) return;

    const result = validateSubmission(
      state.currentWord,
      state.puzzle,
      state.foundWords,
      state.validWordSet
    );

    if (!result.ok) {
      const msg = SUBMIT_ERROR_MESSAGES[result.error];
      get().showToast(msg);
      set({ shaking: true });
      setTimeout(() => set({ shaking: false }), 400);
      return;
    }

    const foundWords = [...state.foundWords, result.word].sort((a, b) =>
      a.localeCompare(b)
    );
    const score = state.score + result.points;
    const newRank = getRankLabel(score, state.maxScore);
    const rankChanged = newRank !== state.lastRank;
    const hitGenius = score / state.maxScore >= 0.7 && state.score / state.maxScore < 0.7;
    const hitQueen = score >= state.maxScore;

    set({
      flyingWord: result.word,
      pointsPopup: result.points,
      currentWord: "",
      foundWords,
      score,
      lastRank: newRank,
      rankFlash: rankChanged,
    });

    if (result.isPangram) {
      set({ pangramFlash: true });
      get().showToast("Pangram!", true);
      setTimeout(() => get().clearPangramFlash(), 600);
    }

    if (hitGenius || hitQueen) {
      set({ confetti: true });
      setTimeout(() => get().clearConfetti(), 3000);
    }

    if (rankChanged) {
      setTimeout(() => set({ rankFlash: false }), 500);
    }

    setTimeout(() => get().clearFlying(), 400);
    setTimeout(() => get().clearPointsPopup(), 1200);

    persist({
      puzzleDate: state.puzzleDate,
      foundWords,
      currentWord: "",
      score,
      outerOrder: state.outerOrder,
      maxScore: state.maxScore,
    });
  },

  showToast: (message, large) => {
    if (toastTimer) clearTimeout(toastTimer);
    const key = Date.now();
    set({ toast: { message, key, large } });
    toastTimer = setTimeout(() => get().dismissToast(), 1500);
  },

  dismissToast: () => set({ toast: null }),
  clearFlying: () => set({ flyingWord: null }),
  clearPointsPopup: () => set({ pointsPopup: null }),
  clearPangramFlash: () => set({ pangramFlash: false }),
  clearConfetti: () => set({ confetti: false }),
}));
