import { create } from "zustand";
import { getTodayString, loadGameState, saveGameState } from "@/lib/gameUtils";
import {
  cellKey,
  findPathForWord,
  getWordFromPath,
  isGameComplete,
  isNonThemeWord,
  isValidPath,
  loadStrandsValidWords,
  pathMatchesWord,
} from "@/lib/strandsLogic";
import {
  getSolutionPath,
  type StrandsPuzzle,
} from "@/lib/strandsData";
import { resolveStrandsPuzzle, savePuzzleResult } from "@/lib/puzzleService";
import type { CellPos } from "@/lib/strandsLogic";

export interface StrandsStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
}

const DEFAULT_STATS: StrandsStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
};

const STATS_KEY = "strands-stats";

function storageKey(date: string) {
  return `strands-state-${date}`;
}

interface PersistedStrandsState {
  puzzleDate: string;
  foundThemeWords: string[];
  spangramFound: boolean;
  foundCellKeys: string[];
  foundCellTypes: Record<string, "theme" | "spangram">;
  nonThemeCount: number;
  hintsUsed: number;
  gameStatus: "playing" | "won";
}

function loadStats(): StrandsStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats: StrandsStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function updateStats(stats: StrandsStats, won: boolean): StrandsStats {
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

interface StrandsStore {
  puzzle: StrandsPuzzle | null;
  puzzleDate: string;
  foundThemeWords: string[];
  spangramFound: boolean;
  foundCells: Record<string, "theme" | "spangram">;
  currentPath: CellPos[];
  isDragging: boolean;
  flashState: "none" | "success" | "error";
  shaking: boolean;
  nonThemeCount: number;
  hintsUsed: number;
  hintHighlight: CellPos | null;
  validWords: Set<string> | null;
  gameStatus: "playing" | "won";
  winRipple: boolean;
  showStats: boolean;
  stats: StrandsStats;
  statsUpdated: boolean;
  toast: { message: string; key: number } | null;
  initialized: boolean;

  init: (
    dateStr: string,
    puzzleData?: Record<string, unknown>
  ) => Promise<void>;
  startPath: (cell: CellPos) => void;
  extendPath: (cell: CellPos) => void;
  endDrag: () => void;
  clearPath: () => void;
  submitPath: () => void;
  applyHint: () => void;
  setShowStats: (show: boolean) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
  getHintsAvailable: () => number;
  isCellFound: (row: number, col: number) => boolean;
  isCellInPath: (row: number, col: number) => boolean;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function markCellsFromPath(
  path: CellPos[],
  type: "theme" | "spangram",
  found: Record<string, "theme" | "spangram">
): Record<string, "theme" | "spangram"> {
  const next = { ...found };
  path.forEach(({ row, col }) => {
    next[cellKey(row, col)] = type;
  });
  return next;
}

export const useStrandsStore = create<StrandsStore>((set, get) => ({
  puzzle: null,
  puzzleDate: getTodayString(),
  foundThemeWords: [],
  spangramFound: false,
  foundCells: {},
  currentPath: [],
  isDragging: false,
  flashState: "none",
  shaking: false,
  nonThemeCount: 0,
  hintsUsed: 0,
  hintHighlight: null,
  validWords: null,
  gameStatus: "playing",
  winRipple: false,
  showStats: false,
  stats: DEFAULT_STATS,
  statsUpdated: false,
  toast: null,
  initialized: false,

  init: async (dateStr, puzzleData) => {
    const puzzle = resolveStrandsPuzzle(dateStr, puzzleData);
    const validWords = await loadStrandsValidWords();
    const stats = loadStats();
    const saved = loadGameState<PersistedStrandsState>(storageKey(dateStr));

    if (saved && isSavedStateValid(saved, puzzle)) {
      const foundCells = rebuildFoundCells(
        puzzle,
        saved.foundThemeWords ?? [],
        saved.spangramFound ?? false
      );
      set({
        puzzle,
        puzzleDate: dateStr,
        foundThemeWords: saved.foundThemeWords ?? [],
        spangramFound: saved.spangramFound ?? false,
        foundCells,
        nonThemeCount: saved.nonThemeCount ?? 0,
        hintsUsed: saved.hintsUsed ?? 0,
        gameStatus: saved.gameStatus ?? "playing",
        validWords,
        stats,
        showStats: saved.gameStatus === "won",
        statsUpdated: saved.gameStatus === "won",
        initialized: true,
      });
      return;
    }

    set({
      puzzle,
      puzzleDate: dateStr,
      foundThemeWords: [],
      spangramFound: false,
      foundCells: {},
      validWords,
      stats,
      initialized: true,
    });
  },

  getHintsAvailable: () => {
    const { nonThemeCount, hintsUsed } = get();
    return Math.floor(nonThemeCount / 3) - hintsUsed;
  },

  isCellFound: (row, col) => !!get().foundCells[cellKey(row, col)],

  isCellInPath: (row, col) =>
    get().currentPath.some((c) => c.row === row && c.col === col),

  startPath: (cell) => {
    const { gameStatus, isCellFound } = get();
    if (gameStatus !== "playing" || isCellFound(cell.row, cell.col)) return;
    set({ currentPath: [cell], isDragging: true, hintHighlight: null });
  },

  extendPath: (cell) => {
    const { currentPath, isCellFound, gameStatus } = get();
    if (gameStatus !== "playing" || currentPath.length === 0) return;
    if (isCellFound(cell.row, cell.col)) return;

    const key = cellKey(cell.row, cell.col);
    const existingIdx = currentPath.findIndex(
      (c) => cellKey(c.row, c.col) === key
    );
    if (existingIdx >= 0) {
      set({ currentPath: currentPath.slice(0, existingIdx + 1) });
      return;
    }

    const last = currentPath[currentPath.length - 1];
    if (!last) {
      set({ currentPath: [cell] });
      return;
    }
    if (
      Math.abs(last.row - cell.row) <= 1 &&
      Math.abs(last.col - cell.col) <= 1
    ) {
      set({ currentPath: [...currentPath, cell] });
    }
  },

  endDrag: () => {
    const { currentPath, gameStatus } = get();
    set({ isDragging: false });
    if (gameStatus === "playing" && currentPath.length >= 4) {
      get().submitPath();
    }
  },

  clearPath: () => set({ currentPath: [], isDragging: false }),

  submitPath: () => {
    const state = get();
    if (!state.puzzle || state.gameStatus !== "playing") return;
    const path = state.currentPath;
    if (path.length < 4) {
      set({ flashState: "error", shaking: true });
      setTimeout(() => set({ flashState: "none", shaking: false }), 400);
      get().clearPath();
      return;
    }

    if (!isValidPath(path)) {
      set({ flashState: "error", shaking: true });
      setTimeout(() => set({ flashState: "none", shaking: false }), 400);
      get().clearPath();
      return;
    }

    const word = getWordFromPath(state.puzzle.grid, path);
    const upper = word.toUpperCase();

    if (
      !state.spangramFound &&
      pathMatchesWord(state.puzzle.grid, path, state.puzzle.spangram)
    ) {
      const solutionPath = getSolutionPath(state.puzzle, state.puzzle.spangram);
      const cellsToMark = solutionPath ?? path;
      const foundCells = markCellsFromPath(cellsToMark, "spangram", state.foundCells);
      const spangramFound = true;
      const foundThemeWords = state.foundThemeWords;
      const complete = isGameComplete(
        state.puzzle,
        foundThemeWords,
        spangramFound
      );
      set({
        flashState: "success",
        spangramFound,
        foundCells,
        currentPath: [],
        gameStatus: complete ? "won" : "playing",
        winRipple: complete,
        showStats: complete,
      });
      setTimeout(() => set({ flashState: "none" }), 300);
      if (complete && !state.statsUpdated) {
        set({
          stats: updateStats(state.stats, true),
          statsUpdated: true,
        });
      }
      if (complete) {
        void savePuzzleResult("strands", state.puzzleDate, {
          won: true,
          spangramFound,
        });
      }
      persistState(get());
      return;
    }

    const unfoundTheme = state.puzzle.themeWords.find(
      (tw) =>
        !state.foundThemeWords.includes(tw) &&
        pathMatchesWord(state.puzzle!.grid, path, tw)
    );

    if (unfoundTheme) {
      const solutionPath = getSolutionPath(state.puzzle, unfoundTheme);
      const cellsToMark = solutionPath ?? path;
      const foundCells = markCellsFromPath(cellsToMark, "theme", state.foundCells);
      const foundThemeWords = [...state.foundThemeWords, unfoundTheme].sort();
      const complete = isGameComplete(
        state.puzzle,
        foundThemeWords,
        state.spangramFound
      );
      set({
        flashState: "success",
        foundThemeWords,
        foundCells,
        currentPath: [],
        gameStatus: complete ? "won" : "playing",
        winRipple: complete,
        showStats: complete,
      });
      setTimeout(() => set({ flashState: "none" }), 300);
      if (complete && !state.statsUpdated) {
        set({
          stats: updateStats(state.stats, true),
          statsUpdated: true,
        });
      }
      if (complete) {
        void savePuzzleResult("strands", state.puzzleDate, {
          won: true,
          themeWordsFound: foundThemeWords.length,
        });
      }
      persistState(get());
      return;
    }

    const isValidBonus =
      upper.length >= 4 &&
      (state.validWords?.has(upper) ?? false) &&
      isNonThemeWord(upper, state.puzzle);

    if (isValidBonus) {
      const nonThemeCount = state.nonThemeCount + 1;
      set({
        nonThemeCount,
        currentPath: [],
        flashState: "success",
      });
      get().showToast(`+1 toward hint (${nonThemeCount % 3}/3)`);
      setTimeout(() => set({ flashState: "none" }), 300);
      persistState(get());
      return;
    }

    set({ flashState: "error", shaking: true });
    setTimeout(() => set({ flashState: "none", shaking: false }), 400);
    get().clearPath();
  },

  applyHint: () => {
    const state = get();
    if (!state.puzzle || get().getHintsAvailable() <= 0) return;

    const unfoundTheme = state.puzzle.themeWords.filter(
      (w) => !state.foundThemeWords.includes(w)
    );
    const unfoundSpangram = state.spangramFound ? [] : [state.puzzle.spangram];
    const candidates = [...unfoundTheme, ...unfoundSpangram].sort(
      () => Math.random() - 0.5
    );

    if (candidates.length === 0) {
      get().showToast("All words found!");
      return;
    }

    const blocked = new Set(Object.keys(state.foundCells));

    for (const word of candidates) {
      const path =
        getSolutionPath(state.puzzle, word) ??
        findPathForWord(state.puzzle.grid, word, blocked);

      if (path && path.length > 0) {
        set({
          hintsUsed: state.hintsUsed + 1,
          hintHighlight: path[0],
        });
        get().showToast(`Hint: "${word}" starts here`);
        return;
      }
    }

    get().showToast("Could not place hint — try again");
  },

  setShowStats: (show) => set({ showStats: show }),

  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: { message, key: Date.now() } });
    toastTimer = setTimeout(() => get().dismissToast(), 1500);
  },

  dismissToast: () => set({ toast: null }),
}));

