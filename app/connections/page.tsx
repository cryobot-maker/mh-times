"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { BarChart2, HelpCircle } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { ConnectionsBoard } from "@/components/connections/ConnectionsBoard";
import { ConnectionsToast } from "@/components/connections/ConnectionsToast";
import { StatsModal } from "@/components/StatsModal";
import { ConnectionsHowToPlayModal } from "@/components/connections/ConnectionsModals";
import { PuzzleLoadingSkeleton } from "@/components/PuzzleLoadingSkeleton";
import { CONNECTIONS_COLOR_EMOJI } from "@/lib/connectionsData";
import { useConnectionsStore } from "@/lib/stores/connectionsStore";
import { useGamePuzzle } from "@/hooks/useGamePuzzle";
import { cn } from "@/lib/utils";

function MistakeTracker({ mistakes }: { mistakes: number }) {
  const remaining = 4 - mistakes;
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <span className="text-sm text-[#121212]">Mistakes remaining:</span>
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 w-3 rounded-full",
              i < remaining
                ? "bg-[#121212]"
                : "border-2 border-[#c9b458] bg-transparent"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ConnectionsContent() {
  const { loading, puzzleDate, puzzleData } = useGamePuzzle("connections");

  const {
    initialized,
    init,
    puzzle,
    words,
    selectedIndices,
    solvedGroups,
    solveOrder,
    mistakes,
    gameStatus,
    shaking,
    solvingWords,
    toast,
    showStats,
    showHowToPlay,
    stats,
    toggleSelect,
    shuffle,
    deselectAll,
    submit,
    setShowStats,
    setShowHowToPlay,
    showToast,
    markTutorialSeen,
    getShareText,
  } = useConnectionsStore();

  const [shareLabel, setShareLabel] = useState("Share");

  useEffect(() => {
    if (loading) return;
    init(puzzleDate, puzzleData);
  }, [init, puzzleDate, puzzleData, loading]);

  const canSubmit = selectedIndices.length === 4 && gameStatus === "playing";

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

  if (loading || !initialized || !puzzle) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <PuzzleLoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="mx-auto w-full max-w-[600px] px-4 pb-8">
        <div className="relative border-b border-[#e2e2e2] py-4">
          <button
            type="button"
            onClick={() => setShowHowToPlay(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#121212]"
            aria-label="How to play"
          >
            <HelpCircle size={22} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => setShowStats(true)}
            className="absolute right-0 top-4 text-[#6b6b6b] hover:text-[#121212]"
            aria-label="Statistics"
          >
            <BarChart2 size={22} strokeWidth={1.75} />
          </button>
          <span className="absolute right-0 top-0 text-xs text-[#6b6b6b]">
            #{puzzle.number}
          </span>

          <div className="text-center">
            <h1
              className="text-[28px] font-bold text-[#121212]"
              style={{ fontFamily: "var(--font-karnak)" }}
            >
              Connections
            </h1>
            <p className="mt-1 text-[13px] text-[#6b6b6b]">
              Group words that share a common thread.
            </p>
          </div>
        </div>

        <MistakeTracker mistakes={mistakes} />

        <div className="relative px-1">
          <ConnectionsToast
            message={toast?.message ?? null}
            toastKey={toast?.key ?? 0}
          />
          <ConnectionsBoard
            words={words}
            selectedIndices={selectedIndices}
            solvedGroups={solvedGroups}
            shaking={shaking}
            solvingWords={solvingWords}
            onToggle={toggleSelect}
          />
        </div>

        {gameStatus === "playing" && (
          <div className="mt-6 flex flex-col gap-2 max-md:w-full md:flex-row md:flex-wrap md:items-center md:justify-center">
            <button
              type="button"
              onClick={shuffle}
              disabled={!!solvingWords}
              className="h-11 min-h-[44px] w-full rounded-full border-2 border-[#121212] bg-white px-5 text-sm font-semibold text-[#121212] hover:bg-[#f4f3ee] disabled:opacity-50 touch-manipulation md:w-auto"
              style={{ touchAction: "manipulation" }}
            >
              Shuffle
            </button>
            {selectedIndices.length > 0 && (
              <button
                type="button"
                onClick={deselectAll}
                disabled={!!solvingWords}
                className="h-11 min-h-[44px] w-full rounded-full border-2 border-[#121212] bg-white px-5 text-sm font-semibold text-[#121212] hover:bg-[#f4f3ee] disabled:opacity-50 touch-manipulation md:w-auto"
                style={{ touchAction: "manipulation" }}
              >
                Deselect All
              </button>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit || !!solvingWords || shaking}
              className={cn(
                "h-11 min-h-[44px] w-full rounded-full border-2 border-[#121212] px-5 text-sm font-semibold transition-colors touch-manipulation md:w-auto",
                canSubmit
                  ? "bg-[#121212] text-white"
                  : "pointer-events-none bg-white text-[#6b6b6b]"
              )}
              style={{ touchAction: "manipulation" }}
            >
              Submit
            </button>
          </div>
        )}

        {gameStatus === "won" && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex gap-1 text-2xl">
              {solveOrder.map((color, i) => (
                <span key={i}>{CONNECTIONS_COLOR_EMOJI[color]}</span>
              ))}
            </div>
            <Link
              href="/"
              className="h-11 rounded-full border-2 border-[#121212] bg-[#121212] px-8 text-sm font-semibold leading-[2.5rem] text-white hover:brightness-95"
            >
              Next Puzzle
            </Link>
          </div>
        )}
      </div>

      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        gameName="Connections"
        stats={{
          played: stats.played,
          winPct:
            stats.played > 0
              ? Math.round((stats.wins / stats.played) * 100)
              : 0,
          currentStreak: stats.currentStreak,
          maxStreak: stats.maxStreak,
        }}
        showShare={gameStatus !== "playing"}
        onShare={handleShare}
        shareLabel={shareLabel}
      />

      <ConnectionsHowToPlayModal
        open={showHowToPlay}
        onClose={() => {
          markTutorialSeen();
          setShowHowToPlay(false);
        }}
      />
    </div>
  );
}

export default function ConnectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          Loading...
        </div>
      }
    >
      <ConnectionsContent />
    </Suspense>
  );
}
