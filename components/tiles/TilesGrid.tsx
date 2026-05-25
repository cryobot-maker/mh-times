"use client";

import { cn } from "@/lib/utils";
import type { GridSlot } from "@/lib/tilesLogic";

interface TilesGridProps {
  slots: GridSlot[];
  selectedId: string | null;
  shakingIds: string[];
  shuffling: boolean;
  dimmed: boolean;
  onSelect: (tileId: string) => void;
}

export function TilesGrid({
  slots,
  selectedId,
  shakingIds,
  shuffling,
  dimmed,
  onSelect,
}: TilesGridProps) {
  return (
    <div
      className={cn(
        "tiles-grid mx-auto w-full max-w-[calc(100vw-32px)] transition-opacity duration-300",
        dimmed && "opacity-40"
      )}
    >
      {slots.map((slot) => {
        const tile = slot.tile;
        const isEmpty = !tile;

        if (isEmpty) {
          return (
            <div
              key={`slot-${slot.slotIndex}`}
              className="tiles-cell tiles-cell-empty"
              aria-hidden
            />
          );
        }

        const isSelected = selectedId === tile.id;
        const isShaking = shakingIds.includes(tile.id);
        const isClearing = tile.clearing;
        const displayLabel = tile.revealLabel ?? tile.label;
        const longLabel = displayLabel.length > 7;

        return (
          <button
            key={tile.id}
            type="button"
            disabled={isClearing || dimmed}
            onClick={() => onSelect(tile.id)}
            className={cn(
              "tiles-cell tiles-tile",
              isSelected && "tiles-tile-selected",
              isShaking && "tiles-tile-shake",
              isClearing && "tiles-tile-clearing",
              shuffling && "tiles-tile-shuffle",
              tile.revealLabel && "tiles-tile-reveal"
            )}
            aria-label={displayLabel}
            aria-pressed={isSelected}
          >
            <span
              className={cn(
                "tiles-tile-label px-1 leading-tight",
                longLabel && "text-[11px]",
                tile.revealLabel && "text-[12px]"
              )}
            >
              {displayLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
