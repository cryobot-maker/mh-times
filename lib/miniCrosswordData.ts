import { getDayNumber } from "./gameUtils";
import {
  assignGridNumbers,
  collectWordCells,
  isBlackCell,
  startsAcross,
  startsDown,
} from "./miniCrosswordLogic";

export interface MiniClueDef {
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
}

export interface MiniCrossword {
  date: string;
  grid: string[][];
  clues: {
    across: MiniClueDef[];
    down: MiniClueDef[];
  };
}

const CLUE_HINTS: Record<string, string> = {
  CRAB: "Sideways crustacean",
  HIDE: "Conceal",
  IDEAS: "Creative thoughts",
  PEAR: "Fruit or shape",
  SEEK: "Search for",
  CHIP: "Salsa dip, often",
  BEAR: "Grizzly animal",
  SNOW: "Winter precipitation",
  SKIER: "One on the slopes",
  ALERT: "Urgent warning",
  TIMES: "New York newspaper, with \"The\"",
  EASY: "Not difficult",
  MES: "French month, to Henri",
  MOON: "Earth's satellite",
  ARISE: "Come up",
  HALF: "50%",
  MARS: "Red planet",
  RISES: "Gets up",
};

function answerFromGrid(
  grid: string[][],
  row: number,
  col: number,
  direction: "across" | "down"
): string {
  return collectWordCells(grid, row, col, direction)
    .map(({ row: r, col: c }) => grid[r][c])
    .join("")
    .toUpperCase();
}

function buildClues(grid: string[][]): {
  across: MiniClueDef[];
  down: MiniClueDef[];
} {
  const size = grid.length;
  const numbers = assignGridNumbers(grid);
  const across: MiniClueDef[] = [];
  const down: MiniClueDef[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isBlackCell(grid, r, c)) continue;
      const num = numbers[r][c] ?? 0;

      if (startsAcross(grid, r, c)) {
        const answer = answerFromGrid(grid, r, c, "across");
        if (answer.length < 2) continue;
        across.push({
          number: num,
          clue: CLUE_HINTS[answer] ?? `Across (${answer.length})`,
          answer,
          row: r,
          col: c,
        });
      }
      if (startsDown(grid, r, c)) {
        const answer = answerFromGrid(grid, r, c, "down");
        if (answer.length < 2) continue;
        down.push({
          number: num,
          clue: CLUE_HINTS[answer] ?? `Down (${answer.length})`,
          answer,
          row: r,
          col: c,
        });
      }
    }
  }

  return { across, down };
}

function makePuzzle(date: string, grid: string[][]): MiniCrossword {
  return { date, grid, clues: buildClues(grid) };
}

/** Grids verified: across/down answers match cell letters */
const GRID_2025_05_25: string[][] = [
  ["C", "R", "A", "B", "#"],
  ["H", "I", "D", "E", "#"],
  ["I", "D", "E", "A", "S"],
  ["P", "E", "A", "R", "#"],
  ["#", "S", "E", "E", "K"],
];

const GRID_2025_05_24: string[][] = [
  ["S", "N", "O", "W", "#"],
  ["K", "#", "#", "#", "E"],
  ["A", "L", "E", "R", "T"],
  ["T", "I", "M", "E", "S"],
  ["E", "A", "S", "Y", "#"],
];

const GRID_2025_05_23: string[][] = [
  ["M", "O", "O", "N", "#"],
  ["A", "#", "R", "#", "E"],
  ["R", "I", "S", "E", "S"],
  ["S", "E", "E", "K", "#"],
  ["#", "H", "A", "L", "F"],
];

export const MINI_CROSSWORD_PUZZLES: MiniCrossword[] = [
  makePuzzle("2025-05-25", GRID_2025_05_25),
  makePuzzle("2025-05-24", GRID_2025_05_24),
  makePuzzle("2025-05-23", GRID_2025_05_23),
];

export function getMiniCrossword(dateStr: string): MiniCrossword {
  const found = MINI_CROSSWORD_PUZZLES.find((p) => p.date === dateStr);
  if (found) return found;
  const index = getDayNumber(dateStr) % MINI_CROSSWORD_PUZZLES.length;
  return MINI_CROSSWORD_PUZZLES[index];
}

export const MINI_MAX_HINTS = 3;
