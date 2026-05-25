"use client";

import { motion, AnimatePresence } from "framer-motion";
import { isPangram } from "@/lib/spellingBeeLogic";
import type { SpellingBeePuzzle } from "@/lib/spellingBeeData";
import { cn } from "@/lib/utils";

export function FoundWordsRow({
  words,
  puzzle,
  newWord,
}: {
  words: string[];
  puzzle: SpellingBeePuzzle;
  newWord: string | null;
}) {
  if (words.length === 0) return <div className="mb-3 h-8" />;

  return (
    <div className="scroll-touch mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <AnimatePresence mode="popLayout">
        {words.map((word) => {
          const pangram = isPangram(word, puzzle);
          const isNew = word === newWord;
          return (
            <motion.span
              key={word}
              layout
              initial={isNew ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, duration: 0.2 }}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[13px]",
                pangram
                  ? "bg-[#f7da21] font-bold underline"
                  : "bg-[#f4f3ee] text-[#121212]"
              )}
            >
              {word}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
