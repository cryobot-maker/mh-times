"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatMonthYear,
  getCalendarDays,
  isFutureDate,
  isGameCompleted,
  toDateString,
  type ArchiveGameSlug,
} from "@/lib/archiveUtils";
import { getTodayString } from "@/lib/gameUtils";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface ArchiveCalendarProps {
  game: ArchiveGameSlug;
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onSelectDate: (dateStr: string) => void;
  refreshKey: number;
}

export function ArchiveCalendar({
  game,
  year,
  month,
  onMonthChange,
  onSelectDate,
  refreshKey,
}: ArchiveCalendarProps) {
  const today = getTodayString();
  const cells = useMemo(() => getCalendarDays(year, month), [year, month]);

  const goPrev = () => {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  };

  const goNext = () => {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  };

  return (
    <div key={refreshKey}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          className="flex items-center gap-1 text-sm text-[#121212] hover:text-[#6b6b6b]"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Previous Month</span>
        </button>
        <h2
          className="text-base font-bold text-[#121212]"
          style={{ fontFamily: "var(--font-karnak)" }}
        >
          {formatMonthYear(year, month)}
        </h2>
        <button
          type="button"
          onClick={goNext}
          className="flex items-center gap-1 text-sm text-[#121212] hover:text-[#6b6b6b]"
          aria-label="Next month"
        >
          <span className="hidden sm:inline">Next Month</span>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="text-xs font-bold text-[#6b6b6b]"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-11 w-11" />;
          }

          const dateStr = toDateString(year, month, day);
          const isToday = dateStr === today;
          const future = isFutureDate(dateStr);
          const completed = !future && isGameCompleted(game, dateStr);

          return (
            <button
              key={dateStr}
              type="button"
              disabled={future}
              onClick={() => !future && onSelectDate(dateStr)}
              className={cn(
                "mx-auto flex h-11 w-11 items-center justify-center rounded-full text-sm transition-colors",
                !future &&
                  !completed &&
                  "cursor-pointer border border-[#e2e2e2] hover:bg-[#f4f3ee]",
                completed && "bg-[#6aaa64] font-medium text-white",
                isToday &&
                  !completed &&
                  "border-2 border-[#121212] font-bold text-[#121212]",
                isToday && completed && "border-2 border-[#121212]",
                future && "cursor-default text-[#d3d6da]"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
