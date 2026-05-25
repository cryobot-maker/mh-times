import { create } from "zustand";
import { getTodayString, loadGameState, saveGameState } from "@/lib/gameUtils";
import {
  DEFAULT_DIFFICULTY,
  getPuzzle,
  MAX_HINTS,
  SUDOKU_TUTORIAL_KEY,
  type SudokuDifficulty,
} from "@/lib/sudokuData";
import {
  cloneBoard,
  cloneBoolGrid,
  cloneNotes,
  createEmptyBoard,
  createEmptyBoolGrid,
  createEmptyNotes,
  formatTimer,
  getConflicts,
  isBoardComplete,
  parseGrid,
  type Board,
  type BoolGrid,
  type NotesGrid,
} from "@/lib/sudokuLogic";

export interface BoardSnapshot {
  board: Board;
  notes: NotesGrid;
  hintCells: BoolGrid;
}

export interface SudokuStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  avgTimeEasyMs: number | null;
  avgTimeMediumMs: number | null;
  avgTimeHardMs: number | null;
  easyWins: number;
  mediumWins: number;
  hardWins: number;
}

const DEFAULT_STATS: SudokuStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  avgTimeEasyMs: null,
  avgTimeMediumMs: null,
  avgTimeHardMs: null,
  easyWins: 0,
  mediumWins: 0,
  hardWins: 0,
};

const STATS_KEY = "sudoku-stats";

function storageKey(date: string, difficulty: SudokuDifficulty) {
  return `sudoku-state-${date}-${difficulty}`;
}

function loadStats(): SudokuStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats: SudokuStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function updateAvg(
  current: number | null,
  count: number,
  newMs: number
): number {
  if (current === null) return newMs;
  return Math.round((current * count + newMs) / (count + 1));
}

function buildGivens(puzzleFlat: string): BoolGrid {
  const givens = createEmptyBoolGrid();
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9);
    const c = i % 9;
    const ch = puzzleFlat[i];
    givens[r][c] = ch !== "0" && ch !== ".";
  }
  return givens;
}

function removeNoteFromPeers(
  board: Board,
  notes: NotesGrid,
  r: number,
  c: number,
  digit: number
): NotesGrid {
  const next = cloneNotes(notes);
  for (let i = 0; i < 9; i++) {
    if (i !== c && next[r][i].includes(digit)) {
      next[r][i] = next[r][i].filter((n) => n !== digit);
    }
    if (i !== r && next[i][c].includes(digit)) {
      next[i][c] = next[i][c].filter((n) => n !== digit);
    }
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) {
      if (rr === r && cc === c) continue;
      if (next[rr][cc].includes(digit)) {
        next[rr][cc] = next[rr][cc].filter((n) => n !== digit);
      }
    }
  }
  return next;
}

export interface PersistedSudokuState {
  puzzleDate: string;
  difficulty: SudokuDifficulty;
  board: Board;
  notes: NotesGrid;
  hintCells: BoolGrid;
  hintsUsed: number;
  elapsedMs: number;
  timerStarted: boolean;
  paused: boolean;
  gameStatus: "playing" | "won";
  history: BoardSnapshot[];
  autoRemoveNotes: boolean;
}

interface SudokuStore {
  initialized: boolean;
  puzzleDate: string;
  difficulty: SudokuDifficulty;
  solution: string;
  givens: BoolGrid;
  board: Board;
  notes: NotesGrid;
  hintCells: BoolGrid;
  selectedCell: [number, number] | null;
  pencilMode: boolean;
  autoRemoveNotes: boolean;
  hintsUsed: number;
  history: BoardSnapshot[];
  timerStarted: boolean;
  elapsedMs: number;
  paused: boolean;
  pauseStartedAt: number | null;
  gameStatus: "playing" | "won";
  winFlash: boolean;
  confetti: boolean;
  showStats: boolean;
  showHowToPlay: boolean;
  stats: SudokuStats;
  statsUpdated: boolean;

  init: (dateStr: string, difficulty: SudokuDifficulty) => void;
  setDifficulty: (difficulty: SudokuDifficulty) => void;
  selectCell: (row: number, col: number) => void;
  moveSelection: (dRow: number, dCol: number) => void;
  togglePencilMode: () => void;
  setAutoRemoveNotes: (v: boolean) => void;
  inputDigit: (digit: number) => void;
  eraseSelected: () => void;
  undo: () => void;
  applyHint: () => boolean;
  togglePause: () => void;
  resume: () => void;
  tickTimer: () => void;
  getTimerDisplay: () => string;
  getHintsLeft: () => number;
  getConflicts: () => Set<string>;
  setShowStats: (v: boolean) => void;
  setShowHowToPlay: (v: boolean) => void;
  markTutorialSeen: () => void;
  getShareText: () => string;
}

