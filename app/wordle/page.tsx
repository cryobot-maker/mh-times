"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { BarChart2, HelpCircle } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { StatsModal } from "@/components/StatsModal";
import { WordleBoard } from "@/components/wordle/WordleBoard";
import { WordleKeyboard } from "@/components/wordle/WordleKeyboard";
import { HowToPlayModal } from "@/components/wordle/WordleModals";
import { PuzzleLoadingSkeleton } from "@/components/PuzzleLoadingSkeleton";
import { evaluationsToEmoji } from "@/lib/wordleLogic";
import { useWordleStore } from "@/lib/stores/wordleStore";
import { useToast } from "@/components/Toast";
import { useGamePuzzle } from "@/hooks/useGamePuzzle";

function WordleContent() {
  const { loading, puzzleDate, isArchive, puzzleData } = useGamePuzzle("wordle");
  const showToast = useToast();

  const {
    initialized,
    init,
    guesses,
    evaluations,
    currentGuess,
    gameStatus,
    keyboardStatus,
    flippingRow,
    bouncingRow,
    shakingRow,
    revealedRows,
    showStats,
    showHowToPlay,
    stats,
    isArchive: storeArchive,
    addLetter,
    removeLetter,
    submitGuess,
    setShowStats,
    setShowHowToPlay,
    onFlipComplete,
    markTutorialSeen,
  } = useWordleStore();

  const [shareLabel, setShareLabel] = useState("Share");
  const [popCol, setPopCol] = useState(-1);

  useEffect(() => {
    if (loading) return;
    void init(puzzleDate, isArchive, puzzleData);
  }, [init, puzzleDate, isArchive, puzzleData, loading]);

  const handleKey = useCallback(
    (key: string) => {
      if (key === "Enter") submitGuess();
      else if (key === "Backspace") removeLetter();
      else if (/^[A-Z]$/.test(key)) addLetter(key);
    },
    [submitGuess, removeLetter, addLetter]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showStats || showHowToPlay) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Enter") {
        e.preventDefault();
        handleKey("Enter");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleKey("Backspace");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey, showStats, showHowToPlay]);

  useEffect(() => {
    if (currentGuess.length > 0) {
      setPopCol(currentGuess.length - 1);
    }
  }, [currentGuess]);

  const handleShare = async () => {
    const grid = evaluationsToEmoji(evaluations);
    const header = `Wordle ${guesses.length}/6\n\n`;
    try {
      await navigator.clipboard.writeText(header + grid);
      setShareLabel("Copied!");
      showToast("Copied!");
      setTimeout(() => setShareLabel("Share"), 2000);
    } catch {
      showToast("Could not copy");
    }
  };

  if (loading || !initialized) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <NavBar />
        <PuzzleLoadingSkeleton />
      </div>
    );
  }

  const winPct =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const winningGuessIndex =
    gameStatus === "won" ? evaluations.length - 1 : -1;

  return (
    <div className="wordle-game-shell bg-white">
      <NavBar />

      <div className="mx-auto flex w-full max-w-[500px] flex-1 flex-col min-h-0">
        <div className="relative flex h-12 shrink-0 items-center justify-center border-b border-[#e2e2e2] px-4">
          <button
            type="button"
            onClick={() => setShowHowToPlay(true)}
            className="absolute left-4 text-[#6b6b6b] hover:text-[#121212]"
            aria-label="How to play"
          >
            <HelpCircle size={22} strokeWidth={1.75} />
          </button>

          <div className="flex flex-col items-center">
            {storeArchive && (
              <span className="mb-0.5 rounded bg-[#f4f3ee] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6b6b6b]">
                Archive
              </span>
            )}
            <h1
              className="text-[28px] font-bold text-[#121212]"
              style={{ fontFamily: "var(--font-karnak)" }}
            >
              Wordle
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowStats(true)}
            className="absolute right-4 text-[#6b6b6b] hover:text-[#121212]"
            aria-label="Statistics"
          >
            <BarChart2 size={22} strokeWidth={1.75} />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
            <WordleBoard
              guesses={guesses}
              evaluations={evaluations}
              currentGuess={currentGuess}
              revealedRows={revealedRows}
              flippingRow={flippingRow}
              bouncingRow={bouncingRow}
              shakingRow={shakingRow}
              popCol={popCol}
              onFlipComplete={onFlipComplete}
            />

          <WordleKeyboard
            keyboardStatus={keyboardStatus}
            onKey={handleKey}
            disabled={gameStatus !== "playing" || flippingRow !== null}
          />
        </div>
      </div>

      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        gameName="Wordle"
        stats={{
          played: stats.played,
          winPct,
          currentStreak: stats.currentStreak,
          maxStreak: stats.maxStreak,
        }}
        guessDistribution={stats.distribution}
        winningGuessIndex={winningGuessIndex}
        onShare={handleShare}
        shareLabel={shareLabel}
        showShare={gameStatus !== "playing" && evaluations.length > 0}
      />

      <HowToPlayModal
        open={showHowToPlay}
        onClose={() => {
          markTutorialSeen();
          setShowHowToPlay(false);
        }}
      />
    </div>
  );
}

export default function WordlePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          Loading...
        </div>
      }
    >
      <WordleContent />
    </Suspense>
  );
}
