"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SpellingBeeInput({
  word,
  centerLetter,
  shaking,
}: {
  word: string;
  centerLetter: string;
  shaking: boolean;
}) {
  const center = centerLetter.toUpperCase();

  return (
    <motion.div
      className="mb-4 flex min-h-[48px] items-center justify-center"
      animate={shaking ? { x: [-6, 6, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <p
        className="text-center text-[32px] font-bold tracking-[0.1em] text-[#121212]"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {word.split("").map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            className={cn(
              ch.toUpperCase() === center && "text-[#c9a600]"
            )}
            style={
              ch.toUpperCase() === center
                ? { backgroundColor: "#f7da21", borderRadius: 2, padding: "0 2px" }
                : undefined
            }
          >
            {ch}
          </span>
        ))}
        <span className="animate-spelling-bee-blink ml-0.5 inline-block w-[14px] text-center">
          _
        </span>
      </p>
    </motion.div>
  );
}
