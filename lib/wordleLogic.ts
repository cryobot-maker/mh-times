import type { WordleLetterStatus } from "@/types";

export function evaluateGuess(
  answer: string,
  guess: string
): WordleLetterStatus[] {
  const result: WordleLetterStatus[] = Array(5).fill("absent");
  const answerChars = answer.split("");
  const guessChars = guess.split("");
  const answerUsed = Array(5).fill(false);

  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === answerChars[i]) {
      result[i] = "correct";
      answerUsed[i] = true;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const letter = guessChars[i];
    const idx = answerChars.findIndex(
      (ch, j) => ch === letter && !answerUsed[j]
    );
    if (idx !== -1) {
      result[i] = "present";
      answerUsed[idx] = true;
    }
  }

  return result;
}

const STATUS_PRIORITY: Record<WordleLetterStatus, number> = {
  correct: 3,
  present: 2,
  absent: 1,
};

export function updateKeyboardStatus(
  current: Record<string, WordleLetterStatus>,
  guess: string,
  evaluation: WordleLetterStatus[]
): Record<string, WordleLetterStatus> {
  const next = { ...current };
  for (let i = 0; i < 5; i++) {
    const letter = guess[i];
    const status = evaluation[i];
    const existing = next[letter];
    if (
      !existing ||
      STATUS_PRIORITY[status] > STATUS_PRIORITY[existing]
    ) {
      next[letter] = status;
    }
  }
  return next;
}

export function validateHardMode(
  guess: string,
  guesses: string[],
  evaluations: WordleLetterStatus[][]
): boolean {
  for (let r = 0; r < guesses.length; r++) {
    const prevGuess = guesses[r];
    const prevEval = evaluations[r];
    for (let i = 0; i < 5; i++) {
      if (prevEval[i] === "correct" && guess[i] !== prevGuess[i]) {
        return false;
      }
    }
    const mustInclude = new Set<string>();
    for (let i = 0; i < 5; i++) {
      if (prevEval[i] === "present") {
        mustInclude.add(prevGuess[i]);
      }
    }
    if (Array.from(mustInclude).some((letter) => !guess.includes(letter))) {
      return false;
    }
  }
  return true;
}

export function evaluationsToEmoji(
  evaluations: WordleLetterStatus[][]
): string {
  const map: Record<WordleLetterStatus, string> = {
    correct: "🟩",
    present: "🟨",
    absent: "⬛",
  };
  return evaluations
    .map((row) => row.map((s) => map[s]).join(""))
    .join("\n");
}

export const WIN_MESSAGES = [
  "Genius!",
  "Magnificent!",
  "Impressive!",
  "Splendid!",
  "Great!",
  "Phew!",
];

export function getWinMessage(guessIndex: number): string {
  return WIN_MESSAGES[guessIndex] ?? "Phew!";
}

export function getCountdownToMidnightET(): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );

  const h = parseInt(parts.hour, 10);
  const m = parseInt(parts.minute, 10);
  const s = parseInt(parts.second, 10);
  const elapsed = h * 3600 + m * 60 + s;
  const remaining = 86400 - elapsed;

  return {
    hours: Math.floor(remaining / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
  };
}

export function formatCountdown(countdown: {
  hours: number;
  minutes: number;
  seconds: number;
}): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`;
}
