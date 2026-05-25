export type GameType =
  | "wordle"
  | "connections"
  | "spelling-bee"
  | "strands"
  | "letter-boxed"
  | "mini"
  | "tiles";

export type PuzzleGameSlug = GameType;

export type WordleLetterStatus = "correct" | "present" | "absent";

export interface WordleState {
  guesses: string[];
  evaluations: WordleLetterStatus[][];
  currentGuess: string;
  gameStatus: "playing" | "won" | "lost";
  puzzleDate: string;
}

export interface ConnectionsState {
  selectedTiles: number[];
  selectedIndices?: number[];
  words?: string[];
  solvedGroups?: {
    name: string;
    color: string;
    words: string[];
  }[];
  solveOrder?: string[];
  mistakes: number;
  gameStatus: "playing" | "won" | "lost";
  puzzleDate: string;
}

export interface SpellingBeeState {
  foundWords: string[];
  currentWord: string;
  score: number;
  pangrams: string[];
  gameStatus: "playing" | "completed";
  puzzleDate: string;
}

export interface StrandsState {
  foundWords: string[];
  spangramFound: boolean;
  themeWordsFound: string[];
  currentPath: number[];
  gameStatus: "playing" | "won";
  puzzleDate: string;
}

export interface LetterBoxedState {
  foundWords: string[];
  currentWord: string;
  sidesUsed: boolean[];
  gameStatus: "playing" | "won";
  puzzleDate: string;
}

export interface DailyPuzzle {
  id: string;
  game: GameType;
  puzzle_date: string;
  puzzle_data: Record<string, unknown>;
}
