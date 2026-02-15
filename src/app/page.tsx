"use client";

import { useRef, useEffect, useState } from "react";
import { schedule } from "@/data/schedule";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { getScheduleState, getTimeUntil, getPartyIntensity } from "@/lib/schedule-utils";
import { Header } from "@/components/Header";
import { CurrentTalk } from "@/components/CurrentTalk";
import { BreakCard } from "@/components/BreakCard";
import { UpNext } from "@/components/UpNext";
import { PastTalks } from "@/components/PastTalks";
import { AuroraBackground } from "@/components/AuroraBackground";
import { ShootingStars } from "@/components/ShootingStars";
import { SpeakerParade } from "@/components/SpeakerParade";
import { FarewellPlanes } from "@/components/FarewellPlanes";
import { QRCodeSVG } from "qrcode.react";

export default function Home() {
  const now = useCurrentTime(1000);
  const state = getScheduleState(schedule, now);
  const partyIntensity = getPartyIntensity(schedule, now);

  // Restore cursor when interactive (post-conference or time traveling)
  useEffect(() => {
    const hasTimeParam = new URLSearchParams(window.location.search).has("time");
    if (state.isAfterEnd || hasTimeParam) {
      document.documentElement.style.cursor = "auto";
      document.body.style.cursor = "auto";
      return () => {
        document.documentElement.style.cursor = "";
        document.body.style.cursor = "";
      };
    }
  }, [state.isAfterEnd]);

  // Pulse aurora when current item changes
  const [auroraPulse, setAuroraPulse] = useState(false);
  const prevItemId = useRef<number | null>(null);

  useEffect(() => {
    const currentId = state.currentItem?.id ?? null;
    if (prevItemId.current !== null && currentId !== prevItemId.current) {
      setAuroraPulse(true);
      const timer = setTimeout(() => setAuroraPulse(false), 4000);
      return () => clearTimeout(timer);
    }
    prevItemId.current = currentId;
  }, [state.currentItem?.id]);

  return (
    <div className="w-screen min-h-screen lg:h-screen bg-navy lg:overflow-hidden flex justify-center">
      <AuroraBackground pulse={auroraPulse} />
      {!state.isAfterEnd && <ShootingStars partyIntensity={partyIntensity} />}
      <div className="w-full lg:w-[75%] h-full flex flex-col lg:overflow-hidden relative z-10">
      <Header now={now} dayLabel={state.dayLabel} partyIntensity={partyIntensity} isAfterEnd={state.isAfterEnd} />

      <main className="flex-1 flex flex-col lg:overflow-hidden lg:min-h-0 px-4 py-4 gap-5 sm:px-6 sm:py-6 sm:gap-6 lg:px-20 lg:py-10 lg:gap-10">
        {state.isBeforeStart ? (
          <BeforeStart
            dayLabel={state.dayLabel}
            firstStart={state.firstItemStart}
            now={now}
            upNext={state.upNext}
          />
        ) : state.isAfterEnd ? (
          <AfterEnd dayLabel={state.dayLabel} />
        ) : (
          <LiveView state={state} now={now} partyIntensity={partyIntensity} />
        )}
      </main>
      </div>

      {/* QR code — TV/desktop only, top-right corner */}
      <div className="hidden lg:flex fixed top-6 right-6 z-20 flex-col items-center gap-2">
        <div className="rounded-xl bg-white p-5">
          <QRCodeSVG
            value="https://robocon2026-agenda.netlify.app"
            size={100}
            bgColor="#ffffff"
            fgColor="#000011"
            level="M"
          />
        </div>
        <span className="text-[10px] text-cyan-30 uppercase tracking-widest">
          Scan for mobile
        </span>
      </div>
    </div>
  );
}

