"use client";

import { useState, useEffect, useRef } from "react";
import { ScheduleItem } from "@/data/schedule";
import { speakers } from "@/data/speakers";
import { formatTime } from "@/lib/schedule-utils";

interface UpNextProps {
  items: ScheduleItem[];
}

export function UpNext({ items }: UpNextProps) {
  const firstTalkId = items.find((item) => !item.isBreak && item.abstract)?.id ?? null;
  const [expandedId, setExpandedId] = useState<number | null>(firstTalkId);
  const prevFirstId = useRef(firstTalkId);

  useEffect(() => {
    if (firstTalkId !== prevFirstId.current) {
      setExpandedId(firstTalkId);
      prevFirstId.current = firstTalkId;
    }
  }, [firstTalkId]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 lg:gap-4 h-full">
      <h3
        className="text-sm lg:text-base font-semibold uppercase tracking-[0.2em] text-cyan-60 shrink-0"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Up Next
      </h3>
      <div className="flex flex-col flex-1 lg:overflow-hidden overflow-y-auto">
        {items.map((item, idx) => (
          <UpNextItem
            key={item.id}
            item={item}
            isFirst={idx === 0}
            isExpanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function UpNextItem({
  item,
  isFirst,
  isExpanded,
  onToggle,
}: {
  item: ScheduleItem;
  isFirst: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const itemSpeakers = item.speakerCodes
    .map((code) => speakers[code])
    .filter(Boolean);

  const hasAbstract = !item.isBreak && !!item.abstract;

  return (
    <div
      className={`py-3 lg:py-4 border-b border-cyan/[0.06] last:border-b-0 ${
        isFirst ? "bg-cyan/[0.03] rounded-lg px-3 sm:px-4 lg:px-5 -mx-3 sm:-mx-4 lg:-mx-5 border-shift-active" : ""
      } ${hasAbstract ? "cursor-pointer active:bg-cyan/[0.05] transition-colors" : ""}`}
      onClick={hasAbstract ? onToggle : undefined}
    >
      <div className="flex items-start gap-3 lg:gap-5">
        <span
          className={`text-base lg:text-xl font-mono tabular-nums mt-0.5 shrink-0 w-12 lg:w-16 ${
            item.isBreak ? "text-cyan-30" : "text-teal"
          }`}
        >
          {formatTime(item.start)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p
              className={`text-base lg:text-xl leading-snug flex-1 ${
                item.isBreak
                  ? "text-cyan-30 italic"
                  : "text-cyan/90 font-medium"
              }`}
            >
              {item.title}
            </p>
            {hasAbstract && (
              <span className={`text-cyan-30 text-xs mt-1 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                ▼
              </span>
            )}
          </div>
          {!item.isBreak && itemSpeakers.length > 0 && (
            <p className="text-sm lg:text-base text-cyan/50 mt-1 truncate">
              {itemSpeakers.map((s) => s.name).join(", ")}
            </p>
          )}
          {isExpanded && item.abstract && (
            <p className="text-sm text-cyan-30 leading-relaxed mt-2 pr-2">
              {cleanAbstract(item.abstract)}
            </p>
          )}
        </div>
        <span className="text-sm lg:text-base text-cyan-30 shrink-0 mt-1 tabular-nums">
          {item.duration}m
        </span>
      </div>
    </div>
  );
}

function cleanAbstract(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
