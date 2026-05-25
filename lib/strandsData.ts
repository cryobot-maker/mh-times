import { getDayNumber } from "./gameUtils";
import type { CellPos } from "./strandsLogic";

export interface StrandsPuzzle {
  date: string;
  number: number;
  theme: string;
  spangram: string;
  themeWords: string[];
  grid: string[][];
  solutions: Record<string, CellPos[]>;
}

export const STRANDS_PUZZLES: StrandsPuzzle[] = [
  {
    date: "2025-05-25",
    number: 812,
    theme: "Summer Essentials",
    spangram: "BEACHBAG",
    themeWords: [
      "SUNSCREEN",
      "TOWEL",
      "FLIPFLOPS",
      "SUNGLASSES",
      "COOLER",
      "UMBRELLA",
    ],
    grid: [
      ["S", "U", "N", "G", "L", "A"],
      ["C", "S", "E", "S", "S", "F"],
      ["R", "E", "N", "I", "L", "U"],
      ["L", "F", "P", "B", "M", "L"],
      ["O", "P", "S", "R", "E", "L"],
      ["B", "H", "C", "A", "A", "E"],
      ["A", "G", "O", "O", "L", "R"],
      ["T", "O", "W", "E", "A", "B"],
    ],
    solutions: {
      SUNGLASSES: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
        { row: 0, col: 4 },
        { row: 0, col: 5 },
        { row: 1, col: 4 },
        { row: 1, col: 3 },
        { row: 1, col: 2 },
        { row: 1, col: 1 },
      ],
      SUNSCREEN: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 1, col: 1 },
        { row: 1, col: 0 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 2 },
      ],
      FLIPFLOPS: [
        { row: 1, col: 5 },
        { row: 2, col: 4 },
        { row: 2, col: 3 },
        { row: 3, col: 2 },
        { row: 3, col: 1 },
        { row: 3, col: 0 },
        { row: 4, col: 0 },
        { row: 4, col: 1 },
        { row: 4, col: 2 },
      ],
      UMBRELLA: [
        { row: 2, col: 5 },
        { row: 3, col: 4 },
        { row: 3, col: 3 },
        { row: 4, col: 3 },
        { row: 4, col: 4 },
        { row: 3, col: 5 },
        { row: 4, col: 5 },
        { row: 5, col: 4 },
      ],
      BEACHBAG: [
        { row: 3, col: 3 },
        { row: 4, col: 4 },
        { row: 5, col: 3 },
        { row: 5, col: 2 },
        { row: 5, col: 1 },
        { row: 5, col: 0 },
        { row: 6, col: 0 },
        { row: 6, col: 1 },
      ],
      COOLER: [
        { row: 5, col: 2 },
        { row: 6, col: 2 },
        { row: 6, col: 3 },
        { row: 6, col: 4 },
        { row: 5, col: 5 },
        { row: 6, col: 5 },
      ],
      TOWEL: [
        { row: 7, col: 0 },
        { row: 7, col: 1 },
        { row: 7, col: 2 },
        { row: 7, col: 3 },
        { row: 6, col: 4 },
      ],
    },
  },
  {
    date: "2025-05-24",
    number: 811,
    theme: "Staying Alive",
    spangram: "SURVIVALIST",
    themeWords: ["MACHETE", "HATCHET", "FLINT", "PARACORD", "TARP", "SHOVEL"],
    grid: [
      ["S", "U", "R", "V", "I", "V"],
      ["T", "S", "I", "L", "A", "P"],
      ["O", "C", "A", "R", "M", "C"],
      ["R", "D", "T", "E", "H", "A"],
      ["S", "E", "H", "C", "T", "F"],
      ["H", "O", "V", "E", "L", "I"],
      ["T", "A", "R", "T", "N", "A"],
      ["B", "P", "C", "D", "E", "F"],
    ],
    solutions: {
      SURVIVALIST: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
        { row: 0, col: 4 },
        { row: 0, col: 5 },
        { row: 1, col: 4 },
        { row: 1, col: 3 },
        { row: 1, col: 2 },
        { row: 1, col: 1 },
        { row: 1, col: 0 },
      ],
      PARACORD: [
        { row: 1, col: 5 },
        { row: 1, col: 4 },
        { row: 2, col: 3 },
        { row: 2, col: 2 },
        { row: 2, col: 1 },
        { row: 2, col: 0 },
        { row: 3, col: 0 },
        { row: 3, col: 1 },
      ],
      MACHETE: [
        { row: 2, col: 4 },
        { row: 1, col: 4 },
        { row: 2, col: 5 },
        { row: 3, col: 4 },
        { row: 3, col: 3 },
        { row: 3, col: 2 },
        { row: 4, col: 1 },
      ],
      HATCHET: [
        { row: 3, col: 4 },
        { row: 3, col: 5 },
        { row: 4, col: 4 },
        { row: 4, col: 3 },
        { row: 4, col: 2 },
        { row: 3, col: 3 },
        { row: 3, col: 2 },
      ],
      SHOVEL: [
        { row: 4, col: 0 },
        { row: 5, col: 0 },
        { row: 5, col: 1 },
        { row: 5, col: 2 },
        { row: 5, col: 3 },
        { row: 5, col: 4 },
      ],
      FLINT: [
        { row: 4, col: 5 },
        { row: 5, col: 4 },
        { row: 5, col: 5 },
        { row: 6, col: 4 },
        { row: 6, col: 3 },
      ],
      TARP: [
        { row: 6, col: 0 },
        { row: 6, col: 1 },
        { row: 6, col: 2 },
        { row: 7, col: 1 },
      ],
    },
  },
  {
    date: "2025-05-23",
    number: 810,
    theme: "Backpacking",
    spangram: "BACKPACKING",
    themeWords: [
      "TENT",
      "COMPASS",
      "CANTEEN",
      "TRAILMAP",
      "SLEEPING",
      "STOVE",
    ],
    grid: [
      ["B", "A", "C", "K", "P", "A"],
      ["G", "N", "I", "K", "C", "T"],
      ["M", "L", "S", "A", "R", "I"],
      ["A", "P", "E", "E", "P", "N"],
      ["C", "O", "M", "P", "G", "C"],
      ["S", "S", "A", "N", "A", "E"],
      ["E", "E", "T", "O", "V", "A"],
      ["N", "T", "B", "C", "D", "E"],
    ],
    solutions: {
      BACKPACKING: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
        { row: 0, col: 4 },
        { row: 0, col: 5 },
        { row: 1, col: 4 },
        { row: 1, col: 3 },
        { row: 1, col: 2 },
        { row: 1, col: 1 },
        { row: 1, col: 0 },
      ],
      TRAILMAP: [
        { row: 1, col: 5 },
        { row: 2, col: 4 },
        { row: 2, col: 3 },
        { row: 1, col: 2 },
        { row: 2, col: 1 },
        { row: 2, col: 0 },
        { row: 3, col: 0 },
        { row: 3, col: 1 },
      ],
      SLEEPING: [
        { row: 2, col: 2 },
        { row: 2, col: 1 },
        { row: 3, col: 2 },
        { row: 3, col: 3 },
        { row: 3, col: 4 },
        { row: 2, col: 5 },
        { row: 3, col: 5 },
        { row: 4, col: 4 },
      ],
      COMPASS: [
        { row: 4, col: 0 },
        { row: 4, col: 1 },
        { row: 4, col: 2 },
        { row: 4, col: 3 },
        { row: 5, col: 2 },
        { row: 5, col: 1 },
        { row: 5, col: 0 },
      ],
      CANTEEN: [
        { row: 4, col: 5 },
        { row: 5, col: 4 },
        { row: 5, col: 3 },
        { row: 6, col: 2 },
        { row: 6, col: 1 },
        { row: 6, col: 0 },
        { row: 7, col: 0 },
      ],
      STOVE: [
        { row: 5, col: 1 },
        { row: 6, col: 2 },
        { row: 6, col: 3 },
        { row: 6, col: 4 },
        { row: 5, col: 5 },
      ],
      TENT: [
        { row: 6, col: 2 },
        { row: 6, col: 1 },
        { row: 7, col: 0 },
        { row: 7, col: 1 },
      ],
    },
  },
];

export function getStrandsPuzzle(dateStr: string): StrandsPuzzle {
  const found = STRANDS_PUZZLES.find((p) => p.date === dateStr);
  if (found) return found;
  const index = getDayNumber(dateStr) % STRANDS_PUZZLES.length;
  return STRANDS_PUZZLES[index];
}

export function getSolutionPath(
  puzzle: StrandsPuzzle,
  word: string
): CellPos[] | null {
  return puzzle.solutions[word] ?? puzzle.solutions[word.toUpperCase()] ?? null;
}