function snapshot(
  board: Board,
  notes: NotesGrid,
  hintCells: BoolGrid
): BoardSnapshot {
  return {
    board: cloneBoard(board),
    notes: cloneNotes(notes),
    hintCells: cloneBoolGrid(hintCells),
  };
}

function persist(get: () => SudokuStore) {
  const s = get();
  if (!s.initialized || s.gameStatus === "won") return;
  const data: PersistedSudokuState = {
    puzzleDate: s.puzzleDate,
    difficulty: s.difficulty,
    board: s.board,
    notes: s.notes,
    hintCells: s.hintCells,
    hintsUsed: s.hintsUsed,
    elapsedMs: s.elapsedMs,
    timerStarted: s.timerStarted,
    paused: s.paused,
    gameStatus: s.gameStatus,
    history: s.history,
    autoRemoveNotes: s.autoRemoveNotes,
  };
  saveGameState(storageKey(s.puzzleDate, s.difficulty), data);
}

export const useSudokuStore = create<SudokuStore>((set, get) => ({
  initialized: false,
  puzzleDate: getTodayString(),
  difficulty: DEFAULT_DIFFICULTY,
  solution: "",
  givens: createEmptyBoolGrid(),
  board: createEmptyBoard(),
  notes: createEmptyNotes(),
  hintCells: createEmptyBoolGrid(),
  selectedCell: null,
  pencilMode: false,
  autoRemoveNotes: true,
  hintsUsed: 0,
  history: [],
  timerStarted: false,
  elapsedMs: 0,
  paused: false,
  pauseStartedAt: null,
  gameStatus: "playing",
  winFlash: false,
  confetti: false,
  showStats: false,
  showHowToPlay: false,
  stats: DEFAULT_STATS,
  statsUpdated: false,

  init: (dateStr, difficulty) => {
    const puzzle = getPuzzle(difficulty, dateStr);
    const givens = buildGivens(puzzle.puzzle);
    const stats = loadStats();
    const tutorialSeen =
      typeof window !== "undefined" &&
      localStorage.getItem(SUDOKU_TUTORIAL_KEY) === "true";

    const saved = loadGameState<PersistedSudokuState>(
      storageKey(dateStr, difficulty)
    );

    if (saved && saved.puzzleDate === dateStr && saved.difficulty === difficulty) {
      set({
        initialized: true,
        puzzleDate: dateStr,
        difficulty,
        solution: puzzle.solution,
        givens,
        board: saved.board,
        notes: saved.notes,
        hintCells: saved.hintCells,
        hintsUsed: saved.hintsUsed,
        history: saved.history ?? [],
        timerStarted: saved.timerStarted,
        elapsedMs: saved.elapsedMs,
        paused: saved.paused,
        pauseStartedAt: null,
        gameStatus: saved.gameStatus,
        selectedCell: null,
        pencilMode: false,
        autoRemoveNotes: saved.autoRemoveNotes ?? true,
        winFlash: false,
        confetti: false,
        showStats: saved.gameStatus === "won",
        showHowToPlay: !tutorialSeen,
        stats,
        statsUpdated: saved.gameStatus === "won",
      });
      return;
    }

    set({
      initialized: true,
      puzzleDate: dateStr,
      difficulty,
      solution: puzzle.solution,
      givens,
      board: parseGrid(puzzle.puzzle),
      notes: createEmptyNotes(),
      hintCells: createEmptyBoolGrid(),
      hintsUsed: 0,
      history: [],
      timerStarted: false,
      elapsedMs: 0,
      paused: false,
      pauseStartedAt: null,
      gameStatus: "playing",
      selectedCell: null,
      pencilMode: false,
      autoRemoveNotes: true,
      winFlash: false,
      confetti: false,
      showStats: false,
      showHowToPlay: !tutorialSeen,
      stats,
      statsUpdated: false,
    });
  },

  setDifficulty: (difficulty) => {
    const { puzzleDate } = get();
    get().init(puzzleDate, difficulty);
  },

  selectCell: (row, col) => {
    const s = get();
    if (s.gameStatus !== "playing" || s.paused) return;
    const timerStarted = s.timerStarted || true;
    set({ selectedCell: [row, col], timerStarted });
    persist(get);
  },

  moveSelection: (dRow, dCol) => {
    const s = get();
    if (s.gameStatus !== "playing" || s.paused) return;
    let [row, col] = s.selectedCell ?? [0, 0];
    row = (row + dRow + 9) % 9;
    col = (col + dCol + 9) % 9;
    const timerStarted = s.timerStarted || true;
    set({ selectedCell: [row, col], timerStarted });
    persist(get);
  },

  togglePencilMode: () => {
    set((s) => ({ pencilMode: !s.pencilMode }));
  },

  setAutoRemoveNotes: (v) => set({ autoRemoveNotes: v }),

  inputDigit: (digit) => {
    const s = get();
    if (s.gameStatus !== "playing" || s.paused || !s.selectedCell) return;
    const [row, col] = s.selectedCell;
    if (s.givens[row][col]) return;

    const timerStarted = true;
    const board = cloneBoard(s.board);
    let notes = cloneNotes(s.notes);
    const hintCells = cloneBoolGrid(s.hintCells);
    const history = [...s.history, snapshot(board, notes, hintCells)];

    if (s.pencilMode) {
      const current = notes[row][col];
      if (board[row][col] !== 0) return;
      if (current.includes(digit)) {
        notes[row][col] = current.filter((n) => n !== digit);
      } else {
        notes[row][col] = [...current, digit].sort((a, b) => a - b);
      }
      set({ notes, history, timerStarted });
      persist(get);
      return;
    }

    board[row][col] = digit;
    notes[row][col] = [];
    if (s.autoRemoveNotes) {
      notes = removeNoteFromPeers(board, notes, row, col, digit);
    }

    const complete = isBoardComplete(board);
    if (complete) {
      set({
        board,
        notes,
        hintCells,
        history,
        timerStarted,
        gameStatus: "won",
        winFlash: true,
        confetti: true,
      });

      setTimeout(() => set({ winFlash: false }), 600);
      setTimeout(() => set({ confetti: false }), 2500);

      if (!s.statsUpdated) {
        const stats = loadStats();
        const elapsed = s.elapsedMs;
        const diff = s.difficulty;
        const next: SudokuStats = {
          ...stats,
          played: stats.played + 1,
          wins: stats.wins + 1,
          currentStreak: stats.currentStreak + 1,
          maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
        };
        if (diff === "easy") {
          next.easyWins += 1;
          next.avgTimeEasyMs = updateAvg(
            stats.avgTimeEasyMs,
            stats.easyWins,
            elapsed
          );
        } else if (diff === "medium") {
          next.mediumWins += 1;
          next.avgTimeMediumMs = updateAvg(
            stats.avgTimeMediumMs,
            stats.mediumWins,
            elapsed
          );
        } else {
          next.hardWins += 1;
          next.avgTimeHardMs = updateAvg(
            stats.avgTimeHardMs,
            stats.hardWins,
            elapsed
          );
        }
        saveStats(next);
        set({ stats: next, statsUpdated: true });
      }

      setTimeout(() => set({ showStats: true }), 800);
      saveGameState(storageKey(s.puzzleDate, s.difficulty), {
        puzzleDate: s.puzzleDate,
        difficulty: s.difficulty,
        board,
        notes,
        hintCells,
        hintsUsed: s.hintsUsed,
        elapsedMs: s.elapsedMs,
        timerStarted: true,
        paused: false,
        gameStatus: "won",
        history,
        autoRemoveNotes: s.autoRemoveNotes,
      });
      return;
    }

    set({ board, notes, hintCells, history, timerStarted });
    persist(get);
  },

  eraseSelected: () => {
    const s = get();
    if (s.gameStatus !== "playing" || s.paused || !s.selectedCell) return;
    const [row, col] = s.selectedCell;
    if (s.givens[row][col]) return;

    const history = [
      ...s.history,
      snapshot(s.board, s.notes, s.hintCells),
    ];
    const board = cloneBoard(s.board);
    const notes = cloneNotes(s.notes);
    const hintCells = cloneBoolGrid(s.hintCells);
    board[row][col] = 0;
    notes[row][col] = [];
    hintCells[row][col] = false;

    set({
      board,
      notes,
      hintCells,
      history,
      timerStarted: s.timerStarted || true,
    });
    persist(get);
  },

  undo: () => {
    const s = get();
    if (s.history.length === 0 || s.gameStatus !== "playing" || s.paused) return;
    const prev = s.history[s.history.length - 1];
    set({
      board: cloneBoard(prev.board),
      notes: cloneNotes(prev.notes),
      hintCells: cloneBoolGrid(prev.hintCells),
      history: s.history.slice(0, -1),
    });
    persist(get);
  },

  applyHint: () => {
    const s = get();
    if (
      s.gameStatus !== "playing" ||
      s.paused ||
      !s.selectedCell ||
      s.hintsUsed >= MAX_HINTS
    )
      return false;

    const [row, col] = s.selectedCell;
    if (s.givens[row][col] || s.board[row][col] !== 0) return false;

    const digit = parseInt(s.solution[row * 9 + col], 10);
    const history = [
      ...s.history,
      snapshot(s.board, s.notes, s.hintCells),
    ];
    const board = cloneBoard(s.board);
    const notes = cloneNotes(s.notes);
    const hintCells = cloneBoolGrid(s.hintCells);
    board[row][col] = digit;
    notes[row][col] = [];
    hintCells[row][col] = true;

    let nextNotes = notes;
    if (s.autoRemoveNotes) {
      nextNotes = removeNoteFromPeers(board, notes, row, col, digit);
    }

    const hintsUsed = s.hintsUsed + 1;
    const timerStarted = s.timerStarted || true;

    if (isBoardComplete(board)) {
      set({
        board,
        notes: nextNotes,
        hintCells,
        history,
        hintsUsed,
        timerStarted,
        gameStatus: "won",
        winFlash: true,
        confetti: true,
      });
      setTimeout(() => set({ winFlash: false }), 600);
      setTimeout(() => set({ confetti: false }), 2500);
      if (!s.statsUpdated) {
        const stats = loadStats();
        const elapsed = s.elapsedMs;
        const diff = s.difficulty;
        const next: SudokuStats = {
          ...stats,
          played: stats.played + 1,
          wins: stats.wins + 1,
          currentStreak: stats.currentStreak + 1,
          maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
        };
        if (diff === "easy") {
          next.easyWins += 1;
          next.avgTimeEasyMs = updateAvg(
            stats.avgTimeEasyMs,
            stats.easyWins,
            elapsed
          );
        } else if (diff === "medium") {
          next.mediumWins += 1;
          next.avgTimeMediumMs = updateAvg(
            stats.avgTimeMediumMs,
            stats.mediumWins,
            elapsed
          );
        } else {
          next.hardWins += 1;
          next.avgTimeHardMs = updateAvg(
            stats.avgTimeHardMs,
            stats.hardWins,
            elapsed
          );
        }
        saveStats(next);
        set({ stats: next, statsUpdated: true });
      }
      setTimeout(() => set({ showStats: true }), 800);
      return true;
    }

    set({
      board,
      notes: nextNotes,
      hintCells,
      history,
      hintsUsed,
      timerStarted,
    });
    persist(get);
    return true;
  },

  togglePause: () => {
    const s = get();
    if (s.gameStatus !== "playing") return;
    if (s.paused) {
      get().resume();
      return;
    }
    set({ paused: true, pauseStartedAt: Date.now() });
  },

  resume: () => {
    set({ paused: false, pauseStartedAt: null });
  },

  tickTimer: () => {
    const s = get();
    if (!s.timerStarted || s.paused || s.gameStatus !== "playing") return;
    set({ elapsedMs: s.elapsedMs + 1000 });
  },

  getTimerDisplay: () => formatTimer(get().elapsedMs),

  getHintsLeft: () => MAX_HINTS - get().hintsUsed,

  getConflicts: () => getConflicts(get().board),

  setShowStats: (v) => set({ showStats: v }),

  setShowHowToPlay: (v) => set({ showHowToPlay: v }),

  markTutorialSeen: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SUDOKU_TUTORIAL_KEY, "true");
    }
  },

  getShareText: () => {
    const s = get();
    const time = formatTimer(s.elapsedMs);
    const diff =
      s.difficulty.charAt(0).toUpperCase() + s.difficulty.slice(1);
    return `I solved today's NYT Sudoku in ${time} on ${diff}! 🧩`;
  },
}));
