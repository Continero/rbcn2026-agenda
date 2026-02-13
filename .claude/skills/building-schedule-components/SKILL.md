---
name: building-schedule-components
description: Builds all conference schedule UI components - Header with live clock, CurrentTalk with speaker avatars, BreakCard with countdown, UpNext with expandable abstracts, PastTalks with collapsed view, and ProgressBar with shimmer. Use when implementing conference display UI.
---

# Building Schedule Components

Six components, each receiving props from the schedule state engine. All `"use client"`.

## Component Overview

| Component | Props | Purpose |
|-----------|-------|---------|
| Header | `now`, `dayLabel` | Clock, date, day tabs, logo |
| CurrentTalk | `item`, `progress` | Active talk card |
| BreakCard | `item`, `progress`, `now`, `nextTalk` | Break with countdown |
| UpNext | `items` | Upcoming items list |
| PastTalks | `items` | Completed talks |
| ProgressBar | `progress` | Animated progress bar |

For detailed specs, see [reference/component-specs.md](reference/component-specs.md).

## Header

Live clock, date, day tabs (Day 1 / Day 2).

```tsx
<header className="flex flex-col gap-3 lg:gap-5 border-b border-cyan-10 shrink-0">
  <div className="flex items-center gap-4">
    <Logo />
    <h1 style={{ fontFamily: "var(--font-heading)" }}>Conference Name</h1>
  </div>
  <div className="flex items-center justify-center gap-5">
    <span className="text-cyan-60">{formatCurrentDate(now)}</span>
    <span className="text-5xl font-bold text-teal tabular-nums">{formatCurrentTime(now)}</span>
    <DayTab label="Day 1" active={dayLabel === "Day 1"} />
    <DayTab label="Day 2" active={dayLabel === "Day 2"} />
  </div>
</header>
```

`tabular-nums` on clock prevents layout shift as digits change.

## CurrentTalk

NOW badge, time range, title, speaker avatars, abstract, progress bar.

```tsx
<div className="flex flex-col gap-5">
  <div className="flex items-center gap-4">
    <span className="text-teal uppercase tracking-wider">
      <span className="w-4 h-4 rounded-full bg-teal animate-pulse" /> Now
    </span>
    <span className="text-cyan-60">{start} – {end}</span>
    <span className="text-cyan-30 ml-auto">{duration}min</span>
  </div>
  <ProgressBar progress={progress} />
  <div className="border-l-4 border-teal rounded-r-xl px-10 py-6 glow-breathe"
       style={{ background: "rgba(0, 192, 181, 0.04)" }}>
    <h2 style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
    {/* Speaker avatars + abstract */}
  </div>
</div>
```

Speaker avatars: Next.js `Image` with `grayscale brightness-80`. Fallback: colored circle with initial.

## BreakCard

Centered with emoji and countdown to next talk.

```tsx
<div className="border-l-4 border-cyan-30 rounded-r-xl px-12 py-10 flex flex-col items-center">
  <span className="text-6xl">{getBreakEmoji(title)}</span>
  <h2>{title}</h2>
  <p>Next up {getTimeUntil(itemEnd, now)}: {nextTalk.title}</p>
</div>
```

Emoji mapping: breakfast/coffee→☕, lunch→🍝, afternoon treat→🍰, lightning→⚡, voting→🗳️

## UpNext

Expandable list with auto-expand and special event highlighting.

Behaviors:
- First non-break item auto-expanded on mount
- Re-expands when schedule advances
- Click to toggle abstract expansion
- Breaks: dimmer, italic, no expansion
- Special events (karaoke, after-party): `.upnext-highlight` golden shimmer, always expanded

## PastTalks

Collapsed section above current talk. Non-break items only with checkmarks.
- "Earlier Today" centered label with horizontal rules
- Items greyed out (`text-cyan/40`), click to expand
- No breaks shown

## ProgressBar

```tsx
<div className="w-full h-2.5 bg-white-10 rounded-full overflow-hidden">
  <div className="h-full rounded-full transition-all duration-1000 shimmer-bar"
    style={{
      width: `${Math.round(progress * 100)}%`,
      background: "linear-gradient(90deg, #00c0b5, #2ecbc2, #bbc446)",
    }} />
</div>
```