function LiveView({
  state,
  now,
  partyIntensity,
}: {
  state: ReturnType<typeof getScheduleState>;
  now: Date;
  partyIntensity: number;
}) {
  const nextTalk = state.upNext.find((item) => !item.isBreak) || null;
  const nowRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the NOW card on mount (mobile: past talks are above, so scroll down to current)
  useEffect(() => {
    if (nowRef.current && window.innerWidth < 1024) {
      nowRef.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, []);

  return (
    <>
      {/* Past talks – above NOW so mobile users can scroll up to see them */}
      {state.past.length > 0 && (
        <div className="shrink-0">
          <PastTalks items={state.past} />
        </div>
      )}

      {/* Current talk / break - never clipped */}
      <div className="shrink-0" ref={nowRef}>
        {state.currentItem && (
          state.currentItem.isBreak ? (
            <BreakCard
              item={state.currentItem}
              progress={state.progress}
              now={now}
              nextTalk={nextTalk}
            />
          ) : (
            <CurrentTalk
              item={state.currentItem}
              progress={state.progress}
              partyIntensity={partyIntensity}
            />
          )
        )}
      </div>

      {/* Divider */}
      <div className="shrink-0 h-px bg-cyan-10" />

      {/* Up Next – fills remaining space, scrollable on desktop */}
      <div className="flex-1 lg:min-h-0 lg:overflow-hidden">
        <UpNext items={state.upNext} partyIntensity={partyIntensity} />
      </div>
    </>
  );
}

function BeforeStart({
  dayLabel,
  firstStart,
  now,
  upNext,
}: {
  dayLabel: string;
  firstStart: Date | null;
  now: Date;
  upNext: ReturnType<typeof getScheduleState>["upNext"];
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-6 lg:gap-8">
      <div className="text-center py-4 lg:py-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan" style={{ fontFamily: "var(--font-heading)" }}>
          {dayLabel === "Day 1" ? "Welcome to RoboCon 2026!" : "Welcome back!"}
        </h2>
        {firstStart && (
          <p className="text-lg sm:text-xl lg:text-2xl text-teal mt-3 lg:mt-4">
            {dayLabel} starts {getTimeUntil(firstStart, now)}
          </p>
        )}
      </div>
      {upNext.length > 0 && (
        <div className="flex-1 w-full min-h-0 overflow-hidden">
          <UpNext items={upNext} />
        </div>
      )}
    </div>
  );
}

function AfterEnd({ dayLabel }: { dayLabel: string }) {
  if (dayLabel === "Day 1") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 lg:gap-6 px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan text-center" style={{ fontFamily: "var(--font-heading)" }}>
          That&apos;s a wrap for Day 1!
        </h2>
        <p className="text-lg sm:text-xl lg:text-2xl text-teal">See you tomorrow for Day 2</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 lg:gap-8 px-4">
      <SpeakerParade />
      <FarewellPlanes />
      {/* Avatar + wave */}
      <div className="relative farewell-float">
        {/* Pulsing glow ring */}
        <div className="absolute inset-[-8px] rounded-full farewell-glow-ring" />

        {/* Animated pixel art avatar */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden">
          <video
            src="/david-fogl-pixel.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Waving hand */}
        <span className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 text-4xl sm:text-5xl lg:text-6xl farewell-wave">
          👋
        </span>
      </div>

      {/* Farewell message */}
      <div className="text-center max-w-xl lg:max-w-2xl space-y-3 lg:space-y-4">
        <h2
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan leading-snug"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          The robots are resting, the gnomes have gone home,
          <br />
          but the vibes live on forever.
        </h2>
        <p className="text-lg sm:text-xl lg:text-2xl text-teal">
          Safe travels, everyone — hope to see you all again soon!
        </p>
      </div>

      {/* Name + title */}
      <div className="text-center">
        <p className="text-base sm:text-lg lg:text-xl font-bold text-cyan">David Fogl</p>
        <p className="text-sm sm:text-base lg:text-lg text-cyan-60">
          RF Foundation Board Member &middot; Vibe Coder
        </p>
      </div>
    </div>
  );
}
