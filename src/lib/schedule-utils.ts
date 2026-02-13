import { ScheduleItem } from "@/data/schedule";

export interface ScheduleState {
  currentItem: ScheduleItem | null;
  upNext: ScheduleItem[];
  past: ScheduleItem[];
  progress: number; // 0 to 1
  dayLabel: string;
  isBeforeStart: boolean;
  isAfterEnd: boolean;
  firstItemStart: Date | null;
}

export function getDay(date: Date): 1 | 2 | null {
  const utcDate = date.getUTCDate();
  const utcMonth = date.getUTCMonth(); // 0-indexed
  if (utcMonth === 1 && utcDate === 12) return 1;
  if (utcMonth === 1 && utcDate === 13) return 2;
  return null;
}

export function getDayItems(schedule: ScheduleItem[], day: 1 | 2): ScheduleItem[] {
  const targetDate = day === 1 ? "2026-02-12" : "2026-02-13";
  return schedule.filter((item) => item.start.startsWith(targetDate));
}

export function getScheduleState(
  schedule: ScheduleItem[],
  now: Date
): ScheduleState {
  const day = getDay(now);

  // If not a conference day, show Day 1 schedule in "before start" state
  // or determine closest day
  const nowISO = now.toISOString();

  // Try to find which day we're on
  let dayItems: ScheduleItem[];
  let dayLabel: string;

  if (day === 1) {
    dayItems = getDayItems(schedule, 1);
    dayLabel = "Day 1";
  } else if (day === 2) {
    dayItems = getDayItems(schedule, 2);
    dayLabel = "Day 2";
  } else {
    // Not a conference day - check if before or after conference
    const day1Start = new Date("2026-02-12T07:00:00Z");
    const day2End = new Date("2026-02-13T15:00:00Z");

    if (now < day1Start) {
      dayItems = getDayItems(schedule, 1);
      dayLabel = "Day 1";
    } else if (now > day2End) {
      dayItems = getDayItems(schedule, 2);
      dayLabel = "Day 2";
    } else {
      // Between days - show Day 2 as upcoming
      dayItems = getDayItems(schedule, 2);
      dayLabel = "Day 2";
    }
  }

  if (dayItems.length === 0) {
    return {
      currentItem: null,
      upNext: [],
      past: [],
      progress: 0,
      dayLabel,
      isBeforeStart: true,
      isAfterEnd: false,
      firstItemStart: null,
    };
  }

  const firstStart = new Date(dayItems[0].start);
  const lastEnd = new Date(dayItems[dayItems.length - 1].end);

  if (now < firstStart) {
    return {
      currentItem: null,
      upNext: dayItems,
      past: [],
      progress: 0,
      dayLabel,
      isBeforeStart: true,
      isAfterEnd: false,
      firstItemStart: firstStart,
    };
  }

  if (now >= lastEnd) {
    return {
      currentItem: null,
      upNext: [],
      past: dayItems,
      progress: 1,
      dayLabel,
      isBeforeStart: false,
      isAfterEnd: true,
      firstItemStart: null,
    };
  }

  // Find current item
  let currentItem: ScheduleItem | null = null;
  const past: ScheduleItem[] = [];
  const upNext: ScheduleItem[] = [];

  for (const item of dayItems) {
    const itemStart = new Date(item.start);
    const itemEnd = new Date(item.end);

    if (now >= itemStart && now < itemEnd) {
      currentItem = item;
    } else if (itemEnd <= now) {
      past.push(item);
    } else {
      upNext.push(item);
    }
  }

  // Calculate progress within current item
  let progress = 0;
  if (currentItem) {
    const start = new Date(currentItem.start).getTime();
    const end = new Date(currentItem.end).getTime();
    progress = (now.getTime() - start) / (end - start);
  }

  return {
    currentItem,
    upNext,
    past,
    progress: Math.min(1, Math.max(0, progress)),
    dayLabel,
    isBeforeStart: false,
    isAfterEnd: false,
    firstItemStart: null,
  };
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Helsinki",
  });
}

export function formatCurrentTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Helsinki",
  });
}

export function formatCurrentDate(date: Date): string {
  const weekday = date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "Europe/Helsinki" });
  const day = date.toLocaleDateString("en-GB", { day: "numeric", timeZone: "Europe/Helsinki" });
  const month = date.toLocaleDateString("en-GB", { month: "short", timeZone: "Europe/Helsinki" });
  return `${weekday}, ${day} ${month}`;
}

/**
 * Returns 0–1 intensity for disco effects based on proximity to the after-party.
 * 0 = far away (>2h), 1 = it's party time (after-party is current item).
 * Ramps up over the last 2 hours before the party starts.
 */
export function getPartyIntensity(schedule: ScheduleItem[], now: Date): number {
  const partyItem = schedule.find((item) =>
    item.title.toLowerCase().includes("after-party")
  );
  if (!partyItem) return 0;

  const partyStart = new Date(partyItem.start).getTime();
  const partyEnd = new Date(partyItem.end).getTime();
  const nowMs = now.getTime();

  // Already at the party
  if (nowMs >= partyStart && nowMs < partyEnd) return 1;

  // Party is over
  if (nowMs >= partyEnd) return 0;

  // Ramp up over 2 hours before party
  const rampMs = 2 * 60 * 60 * 1000; // 2 hours
  const timeUntil = partyStart - nowMs;
  if (timeUntil > rampMs) return 0;

  // 0 at 2h out, ~0.8 right before it starts (save 1.0 for when it's live)
  return (1 - timeUntil / rampMs) * 0.8;
}

export function getTimeUntil(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "now";
  const minutes = Math.ceil(diff / 60000);
  if (minutes < 60) return `in ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `in ${hours}h ${mins}min`;
}
