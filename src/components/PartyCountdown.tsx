"use client";

import { useEffect, useRef } from "react";
import { useCurrentTime } from "@/hooks/useCurrentTime";

const DISCO_COLORS = [
  "#ff1493", "#00ff87", "#ffdd00", "#ff6b35",
  "#00d4ff", "#bf5fff", "#ff4444", "#44ff44",
];

interface PartyCountdownProps {
  /** ISO string of party start time */
  partyStart: string;
  /** 0–1 disco intensity */
  intensity: number;
}

export function PartyCountdown({ partyStart, intensity }: PartyCountdownProps) {
  const now = useCurrentTime(1000);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorIdxRef = useRef(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetMs = new Date(partyStart).getTime();
  const diff = Math.max(0, targetMs - now.getTime());
  const isPartyTime = diff <= 0;

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  // Color-cycle the digits via JS
  useEffect(() => {
    if (intensity <= 0.1 || !containerRef.current) {
      if (animRef.current) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
      return;
    }

    const stepMs = Math.max(150, 600 - intensity * 450);

    function tick() {
      const el = containerRef.current;
      if (!el) return;
      colorIdxRef.current = (colorIdxRef.current + 1) % DISCO_COLORS.length;
      const color = DISCO_COLORS[colorIdxRef.current];

      // Color the digits
      const digits = el.querySelectorAll<HTMLSpanElement>(".countdown-digit");
      digits.forEach((d, i) => {
        const offset = (colorIdxRef.current + i * 2) % DISCO_COLORS.length;
        d.style.color = DISCO_COLORS[offset];
      });

      // Color the separators
      const seps = el.querySelectorAll<HTMLSpanElement>(".countdown-sep");
      seps.forEach((s) => {
        s.style.color = color;
      });

      // Glow on label
      if (intensity > 0.4) {
        const label = el.querySelector<HTMLSpanElement>(".countdown-label");
        if (label) label.style.color = color;
      }
    }

    tick();
    animRef.current = setInterval(tick, stepMs);

    return () => {
      if (animRef.current) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
    };
  }, [intensity]);

  // Scale up font size with intensity
  const baseFontSize = 1.5 + intensity * 1.5; // 1.5rem at 0, 3rem at 1
  const labelSize = 0.65 + intensity * 0.25;

  // Pulse animation at high intensity
  const pulseClass = intensity > 0.5 ? "countdown-pulse" : "";

  if (isPartyTime) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center py-3 ${pulseClass}`}
      >
        <span
          className="countdown-digit font-bold tracking-wider uppercase"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: `${baseFontSize}rem`,
            color: DISCO_COLORS[0],
          }}
        >
          PARTY TIME!
        </span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center gap-1 py-3 ${pulseClass}`}
    >
      <span
        className="countdown-label uppercase tracking-[0.2em] font-semibold"
        style={{
          fontSize: `${labelSize}rem`,
          color: intensity > 0.3 ? DISCO_COLORS[3] : "rgba(230, 248, 246, 0.5)",
          fontFamily: "var(--font-heading)",
        }}
      >
        Party starts in
      </span>
      <div
        className="font-mono tabular-nums font-bold flex items-baseline gap-1"
        style={{ fontSize: `${baseFontSize}rem` }}
      >
        {hours > 0 && (
          <>
            <span className="countdown-digit" style={{ color: "rgba(230, 248, 246, 0.9)" }}>
              {pad(hours)}
            </span>
            <span className="countdown-sep" style={{ color: "rgba(230, 248, 246, 0.4)", fontSize: "0.8em" }}>
              h
            </span>
          </>
        )}
        <span className="countdown-digit" style={{ color: "rgba(230, 248, 246, 0.9)" }}>
          {pad(minutes)}
        </span>
        <span className="countdown-sep" style={{ color: "rgba(230, 248, 246, 0.4)", fontSize: "0.8em" }}>
          m
        </span>
        <span className="countdown-digit" style={{ color: "rgba(230, 248, 246, 0.9)" }}>
          {pad(seconds)}
        </span>
        <span className="countdown-sep" style={{ color: "rgba(230, 248, 246, 0.4)", fontSize: "0.8em" }}>
          s
        </span>
      </div>
    </div>
  );
}
