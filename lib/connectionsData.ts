import { getDayNumber } from "./gameUtils";

export type ConnectionsColor = "yellow" | "green" | "blue" | "purple";

export interface ConnectionsCategory {
  name: string;
  color: ConnectionsColor;
  words: [string, string, string, string];
}

export interface ConnectionsPuzzle {
  date: string;
  number: number;
  categories: ConnectionsCategory[];
}

export const CONNECTIONS_PUZZLES: ConnectionsPuzzle[] = [
  {
    date: "2025-05-25",
    number: 1078,
    categories: [
      {
        name: "FARM FIXTURES",
        color: "yellow",
        words: ["BARN", "FENCE", "SILO", "TROUGH"],
      },
      {
        name: "LABOR PROTEST ACTIONS",
        color: "green",
        words: ["BOYCOTT", "MARCH", "PICKET", "STRIKE"],
      },
      {
        name: "OBJECTS USED IN RITUAL PERFORMANCES",
        color: "blue",
        words: ["BELL", "CANDLE", "INCENSE", "RATTLE"],
      },
      {
        name: "POSSESSIVE ADJECTIVES PLUS A LETTER",
        color: "purple",
        words: ["HERS", "HIST", "OURN", "THEYS"],
      },
    ],
  },
  {
    date: "2025-05-24",
    number: 1077,
    categories: [
      {
        name: "TYPES OF CHEESE",
        color: "yellow",
        words: ["BRIE", "GOUDA", "HAVARTI", "MUENSTER"],
      },
      {
        name: "POKER TERMS",
        color: "green",
        words: ["BLUFF", "CALL", "FOLD", "RAISE"],
      },
      {
        name: "OLD TESTAMENT BOOKS",
        color: "blue",
        words: ["AMOS", "HOSEA", "MICAH", "RUTH"],
      },
      {
        name: "___ LIGHT",
        color: "purple",
        words: ["FLASH", "MOON", "SPOT", "STAR"],
      },
    ],
  },
  {
    date: "2025-05-23",
    number: 1076,
    categories: [
      {
        name: "RUNNING TERMS",
        color: "yellow",
        words: ["CADENCE", "FARTLEK", "PACE", "STRIDE"],
      },
      {
        name: "JAZZ LEGENDS",
        color: "green",
        words: ["COLTRANE", "DAVIS", "ELLINGTON", "PARKER"],
      },
      {
        name: "VOLCANIC FEATURES",
        color: "blue",
        words: ["CALDERA", "FUMAROLE", "LAVA", "MAGMA"],
      },
      {
        name: "WORDS AFTER 'DOUBLE'",
        color: "purple",
        words: ["AGENT", "DUTCH", "TAKE", "TALK"],
      },
    ],
  },
  {
    date: "2025-05-22",
    number: 1075,
    categories: [
      {
        name: "BREAKFAST FOODS",
        color: "yellow",
        words: ["BAGEL", "MUFFIN", "PANCAKE", "WAFFLE"],
      },
      {
        name: "GREEK LETTERS",
        color: "green",
        words: ["DELTA", "OMEGA", "SIGMA", "THETA"],
      },
      {
        name: "GOLF TERMS",
        color: "blue",
        words: ["BIRDIE", "BOGEY", "EAGLE", "MULLIGAN"],
      },
      {
        name: "___ FISH",
        color: "purple",
        words: ["BLOW", "CAT", "SWORD", "STAR"],
      },
    ],
  },
  {
    date: "2025-05-21",
    number: 1074,
    categories: [
      {
        name: "SHADES OF RED",
        color: "yellow",
        words: ["BURGUNDY", "CRIMSON", "SCARLET", "VERMILLION"],
      },
      {
        name: "MUSICAL TIME SIGNATURES",
        color: "green",
        words: ["COMMON", "CUT", "TRIPLE", "WALTZ"],
      },
      {
        name: "THINGS THAT CAN BE 'LOADED'",
        color: "blue",
        words: ["DICE", "GUN", "POTATO", "QUESTION"],
      },
      {
        name: "BOWIE SONGS (FIRST WORD)",
        color: "purple",
        words: ["CHINA", "GOLDEN", "HEROES", "ZIGGY"],
      },
    ],
  },
  {
    date: "2025-05-20",
    number: 1073,
    categories: [
      {
        name: "OFFICE SUPPLIES",
        color: "yellow",
        words: ["BINDER", "CLIP", "STAPLER", "TONER"],
      },
      {
        name: "PIZZA TOPPINGS",
        color: "green",
        words: ["ANCHOVY", "ARUGULA", "PROSCIUTTO", "TRUFFLE"],
      },
      {
        name: "FRENCH WORDS USED IN ENGLISH",
        color: "blue",
        words: ["BALLET", "CAFE", "GENRE", "NAIVE"],
      },
      {
        name: "THINGS WITH 'RINGS'",
        color: "purple",
        words: ["CIRCUS", "PHONE", "SATURN", "TREE"],
      },
    ],
  },
  {
    date: "2025-05-19",
    number: 1072,
    categories: [
      {
        name: "NAIL POLISH SHADES",
        color: "yellow",
        words: ["BLUSH", "CORAL", "NUDE", "ROSE"],
      },
      {
        name: "FAMOUS DUOS (ONE NAME)",
        color: "green",
        words: ["BONNIE", "LENNON", "ROMEO", "WATSON"],
      },
      {
        name: "WORDS BEFORE 'BOARD'",
        color: "blue",
        words: ["CARD", "DART", "SKATE", "SNOW"],
      },
      {
        name: "TYPES OF BONDS",
        color: "purple",
        words: ["BAIL", "COVALENT", "JAMES", "PEPTIDE"],
      },
    ],
  },
];

export const CONNECTIONS_COLOR_BG: Record<ConnectionsColor, string> = {
  yellow: "#f9df6d",
  green: "#a0c35a",
  blue: "#b4d8fb",
  purple: "#ba81c5",
};

export const CONNECTIONS_COLOR_EMOJI: Record<ConnectionsColor, string> = {
  yellow: "🟨",
  green: "🟩",
  blue: "🟦",
  purple: "🟪",
};

export function getConnectionsPuzzle(dateStr: string): ConnectionsPuzzle {
  const found = CONNECTIONS_PUZZLES.find((p) => p.date === dateStr);
  if (found) return found;
  const index = getDayNumber(dateStr) % CONNECTIONS_PUZZLES.length;
  return CONNECTIONS_PUZZLES[index];
}

export function getAllWords(puzzle: ConnectionsPuzzle): string[] {
  return puzzle.categories.flatMap((c) => c.words);
}
