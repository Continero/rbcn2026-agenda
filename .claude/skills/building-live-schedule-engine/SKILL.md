---
name: building-live-schedule-engine
description: Builds the real-time schedule state engine with useCurrentTime hook, URL-based time simulation, and getScheduleState calculator. Handles current/past/upcoming detection, multi-day switching, and progress tracking. Use when implementing live schedule tracking logic.
---

# Building the Live Schedule Engine

Two pieces: a time hook and a state calculator.

## useCurrentTime Hook

Client-side hook returning current time, updating every second. Supports URL parameters for testing.

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";

export function useCurrentTime(intervalMs: number = 1000): Date {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  const getConfig = useCallback(() => {
    if (typeof window === "undefined") return { offset: 0, speed: 1 };
    const params = new URLSearchParams(window.location.search);
    const timeParam = params.get("time");
    const speedParam = params.get("speed");

    let offset = 0, speed = 1;
    if (timeParam) {
      const simulated = new Date(timeParam);
      if (!isNaN(simulated.getTime())) offset = simulated.getTime() - Date.now();
    }
    if (speedParam) {
      const s = parseFloat(speedParam);
      if (!isNaN(s) && s > 0) speed = s;
    }
    return { offset, speed };
  }, []);

  useEffect(() => {
    setMounted(true);
    const { offset, speed } = getConfig();
    const startReal = Date.now();
    setNow(new Date(startReal + offset));

    const timer = setInterval(() => {
      const elapsed = Date.now() - startReal;
      setNow(new Date(startReal + offset + elapsed * speed));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, getConfig]);

  // Stable date during SSR to avoid hydration mismatch
  if (!mounted) return new Date("2026-02-12T07:00:00Z");
  return now;
}
```

### Time Simulation

- `?time=2026-02-12T09:25:00Z` — jump to specific time
- `?speed=10` — 10x speed
- Combine: `?time=...&speed=60` — start at time, 1-minute-per-second

## getScheduleState Function

### ScheduleState Interface

```typescript
export interface ScheduleState {
  currentItem: ScheduleItem | null;
  upNext: ScheduleItem[];
  past: ScheduleItem[];
  progress: number;      // 0 to 1
  dayLabel: string;      // "Day 1" or "Day 2"
  isBeforeStart: boolean;
  isAfterEnd: boolean;
  firstItemStart: Date | null;
}
```

### Algorithm

1. **Determine day** — match UTC date to conference days
2. **Filter items** — by ISO date prefix
3. **Boundary states** — before first item? after last?
4. **Classify each item**:
   - `now >= start && now < end` → currentItem
   - `end <= now` → past
   - else → upNext
5. **Progress** — `(now - start) / (end - start)`, clamped 0-1

### Day Detection

```typescript
function getDay(date: Date): 1 | 2 | null {
  const utcDate = date.getUTCDate();
  const utcMonth = date.getUTCMonth();
  if (utcMonth === 1 && utcDate === 12) return 1;
  if (utcMonth === 1 && utcDate === 13) return 2;
  return null;
}
```

Non-conference days: show Day 1 before conference, Day 2 after.

### Utility Functions

```typescript
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Helsinki",
  });
}

function getTimeUntil(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "now";
  const minutes = Math.ceil(diff / 60000);
  if (minutes < 60) return `in ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `in ${hours}h ${minutes % 60}min`;
}
```

## Wiring Together

```typescript
// page.tsx
const now = useCurrentTime(1000);
const state = getScheduleState(schedule, now);
```
