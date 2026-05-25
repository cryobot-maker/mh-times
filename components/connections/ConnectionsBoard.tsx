"use client";

import { motion } from "framer-motion";
import { CONNECTIONS_COLOR_BG } from "@/lib/connectionsData";
import type { SolvedGroup } from "@/lib/stores/connectionsStore";
import { cn } from "@/lib/utils";

function SolvedBanner({ group }: { group: SolvedGroup }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex min-h-[72px] flex-col items-center justify-center rounded px-4 py-3 text-center text-[#121212]"
      style={{ backgroundColor: CONNECTIONS_COLOR_BG[group.color] }}
    >
      <p className="text-[13px] font-bold uppercase tracking-wide">
        {group.name}
      </p>
      <p className="mt-1 text-base font-medium">
        {group.words.join(", ")}
      </p>
    </motion.div>
  );
}

function WordTile({
  word,
  selected,
  shaking,
  jumping,
  jumpDelay,
  onClick,
}: {
  word: string;
  selected: boolean;
  shaking: boolean;
  jumping: boolean;
  jumpDelay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[56px] min-w-0 items-center justify-center rounded px-1 text-center text-[15px] font-bold uppercase touch-manipulation max-md:min-h-[56px] max-md:text-sm",
        selected
          ? "bg-[#5a594e] text-white"
          : "bg-[#efefe6] text-[#121212]"
      )}
      style={{ touchAction: "manipulation" }}
      animate={
        shaking
          ? { x: [-8, 8, -8, 8, -4, 4, 0] }
          : jumping
            ? { y: [0, -16, 0] }
            : selected
              ? { scale: [0.95, 1] }
              : {}
      }
      transition={
        shaking
          ? { duration: 0.5, ease: "easeInOut" }
          : jumping
            ? { duration: 0.35, delay: jumpDelay / 1000, ease: "easeOut" }
            : selected
              ? { duration: 0.08 }
              : {}
      }
    >
      {word}
    </motion.button>
  );
}

interface ConnectionsBoardProps {
  words: string[];
  selectedIndices: number[];
  solvedGroups: SolvedGroup[];
  shaking: boolean;
  solvingWords: string[] | null;
  onToggle: (index: number) => void;
}

export function ConnectionsBoard({
  words,
  selectedIndices,
  solvedGroups,
  shaking,
  solvingWords,
  onToggle,
}: ConnectionsBoardProps) {
  const solvingSet = new Set(solvingWords ?? []);

  return (
    <div className="flex w-full flex-col gap-2">
      {solvedGroups.map((group) => (
        <SolvedBanner key={group.name} group={group} />
      ))}

      {words.length > 0 && (
        <div className="grid grid-cols-4 gap-2 max-md:gap-1.5">
          {words.map((word, index) => {
            const selected = selectedIndices.includes(index);
            const jumping = solvingSet.has(word);
            const jumpIndex = solvingWords
              ? solvingWords.indexOf(word)
              : 0;

            return (
              <WordTile
                key={`${word}-${index}`}
                word={word}
                selected={selected}
                shaking={shaking && selected}
                jumping={jumping}
                jumpDelay={jumpIndex * 100}
                onClick={() => onToggle(index)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
