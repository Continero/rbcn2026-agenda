"use client";

import { ScheduleItem } from "@/data/schedule";
import { formatTime, getTimeUntil } from "@/lib/schedule-utils";
import { ProgressBar } from "./ProgressBar";

interface BreakCardProps {
  item: ScheduleItem;
  progress: number;
  now: Date;
  nextTalk: ScheduleItem | null;
}

export function BreakCard({ item, progress, now, nextTalk }: BreakCardProps) {
  const itemEnd = new Date(item.end);
  const timeUntilNext = getTimeUntil(itemEnd, now);

  return (
    <div className="flex flex-col gap-3 lg:gap-5">
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="flex items-center gap-2 sm:gap-3 text-teal font-semibold text-base sm:text-xl lg:text-2xl uppercase tracking-wider">
          <BreakIcon />
          Now
        </span>
        <span className="text-cyan-60 text-sm sm:text-base lg:text-xl">
          {formatTime(item.start)} &ndash; {formatTime(item.end)}
        </span>
      </div>

      <ProgressBar progress={progress} />

      <div className="border-l-4 border-cyan-30 rounded-r-xl px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10 flex flex-col items-center justify-center gap-3 lg:gap-5 bg-cyan/[0.02]">
        <span className="text-4xl lg:text-6xl">{getBreakEmoji(item.title)}</span>
        <h2
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan/80"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {item.title}
        </h2>
        {nextTalk && (
          <div className="text-center mt-1 lg:mt-2">
            <p className="text-cyan-60 text-sm lg:text-base">
              Next up {timeUntilNext}
            </p>
            <p className="text-teal text-base lg:text-lg font-semibold mt-1">
              {nextTalk.title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getBreakEmoji(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("breakfast")) return "\u2615";
  if (lower.includes("lunch")) return "\uD83C\uDF5D";
  if (lower.includes("coffee")) return "\u2615";
  if (lower.includes("afternoon treat")) return "\uD83C\uDF70";
  if (lower.includes("lightning")) return "\u26A1";
  if (lower.includes("elevator") || lower.includes("sponsor")) return "\uD83C\uDFA4";
  if (lower.includes("voting")) return "\uD83D\uDDF3\uFE0F";
  return "\u23F8\uFE0F";
}

function BreakIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="2" y="2" width="4" height="10" rx="1" />
      <rect x="8" y="2" width="4" height="10" rx="1" />
    </svg>
  );
}
