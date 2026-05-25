"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { CellPos } from "@/lib/strandsLogic";
import { cellKey } from "@/lib/strandsLogic";
import { cn } from "@/lib/utils";

const GAP = 4;
const DESKTOP_CELL = 48;
const MOBILE_CELL = 42;

function cellCenter(cell: number, row: number, col: number) {
  const stride = cell + GAP;
  return {
    x: col * stride + cell / 2,
    y: row * stride + cell / 2,
  };
}

function StrandsPathLine({
  path,
  cellSize,
  rows,
  cols,
}: {
  path: CellPos[];
  cellSize: number;
  rows: number;
  cols: number;
}) {
  if (path.length < 2) return null;
  const points = path.map(({ row, col }) => {
    const { x, y } = cellCenter(cellSize, row, col);
    return `${x},${y}`;
  });
  const stride = cellSize + GAP;
  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 z-10"
      width={cols * stride - GAP}
      height={rows * stride - GAP}
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#5a594e"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface StrandsGridProps {
  grid: string[][];
  currentPath: CellPos[];
  foundCells: Record<string, "theme" | "spangram">;
  flashState: "none" | "success" | "error";
  shaking: boolean;
  hintHighlight: CellPos | null;
  winRipple: boolean;
  onStart: (cell: CellPos) => void;
  onExtend: (cell: CellPos) => void;
  onEndDrag: () => void;
  onSubmit: () => void;
  isCellFound: (row: number, col: number) => boolean;
  isDragging: boolean;
}

export function StrandsGrid({
  grid,
  currentPath,
  foundCells,
  flashState,
  shaking,
  hintHighlight,
  winRipple,
  onStart,
  onExtend,
  onEndDrag,
  onSubmit,
  isCellFound,
  isDragging,
}: StrandsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(DESKTOP_CELL);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setCellSize(mq.matches ? MOBILE_CELL : DESKTOP_CELL);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const stride = cellSize + GAP;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const getCellFromPoint = useCallback(
    (clientX: number, clientY: number): CellPos | null => {
      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) return null;

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;

      const col = Math.floor(x / stride);
      const row = Math.floor(y / stride);
      if (row < 0 || row >= rows || col < 0 || col >= cols) return null;

      const cellX = x - col * stride;
      const cellY = y - row * stride;
      if (cellX > cellSize || cellY > cellSize) return null;

      return { row, col };
    },
    [stride, rows, cols, cellSize]
  );

  useEffect(() => {
    const onUp = () => onEndDrag();
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchcancel", onUp);
    };
  }, [onEndDrag]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const cell = getCellFromPoint(touch.clientX, touch.clientY);
      if (cell) onExtend(cell);
    };

    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [isDragging, getCellFromPoint, onExtend]);

  return (
    <motion.div
      ref={gridRef}
      className={cn(
        "relative mx-auto select-none touch-none",
        shaking && "animate-[strands-shake_0.4s_ease-in-out]"
      )}
      style={{
        width: cols * stride - GAP,
        height: rows * stride - GAP,
        touchAction: "none",
      }}
      onMouseLeave={onEndDrag}
      onTouchEnd={onEndDrag}
    >
      <StrandsPathLine
        path={currentPath}
        cellSize={cellSize}
        rows={rows}
        cols={cols}
      />

      {grid.map((row, rowIndex) =>
        row.map((letter, colIndex) => {
          const key = cellKey(rowIndex, colIndex);
          const found = foundCells[key];
          const inPath = currentPath.some(
            (c) => c.row === rowIndex && c.col === colIndex
          );
          const isHint =
            hintHighlight?.row === rowIndex &&
            hintHighlight?.col === colIndex;

          let bg = "#f4f3ee";
          let textColor = "#121212";
          let fontWeight = 600;

          if (found === "spangram") {
            bg = "#f6d155";
            fontWeight = 700;
          } else if (found === "theme") {
            bg = "#a8d8ea";
            textColor = "#ffffff";
          } else if (inPath) {
            bg =
              flashState === "error"
                ? "#fca5a5"
                : flashState === "success"
                  ? "#86efac"
                  : "#d3d6da";
          }

          if (isHint) {
            bg = "#f7da21";
          }

          return (
            <button
              key={key}
              type="button"
              data-row={rowIndex}
              data-col={colIndex}
              disabled={!!found || winRipple}
              className={cn(
                "absolute flex items-center justify-center rounded-full font-semibold transition-[transform,background-color] duration-75",
                inPath && "scale-105",
                winRipple && "animate-[strands-ripple_1.2s_ease-out]",
                !found && "active:scale-95"
              )}
              style={{
                left: colIndex * stride,
                top: rowIndex * stride,
                width: cellSize,
                height: cellSize,
                fontSize: cellSize < 44 ? 15 : 17,
                backgroundColor: bg,
                color: textColor,
                fontWeight,
                touchAction: "manipulation",
                animationDelay: winRipple
                  ? `${(rowIndex * cols + colIndex) * 30}ms`
                  : undefined,
              }}
              onMouseDown={() => {
                if (!isCellFound(rowIndex, colIndex))
                  onStart({ row: rowIndex, col: colIndex });
              }}
              onMouseEnter={() => {
                if (isDragging) onExtend({ row: rowIndex, col: colIndex });
              }}
              onMouseUp={onEndDrag}
              onClick={() => {
                if (isCellFound(rowIndex, colIndex)) return;
                if (currentPath.length === 0) {
                  onStart({ row: rowIndex, col: colIndex });
                } else {
                  onExtend({ row: rowIndex, col: colIndex });
                }
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                if (inPath) onSubmit();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                onStart({ row: rowIndex, col: colIndex });
              }}
            >
              {letter}
            </button>
          );
        })
      )}
    </motion.div>
  );
}
