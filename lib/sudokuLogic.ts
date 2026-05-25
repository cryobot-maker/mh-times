export type Board = number[][];
export type NotesGrid = number[][][];
export type BoolGrid = boolean[][];

export function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

export function createEmptyNotes(): NotesGrid {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => [] as number[])
  );
}

export function createEmptyBoolGrid(): BoolGrid {
  return Array.from({ length: 9 }, () => Array(9).fill(false));
}

export function parseGrid(flat: string): Board {
  const board = createEmptyBoard();
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9);
    const c = i % 9;
    const ch = flat[i];
    board[r][c] = ch === "0" || ch === "." ? 0 : parseInt(ch, 10);
  }
  return board;
}

export function boardToFlat(board: Board): string {
  return board.flat().join("");
}

export function cellKey(r: number, c: number): string {
  return `${r},${c}`;
}

export function parseCellKey(key: string): [number, number] {
  const [r, c] = key.split(",").map(Number);
  return [r, c];
}

export function getBoxIndex(r: number, c: number): number {
  return Math.floor(r / 3) * 3 + Math.floor(c / 3);
}

export function sameBox(r1: number, c1: number, r2: number, c2: number): boolean {
  return getBoxIndex(r1, c1) === getBoxIndex(r2, c2);
}

export function isPeer(
  r1: number,
  c1: number,
  r2: number,
  c2: number
): boolean {
  if (r1 === r2 && c1 === c2) return false;
  return r1 === r2 || c1 === c2 || sameBox(r1, c1, r2, c2);
}

export function getConflicts(board: Board): Set<string> {
  const conflicts = new Set<string>();

  for (let r = 0; r < 9; r++) {
    const rowCounts = new Map<number, number[]>();
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v === 0) continue;
      if (!rowCounts.has(v)) rowCounts.set(v, []);
      rowCounts.get(v)!.push(c);
    }
    Array.from(rowCounts.values()).forEach((cols) => {
      if (cols.length > 1) cols.forEach((c) => conflicts.add(cellKey(r, c)));
    });
  }

  for (let c = 0; c < 9; c++) {
    const colCounts = new Map<number, number[]>();
    for (let r = 0; r < 9; r++) {
      const v = board[r][c];
      if (v === 0) continue;
      if (!colCounts.has(v)) colCounts.set(v, []);
      colCounts.get(v)!.push(r);
    }
    Array.from(colCounts.values()).forEach((rows) => {
      if (rows.length > 1) rows.forEach((r) => conflicts.add(cellKey(r, c)));
    });
  }

  for (let box = 0; box < 9; box++) {
    const br = Math.floor(box / 3) * 3;
    const bc = (box % 3) * 3;
    const counts = new Map<number, [number, number][]>();
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        const v = board[r][c];
        if (v === 0) continue;
        if (!counts.has(v)) counts.set(v, []);
        counts.get(v)!.push([r, c]);
      }
    }
    Array.from(counts.values()).forEach((cells) => {
      if (cells.length > 1) {
        cells.forEach(([r, c]) => conflicts.add(cellKey(r, c)));
      }
    });
  }

  return conflicts;
}

export function countDigitOnBoard(board: Board, digit: number): number {
  let n = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === digit) n++;
    }
  }
  return n;
}

export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return getConflicts(board).size === 0;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function cloneNotes(notes: NotesGrid): NotesGrid {
  return notes.map((row) => row.map((cell) => [...cell]));
}

export function cloneBoolGrid(grid: BoolGrid): BoolGrid {
  return grid.map((row) => [...row]);
}

export function formatTimer(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function difficultyLabel(d: string): string {
  return d.charAt(0).toUpperCase() + d.slice(1);
}
