import { create } from "zustand";
import { getTodayString, loadGameState, saveGameState } from "@/lib/gameUtils";
import { resolveMiniPuzzle, savePuzzleResult } from "@/lib/puzzleService";
import {
  cellKey,
  findWordAtCell,
  formatTimer,
  getFirstEmptyInWord,
  getNextCellInWord,
  getWordCells,
  isPuzzleComplete,
  moveFocus,
  parseMiniPuzzle,
  type MiniDirection,
  type ParsedMiniPuzzle,
} from "@/lib/miniCrosswordLogic";

function storageKey(date: string) {
  return `mini-state-${date}`;
}

export interface MiniStats {
  solvedToday: number;
  totalTimeSeconds: number;
  solveCount: number;
  currentStreak: number;
  maxStreak: number;
  bestTimeSeconds: number | null;
}

const DEFAULT_STATS: MiniStats = {
  solvedToday: 0,
  totalTimeSeconds: 0,
  solveCount: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestTimeSeconds: null,
};

const STATS_KEY = "mini-stats";

function loadStats(): MiniStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats: MiniStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function updateStatsOnWin(stats: MiniStats, timeSeconds: number): MiniStats {
  const today = getTodayString();
  const lastSolved = localStorage.getItem("mini-last-solved-date");
  const solvedToday = lastSolved === today ? stats.solvedToday : 0;

  const next: MiniStats = {
    ...stats,
    solveCount: stats.solveCount + 1,
    totalTimeSeconds: stats.totalTimeSeconds + timeSeconds,
    currentStreak: stats.currentStreak + 1,
    maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
    bestTimeSeconds:
      stats.bestTimeSeconds === null
        ? timeSeconds
        : Math.min(stats.bestTimeSeconds, timeSeconds),
    solvedToday: solvedToday + 1,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem("mini-last-solved-date", today);
  }
  saveStats(next);
  return next;
}

interface PersistedMiniState {
  puzzleDate: string;
  entries: Record<string, string>;
  focusRow: number;
  focusCol: number;
  direction: MiniDirection;
  activeTab: MiniDirection;
  elapsedSeconds: number;
  timerStarted: boolean;
  timerRunning: boolean;
  gameStatus: "playing" | "won";
}

interface MiniStore {
  parsed: ParsedMiniPuzzle | null;
  puzzleDate: string;
  entries: Record<string, string>;
  focusRow: number;
  focusCol: number;
  direction: MiniDirection;
  activeTab: MiniDirection;
  elapsedSeconds: number;
  timerStarted: boolean;
  timerRunning: boolean;
  gameStatus: "playing" | "won";
  completionFlash: boolean;
  confetti: boolean;
  showStats: boolean;
  stats: MiniStats;
  statsUpdated: boolean;
  initialized: boolean;

  init: (dateStr: string, puzzleData?: Record<string, unknown>) => void;
  selectCell: (row: number, col: number) => void;
  selectClue: (direction: MiniDirection, number: number) => void;
  setActiveTab: (tab: MiniDirection) => void;
  typeLetter: (letter: string) => void;
  backspace: () => void;
  moveArrow: (dRow: number, dCol: number) => void;
  tickTimer: () => void;
  setShowStats: (open: boolean) => void;
  clearConfetti: () => void;
  getTimerDisplay: () => string;
}

function persist(state: {
  puzzleDate: string;
  entries: Record<string, string>;
  focusRow: number;
  focusCol: number;
  direction: MiniDirection;
  activeTab: MiniDirection;
  elapsedSeconds: number;
  timerStarted: boolean;
  timerRunning: boolean;
  gameStatus: "playing" | "won";
}) {
  saveGameState<PersistedMiniState>(storageKey(state.puzzleDate), state);
}

function firstWhiteCell(parsed: ParsedMiniPuzzle): { row: number; col: number } {
  for (let r = 0; r < parsed.size; r++) {
    for (let c = 0; c < parsed.size; c++) {
      if (!parsed.black[r][c]) return { row: r, col: c };
    }
  }
  return { row: 0, col: 0 };
}

