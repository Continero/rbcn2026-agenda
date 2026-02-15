"use client";

import { useState, useEffect } from "react";
import { formatCurrentTime, formatCurrentDate } from "@/lib/schedule-utils";

interface HeaderProps {
  now: Date;
  dayLabel: string;
  partyIntensity?: number;
  isAfterEnd?: boolean;
}

const TIME_MACHINE_STOPS = [
  { label: "Day 1 Opening", time: "2026-02-12T07:00:00Z" },
  { label: "Day 2 Keynote", time: "2026-02-13T07:00:00Z" },
  { label: "Party Mode", time: "2026-02-13T14:50:00Z" },
];

export function Header({ now, dayLabel, partyIntensity = 0, isAfterEnd = false }: HeaderProps) {
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsTimeTraveling(params.has("time"));
  }, []);

  const showTimeMachine = (isAfterEnd && dayLabel === "Day 2") || isTimeTraveling;

  return (
    <header className="flex flex-col gap-3 lg:gap-5 px-4 sm:px-6 lg:px-0 pt-4 pb-3 lg:pt-10 lg:pb-8 border-b border-cyan-10 shrink-0">
      {/* Top row: logo + title */}
      <div className="flex items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 shrink-0">
            <RoboConLogo />
          </div>
          <h1 className={`text-lg sm:text-xl lg:text-3xl font-bold tracking-[0.15em] text-cyan uppercase ${partyIntensity >= 1 ? "header-glitch" : ""}`} style={{ fontFamily: "var(--font-heading)" }}>
            RoboCon 2026
          </h1>
        </div>
      </div>
      {/* Bottom row: day tabs or time machine */}
      <div className="flex items-center justify-center gap-3 lg:gap-5">
        <span className="text-cyan-60 text-sm sm:text-lg lg:text-2xl">{formatCurrentDate(now)}</span>
        <span className="text-2xl sm:text-3xl lg:text-5xl font-bold text-teal tabular-nums tracking-wider">
          {formatCurrentTime(now)}
        </span>
        <div className="flex gap-2 sm:gap-3 ml-3 lg:ml-5">
          {showTimeMachine ? (
            <>
              <span className="text-base sm:text-lg lg:text-2xl self-center mr-1">🕰️</span>
              {TIME_MACHINE_STOPS.map((stop) => (
                <TimeMachineTab key={stop.time} label={stop.label} time={stop.time} />
              ))}
              {isTimeTraveling && (
                <TimeMachineTab label="Back to Now" time="" />
              )}
            </>
          ) : (
            <>
              <DayTab label="Day 1" active={dayLabel === "Day 1"} />
              <DayTab label="Day 2" active={dayLabel === "Day 2"} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function TimeMachineTab({ label, time }: { label: string; time: string }) {
  const isParty = label === "Party Mode";
  const isBackToNow = !time;
  return (
    <button
      onClick={() => {
        const url = new URL(window.location.href);
        if (isBackToNow) {
          url.searchParams.delete("time");
          url.searchParams.delete("speed");
        } else {
          url.searchParams.set("time", time);
        }
        window.location.href = url.toString();
      }}
      className={`py-1.5 sm:py-2 lg:py-4 text-xs sm:text-base lg:text-xl font-bold rounded-full transition-colors cursor-pointer ${
        isParty
          ? "bg-teal text-navy hover:bg-teal-dim"
          : isBackToNow
          ? "bg-gradient-3/20 text-gradient-3 hover:bg-gradient-3/40"
          : "bg-cyan-10 text-cyan-60 hover:bg-cyan-30 hover:text-cyan"
      }`}
      style={{ paddingLeft: "15px", paddingRight: "15px" }}
    >
      {label}
    </button>
  );
}

function DayTab({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`py-1.5 sm:py-2 lg:py-4 text-xs sm:text-base lg:text-2xl font-bold rounded-full transition-colors ${
        active
          ? "bg-teal text-navy"
          : "bg-cyan-10 text-cyan-60"
      }`}
      style={{ paddingLeft: "15px", paddingRight: "15px" }}
    >
      {label}
    </span>
  );
}

function RoboConLogo() {
  return (
    <svg width="100%" height="100%" viewBox="40 40 122.4325 122.34125" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1.25,0,0,-1.25,0,202.34125)">
        <g>
          <g>
            <g transform="translate(52.4477,88.1268)">
              <path
                style={{ fill: "#00c0b5", fillOpacity: 1, fillRule: "nonzero", stroke: "none" }}
                d="m 0,0 c 0,7.6 6.179,13.779 13.77,13.779 7.6,0 13.779,-6.179 13.779,-13.779 0,-2.769 -2.238,-5.007 -4.998,-5.007 -2.761,0 -4.999,2.238 -4.999,5.007 0,2.078 -1.695,3.765 -3.782,3.765 C 11.693,3.765 9.997,2.078 9.997,0 9.997,-2.769 7.76,-5.007 4.999,-5.007 2.238,-5.007 0,-2.769 0,0 m 57.05,-23.153 c 0,-2.771 -2.237,-5.007 -4.998,-5.007 l -46.378,0 c -2.761,0 -4.999,2.236 -4.999,5.007 0,2.769 2.238,5.007 4.999,5.007 l 46.378,0 c 2.761,0 4.998,-2.238 4.998,-5.007 M 35.379,-2.805 c -1.545,2.291 -0.941,5.398 1.35,6.943 l 11.594,7.83 c 2.273,1.58 5.398,0.941 6.943,-1.332 1.545,-2.29 0.941,-5.398 -1.35,-6.943 l -11.594,-7.83 c -0.852,-0.586 -1.829,-0.87 -2.788,-0.87 -1.607,0 -3.187,0.781 -4.155,2.202 m 31.748,-30.786 c 0,-0.945 -0.376,-1.852 -1.045,-2.522 l -8.617,-8.617 c -0.669,-0.668 -1.576,-1.045 -2.523,-1.045 l -52.833,0 c -0.947,0 -1.854,0.377 -2.523,1.045 l -8.617,8.617 c -0.669,0.67 -1.045,1.577 -1.045,2.522 l 0,52.799 c 0,0.947 0.376,1.854 1.045,2.522 l 8.617,8.619 c 0.669,0.668 1.576,1.044 2.523,1.044 l 52.833,0 c 0.947,0 1.854,-0.376 2.523,-1.044 l 8.617,-8.619 c 0.669,-0.668 1.045,-1.575 1.045,-2.522 l 0,-52.799 z m 7.334,61.086 -11.25,11.25 c -1.705,1.705 -4.018,2.663 -6.428,2.663 l -56.523,0 c -2.412,0 -4.725,-0.959 -6.43,-2.665 L -17.412,27.494 c -1.704,-1.705 -2.661,-4.016 -2.661,-6.427 l 0,-56.515 c 0,-2.411 0.958,-4.725 2.663,-6.428 l 11.25,-11.25 c 1.705,-1.705 4.017,-2.662 6.428,-2.662 l 56.515,0 c 2.41,0 4.723,0.957 6.428,2.662 l 11.25,11.25 c 1.705,1.703 2.663,4.017 2.663,6.428 l 0,56.514 c 0,2.412 -0.958,4.724 -2.663,6.429"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
