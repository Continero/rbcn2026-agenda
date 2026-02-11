"use client";

import { useState } from "react";
import { ScheduleItem } from "@/data/schedule";
import { speakers } from "@/data/speakers";
import { formatTime } from "@/lib/schedule-utils";

interface PastTalksProps {
  items: ScheduleItem[];
}

export function PastTalks({ items }: PastTalksProps) {
  const talks = items.filter((item) => !item.isBreak);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (talks.length === 0) return null;

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
      <div className="flex flex-col">
        {talks.map((item) => (
          <PastTalkItem
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PastTalkItem({
  item,
  isExpanded,
  onToggle,
}: {
  item: ScheduleItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const itemSpeakers = item.speakerCodes
    .map((code) => speakers[code])
    .filter(Boolean);

  const hasAbstract = !!item.abstract;

  return (
    <div
      className={`py-2 lg:py-3 border-b border-cyan/[0.04] last:border-b-0 ${
        hasAbstract ? "cursor-pointer active:bg-cyan/[0.03] transition-colors" : ""
      }`}
      onClick={hasAbstract ? onToggle : undefined}
    >
      <div className="flex items-start gap-2 sm:gap-4">
        <span className="text-teal/30 text-sm lg:text-lg mt-0.5 shrink-0">✓</span>
        <span className="text-sm lg:text-base text-cyan/25 font-mono tabular-nums w-12 lg:w-16 mt-0.5 shrink-0">
          {formatTime(item.start)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-sm lg:text-base text-cyan/25 flex-1">
              {item.title}
            </span>
            {hasAbstract && (
              <span className={`text-cyan/20 text-xs mt-0.5 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                ▼
              </span>
            )}
          </div>
          {isExpanded && (
            <>
              {itemSpeakers.length > 0 && (
                <p className="text-sm text-cyan/30 mt-1 truncate">
                  {itemSpeakers.map((s) => s.name).join(", ")}
                </p>
              )}
              {item.abstract && (
                <p className="text-sm text-cyan/20 leading-relaxed mt-1.5 pr-2">
                  {cleanAbstract(item.abstract)}
                </p>
              )}
            </>
          )}
        </div>
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
