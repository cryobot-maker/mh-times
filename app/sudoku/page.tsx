"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HelpCircle, Pause } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { useToast } from "@/components/Toast";
import { SudokuBoard } from "@/components/sudoku/SudokuBoard";
import { SudokuNumberPad } from "@/components/sudoku/SudokuNumberPad";
import { SudokuConfetti } from "@/components/sudoku/SudokuConfetti";
import { HowToPlayModal } from "@/components/sudoku/SudokuModals";
import { SudokuStatsModal } from "@/components/sudoku/SudokuStatsModal";
import {
  DEFAULT_DIFFICULTY,
  parseDifficultyParam,
  type SudokuDifficulty,
} from "@/lib/sudokuData";
import { getTodayString } from "@/lib/gameUtils";
import { useSudokuStore } from "@/lib/stores/sudokuStore";
import { cn } from "@/lib/utils";

const DIFFICULTIES: SudokuDifficulty[] = ["easy", "medium", "hard"];

function SudokuContent() {
  const searchParams = useSearchParams();
  const showToast = useToast();

  const dateParam = searchParams.get("date");
  const difficultyParam = parseDifficultyParam(searchParams.get("difficulty"));
  const puzzleDate =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : getTodayString();
  const difficulty = difficultyParam ?? DEFAULT_DIFFICULTY;

  const {
    initialized,
    init,
    setDifficulty,
    gameStatus,
    paused,
    showStats,
    showHowToPlay,
    confetti,
    stats,
    elapsedMs,
    puzzleDate: storeDate,
    difficulty: storeDifficulty,
    togglePause,
    tickTimer,
    getTimerDisplay,
    moveSelection,
    inputDigit,
    eraseSelected,
    undo,
    setShowStats,
    setShowHowToPlay,
    markTutorialSeen,
    getShareText,
  } = useSudokuStore();

  const [timerDisplay, setTimerDisplay] = useState("00:00");
  const [shareLabel, setShareLabel] = useState("Share");

  useEffect(() => {
    init(puzzleDate, difficulty);
  }, [init, puzzleDate, difficulty]);

  useEffect(() => {
    setTimerDisplay(getTimerDisplay());
  }, [elapsedMs, getTimerDisplay]);

  useEffect(() => {
    const id = setInterval(() => {
      tickTimer();
      setTimerDisplay(useSudokuStore.getState().getTimerDisplay());
    }, 1000);
    return () => clearInterval(id);
  }, [tickTimer]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (gameStatus !== "playing") return;
      if (showStats || showHowToPlay) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === " " || e.key === "p" || e.key === "P") {
        e.preventDefault();
        togglePause();
        return;
      }

      if (paused) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          useSudokuStore.getState().resume();
        }
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        eraseSelected();
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveSelection(-1, 0);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveSelection(1, 0);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveSelection(0, -1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        moveSelection(0, 1);
        return;
      }

      const digit = parseInt(e.key, 10);
      if (digit >= 1 && digit <= 9) {
        e.preventDefault();
        inputDigit(digit);
      }
    },
    [
      gameStatus,
      showStats,
      showHowToPlay,
      paused,
      togglePause,
      eraseSelected,
      undo,
      moveSelection,
      inputDigit,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setShareLabel("Copied!");
      showToast("Copied!");
      setTimeout(() => setShareLabel("Share"), 2000);
    } catch {
      showToast("Could not copy");
    }
  };

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-[#6b6b6b]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <SudokuConfetti active={confetti} />

      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col pb-8 pt-0">
        {/* Title row */}
        <div className="relative flex h-12 shrink-0 items-center justify-center border-b border-[#e2e2e2] px-4">
          <button
            type="button"
            onClick={() => setShowHowToPlay(true)}
            className="absolute left-4 text-[#6b6b6b] hover:text-[#121212]"
            aria-label="How to play"
          >
            <HelpCircle size={22} strokeWidth={1.75} />
          </button>

          <h1
            className="text-[28px] font-bold text-[#121212]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Sudoku
          </h1>

          <div className="absolute right-2 flex gap-1">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold capitalize transition-colors",
                  storeDifficulty === d
                    ? "bg-[#89b4f7] text-white"
                    : "border border-[#e2e2e2] text-[#6b6b6b] hover:bg-[#f4f3ee]"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-3 py-3">
          <span className="text-sm text-[#6b6b6b]">{timerDisplay}</span>
          {gameStatus === "playing" && (
            <button
              type="button"
              onClick={togglePause}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#e2e2e2] text-[#6b6b6b] hover:bg-[#f4f3ee] hover:text-[#121212]"
              aria-label={paused ? "Resume" : "Pause"}
            >
              <Pause size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Board */}
        <div className="mb-6">
          <SudokuBoard />
        </div>

        {/* Number pad */}
        <SudokuNumberPad />
      </main>

      <HowToPlayModal
        open={showHowToPlay}
        onClose={() => {
          markTutorialSeen();
          setShowHowToPlay(false);
        }}
      />

      <SudokuStatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        elapsedMs={elapsedMs}
        difficulty={storeDifficulty}
        puzzleDate={storeDate}
        onShare={handleShare}
        shareLabel={shareLabel}
      />
    </div>
  );
}

export default function SudokuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-[#6b6b6b]">Loading...</p>
        </div>
      }
    >
      <SudokuContent />
    </Suspense>
  );
}
