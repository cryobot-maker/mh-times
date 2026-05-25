import { getDayNumber } from "./gameUtils";

export type LetterSide = "top" | "right" | "bottom" | "left";

export interface LetterBoxedPuzzle {
  date: string;
  number: number;
  sides: {
    top: [string, string, string];
    right: [string, string, string];
    bottom: [string, string, string];
    left: [string, string, string];
  };
  par: number;
  solutions: string[][];
}

export const LETTER_BOXED_PUZZLES: LetterBoxedPuzzle[] = [
  {
    date: "2025-05-25",
    number: 2728,
    sides: {
      top: ["P", "L", "A"],
      right: ["N", "T", "E"],
      bottom: ["R", "S", "O"],
      left: ["M", "I", "C"],
    },
    par: 2,
    solutions: [["MICROPLANES", "STAMEN"], ["OMPLIANT", "TRACERS"]],
  },
  {
    date: "2025-05-24",
    number: 2727,
    sides: {
      top: ["F", "O", "R"],
      right: ["M", "A", "T"],
      bottom: ["H", "E", "S"],
      left: ["N", "I", "G"],
    },
    par: 2,
    solutions: [["NIGHTMARES", "SHORTEN", "FORGE"], ["IFORMANTS", "SHEETING"]],
  },
  {
    date: "2025-05-23",
    number: 2726,
    sides: {
      top: ["B", "U", "L"],
      right: ["D", "O", "G"],
      bottom: ["R", "A", "N"],
      left: ["W", "I", "C"],
    },
    par: 2,
    solutions: [["BRICKLAYING", "GROUNDWORK"], ["WILDGOOSE", "CRANBERRY"]],
  },
  {
    date: "2025-05-22",
    number: 2725,
    sides: {
      top: ["S", "T", "A"],
      right: ["R", "E", "D"],
      bottom: ["N", "O", "W"],
      left: ["L", "V", "I"],
    },
    par: 2,
    solutions: [["SNOWSTRIDE", "ELEVATION"], ["LIVERWORMS", "STAINED"]],
  },
];

export function getLetterBoxedPuzzle(dateStr: string): LetterBoxedPuzzle {
  const found = LETTER_BOXED_PUZZLES.find((p) => p.date === dateStr);
  if (found) return found;
  const index = getDayNumber(dateStr) % LETTER_BOXED_PUZZLES.length;
  return LETTER_BOXED_PUZZLES[index];
}
