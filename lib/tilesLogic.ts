import type { TilesPuzzle } from "./tilesData";

export interface TileItem {
  id: string;
  label: string;
  pairId: number;
  side: "a" | "b";
  clearing?: boolean;
  revealLabel?: string;
}

export interface GridSlot {
  slotIndex: number;
  tile: TileItem | null;
}

export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildTileItems(puzzle: TilesPuzzle): TileItem[] {
  const items: TileItem[] = [];
  puzzle.pairs.forEach((pair, pairId) => {
    items.push({
      id: `${pairId}-a`,
      label: pair.a,
      pairId,
      side: "a",
    });
    items.push({
      id: `${pairId}-b`,
      label: pair.b,
      pairId,
      side: "b",
    });
  });
  return items;
}

export function createShuffledSlots(puzzle: TilesPuzzle): GridSlot[] {
  const shuffled = fisherYatesShuffle(buildTileItems(puzzle));
  return shuffled.map((tile, slotIndex) => ({
    slotIndex,
    tile,
  }));
}

export function slotsFromOrder(
  puzzle: TilesPuzzle,
  order: (TileItem | null)[]
): GridSlot[] {
  return order.map((tile, slotIndex) => ({ slotIndex, tile }));
}

export function serializeSlots(slots: GridSlot[]): (TileItem | null)[] {
  return slots.map((s) => s.tile);
}

export function areMatchingPair(a: TileItem, b: TileItem): boolean {
  return a.pairId === b.pairId && a.id !== b.id;
}

export function getPartnerLabel(puzzle: TilesPuzzle, tile: TileItem): string {
  const pair = puzzle.pairs[tile.pairId];
  return tile.side === "a" ? pair.b : pair.a;
}

export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShareDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
