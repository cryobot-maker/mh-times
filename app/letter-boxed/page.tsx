"use client";

import { Suspense, useCallback, useEffect } from "react";
import { BarChart2 } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { LetterBoxedBox } from "@/components/letter-boxed/LetterBoxedBox";
import { LetterBoxedStatsModal } from "@/components/letter-boxed/LetterBoxedModals";
import { PuzzleLoadingSkeleton } from "@/components/PuzzleLoadingSkeleton";
import { SpellingBeeConfetti } from "@/components/spelling-bee/SpellingBeeConfetti";
import { pathToWord } from "@/lib/letterBoxedLogic";
import { useLetterBoxedStore } from "@/lib/stores/letterBoxedStore";
import { useGamePuzzle } from "@/hooks/useGamePuzzle";
import { cn } from "@/lib/utils";

function WordPills({ words }: { words: string[] }) {
  if (words.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-2">
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="flex items-center gap-1">
          {i > 0 && (
            <span className="text-xs text-[#6b6b6b]" aria-hidden>
              →
            </span>
          )}
          <span className="rounded-full border border-[#e2e2e2] px-3 py-1 text-[13px] uppercase text-[#121212]">
            {word.split("").map((ch, j) => (
              <span
                key={j}
                className={j === word.length - 1 ? "font-bold" : undefined}
              >
                {ch}
              </span>
            ))}
          </span>
        </span>
      ))}
    </div>
  );
}

function LetterBoxedContent() {
  const { loading, puzzleDate, puzzleData } = useGamePuzzle("letter-boxed");

  const {
    initialized,
    init,
    puzzle,
    completedWords,
    completedPaths,
    currentPath,
    gameStatus,
    flashKey,
    confetti,
    showStats,
    stats,
    selectLetter,
    deleteLetter,
    submitWord,
    setShowStats,
  } = useLetterBoxedStore();

  useEffect(() => {
    if (loading) return;
    void init(puzzleDate, puzzleData);
  }, [init, puzzleDate, puzzleData, loading]);

  const currentWord =
    puzzle && currentPath.length > 0
      ? pathToWord(puzzle.sides, currentPath)
      : "";

  const canSubmit = currentPath.length >= 3;

  const handleKey = useCallback(
    (key: string) => {
      if (gameStatus === "won") return;
      if (key === "Enter") submitWord();
      else if (key === "Backspace") deleteLetter();
    },
    [gameStatus, submitWord, deleteLetter]
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
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  if (loading || !initialized || !puzzle) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <PuzzleLoadingSkeleton />
      </div>
    );
  }

  const wordCount = completedWords.length;
  const atPar = wordCount <= puzzle.par;
  const showWin = gameStatus === "won";

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <SpellingBeeConfetti active={confetti} />
      <LetterBoxedStatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
      />

      <main className="mx-auto max-w-[500px] px-4 pb-12 pt-6">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-[#121212] md:text-[28px]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Letter Boxed
            </h1>
            <p className="mt-1 text-xs text-[#6b6b6b]">No. {puzzle.number}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowStats(true)}
            aria-label="Statistics"
            className="mt-1 text-[#6b6b6b] hover:text-[#121212]"
          >
            <BarChart2 size={22} strokeWidth={1.5} />
          </button>
        </div>

        {showWin ? (
          <div className="mb-8 text-center">
            <p
              className="text-3xl font-bold text-[#121212] md:text-4xl"
              style={{ fontFamily: "var(--font-karnak)" }}
            >
              Solved in {wordCount} {wordCount === 1 ? "word" : "words"}!
            </p>
            <p className="mt-3 text-sm text-[#6b6b6b]">
              Today&apos;s par: {puzzle.par} words
              {atPar && (
                <span className="mt-1 block font-bold text-[#6aaa64]">
                  At or under par — nice!
                </span>
              )}
            </p>
          </div>
        ) : (
          <>
            <LetterBoxedBox
              puzzle={puzzle}
              currentPath={currentPath}
              completedPaths={completedPaths}
              gameStatus={gameStatus}
              flashKey={flashKey}
              onSelect={selectLetter}
            />

            <p
              className="mt-6 min-h-[36px] text-center text-[28px] font-bold uppercase tracking-[0.15em] text-[#121212]"
              aria-live="polite"
            >
              {currentWord || "\u00a0"}
            </p>

            <WordPills words={completedWords} />

            <div className="mt-8 flex justify-center gap-3">
              <button
                type="button"
                onClick={deleteLetter}
                disabled={currentPath.length === 0}
                className={cn(
                  "rounded-full border border-[#e2e2e2] px-6 py-2 text-sm font-bold text-[#121212] transition-opacity",
                  currentPath.length === 0 && "opacity-40"
                )}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={submitWord}
                disabled={!canSubmit}
                className={cn(
                  "rounded-full px-6 py-2 text-sm font-bold transition-colors",
                  canSubmit
                    ? "bg-[#121212] text-white"
                    : "border border-[#e2e2e2] bg-[#f4f3ee] text-[#6b6b6b]"
                )}
              >
                Enter
              </button>
            </div>
          </>
        )}

        {showWin && (
          <>
            <LetterBoxedBox
              puzzle={puzzle}
              currentPath={[]}
              completedPaths={completedPaths}
              gameStatus={gameStatus}
              flashKey={null}
              onSelect={() => {}}
            />
            <WordPills words={completedWords} />
          </>
        )}
      </main>
    </div>
  );
}

export default function LetterBoxedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-[#6b6b6b]">Loading...</p>
        </div>
      }
    >
      <LetterBoxedContent />
    </Suspense>
  );
}
