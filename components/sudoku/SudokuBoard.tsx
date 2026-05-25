"use client";

import { useSudokuStore } from "@/lib/stores/sudokuStore";
import {
  cellKey,
  isPeer,
  type NotesGrid,
} from "@/lib/sudokuLogic";
import { cn } from "@/lib/utils";

function PencilMarks({ marks }: { marks: number[] }) {
  if (marks.length === 0) return null;
  const grid = Array.from({ length: 9 }, (_, i) => i + 1);
  return (
    <div className="sudoku-pencil-grid">
      {grid.map((n) => (
        <span key={n} className="sudoku-pencil-mark">
          {marks.includes(n) ? n : ""}
        </span>
      ))}
    </div>
  );
}

function getCellClasses(opts: {
  isGiven: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  isConflict: boolean;
  isHint: boolean;
  winFlash: boolean;
}): string {
  const { isSelected, isHighlighted, isSameNumber, isConflict, isHint, winFlash } =
    opts;

  if (winFlash) return "sudoku-cell sudoku-cell-win-flash";
  if (isConflict) return "sudoku-cell sudoku-cell-conflict";
  if (isSelected) return "sudoku-cell sudoku-cell-selected";
  if (isSameNumber) return "sudoku-cell sudoku-cell-same-number";
  if (isHint) return "sudoku-cell sudoku-cell-hint";
  if (isHighlighted) return "sudoku-cell sudoku-cell-highlighted";
  return "sudoku-cell sudoku-cell-default";
}

export function SudokuBoard() {
  const board = useSudokuStore((s) => s.board);
  const notes = useSudokuStore((s) => s.notes);
  const givens = useSudokuStore((s) => s.givens);
  const hintCells = useSudokuStore((s) => s.hintCells);
  const selectedCell = useSudokuStore((s) => s.selectedCell);
  const winFlash = useSudokuStore((s) => s.winFlash);
  const paused = useSudokuStore((s) => s.paused);
  const gameStatus = useSudokuStore((s) => s.gameStatus);
  const conflicts = useSudokuStore((s) => s.getConflicts());
  const selectCell = useSudokuStore((s) => s.selectCell);
  const resume = useSudokuStore((s) => s.resume);

  const [selRow, selCol] = selectedCell ?? [-1, -1];
  const selectedValue =
    selRow >= 0 && selCol >= 0 ? board[selRow][selCol] : 0;

  return (
    <div className="relative mx-auto w-full max-w-[504px] px-4 md:px-0">
      <div
        className={cn("sudoku-grid", paused && "sudoku-grid-blurred")}
        role="grid"
        aria-label="Sudoku board"
      >
        {board.map((row, r) =>
          row.map((value, c) => {
            const isGiven = givens[r][c];
            const isSelected = r === selRow && c === selCol;
            const isHighlighted =
              selectedCell !== null && isPeer(selRow, selCol, r, c);
            const isSameNumber =
              selectedValue > 0 && value === selectedValue && !isSelected;
            const isConflict = conflicts.has(cellKey(r, c));
            const isHint = hintCells[r][c];
            const cellNotes: number[] = (notes as NotesGrid)[r][c];
            const showPencil = value === 0 && cellNotes.length > 0;

            return (
              <button
                key={cellKey(r, c)}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                disabled={gameStatus !== "playing"}
                onClick={() => {
                  if (paused) {
                    resume();
                    return;
                  }
                  selectCell(r, c);
                }}
                className={cn(
                  getCellClasses({
                    isGiven,
                    isSelected,
                    isHighlighted,
                    isSameNumber,
                    isConflict,
                    isHint,
                    winFlash,
                  }),
                  isGiven && "sudoku-cell-given",
                  !isGiven && value > 0 && "sudoku-cell-user",
                  c === 2 || c === 5 ? "sudoku-cell-box-right" : "",
                  r === 2 || r === 5 ? "sudoku-cell-box-bottom" : ""
                )}
              >
                {value > 0 ? (
                  <span className="sudoku-cell-value">{value}</span>
                ) : showPencil ? (
                  <PencilMarks marks={cellNotes} />
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {paused && gameStatus === "playing" && (
        <button
          type="button"
          className="sudoku-pause-overlay"
          onClick={resume}
          aria-label="Resume game"
        >
          <span className="text-lg font-semibold text-[#344861]">
            Tap to Resume
          </span>
        </button>
      )}
    </div>
  );
}
