"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NavBar } from "@/components/NavBar";
import { StrandsGrid } from "@/components/strands/StrandsGrid";
import { StatsModal } from "@/components/StatsModal";
import { PuzzleLoadingSkeleton } from "@/components/PuzzleLoadingSkeleton";
import { buildShareGrid } from "@/lib/strandsLogic";
import { useStrandsStore } from "@/lib/stores/strandsStore";
import { useGamePuzzle } from "@/hooks/useGamePuzzle";
import { cn } from "@/lib/utils";

function StrandsToast({
  message,
  toastKey,
}: {
  message: string | null;
  toastKey: number;
}) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={toastKey}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded bg-[#121212] px-4 py-2 text-sm font-bold text-white"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StrandsContent() {
  const { loading, puzzleDate, puzzleData } = useGamePuzzle("strands");

  const {
    initialized,
    init,
    puzzle,
    foundThemeWords,
    spangramFound,
    foundCells,
    currentPath,
    isDragging,
    flashState,
    shaking,
    hintHighlight,
    winRipple,
    gameStatus,
    hintsUsed,
    showStats,
    stats,
    toast,
    startPath,
    extendPath,
    endDrag,
    clearPath,
    submitPath,
    useHint,
    setShowStats,
    showToast,
    getHintsAvailable,
    isCellFound,
  } = useStrandsStore();

  const [shareLabel, setShareLabel] = useState("Share");

  useEffect(() => {
    if (loading) return;
    void init(puzzleDate, puzzleData);
  }, [init, puzzleDate, puzzleData, loading]);

  const hintsAvailable = getHintsAvailable();

  const handleShare = async () => {
    const text = buildShareGrid(foundThemeWords, spangramFound, hintsUsed);
    try {
      await navigator.clipboard.writeText(text);
      setShareLabel("Copied!");
      showToast("Copied!");
      setTimeout(() => setShareLabel("Share"), 2000);
    } catch {
      showToast("Could not copy");
    }
  };

  if (loading || !initialized || !puzzle) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <PuzzleLoadingSkeleton />
      </div>
    );
  }

  const wordsFound =
    foundThemeWords.length + (spangramFound ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="mx-auto w-full max-w-[600px] px-4 pb-10">
        <h1
          className="pt-4 text-center text-[28px] font-bold text-[#121212]"
          style={{ fontFamily: "var(--font-karnak)" }}
        >
          Strands
        </h1>
        <p
          className="mt-1 text-center text-xl italic text-[#121212]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {puzzle.theme}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-[#e2e2e2] px-3 py-1.5 text-sm text-[#121212]">
            💡 Hints: {hintsAvailable}
          </span>
          {hintsAvailable > 0 && gameStatus === "playing" && (
            <button
              type="button"
              onClick={useHint}
              className="rounded-full border border-[#121212] px-3 py-1.5 text-sm font-semibold hover:bg-[#f4f3ee]"
            >
              Use Hint
            </button>
          )}
          <span className="text-xs text-[#6b6b6b]">#{puzzle.number}</span>
        </div>

        {spangramFound && (
          <p className="mt-4 text-center text-[22px] font-bold text-[#121212]">
            ✨ {puzzle.theme}
          </p>
        )}

        <div className="mt-4 flex min-h-[36px] flex-wrap justify-center gap-2">
          <AnimatePresence>
            {foundThemeWords.map((word) => (
              <motion.span
                key={word}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="rounded-full bg-[#a8d8ea] px-4 py-1.5 text-[13px] font-semibold text-white"
              >
                {word}
              </motion.span>
            ))}
            {spangramFound && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="rounded-full bg-[#f6d155] px-4 py-1.5 text-[13px] font-bold text-[#121212]"
              >
                {puzzle.spangram}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mt-6 flex justify-center">
          <StrandsGrid
            grid={puzzle.grid}
            currentPath={currentPath}
            foundCells={foundCells}
            flashState={flashState}
            shaking={shaking}
            hintHighlight={hintHighlight}
            winRipple={winRipple}
            onStart={startPath}
            onExtend={extendPath}
            onEndDrag={endDrag}
            onSubmit={submitPath}
            isCellFound={isCellFound}
            isDragging={isDragging}
          />
        </div>

        {currentPath.length > 0 && gameStatus === "playing" && (
          <p className="mt-3 text-center text-2xl font-bold tracking-[0.1em] text-[#121212]">
            {currentPath
              .map(({ row, col }) => puzzle.grid[row][col])
              .join("")}
          </p>
        )}

        {gameStatus === "playing" && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={clearPath}
              className="h-11 rounded-full border-2 border-[#121212] px-5 text-sm font-semibold hover:bg-[#f4f3ee]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={submitPath}
              disabled={currentPath.length < 4}
              className={cn(
                "h-11 rounded-full border-2 border-[#121212] px-6 text-sm font-semibold",
                currentPath.length >= 4
                  ? "bg-[#121212] text-white"
                  : "text-[#6b6b6b]"
              )}
            >
              Submit
            </button>
          </div>
        )}

        {gameStatus === "won" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex gap-1 text-xl">
              {foundThemeWords.map(() => "🟦")}
              {spangramFound && "🟨"}
            </div>
            <Link
              href="/"
              className="rounded-full border-2 border-[#121212] bg-[#121212] px-8 py-2.5 text-sm font-semibold text-white"
            >
              Next Puzzle
            </Link>
          </div>
        )}
      </div>

      <StrandsToast message={toast?.message ?? null} toastKey={toast?.key ?? 0} />

      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        gameName="Strands"
        stats={{
          played: stats.played,
          winPct:
            stats.played > 0
              ? Math.round((stats.wins / stats.played) * 100)
              : 0,
          currentStreak: stats.currentStreak,
          maxStreak: stats.maxStreak,
        }}
        showShare
        onShare={handleShare}
        shareLabel={shareLabel}
        extraContent={
          <p className="mb-4 text-center text-sm text-[#6b6b6b]">
            Words found: {wordsFound} · Hints used: {hintsUsed}
          </p>
        }
      />
    </div>
  );
}

export default function StrandsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          Loading...
        </div>
      }
    >
      <StrandsContent />
    </Suspense>
  );
}
