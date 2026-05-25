"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NavBar } from "@/components/NavBar";
import { GameCard } from "@/components/GameCard";
import { cn } from "@/lib/utils";

interface Game {
  slug: string;
  title: string;
  description: string;
  brandColor: string;
  preview: React.ReactNode;
}

function WordlePreview() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {["#d3d6da", "#6aaa64", "#d3d6da", "#d3d6da", "#d3d6da"].map((color, i) => (
        <div
          key={i}
          className="h-8 w-8 rounded-sm"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function ConnectionsPreview() {
  const colors = ["#f9df6d", "#a0c35a", "#b4d8fb", "#ba81c5"];
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {colors.map((color, i) => (
        <div
          key={i}
          className="h-9 w-9 rounded-sm"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function StrandsPreview() {
  return (
    <svg
      viewBox="0 0 80 40"
      className="h-10 w-20"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M8 32 Q30 8 52 28 T72 12" />
      <path d="M12 20 Q40 36 68 24" opacity="0.7" />
    </svg>
  );
}

function SpellingBeePreview() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="white">
      <polygon points="24,4 44,14 44,34 24,44 4,34 4,14" />
    </svg>
  );
}

function MiniCrosswordPreview() {
  const grid = [
    [1, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  return (
    <div className="grid grid-cols-4 gap-px bg-white/30 p-0.5">
      {grid.flat().map((cell, i) => (
        <div
          key={i}
          className={cn(
            "relative h-5 w-5 bg-white/20",
            cell === 1 && "bg-white"
          )}
        >
          {cell === 1 && (
            <span className="absolute left-0.5 top-0 text-[6px] font-bold text-black">
              1
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function LetterBoxedPreview() {
  return (
    <div className="relative h-14 w-14">
      <div className="absolute inset-0 rounded-sm border-2 border-white" />
      <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white" />
      <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      <div className="absolute right-0 top-1/2 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
    </div>
  );
}

function SudokuPreview() {
  const nums = [
    [5, 3, 0],
    [6, 0, 0],
    [0, 9, 8],
  ];
  return (
    <div className="grid grid-cols-3 gap-px bg-white/40 p-0.5">
      {nums.flat().map((n, i) => (
        <div
          key={i}
          className="flex h-6 w-6 items-center justify-center bg-white/15 text-[10px] font-bold text-white"
        >
          {n > 0 ? n : ""}
        </div>
      ))}
    </div>
  );
}

function TilesPreview() {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "h-8 w-8 rounded-sm",
            i % 2 === 0 ? "bg-white/90" : "bg-white/50"
          )}
        />
      ))}
    </div>
  );
}

const GAMES: Game[] = [
  {
    slug: "wordle",
    title: "Wordle",
    description: "Get 6 chances to guess a 5-letter word.",
    brandColor: "#6aaa64",
    preview: <WordlePreview />,
  },
  {
    slug: "connections",
    title: "Connections",
    description: "Group words that share a common thread.",
    brandColor: "#b4d8fb",
    preview: <ConnectionsPreview />,
  },
  {
    slug: "strands",
    title: "Strands",
    description: "Find the words that fit the theme.",
    brandColor: "#a8d8ea",
    preview: <StrandsPreview />,
  },
  {
    slug: "spelling-bee",
    title: "Spelling Bee",
    description: "How many words can you make with 7 letters?",
    brandColor: "#f7da21",
    preview: <SpellingBeePreview />,
  },
  {
    slug: "mini",
    title: "Mini Crossword",
    description: "A quick crossword you can complete in minutes.",
    brandColor: "#000000",
    preview: <MiniCrosswordPreview />,
  },
  {
    slug: "letter-boxed",
    title: "Letter Boxed",
    description: "Make words using letters around the square.",
    brandColor: "#f7da21",
    preview: <LetterBoxedPreview />,
  },
  {
    slug: "sudoku",
    title: "Sudoku",
    description: "The classic number placement puzzle.",
    brandColor: "#89b4f7",
    preview: <SudokuPreview />,
  },
  {
    slug: "tiles",
    title: "Tiles",
    description: "Match tiles to clear the board.",
    brandColor: "#c3a0d8",
    preview: <TilesPreview />,
  },
];

function getArchiveDates(): { label: string; dateStr: string }[] {
  const results: { label: string; dateStr: string }[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    let label: string;
    if (i === 0) label = "Today";
    else if (i === 1) label = "Yesterday";
    else {
      label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    results.push({ label, dateStr });
  }

  return results;
}

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-4 pt-6 text-[13px] font-bold uppercase tracking-[0.08em] text-[#6b6b6b]"
      style={{ fontFamily: "var(--font-franklin)" }}
    >
      {children}
    </h2>
  );
}

export default function Home() {
  const archiveDates = getArchiveDates();

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="mx-auto max-w-[1200px] px-4 lg:px-12">
        <SectionHeading>Today&apos;s Games</SectionHeading>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={gridVariants}
          initial={false}
          animate="visible"
        >
          {GAMES.map((game) => (
            <GameCard
              key={game.slug}
              title={game.title}
              description={game.description}
              color={game.brandColor}
              slug={game.slug}
              symbol={game.preview}
            />
          ))}
        </motion.div>

        <SectionHeading>Play Past Puzzles</SectionHeading>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none lg:-mx-0 lg:px-0">
          {archiveDates.map(({ label, dateStr }) => (
            <Link
              key={dateStr}
              href={`/archive?game=wordle&date=${dateStr}`}
              className="shrink-0 rounded-full border border-[#e2e2e2] px-3 py-1.5 text-xs text-[#121212] transition-colors hover:bg-[#f4f3ee]"
            >
              {label}
            </Link>
          ))}
        </div>
      </main>

      <footer className="mt-12 border-t border-[#e2e2e2]">
        <p className="py-6 text-center text-xs text-[#6b6b6b]">
          © 2025 Maharashtra Time Games
        </p>
      </footer>
    </div>
  );
}
