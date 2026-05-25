"use client";

import { motion } from "framer-motion";
import { getProgressPct, getRankLabel } from "@/lib/spellingBeeLogic";
import { cn } from "@/lib/utils";

export function SpellingBeeRankBar({
  score,
  maxScore,
  rankFlash,
}: {
  score: number;
  maxScore: number;
  rankFlash: boolean;
}) {
  const pct = getProgressPct(score, maxScore);
  const rank = getRankLabel(score, maxScore);

  return (
    <div className="mb-4 px-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e2e2e2]">
        <motion.div
          className="h-full bg-[#f7da21]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <motion.span
          className={cn(
            "text-sm font-bold text-[#121212]",
            rankFlash && "text-[#f7da21]"
          )}
          animate={
            rankFlash
              ? { scale: [1, 1.15, 1] }
              : {}
          }
          transition={{ duration: 0.4 }}
        >
          {rank}
        </motion.span>
        <span className="text-sm text-[#6b6b6b]">{score}</span>
      </div>
    </div>
  );
}
