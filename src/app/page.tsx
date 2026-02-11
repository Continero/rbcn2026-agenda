"use client";

import { schedule } from "@/data/schedule";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { getScheduleState, getTimeUntil } from "@/lib/schedule-utils";
import { Header } from "@/components/Header";
import { CurrentTalk } from "@/components/CurrentTalk";
import { BreakCard } from "@/components/BreakCard";
import { UpNext } from "@/components/UpNext";
import { PastTalks } from "@/components/PastTalks";

export default function Home() {
  const now = useCurrentTime(1000);
  const state = getScheduleState(schedule, now);

  return (
    <div className="w-screen min-h-screen lg:h-screen bg-navy lg:overflow-hidden flex justify-center">
      <div className="w-full lg:w-[75%] h-full flex flex-col lg:overflow-hidden">
      <Header now={now} dayLabel={state.dayLabel} />

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
          <LiveView state={state} now={now} />
        )}
      </main>
      </div>
    </div>
  );
}

function LiveView({
  state,
  now,
}: {
  state: ReturnType<typeof getScheduleState>;
  now: Date;
}) {
  const nextTalk = state.upNext.find((item) => !item.isBreak) || null;

  return (
    <>
      {/* Current talk / break - never clipped */}
      <div className="shrink-0">
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
            />
          )
        )}
      </div>

      {/* Divider */}
      <div className="shrink-0 h-px bg-cyan-10" />

      {/* Bottom: Up Next + Past Talks – grid ensures Past Talks always visible on desktop */}
      <div className="flex-1 lg:min-h-0 lg:grid lg:grid-rows-[minmax(0,1fr)_auto] gap-6 lg:overflow-hidden">
        <div className="lg:overflow-hidden">
          <UpNext items={state.upNext} />
        </div>
        {state.past.length > 0 && (
          <div>
            <PastTalks items={state.past} />
          </div>
        )}
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
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 lg:gap-6 px-4">
      {dayLabel === "Day 1" ? (
        <>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan text-center" style={{ fontFamily: "var(--font-heading)" }}>
            That&apos;s a wrap for Day 1!
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-teal">See you tomorrow for Day 2</p>
        </>
      ) : (
        <>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Thank you for attending RoboCon 2026!
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-teal">See you next year</p>
        </>
      )}
    </div>
  );
}
