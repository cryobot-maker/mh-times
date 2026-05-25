import { create } from "zustand";
import { getTodayString, loadGameState, saveGameState } from "@/lib/gameUtils";
import {
  TOTAL_PAIRS,
  TILES_TUTORIAL_KEY,
  getTilesPuzzle,
  type TilesPuzzle,
} from "@/lib/tilesData";
import {
  areMatchingPair,
  createShuffledSlots,
  formatShareDate,
  getPartnerLabel,
  fisherYatesShuffle,
  serializeSlots,
  slotsFromOrder,
  type GridSlot,
  type TileItem,
} from "@/lib/tilesLogic";
import { savePuzzleResult } from "@/lib/puzzleService";

export interface TilesStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
}

const DEFAULT_STATS: TilesStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
};

const STATS_KEY = "tiles-stats";

function storageKey(date: string) {
  return `tiles-state-${date}`;
}

function loadStats(): TilesStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats: TilesStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function updateStatsOnWin(stats: TilesStats): TilesStats {
  const next: TilesStats = {
    ...stats,
    played: stats.played + 1,
    wins: stats.wins + 1,
    currentStreak: stats.currentStreak + 1,
    maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
  };
  saveStats(next);
  return next;
}

interface PersistedTilesState {
  puzzleDate: string;
  slots: (TileItem | null)[];
  matchedPairs: number;
  movesUsed: number;
  gameStatus: "playing" | "won" | "lost";
  revealed: boolean;
}

interface TilesStore {
  puzzle: TilesPuzzle | null;
  puzzleDate: string;
  slots: GridSlot[];
  selectedId: string | null;
  matchedPairs: number;
  movesUsed: number;
  maxMoves: number;
  gameStatus: "playing" | "won" | "lost";
  shakingIds: string[];
  clearingIds: string[];
  shuffling: boolean;
  revealed: boolean;
  showStats: boolean;
  showHowToPlay: boolean;
  confetti: boolean;
  showWinBanner: boolean;
  stats: TilesStats;
  statsUpdated: boolean;
  initialized: boolean;

  init: (dateStr: string, puzzleData?: Record<string, unknown>) => void;
  selectTile: (tileId: string) => void;
  shuffleBoard: () => void;
  revealAnswers: () => void;
  tryAgain: () => void;
  setShowStats: (v: boolean) => void;
  setShowHowToPlay: (v: boolean) => void;
  markTutorialSeen: () => void;
  clearShaking: () => void;
  clearClearing: () => void;
  clearConfetti: () => void;
  getShareText: () => string;
}

function resolvePuzzle(
  dateStr: string,
  puzzleData?: Record<string, unknown>
): TilesPuzzle {
  if (
    puzzleData &&
    typeof puzzleData.theme === "string" &&
    Array.isArray(puzzleData.pairs)
  ) {
    return puzzleData as unknown as TilesPuzzle;
  }
  return getTilesPuzzle(dateStr);
}

function persist(get: () => TilesStore) {
  const s = get();
  if (!s.puzzle || !s.initialized) return;
  saveGameState<PersistedTilesState>(storageKey(s.puzzleDate), {
    puzzleDate: s.puzzleDate,
    slots: serializeSlots(s.slots),
    matchedPairs: s.matchedPairs,
    movesUsed: s.movesUsed,
    gameStatus: s.gameStatus,
    revealed: s.revealed,
  });
}

function checkLoss(get: () => TilesStore, set: (p: Partial<TilesStore>) => void) {
  const s = get();
  if (s.gameStatus !== "playing") return;
  if (s.matchedPairs >= TOTAL_PAIRS) return;
  if (s.movesUsed < s.maxMoves) return;

  set({ gameStatus: "lost" });
  persist(get);
}

