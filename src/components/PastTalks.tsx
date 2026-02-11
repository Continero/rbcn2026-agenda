"use client";

import { ScheduleItem } from "@/data/schedule";
import { formatTime } from "@/lib/schedule-utils";

interface PastTalksProps {
  items: ScheduleItem[];
}

export function PastTalks({ items }: PastTalksProps) {
  const talks = items.filter((item) => !item.isBreak);
  const visible = talks.slice(-4);

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 lg:gap-3">
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex-1 h-px bg-cyan/[0.06]" />
        <span
          className="text-xs lg:text-base uppercase tracking-[0.2em] text-cyan-30"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Earlier Today
        </span>
        <div className="flex-1 h-px bg-cyan/[0.06]" />
      </div>
      <div className="flex flex-col gap-1 lg:gap-2">
        {visible.map((item) => (
          <div key={item.id} className="flex items-center gap-2 sm:gap-4 py-1">
            <span className="text-teal/30 text-sm lg:text-lg">✓</span>
            <span className="text-sm lg:text-base text-cyan/25 font-mono tabular-nums w-12 lg:w-16">
              {formatTime(item.start)}
            </span>
            <span className="text-sm lg:text-base text-cyan/25 truncate flex-1">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