function checkWin(get: () => MiniStore, set: (p: Partial<MiniStore>) => void) {
  const state = get();
  if (!state.parsed || state.gameStatus === "won") return;

  if (!isPuzzleComplete(state.parsed, state.entries)) return;

  const elapsed = state.elapsedSeconds;
  const updates: Partial<MiniStore> = {
    gameStatus: "won",
    timerRunning: false,
    completionFlash: true,
    confetti: true,
    showStats: true,
  };

  if (!state.statsUpdated) {
    updates.stats = updateStatsOnWin(state.stats, elapsed);
    updates.statsUpdated = true;
  }

  void savePuzzleResult("mini", state.puzzleDate, {
    won: true,
    elapsedSeconds: elapsed,
  });

  set(updates);
  persist({
    puzzleDate: state.puzzleDate,
    entries: state.entries,
    focusRow: state.focusRow,
    focusCol: state.focusCol,
    direction: state.direction,
    activeTab: state.activeTab,
    elapsedSeconds: elapsed,
    timerStarted: state.timerStarted,
    timerRunning: false,
    gameStatus: "won",
  });

  setTimeout(() => {
    set({ completionFlash: false });
  }, 600);
}

export const useMiniStore = create<MiniStore>((set, get) => ({
  parsed: null,
  puzzleDate: getTodayString(),
  entries: {},
  focusRow: 0,
  focusCol: 0,
  direction: "across",
  activeTab: "across",
  elapsedSeconds: 0,
  timerStarted: false,
  timerRunning: false,
  gameStatus: "playing",
  completionFlash: false,
  confetti: false,
  showStats: false,
  stats: DEFAULT_STATS,
  statsUpdated: false,
  initialized: false,

  init: (dateStr, puzzleData) => {
    const puzzle = resolveMiniPuzzle(dateStr, puzzleData);
    const parsed = parseMiniPuzzle(puzzle);
    const stats = loadStats();
    const saved = loadGameState<PersistedMiniState>(storageKey(dateStr));
    const start = firstWhiteCell(parsed);

    if (saved) {
      set({
        parsed,
        puzzleDate: dateStr,
        entries: saved.entries ?? {},
        focusRow: saved.focusRow ?? start.row,
        focusCol: saved.focusCol ?? start.col,
        direction: saved.direction ?? "across",
        activeTab: saved.activeTab ?? "across",
        elapsedSeconds: saved.elapsedSeconds ?? 0,
        timerStarted: saved.timerStarted ?? false,
        timerRunning:
          saved.gameStatus === "won" ? false : (saved.timerRunning ?? false),
        gameStatus: saved.gameStatus ?? "playing",
        stats,
        statsUpdated: saved.gameStatus === "won",
        confetti: saved.gameStatus === "won",
        initialized: true,
      });
      return;
    }

    set({
      parsed,
      puzzleDate: dateStr,
      entries: {},
      focusRow: start.row,
      focusCol: start.col,
      direction: "across",
      activeTab: "across",
      elapsedSeconds: 0,
      timerStarted: false,
      timerRunning: false,
      gameStatus: "playing",
      stats,
      statsUpdated: false,
      confetti: false,
      initialized: true,
    });
  },

  selectCell: (row, col) => {
    const state = get();
    if (!state.parsed || state.parsed.black[row][col]) return;
    if (state.gameStatus === "won") return;

    const sameCell =
      state.focusRow === row && state.focusCol === col;
    let direction = state.direction;

    if (sameCell) {
      const other: MiniDirection =
        direction === "across" ? "down" : "across";
      const otherWord = findWordAtCell(
        other === "across"
          ? state.parsed.acrossWords
          : state.parsed.downWords,
        row,
        col,
        other
      );
      if (otherWord) direction = other;
    } else {
      const acrossWord = findWordAtCell(
        state.parsed.acrossWords,
        row,
        col,
        "across"
      );
      direction = acrossWord ? "across" : "down";
    }

    set({
      focusRow: row,
      focusCol: col,
      direction,
      activeTab: direction,
    });
    persist({ ...state, focusRow: row, focusCol: col, direction });
  },

  selectClue: (direction, number) => {
    const state = get();
    if (!state.parsed) return;
    const list =
      direction === "across"
        ? state.parsed.acrossWords
        : state.parsed.downWords;
    const word = list.find((w) => w.number === number);
    if (!word || word.cells.length === 0) return;

    const { row, col } = word.cells[0];
    set({
      focusRow: row,
      focusCol: col,
      direction,
      activeTab: direction,
    });
    persist({ ...state, focusRow: row, focusCol: col, direction, activeTab: direction });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  typeLetter: (letter) => {
    const state = get();
    if (!state.parsed || state.gameStatus === "won") return;

    const L = letter.toUpperCase();
    const { focusRow, focusCol } = state;
    if (state.parsed.black[focusRow][focusCol]) return;

    const cells = getWordCells(
      state.parsed,
      focusRow,
      focusCol,
      state.direction
    );
    if (cells.length === 0) return;

    const key = cellKey(focusRow, focusCol);
    const entries = { ...state.entries, [key]: L };

    const idx = cells.findIndex(
      (c) => c.row === focusRow && c.col === focusCol
    );
    const next = getFirstEmptyInWord(cells, entries, idx + 1) ??
      getNextCellInWord(cells, focusRow, focusCol, true);

    const updates: Partial<MiniStore> = {
      entries,
      timerStarted: true,
      timerRunning: true,
    };
    if (next) {
      updates.focusRow = next.row;
      updates.focusCol = next.col;
    }

    set(updates);
    persist({
      ...state,
      entries,
      focusRow: next?.row ?? focusRow,
      focusCol: next?.col ?? focusCol,
      timerStarted: true,
      timerRunning: true,
    });
    checkWin(get, set);
  },

  backspace: () => {
    const state = get();
    if (!state.parsed || state.gameStatus === "won") return;

    const { focusRow, focusCol } = state;
    const key = cellKey(focusRow, focusCol);
    const entries = { ...state.entries };

    const cells = getWordCells(
      state.parsed,
      focusRow,
      focusCol,
      state.direction
    );

    if (entries[key]) {
      delete entries[key];
      set({ entries });
      persist({ ...state, entries });
      return;
    }

    const prev = getNextCellInWord(cells, focusRow, focusCol, false);
    if (prev) {
      const prevKey = cellKey(prev.row, prev.col);
      delete entries[prevKey];
      set({ entries, focusRow: prev.row, focusCol: prev.col });
      persist({
        ...state,
        entries,
        focusRow: prev.row,
        focusCol: prev.col,
      });
    }
  },

  moveArrow: (dRow, dCol) => {
    const state = get();
    if (!state.parsed || state.gameStatus === "won") return;

    const next = moveFocus(
      state.parsed,
      state.focusRow,
      state.focusCol,
      dRow,
      dCol
    );
    if (!next) return;

    const acrossWord = findWordAtCell(
      state.parsed.acrossWords,
      next.row,
      next.col,
      "across"
    );
    const direction: MiniDirection = acrossWord ? "across" : "down";

    set({ focusRow: next.row, focusCol: next.col, direction });
    persist({
      ...state,
      focusRow: next.row,
      focusCol: next.col,
      direction,
    });
  },

  tickTimer: () => {
    const state = get();
    if (!state.timerRunning || state.gameStatus === "won") return;
    set({ elapsedSeconds: state.elapsedSeconds + 1 });
  },

  setShowStats: (open) => set({ showStats: open }),

  clearConfetti: () => set({ confetti: false }),

  getTimerDisplay: () => formatTimer(get().elapsedSeconds),
}));
