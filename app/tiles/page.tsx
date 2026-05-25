"use client";

import { Suspense, useCallback, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Toast, useToast } from "@/components/Toast";
import { PuzzleLoadingSkeleton } from "@/components/PuzzleLoadingSkeleton";
import { SpellingBeeConfetti } from "@/components/spelling-bee/SpellingBeeConfetti";
import { TilesGrid } from "@/components/tiles/TilesGrid";
import {
  TilesHowToPlayModal,
  TilesStatsModal,
} from "@/components/tiles/TilesModals";
import { useGamePuzzle } from "@/hooks/useGamePuzzle";
import { TOTAL_PAIRS } from "@/lib/tilesData";
import { useTilesStore } from "@/lib/stores/tilesStore";
import { cn } from "@/lib/utils";

function TilesContent() {
  const { loading, puzzleDate, puzzleData } = useGamePuzzle("tiles");
  const showToast = useToast();

  const {
    initialized,
    init,
    puzzle,
    slots,
    selectedId,
    matchedPairs,
    movesUsed,
    maxMoves,
    gameStatus,
    shakingIds,
    shuffling,
    revealed,
    showStats,
    showHowToPlay,
    confetti,
    showWinBanner,
    stats,
    selectTile,
    shuffleBoard,
    revealAnswers,
    tryAgain,
    setShowStats,
    setShowHowToPlay,
    markTutorialSeen,
    getShareText,
  } = useTilesStore();

  useEffect(() => {
    if (loading) return;
    init(puzzleDate, puzzleData);
  }, [init, puzzleDate, puzzleData, loading]);

  const handleCloseHowTo = useCallback(() => {
    markTutorialSeen();
    setShowHowToPlay(false);
  }, [markTutorialSeen, setShowHowToPlay]);

  const handleOpenHelp = useCallback(() => {
    setShowHowToPlay(true);
  }, [setShowHowToPlay]);

  const handleShare = useCallback(async () => {
    const text = getShareText();
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      // fall through
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Could not copy — try again");
    }
  }, [getShareText, showToast]);

  const movesLeft = maxMoves - movesUsed;
  const lowMoves = movesLeft <= 5 && gameStatus === "playing";
  const progressPct = (matchedPairs / TOTAL_PAIRS) * 100;
  const shareLabel =
    typeof navigator !== "undefined" && "share" in navigator
      ? "Share"
      : "Copy";

  if (loading || !initialized || !puzzle) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-white pt-12">
          <PuzzleLoadingSkeleton />
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Toast />
      <SpellingBeeConfetti active={confetti} />

      <main className="min-h-screen bg-white pt-12">
        <div className="relative mx-auto w-full max-w-[500px] px-4 pb-12">
          {/* Title row */}
          <div className="relative flex h-12 items-center justify-center border-b border-[#e2e2e2]">
            <button
              type="button"
              onClick={handleOpenHelp}
              className="absolute left-0 flex h-10 w-10 items-center justify-center text-[#6b6b6b] transition-colors hover:text-[#121212]"
              aria-label="How to play"
            >
              <HelpCircle size={22} strokeWidth={1.75} />
            </button>
            <h1
              className="text-[28px] font-bold text-[#121212]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Tiles
            </h1>
          </div>

          <p
            className="mt-3 text-center text-sm italic text-[#6b6b6b]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Today&apos;s theme: {puzzle.theme}
          </p>

          <p
            className={cn(
              "mt-2 text-center text-sm text-[#121212]",
              lowMoves && "text-[#c0392b]"
            )}
          >
            Moves: {movesUsed} / {maxMoves}
          </p>

          <div className="relative mt-4">
            <TilesGrid
              slots={slots}
              selectedId={selectedId}
              shakingIds={shakingIds}
              shuffling={shuffling}
              dimmed={gameStatus === "lost"}
              onSelect={selectTile}
            />

            {gameStatus === "lost" && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="pointer-events-auto text-[22px] font-bold text-[#121212]">
                  Out of moves!
                </p>
                <div className="pointer-events-auto mt-4 flex flex-col items-center gap-3">
                  {!revealed && (
                    <button
                      type="button"
                      onClick={revealAnswers}
                      className="rounded-full border border-[#121212] bg-white px-6 py-2 text-sm font-bold text-[#121212] hover:bg-[#f5f5f5]"
                    >
                      Reveal Answers
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={tryAgain}
                    className="rounded-full border border-[#121212] bg-white px-6 py-2 text-sm font-bold text-[#121212] hover:bg-[#f5f5f5]"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {showWinBanner && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <p className="text-4xl font-bold text-[#121212]">🎉 Solved!</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="h-[6px] w-full overflow-hidden rounded-[3px] bg-[#e2e2e2]">
              <div
                className="h-full rounded-[3px] bg-[#c3a0d8] transition-[width] duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-center text-[13px] text-[#6b6b6b]">
              {matchedPairs} / {TOTAL_PAIRS} pairs found
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={shuffleBoard}
              disabled={gameStatus !== "playing"}
              className="flex h-11 items-center justify-center rounded-full border-2 border-[#121212] bg-white px-6 text-sm font-bold text-[#121212] transition-opacity hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ↺ Shuffle
            </button>
          </div>
        </div>
      </main>

      <TilesHowToPlayModal open={showHowToPlay} onClose={handleCloseHowTo} />

      <TilesStatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        puzzleDate={puzzleDate}
        movesUsed={movesUsed}
        matchedPairs={matchedPairs}
        onShare={handleShare}
        shareLabel={shareLabel}
      />
    </>
  );
}

export default function TilesPage() {
  return (
    <Suspense
      fallback={
        <>
          <NavBar />
          <main className="min-h-screen bg-white pt-12">
            <PuzzleLoadingSkeleton />
          </main>
        </>
      }
    >
      <TilesContent />
    </Suspense>
  );
}
