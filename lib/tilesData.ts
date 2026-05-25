import { getDayNumber } from "./gameUtils";

export interface TilesPair {
  a: string;
  b: string;
}

export interface TilesPuzzle {
  date: string;
  number: number;
  theme: string;
  maxMoves: number;
  pairs: TilesPair[];
}

export const TILES_PUZZLES: TilesPuzzle[] = [
  {
    date: "2025-05-25",
    number: 312,
    theme: "Animals & Their Sounds",
    maxMoves: 20,
    pairs: [
      { a: "CAT", b: "MEOW" },
      { a: "DOG", b: "BARK" },
      { a: "COW", b: "MOO" },
      { a: "DUCK", b: "QUACK" },
      { a: "LION", b: "ROAR" },
      { a: "FROG", b: "CROAK" },
      { a: "SNAKE", b: "HISS" },
      { a: "BEE", b: "BUZZ" },
    ],
  },
  {
    date: "2025-05-24",
    number: 311,
    theme: "Capitals & Countries",
    maxMoves: 20,
    pairs: [
      { a: "PARIS", b: "FRANCE" },
      { a: "TOKYO", b: "JAPAN" },
      { a: "ROME", b: "ITALY" },
      { a: "OSLO", b: "NORWAY" },
      { a: "LIMA", b: "PERU" },
      { a: "CAIRO", b: "EGYPT" },
      { a: "SEOUL", b: "KOREA" },
      { a: "ATHENS", b: "GREECE" },
    ],
  },
  {
    date: "2025-05-23",
    number: 310,
    theme: "Famous Pairs",
    maxMoves: 20,
    pairs: [
      { a: "ROMEO", b: "JULIET" },
      { a: "TOM", b: "JERRY" },
      { a: "SALT", b: "PEPPER" },
      { a: "PEANUT", b: "BUTTER" },
      { a: "THUNDER", b: "LIGHTNING" },
      { a: "DAY", b: "NIGHT" },
      { a: "BREAD", b: "BUTTER" },
      { a: "CUP", b: "SAUCER" },
    ],
  },
  {
    date: "2025-05-22",
    number: 309,
    theme: "Elements & Symbols",
    maxMoves: 22,
    pairs: [
      { a: "GOLD", b: "AU" },
      { a: "SILVER", b: "AG" },
      { a: "IRON", b: "FE" },
      { a: "LEAD", b: "PB" },
      { a: "SODIUM", b: "NA" },
      { a: "POTASSIUM", b: "K" },
      { a: "MERCURY", b: "HG" },
      { a: "COPPER", b: "CU" },
    ],
  },
  {
    date: "2025-05-21",
    number: 308,
    theme: "Movies & Directors",
    maxMoves: 20,
    pairs: [
      { a: "JAWS", b: "SPIELBERG" },
      { a: "ALIEN", b: "SCOTT" },
      { a: "PSYCHO", b: "HITCHCOCK" },
      { a: "ROCKY", b: "AVILDSEN" },
      { a: "FARGO", b: "COENS" },
      { a: "CHINATOWN", b: "POLANSKI" },
      { a: "GOODFELLAS", b: "SCORSESE" },
      { a: "AMADEUS", b: "FORMAN" },
    ],
  },
  {
    date: "2025-05-20",
    number: 307,
    theme: "Planets & Moons",
    maxMoves: 20,
    pairs: [
      { a: "EARTH", b: "LUNA" },
      { a: "MARS", b: "PHOBOS" },
      { a: "JUPITER", b: "IO" },
      { a: "SATURN", b: "TITAN" },
      { a: "URANUS", b: "MIRANDA" },
      { a: "NEPTUNE", b: "TRITON" },
      { a: "PLUTO", b: "CHARON" },
      { a: "VENUS", b: "APHRODITE" },
    ],
  },
  {
    date: "2025-05-19",
    number: 306,
    theme: "Inventors & Inventions",
    maxMoves: 20,
    pairs: [
      { a: "EDISON", b: "LIGHTBULB" },
      { a: "BELL", b: "TELEPHONE" },
      { a: "WRIGHT", b: "AIRPLANE" },
      { a: "TESLA", b: "AC MOTOR" },
      { a: "DARWIN", b: "EVOLUTION" },
      { a: "CURIE", b: "RADIUM" },
      { a: "TURING", b: "COMPUTER" },
      { a: "GUTENBERG", b: "PRESS" },
    ],
  },
];

export const TILES_TUTORIAL_KEY = "tiles-tutorial-seen";
export const TOTAL_PAIRS = 8;

export function getTilesPuzzle(dateStr: string): TilesPuzzle {
  const found = TILES_PUZZLES.find((p) => p.date === dateStr);
  if (found) return found;
  const index = getDayNumber(dateStr) % TILES_PUZZLES.length;
  return { ...TILES_PUZZLES[index], date: dateStr };
}
