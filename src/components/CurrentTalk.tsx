"use client";

import Image from "next/image";
import { ScheduleItem } from "@/data/schedule";
import { speakers } from "@/data/speakers";
import { formatTime } from "@/lib/schedule-utils";
import { ProgressBar } from "./ProgressBar";

interface CurrentTalkProps {
  item: ScheduleItem;
  progress: number;
}

export function CurrentTalk({ item, progress }: CurrentTalkProps) {
  const itemSpeakers = item.speakerCodes
    .map((code) => speakers[code])
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-3 text-teal font-semibold text-2xl uppercase tracking-wider">
          <span className="inline-block w-4 h-4 rounded-full bg-teal animate-pulse" />
          Now
        </span>
        <span className="text-white-60 text-xl">
          {formatTime(item.start)} &ndash; {formatTime(item.end)}
        </span>
        <span className="text-white-30 text-lg ml-auto">
          {item.duration}min
        </span>
      </div>

      <ProgressBar progress={progress} />

      <div
        className="rounded-2xl border border-teal/30 px-12 py-10 flex flex-col gap-6"
        style={{
          background: "linear-gradient(135deg, rgba(0,192,181,0.06) 0%, rgba(0,0,17,0.95) 100%)",
          animation: "pulse-glow 4s ease-in-out infinite",
        }}
      >
        <h2 className="text-4xl font-bold leading-tight text-white">
          {item.title}
        </h2>

        {itemSpeakers.length > 0 && (
          <div className="flex items-center gap-6 flex-wrap">
            {itemSpeakers.map((speaker) => (
              <div key={speaker.code} className="flex items-center gap-4">
                {speaker.avatar ? (
                  <Image
                    src={speaker.avatar}
                    alt={speaker.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border-2 border-teal/40"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center text-teal text-2xl font-bold">
                    {speaker.name.charAt(0)}
                  </div>
                )}
                <span className="text-2xl text-white/90 font-medium">
                  {speaker.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {item.abstract && (
          <p className="text-lg text-white/40 leading-relaxed line-clamp-3">
            {cleanAbstract(item.abstract)}
          </p>
        )}
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