export const useTilesStore = create<TilesStore>((set, get) => ({
  puzzle: null,
  puzzleDate: getTodayString(),
  slots: [],
  selectedId: null,
  matchedPairs: 0,
  movesUsed: 0,
  maxMoves: 20,
  gameStatus: "playing",
  shakingIds: [],
  clearingIds: [],
  shuffling: false,
  revealed: false,
  showStats: false,
  showHowToPlay: false,
  confetti: false,
  showWinBanner: false,
  stats: DEFAULT_STATS,
  statsUpdated: false,
  initialized: false,

  init: (dateStr, puzzleData) => {
    const puzzle = resolvePuzzle(dateStr, puzzleData);
    const stats = loadStats();
    const tutorialSeen =
      typeof window !== "undefined" &&
      localStorage.getItem(TILES_TUTORIAL_KEY) === "true";

    const saved = loadGameState<PersistedTilesState>(storageKey(dateStr));

    if (saved && saved.puzzleDate === dateStr) {
      set({
        puzzle,
        puzzleDate: dateStr,
        slots: slotsFromOrder(puzzle, saved.slots),
        matchedPairs: saved.matchedPairs,
        movesUsed: saved.movesUsed,
        maxMoves: puzzle.maxMoves,
        gameStatus: saved.gameStatus,
        revealed: saved.revealed ?? false,
        selectedId: null,
        shakingIds: [],
        clearingIds: [],
        showStats: saved.gameStatus === "won",
        showHowToPlay: !tutorialSeen,
        confetti: false,
        showWinBanner: false,
        stats,
        statsUpdated: saved.gameStatus === "won",
        initialized: true,
      });
      return;
    }

    set({
      puzzle,
      puzzleDate: dateStr,
      slots: createShuffledSlots(puzzle),
      matchedPairs: 0,
      movesUsed: 0,
      maxMoves: puzzle.maxMoves,
      gameStatus: "playing",
      revealed: false,
      selectedId: null,
      shakingIds: [],
      clearingIds: [],
      showStats: false,
      showHowToPlay: !tutorialSeen,
      confetti: false,
      showWinBanner: false,
      stats,
      statsUpdated: false,
      initialized: true,
    });
  },

  selectTile: (tileId) => {
    const state = get();
    if (state.gameStatus !== "playing" || state.revealed) return;

    const tile = state.slots.find((s) => s.tile?.id === tileId)?.tile;
    if (!tile) return;

    if (state.selectedId === tileId) {
      set({ selectedId: null });
      return;
    }

    if (!state.selectedId) {
      set({ selectedId: tileId });
      return;
    }

    const first = state.slots.find((s) => s.tile?.id === state.selectedId)?.tile;
    if (!first) {
      set({ selectedId: tileId });
      return;
    }

    if (areMatchingPair(first, tile)) {
      const clearingIds = [first.id, tile.id];
      const newSlots = state.slots.map((slot) => {
        if (slot.tile && clearingIds.includes(slot.tile.id)) {
          return { ...slot, tile: { ...slot.tile, clearing: true } };
        }
        return slot;
      });
      const matchedPairs = state.matchedPairs + 1;
      const movesUsed = state.movesUsed + 1;
      const won = matchedPairs >= TOTAL_PAIRS;

      set({
        slots: newSlots,
        selectedId: null,
        clearingIds,
        matchedPairs,
        movesUsed,
        gameStatus: won ? "won" : "playing",
        showWinBanner: won,
        confetti: won,
      });

      setTimeout(() => {
        const cleared = get().slots.map((slot) => {
          if (slot.tile && clearingIds.includes(slot.tile.id)) {
            return { ...slot, tile: null };
          }
          return slot;
        });
        set({ slots: cleared, clearingIds: [] });
      }, 300);

      if (won) {
        if (!state.statsUpdated) {
          const stats = updateStatsOnWin(state.stats);
          set({ stats, statsUpdated: true });
        }
        void savePuzzleResult("tiles", state.puzzleDate, {
          won: true,
          moves: movesUsed,
        });
        setTimeout(() => set({ showStats: true }), 600);
        setTimeout(() => get().clearConfetti(), 3000);
      } else {
        checkLoss(get, set);
      }

      persist(get);
      return;
    }

    set({
      shakingIds: [first.id, tile.id],
      selectedId: null,
    });
    setTimeout(() => get().clearShaking(), 400);
  },

  shuffleBoard: () => {
    const state = get();
    if (state.gameStatus !== "playing") return;

    const remaining = state.slots
      .filter((s) => s.tile !== null)
      .map((s) => s.tile!) as TileItem[];
    const shuffled = fisherYatesShuffle(remaining);
    let idx = 0;
    const newSlots = state.slots.map((slot) => {
      if (slot.tile === null) return slot;
      const tile = shuffled[idx++];
      return { ...slot, tile };
    });

    set({ slots: newSlots, shuffling: true, selectedId: null });
    setTimeout(() => set({ shuffling: false }), 200);
    persist(get);
  },

  revealAnswers: () => {
    const state = get();
    if (!state.puzzle) return;

    const newSlots = state.slots.map((slot) => {
      if (!slot.tile || slot.tile.revealLabel) return slot;
      return {
        ...slot,
        tile: {
          ...slot.tile,
          revealLabel: getPartnerLabel(state.puzzle!, slot.tile),
        },
      };
    });

    set({ slots: newSlots, revealed: true, selectedId: null });
    persist(get);

    setTimeout(() => {
      set({
        slots: get().slots.map((slot) => {
          if (!slot.tile?.revealLabel) return slot;
          const { revealLabel, ...tile } = slot.tile;
          void revealLabel;
          return { ...slot, tile: tile as TileItem };
        }),
      });
    }, 2000);
  },

  tryAgain: () => {
    const state = get();
    if (!state.puzzle) return;

    set({
      slots: createShuffledSlots(state.puzzle),
      selectedId: null,
      matchedPairs: 0,
      movesUsed: 0,
      gameStatus: "playing",
      shakingIds: [],
      clearingIds: [],
      revealed: false,
      showStats: false,
      confetti: false,
      showWinBanner: false,
      statsUpdated: false,
    });
    persist(get);
  },

  setShowStats: (v) => set({ showStats: v }),

  setShowHowToPlay: (v) => set({ showHowToPlay: v }),

  markTutorialSeen: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TILES_TUTORIAL_KEY, "true");
    }
  },

  clearShaking: () => set({ shakingIds: [] }),

  clearClearing: () => set({ clearingIds: [] }),

  clearConfetti: () => set({ confetti: false, showWinBanner: false }),

  getShareText: () => {
    const s = get();
    return `NYT Tiles — ${formatShareDate(s.puzzleDate)} — Solved in ${s.movesUsed} moves! 🟪`;
  },
}));
