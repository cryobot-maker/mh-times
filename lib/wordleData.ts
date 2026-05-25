import { getDayNumber } from "./gameUtils";
import validWordsJson from "../public/valid-words.json";

export const WORDLE_ANSWERS: string[] = [
  "CRANE",
  "STALE",
  "PLUMB",
  "CAULK",
  "JAZZY",
  "FJORD",
  "GNARLY",
  "BOXER",
  "QUICK",
  "FLANK",
  "WEAVE",
  "MIRTH",
  "LODGE",
  "PIVOT",
  "QUIRK",
  "ZESTY",
  "BLUFF",
  "GROAN",
  "TWIRL",
  "PERCH",
  "KNACK",
  "STOMP",
  "BLAZE",
  "CRISP",
  "DOWDY",
  "EXPEL",
  "FROWN",
  "GLOOM",
  "HASTE",
  "INFER",
];

/** All 5-letter guess words from public/valid-words.json (tabatkins/wordle-list) */
export const VALID_WORDS: string[] = (validWordsJson as string[]).map((w) =>
  w.toUpperCase()
);

export function getWordleAnswer(dateStr: string): string {
  const dayIndex = getDayNumber(dateStr);
  return WORDLE_ANSWERS[dayIndex % WORDLE_ANSWERS.length];
}

let validWordsSet: Set<string> | null = null;

export function loadValidWordsSet(): Promise<Set<string>> {
  if (!validWordsSet) {
    validWordsSet = new Set(VALID_WORDS);
  }
  return Promise.resolve(validWordsSet);
}
