"use client";

import { ScheduleItem } from "@/data/schedule";
import { speakers } from "@/data/speakers";
import { formatTime } from "@/lib/schedule-utils";

interface UpNextProps {
  items: ScheduleItem[];
}

export function UpNext({ items }: UpNextProps) {
  const visible = items.slice(0, 7);

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 h-full">
      <h3
        className="text-base font-semibold uppercase tracking-[0.2em] text-cyan-60 shrink-0"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Up Next
      </h3>
      <div className="flex flex-col flex-1 overflow-hidden">
        {visible.map((item, idx) => (
          <UpNextItem key={item.id} item={item} isFirst={idx === 0} />
        ))}
      </div>
      {items.length > 7 && (
        <p className="text-cyan-30 text-base text-center shrink-0 mt-2">
          +{items.length - 7} more
        </p>
      )}
    </div>
  );
}

function UpNextItem({ item, isFirst }: { item: ScheduleItem; isFirst: boolean }) {
  const itemSpeakers = item.speakerCodes
    .map((code) => speakers[code])
    .filter(Boolean);

  return (
    <div
      className={`py-4 border-b border-cyan/[0.06] last:border-b-0 ${
        isFirst ? "bg-cyan/[0.03] rounded-lg px-5 -mx-5" : ""
      }`}
    >
      <div className="flex items-start gap-5">
        <span
          className={`text-xl font-mono tabular-nums mt-0.5 shrink-0 w-16 ${
            item.isBreak ? "text-cyan-30" : "text-teal"
          }`}
        >
          {formatTime(item.start)}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xl leading-snug ${
              item.isBreak
                ? "text-cyan-30 italic"
                : "text-cyan/90 font-medium"
            }`}
          >
            {item.title}
          </p>
          {!item.isBreak && itemSpeakers.length > 0 && (
            <p className="text-base text-cyan/40 mt-1 truncate">
              {itemSpeakers.map((s) => s.name).join(", ")}
            </p>
          )}
        </div>
        <span className="text-base text-cyan-30 shrink-0 mt-1 tabular-nums">
          {item.duration}m
        </span>
      </div>
    </div>
  );
}
