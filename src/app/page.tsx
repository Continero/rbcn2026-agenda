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
    <div className="w-screen h-screen bg-navy overflow-hidden flex justify-center">
      <div className="w-[75%] h-full flex flex-col overflow-hidden">
      <Header now={now} dayLabel={state.dayLabel} />

      <main className="flex-1 flex flex-col overflow-hidden min-h-0 px-20 py-10 gap-10">
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

      {/* Bottom: Up Next + Past Talks share remaining space */}
      <div className="flex-1 min-h-0 flex flex-col gap-6">
        <div className="flex-1 min-h-0 overflow-hidden">
          <UpNext items={state.upNext} />
        </div>
        {state.past.length > 0 && (
          <div className="shrink-0">
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
    <div className="flex-1 flex flex-col items-center gap-8">
      <div className="text-center py-10">
        <h2 className="text-4xl font-bold text-cyan" style={{ fontFamily: "var(--font-heading)" }}>
          {dayLabel === "Day 1" ? "Welcome to RoboCon 2026!" : "Welcome back!"}
        </h2>
        {firstStart && (
          <p className="text-2xl text-teal mt-4">
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
    <div className="flex-1 flex flex-col items-center justify-center gap-6">
      {dayLabel === "Day 1" ? (
        <>
          <h2 className="text-4xl font-bold text-cyan text-center" style={{ fontFamily: "var(--font-heading)" }}>
            That&apos;s a wrap for Day 1!
          </h2>
          <p className="text-2xl text-teal">See you tomorrow for Day 2</p>
        </>
      ) : (
        <>
          <h2 className="text-4xl font-bold text-cyan text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Thank you for attending RoboCon 2026!
          </h2>
          <p className="text-2xl text-teal">See you next year</p>
        </>
      )}
    </div>
  );
}
