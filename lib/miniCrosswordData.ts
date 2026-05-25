import { getDayNumber } from "./gameUtils";

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

export const MINI_CROSSWORD_PUZZLES: MiniCrossword[] = [
  {
    date: "2025-05-25",
    grid: [
      ["C", "R", "A", "B", "#"],
      ["H", "#", "L", "#", "T"],
      ["I", "D", "E", "A", "S"],
      ["P", "#", "R", "#", "E"],
      ["#", "G", "T", "S", "A"],
    ],
    clues: {
      across: [
        {
          number: 1,
          clue: "Sideways-walking crustacean",
          answer: "CRAB",
          row: 0,
          col: 0,
        },
        {
          number: 5,
          clue: "Creative thoughts",
          answer: "IDEAS",
          row: 2,
          col: 0,
        },
        {
          number: 6,
          clue: "Abbr. after a student's name",
          answer: "GTSA",
          row: 4,
          col: 1,
        },
      ],
      down: [
        {
          number: 1,
          clue: "A spicy Mexican side dish",
          answer: "CHIP",
          row: 0,
          col: 0,
        },
        {
          number: 2,
          clue: "Prefix meaning 'not'",
          answer: "ALERT",
          row: 0,
          col: 2,
        },
        {
          number: 4,
          clue: "Treat, for short",
          answer: "TSEA",
          row: 1,
          col: 4,
        },
      ],
    },
  },
  {
    date: "2025-05-24",
    grid: [
      ["S", "N", "O", "W", "#"],
      ["K", "#", "R", "#", "I"],
      ["A", "L", "E", "R", "T"],
      ["T", "#", "M", "#", "N"],
      ["E", "E", "A", "S", "Y"],
    ],
    clues: {
      across: [
        {
          number: 1,
          clue: "Winter precipitation",
          answer: "SNOW",
          row: 0,
          col: 0,
        },
        {
          number: 5,
          clue: "Urgent warning",
          answer: "ALERT",
          row: 2,
          col: 0,
        },
        {
          number: 6,
          clue: "Not difficult",
          answer: "EASY",
          row: 4,
          col: 1,
        },
      ],
      down: [
        {
          number: 1,
          clue: "Glide on ice",
          answer: "SKATE",
          row: 0,
          col: 0,
        },
        {
          number: 2,
          clue: "Opposite of off",
          answer: "ON",
          row: 0,
          col: 2,
        },
        {
          number: 3,
          clue: "Tiny",
          answer: "WIMPY",
          row: 0,
          col: 3,
        },
      ],
    },
  },
  {
    date: "2025-05-23",
    grid: [
      ["M", "O", "O", "N", "#"],
      ["A", "#", "R", "#", "E"],
      ["R", "I", "S", "E", "S"],
      ["S", "#", "E", "#", "N"],
      ["#", "H", "A", "L", "F"],
    ],
    clues: {
      across: [
        {
          number: 1,
          clue: "Earth's satellite",
          answer: "MOON",
          row: 0,
          col: 0,
        },
        {
          number: 5,
          clue: "Gets out of bed",
          answer: "RISES",
          row: 2,
          col: 0,
        },
        {
          number: 6,
          clue: "50%",
          answer: "HALF",
          row: 4,
          col: 1,
        },
      ],
      down: [
        {
          number: 1,
          clue: "Planets, e.g.",
          answer: "MARS",
          row: 0,
          col: 0,
        },
        {
          number: 2,
          clue: "Center of an apple",
          answer: "CORE",
          row: 0,
          col: 2,
        },
        {
          number: 3,
          clue: "Opposite of day",
          answer: "NIGHT",
          row: 0,
          col: 3,
        },
      ],
    },
  },
];

export function getMiniCrossword(dateStr: string): MiniCrossword {
  const found = MINI_CROSSWORD_PUZZLES.find((p) => p.date === dateStr);
  if (found) return found;
  const index = getDayNumber(dateStr) % MINI_CROSSWORD_PUZZLES.length;
  return MINI_CROSSWORD_PUZZLES[index];
}
