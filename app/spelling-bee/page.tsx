"use client";

import { Suspense, useCallback, useEffect } from "react";
import { Delete, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NavBar } from "@/components/NavBar";
import { SpellingBeeRankBar } from "@/components/spelling-bee/SpellingBeeRankBar";
import { FoundWordsRow } from "@/components/spelling-bee/FoundWordsRow";
import { SpellingBeeInput } from "@/components/spelling-bee/SpellingBeeInput";
import { SpellingBeeHive } from "@/components/spelling-bee/SpellingBeeHive";
import { SpellingBeeToast } from "@/components/spelling-bee/SpellingBeeToast";
import { SpellingBeeConfetti } from "@/components/spelling-bee/SpellingBeeConfetti";
import { PuzzleLoadingSkeleton } from "@/components/PuzzleLoadingSkeleton";
import { useSpellingBeeStore } from "@/lib/stores/spellingBeeStore";
import { useGamePuzzle } from "@/hooks/useGamePuzzle";
import { cn } from "@/lib/utils";

function SpellingBeeContent() {
  const { loading, puzzleDate, puzzleData } = useGamePuzzle("spelling-bee");

  const {
    initialized,
    init,
    puzzle,
    foundWords,
    currentWord,
    outerOrder,
    score,
    maxScore,
    shaking,
    toast,
    pangramFlash,
    rankFlash,
    confetti,
    flyingWord,
    pointsPopup,
    shuffleSpin,
    addLetter,
    removeLetter,
    shuffle,
    submit,
  } = useSpellingBeeStore();

  useEffect(() => {
    if (loading) return;
    void init(puzzleDate, puzzleData);
  }, [init, puzzleDate, puzzleData, loading]);

  const handleKey = useCallback(
    (key: string) => {
      if (key === "Enter") submit();
      else if (key === "Backspace") removeLetter();
      else if (/^[a-zA-Z]$/.test(key)) addLetter(key);
    },
    [submit, removeLetter, addLetter]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") {
        e.preventDefault();
        handleKey("Enter");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleKey("Backspace");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  if (loading || !initialized || !puzzle) {
    return (
      <div className="min-h-screen bg-[#f7da21]">
        <NavBar />
        <PuzzleLoadingSkeleton />
      </div>
    );
  }

  const outerLetters = [...puzzle.outerLetters];

  return (
    <div className="relative min-h-screen bg-white">
      {pangramFlash && (
        <div className="pointer-events-none fixed inset-0 z-[200] animate-pulse bg-[#f7da21]/40" />
      )}
      <SpellingBeeConfetti active={confetti} />

      <NavBar />

      <div className="mx-auto w-full max-w-[540px] px-4 pb-10">
        <h1
          className="py-4 text-center text-[28px] font-bold text-[#121212]"
          style={{ fontFamily: "var(--font-karnak)" }}
        >
          Spelling Bee
        </h1>

        <SpellingBeeRankBar
          score={score}
          maxScore={maxScore}
          rankFlash={rankFlash}
        />

        <FoundWordsRow
          words={foundWords}
          puzzle={puzzle}
          newWord={flyingWord}
        />

        <AnimatePresence>
          {flyingWord && (
            <motion.div
              key={flyingWord}
              initial={{ opacity: 1, y: 0, x: 0 }}
              animate={{ opacity: 0, y: -80, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="pointer-events-none fixed left-1/2 top-[45%] z-40 -translate-x-1/2 text-2xl font-bold text-[#121212]"
            >
              {flyingWord}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {pointsPopup !== null && (
            <motion.span
              key={pointsPopup}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="pointer-events-none fixed left-1/2 top-[42%] z-40 -translate-x-1/2 text-lg font-bold text-[#6aaa64]"
            >
              +{pointsPopup}
            </motion.span>
          )}
        </AnimatePresence>

        <SpellingBeeInput
          word={currentWord}
          centerLetter={puzzle.centerLetter}
          shaking={shaking}
        />

        <SpellingBeeHive
          centerLetter={puzzle.centerLetter}
          outerLetters={outerLetters}
          outerOrder={outerOrder}
          shuffleSpin={shuffleSpin}
          onLetter={addLetter}
        />

        <div className="mt-4 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={shuffle}
            className="flex h-11 items-center gap-2 rounded-full border-2 border-[#121212] bg-white px-5 text-sm font-semibold text-[#121212] hover:bg-[#f4f3ee]"
          >
            <RotateCcw size={18} className={shuffleSpin ? "animate-spin" : ""} />
            Shuffle
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={removeLetter}
              aria-label="Delete"
              className="flex h-11 items-center gap-2 rounded-full border-2 border-[#121212] bg-white px-5 text-sm font-semibold text-[#121212] hover:bg-[#f4f3ee]"
            >
              <Delete size={18} />
              Delete
            </button>
            <button
              type="button"
              onClick={submit}
              className={cn(
                "h-11 rounded-full border-2 border-[#121212] px-6 text-sm font-semibold",
                currentWord.length >= 4
                  ? "bg-[#121212] text-white"
                  : "bg-white text-[#6b6b6b]"
              )}
            >
              Enter
            </button>
          </div>
        </div>
      </div>

      <SpellingBeeToast
        message={toast?.message ?? null}
        toastKey={toast?.key ?? 0}
        large={toast?.large}
      />
    </div>
  );
}

export default function SpellingBeePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          Loading...
        </div>
      }
    >
      <SpellingBeeContent />
    </Suspense>
  );
}
