export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayNumber(dateStr: string): number {
  const date = new Date(dateStr + "T00:00:00");
  const start = new Date("2021-01-01T00:00:00");
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Days elapsed since Jan 1, 2025 — used for daily puzzle rotation */
export function getDaysSinceJan12025(dateStr: string): number {
  const date = new Date(dateStr + "T00:00:00");
  const start = new Date("2025-01-01T00:00:00");
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function saveGameState<T>(gameKey: string, state: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(gameKey, JSON.stringify(state));
}

export function loadGameState<T>(gameKey: string): T | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(gameKey);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as T;
  } catch {
    return null;
  }
}
