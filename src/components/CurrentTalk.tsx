"use client";

import Image from "next/image";
import { ScheduleItem } from "@/data/schedule";
import { speakers } from "@/data/speakers";
import { formatTime } from "@/lib/schedule-utils";
import { ProgressBar } from "./ProgressBar";
import { DiscoEffect } from "./DiscoEffect";

interface CurrentTalkProps {
  item: ScheduleItem;
  progress: number;
  partyIntensity?: number;
}

export function CurrentTalk({ item, progress, partyIntensity = 0 }: CurrentTalkProps) {
  const isAfterParty = item.title.toLowerCase().includes("after-party");
  const itemSpeakers = item.speakerCodes
    .map((code) => speakers[code])
    .filter(Boolean);

  const content = (
    <div className="flex flex-col gap-3 lg:gap-5">
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="flex items-center gap-2 sm:gap-3 text-teal font-semibold text-base sm:text-xl lg:text-2xl uppercase tracking-wider">
          <span className="inline-block w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-teal animate-pulse" />
          Now
        </span>
        <span className="text-cyan-60 text-sm sm:text-base lg:text-xl">
          {formatTime(item.start)} &ndash; {formatTime(item.end)}
        </span>
        <span className="text-cyan-30 text-sm lg:text-lg ml-auto">
          {item.duration}min
        </span>
      </div>

      <ProgressBar progress={progress} />

      <div
        className="border-l-4 border-teal rounded-r-xl px-4 py-4 sm:px-6 sm:py-5 lg:px-10 lg:py-6 flex flex-col gap-3 lg:gap-4 glow-breathe"
        style={{
          background: "rgba(0, 192, 181, 0.04)",
        }}
      >
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-cyan" style={{ fontFamily: "var(--font-heading)" }}>
          {item.title}
        </h2>

        {itemSpeakers.length > 0 && (
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            {itemSpeakers.map((speaker) => (
              <div key={speaker.code} className="flex items-center gap-2 sm:gap-3">
                {speaker.avatar ? (
                  <Image
                    src={speaker.avatar}
                    alt={speaker.name}
                    width={48}
                    height={48}
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-teal/40 grayscale brightness-80"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-teal/20 flex items-center justify-center text-teal text-sm sm:text-lg lg:text-xl font-bold">
                    {speaker.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm sm:text-base lg:text-xl text-cyan/90 font-medium">
                  {speaker.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {item.abstract && (
          <p className="text-sm lg:text-base text-cyan-30 leading-relaxed">
            {cleanAbstract(item.abstract)}
          </p>
        )}
      </div>
    </div>
  );

  if (isAfterParty && partyIntensity > 0) {
    return <DiscoEffect intensity={partyIntensity}>{content}</DiscoEffect>;
  }

  return content;
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
