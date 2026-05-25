"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const HEX_CLIP =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const OUTER_SLOTS: { className: string }[] = [
  { className: "left-1/2 top-0 -translate-x-1/2" },
  { className: "right-[4%] top-[18%]" },
  { className: "right-[4%] bottom-[18%]" },
  { className: "left-1/2 bottom-0 -translate-x-1/2" },
  { className: "left-[4%] bottom-[18%]" },
  { className: "left-[4%] top-[18%]" },
];

function HexButton({
  letter,
  isCenter,
  onClick,
}: {
  letter: string;
  isCenter?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[70px] w-[70px] shrink-0 items-center justify-center text-[22px] font-bold uppercase transition-[filter,transform] duration-75",
        "hover:brightness-[0.92] active:scale-95 active:brightness-[0.88]",
        "md:h-20 md:w-20 md:text-[28px]"
      )}
      style={{
        clipPath: HEX_CLIP,
        backgroundColor: isCenter ? "#f7da21" : "#e6e6e6",
        fontFamily: "Arial, sans-serif",
        touchAction: "manipulation",
      }}
    >
      {letter}
    </button>
  );
}

export function SpellingBeeHive({
  centerLetter,
  outerLetters,
  outerOrder,
  shuffleSpin,
  onLetter,
}: {
  centerLetter: string;
  outerLetters: string[];
  outerOrder: number[];
  shuffleSpin: boolean;
  onLetter: (letter: string) => void;
}) {
  return (
    <div className="relative mx-auto h-[240px] w-[230px] md:h-[280px] md:w-[260px]">
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <HexButton
          letter={centerLetter}
          isCenter
          onClick={() => onLetter(centerLetter)}
        />
      </div>

      <motion.div
        className="absolute inset-0"
        animate={shuffleSpin ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {OUTER_SLOTS.map((slot, slotIndex) => {
          const letterIndex = outerOrder[slotIndex];
          const letter = outerLetters[letterIndex];
          return (
            <div
              key={slotIndex}
              className={cn("absolute", slot.className)}
            >
              <HexButton
                letter={letter}
                onClick={() => onLetter(letter)}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
