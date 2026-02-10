"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Returns the current time, updating every `intervalMs` milliseconds.
 *
 * Supports a `?time=` URL parameter for testing:
 *   ?time=2026-02-12T09:25:00Z   (fixed point in time, auto-advances)
 *   ?time=2026-02-12T09:25:00Z&speed=10  (10x speed)
 */
export function useCurrentTime(intervalMs: number = 1000): Date {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  const getConfig = useCallback(() => {
    if (typeof window === "undefined") return { offset: 0, speed: 1 };

    const params = new URLSearchParams(window.location.search);
    const timeParam = params.get("time");
    const speedParam = params.get("speed");

    let offset = 0;
    let speed = 1;

    if (timeParam) {
      const simulated = new Date(timeParam);
      if (!isNaN(simulated.getTime())) {
        offset = simulated.getTime() - Date.now();
      }
    }

    if (speedParam) {
      const s = parseFloat(speedParam);
      if (!isNaN(s) && s > 0) {
        speed = s;
      }
    }

    return { offset, speed };
  }, []);

  useEffect(() => {
    setMounted(true);
    const { offset, speed } = getConfig();
    const startReal = Date.now();

    // Set initial time immediately
    setNow(new Date(startReal + offset));

    const timer = setInterval(() => {
      const elapsed = Date.now() - startReal;
      setNow(new Date(startReal + offset + elapsed * speed));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, getConfig]);

  if (!mounted) {
    // Return a stable date during SSR to avoid hydration mismatch
    return new Date("2026-02-12T07:00:00Z");
  }

  return now;
}
