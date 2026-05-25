"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  isGameCompleted,
  isValidArchiveGame,
  type ArchiveGameSlug,
} from "@/lib/archiveUtils";
import { getTodayString } from "@/lib/gameUtils";

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export interface GameCardProps {
  title: string;
  description: string;
  color: string;
  slug: string;
  symbol: React.ReactNode;
  isCompleted?: boolean;
}

export function GameCard({
  title,
  description,
  color,
  slug,
  symbol,
  isCompleted: isCompletedProp,
}: GameCardProps) {
  const [completed, setCompleted] = useState(isCompletedProp ?? false);

  useEffect(() => {
    if (isCompletedProp !== undefined) {
      setCompleted(isCompletedProp);
      return;
    }
    if (!isValidArchiveGame(slug)) {
      setCompleted(false);
      return;
    }
    setCompleted(isGameCompleted(slug as ArchiveGameSlug, getTodayString()));
  }, [slug, isCompletedProp]);

  return (
    <motion.div variants={cardVariants}>
      <Link
        href={`/${slug}`}
        className="group relative flex h-full cursor-pointer flex-col rounded border border-[#e2e2e2] bg-white p-5 transition-[transform,box-shadow] duration-150 ease-in-out hover:scale-[1.01] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        {completed && (
          <span
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#6aaa64] text-white"
            aria-label="Completed today"
          >
            <Check size={14} strokeWidth={3} />
          </span>
        )}
        <div
          className="flex h-20 items-center justify-center rounded-sm"
          style={{ backgroundColor: color }}
        >
          {symbol}
        </div>
        <h3
          className="mt-3 text-lg font-bold text-[#121212]"
          style={{ fontFamily: "var(--font-karnak)" }}
        >
          {title}
        </h3>
        <p className="mt-1 text-[13px] leading-[1.4] text-[#6b6b6b]">
          {description}
        </p>
        <div className="mt-4">
          <span className="inline-block rounded-sm border border-[#121212] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#121212] transition-colors duration-150 group-hover:bg-[#121212] group-hover:text-white">
            PLAY
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
