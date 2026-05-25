import type { MiniClueDef, MiniCrossword } from "./miniCrosswordData";

export type MiniDirection = "across" | "down";

export interface CellPos {
  row: number;
  col: number;
}

export interface MiniWord {
  id: string;
  direction: MiniDirection;
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
  cells: CellPos[];
}

export interface ParsedMiniPuzzle {
  size: number;
  solution: string[][];
  black: boolean[][];
  numbers: (number | null)[][];
  words: MiniWord[];
  acrossWords: MiniWord[];
  downWords: MiniWord[];
}

export function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

export function parseCellKey(key: string): CellPos {
  const [row, col] = key.split("-").map(Number);
  return { row, col };
}

export function isBlackCell(grid: string[][], row: number, col: number): boolean {
  return grid[row][col] === "#";
}

export function startsAcross(grid: string[][], row: number, col: number): boolean {
  if (isBlackCell(grid, row, col)) return false;
  return col === 0 || isBlackCell(grid, row, col - 1);
}

export function startsDown(grid: string[][], row: number, col: number): boolean {
  if (isBlackCell(grid, row, col)) return false;
  return row === 0 || isBlackCell(grid, row - 1, col);
}

export function collectWordCells(
  grid: string[][],
  row: number,
  col: number,
  direction: MiniDirection
): CellPos[] {
  const cells: CellPos[] = [];
  const size = grid.length;
  let r = row;
  let c = col;
  while (r >= 0 && r < size && c >= 0 && c < size && !isBlackCell(grid, r, c)) {
    cells.push({ row: r, col: c });
    if (direction === "across") c++;
    else r++;
  }
  return cells;
}

export function assignGridNumbers(grid: string[][]): (number | null)[][] {
  const size = grid.length;
  const numbers: (number | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );
  let num = 1;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isBlackCell(grid, r, c)) continue;
      const across = startsAcross(grid, r, c);
      const down = startsDown(grid, r, c);
      if (across || down) {
        numbers[r][c] = num;
        num++;
      }
    }
  }
  return numbers;
}

function buildWordFromClue(
  grid: string[][],
  clue: MiniClueDef,
  direction: MiniDirection
): MiniWord | null {
  const cells = collectWordCells(grid, clue.row, clue.col, direction);
  if (cells.length === 0) return null;
  const answer = cells
    .map(({ row, col }) => grid[row][col].toUpperCase())
    .join("");
  const numbers = assignGridNumbers(grid);
  const number = numbers[clue.row][clue.col] ?? clue.number;
  return {
    id: `${direction}-${number}-${clue.row}-${clue.col}`,
    direction,
    number,
    clue: clue.clue,
    answer,
    row: clue.row,
    col: clue.col,
    cells,
  };
}

export function parseMiniPuzzle(puzzle: MiniCrossword): ParsedMiniPuzzle {
  const grid = puzzle.grid;
  const size = grid.length;
  const solution = grid.map((row) =>
    row.map((cell) => (cell === "#" ? "#" : cell.toUpperCase()))
  );
  const black = grid.map((row) => row.map((cell) => cell === "#"));
  const numbers = assignGridNumbers(grid);

  const acrossWords: MiniWord[] = [];
  const downWords: MiniWord[] = [];

  for (const clue of puzzle.clues.across) {
    const word = buildWordFromClue(grid, clue, "across");
    if (word) acrossWords.push(word);
  }
  for (const clue of puzzle.clues.down) {
    const word = buildWordFromClue(grid, clue, "down");
    if (word) downWords.push(word);
  }

  return {
    size,
    solution,
    black,
    numbers,
    words: [...acrossWords, ...downWords],
    acrossWords,
    downWords,
  };
}

export function findWordAtCell(
  words: MiniWord[],
  row: number,
  col: number,
  direction: MiniDirection
): MiniWord | null {
  return (
    words.find(
      (w) =>
        w.direction === direction &&
        w.cells.some((c) => c.row === row && c.col === col)
    ) ?? null
  );
}

export function getWordCells(
  parsed: ParsedMiniPuzzle,
  row: number,
  col: number,
  direction: MiniDirection
): CellPos[] {
  const word = findWordAtCell(
    direction === "across" ? parsed.acrossWords : parsed.downWords,
    row,
    col,
    direction
  );
  return word?.cells ?? [];
}

export function getNextCellInWord(
  cells: CellPos[],
  row: number,
  col: number,
  forward: boolean
): CellPos | null {
  const idx = cells.findIndex((c) => c.row === row && c.col === col);
  if (idx === -1) return null;
  const nextIdx = forward ? idx + 1 : idx - 1;
  if (nextIdx < 0 || nextIdx >= cells.length) return null;
  return cells[nextIdx];
}

export function getFirstEmptyInWord(
  cells: CellPos[],
  entries: Record<string, string>,
  fromIdx: number
): CellPos | null {
  for (let i = fromIdx; i < cells.length; i++) {
    const { row, col } = cells[i];
    if (!entries[cellKey(row, col)]) return cells[i];
  }
  return null;
}

export function isPuzzleComplete(
  parsed: ParsedMiniPuzzle,
  entries: Record<string, string>
): boolean {
  for (let r = 0; r < parsed.size; r++) {
    for (let c = 0; c < parsed.size; c++) {
      if (parsed.black[r][c]) continue;
      const key = cellKey(r, c);
      const expected = parsed.solution[r][c];
      if ((entries[key] ?? "").toUpperCase() !== expected) return false;
    }
  }
  return true;
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function moveFocus(
  parsed: ParsedMiniPuzzle,
  row: number,
  col: number,
  dRow: number,
  dCol: number
): CellPos | null {
  let r = row + dRow;
  let c = col + dCol;
  while (r >= 0 && r < parsed.size && c >= 0 && c < parsed.size) {
    if (!parsed.black[r][c]) return { row: r, col: c };
    r += dRow;
    c += dCol;
  }
  return null;
}
