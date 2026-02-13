---
name: modeling-conference-data
description: Defines TypeScript interfaces and data structures for conference schedule items and speaker profiles. Covers ScheduleItem interface, Speaker lookup table, timezone handling, and abstract cleaning. Use when setting up conference data models.
---

# Modeling Conference Data

## ScheduleItem Interface

```typescript
export interface ScheduleItem {
  id: number;
  code?: string;           // External system ID (e.g., pretalx talk code)
  title: string;
  abstract?: string;       // May contain markdown from CfP system
  speakerCodes: string[];  // Maps to Speaker lookup table
  start: string;           // ISO 8601 datetime in UTC
  end: string;             // ISO 8601 datetime in UTC
  duration: number;        // Minutes
  isBreak: boolean;        // Breaks render differently
}
```

### Key Design Decisions

- **All times in UTC** — displayed in event timezone via `toLocaleTimeString` with `timeZone` option
- **Speaker references by code** — not by name, enables speaker lookup pattern
- **isBreak flag** — breaks render differently: no speaker, dimmed styling, emoji icons
- **Abstracts may contain markdown** — strip before rendering with `cleanAbstract()`

## Speaker Lookup

`Record<string, Speaker>` for O(1) lookup by code:

```typescript
export interface Speaker {
  code: string;
  name: string;
  avatar: string; // URL
}

export const speakers: Record<string, Speaker> = {
  ABC123: {
    code: "ABC123",
    name: "Jane Smith",
    avatar: "https://example.com/avatars/ABC123.webp",
  },
};
```

For detailed schema examples, see [reference/schedule-schema.md](reference/schedule-schema.md).

## Multi-Day Conferences

Filter by day using ISO date prefix:
```typescript
const day1Items = schedule.filter(item => item.start.startsWith("2026-02-12"));
```

## Special Events

Community dinners, parties use emoji in title and longer durations:
```typescript
{
  id: 9900001,
  title: "🍽️ Community Dinner — Venue Name",
  abstract: "Details...",
  speakerCodes: [],
  start: "2026-02-12T16:30:00Z",
  end: "2026-02-12T18:30:00Z",
  duration: 120,
  isBreak: false,  // Not a break — it's an event
}
```

## Abstract Cleaning

Strip markdown before rendering:

```typescript
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
```

## Timezone Display

Store UTC, display in event timezone:

```typescript
function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Helsinki",
  });
}
```