function isSavedStateValid(
  saved: PersistedStrandsState,
  puzzle: StrandsPuzzle
): boolean {
  for (const word of saved.foundThemeWords ?? []) {
    if (!getSolutionPath(puzzle, word) && !findPathForWord(puzzle.grid, word)) {
      return false;
    }
  }
  if (
    saved.spangramFound &&
    !getSolutionPath(puzzle, puzzle.spangram) &&
    !findPathForWord(puzzle.grid, puzzle.spangram)
  ) {
    return false;
  }
  return true;
}

function rebuildFoundCells(
  puzzle: StrandsPuzzle,
  foundThemeWords: string[],
  spangramFound: boolean
): Record<string, "theme" | "spangram"> {
  const foundCells: Record<string, "theme" | "spangram"> = {};
  for (const word of foundThemeWords) {
    const path = getSolutionPath(puzzle, word);
    if (path) {
      path.forEach(({ row, col }) => {
        foundCells[cellKey(row, col)] = "theme";
      });
    }
  }
  if (spangramFound) {
    const path = getSolutionPath(puzzle, puzzle.spangram);
    if (path) {
      path.forEach(({ row, col }) => {
        foundCells[cellKey(row, col)] = "spangram";
      });
    }
  }
  return foundCells;
}

function persistState(state: ReturnType<typeof useStrandsStore.getState>) {
  if (!state.puzzle) return;
  saveGameState<PersistedStrandsState>(storageKey(state.puzzleDate), {
    puzzleDate: state.puzzleDate,
    foundThemeWords: state.foundThemeWords,
    spangramFound: state.spangramFound,
    foundCellKeys: Object.keys(state.foundCells),
    foundCellTypes: state.foundCells,
    nonThemeCount: state.nonThemeCount,
    hintsUsed: state.hintsUsed,
    gameStatus: state.gameStatus,
  });
}
