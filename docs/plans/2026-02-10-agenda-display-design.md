# RoboCon 2026 Agenda TV Display - Design Document

## Overview

A full-screen conference agenda display for RoboCon 2026, designed for a horizontal Full-HD TV (1920x1080) in the venue. Shows the current time, highlights the active talk with details, and lists upcoming/past sessions. Covers Feb 12-13 (conference days, single "RoboCon" room).

## Tech Stack

- **Framework**: Next.js (App Router)
- **Deployment**: Netlify
- **Data**: Embedded static JSON (from pretalx widget API)
- **Styling**: CSS Modules or Tailwind CSS (matching robocon.io branding)

## Data Scope

- **Feb 12** (Conference Day 1): 12 talks + breaks, room "RoboCon" (5060)
- **Feb 13** (Conference Day 2): 8 talks + breaks, room "RoboCon" (5060)
- Data sources: `widget.json` (compact talk data) and `agenda_response.json` (full pretalx schedule with speaker details/avatars)
- Only room 5060 ("RoboCon") items are relevant

## Branding (from robocon.io)

- **Background**: Dark navy `#000011`
- **Primary accent**: Teal `#00c0b5`
- **Text**: White `#ffffff`
- **Gradient accents**: `#bbc446` (yellow-green), `#00c0b5` (teal), `#ff00e1` (magenta), `#1f1b9f` (deep blue)
- **Heading font**: OCR-style monospace (OCR-A or similar)
- **Body font**: JetBrains Mono / Courier Code (monospace)
- **Theme**: Dark-first, high contrast

## Layout (1920x1080)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]   ROBOCON 2026   [Day 1 | Day 2]     HH:MM   Feb DD   │ Header
├────────────────────────────────────────┬────────────────────────┤
│                                        │                        │
│  ▶ NOW  HH:MM - HH:MM   ████░░ 60%   │  UP NEXT               │
│  ┌────────────────────────────────┐    │                        │
│  │                                │    │  HH:MM  Talk Title     │
│  │  Talk Title (large)            │    │         Speaker(s)     │
│  │                                │    │  ───────────────────   │
│  │  [Avatar] Speaker Name(s)     │    │  HH:MM  Talk Title     │
│  │                           30m  │    │         Speaker(s)     │
│  │                                │    │  ───────────────────   │
│  │  Abstract text providing       │    │  HH:MM  Break Name     │
│  │  detail about the current      │    │  ───────────────────   │
│  │  session...                    │    │  HH:MM  Talk Title     │
│  │                                │    │         Speaker(s)     │
│  └────────────────────────────────┘    │  ───────────────────   │
│                                        │  HH:MM  Talk Title     │
│  ── earlier today ──                   │         Speaker(s)     │
│  ✓ HH:MM  Past Talk Title             │                        │
│  ✓ HH:MM  Past Talk Title             │                        │
│  ✓ HH:MM  Past Talk Title             │                        │
│                                        │                        │
└────────────────────────────────────────┴────────────────────────┘
```

### Header Bar
- RoboCon logo (SVG, left-aligned)
- "ROBOCON 2026" title in OCR font
- Day indicator tabs: "Day 1" / "Day 2" (auto-switches based on date, highlights active day)
- Current time (HH:MM, updates every second) and date, right-aligned

### Current Talk Card (Left, ~65% width)
- Large teal-bordered/glowing card
- **Title**: Large OCR-style heading
- **Speaker(s)**: Circular avatar photos + names
- **Duration**: Badge showing talk length
- **Abstract**: Full text of the talk abstract (truncated with ellipsis if too long for the card)
- **Progress bar**: Thin teal bar at the top of the card showing elapsed time vs. total duration
- For **breaks**: Different visual treatment - no avatar, break icon, countdown to next talk

### Up Next Column (Right, ~35% width)
- List of 4-6 upcoming items
- Each item: time, title, speaker name(s)
- Breaks shown with a subtle different style (dimmer, italic, no speaker)
- First item slightly highlighted (next up)

### Past Talks Section (Bottom-left, below current talk)
- Compact greyed-out list of completed talks
- Checkmark icon + time + title (no speakers, no abstracts)
- Maximum ~4 items, scrolls as the day progresses

## Behavior

### Auto-tracking
- App reads system clock to determine which talk is "NOW"
- Transitions smoothly when a talk ends and the next begins
- Progress bar animates continuously
- Day auto-switches from Feb 12 to Feb 13

### Before first talk / After last talk
- Before day starts: Show "Day starts at HH:MM" with full upcoming schedule
- After day ends: Show "That's a wrap! See you tomorrow" (Day 1) or "Thank you for attending RoboCon 2026!" (Day 2)

### Break handling
- During breaks: Show break name ("Coffee Break", "Lunch Break") with a countdown to the next session
- Different visual treatment (no speaker card, perhaps a subtle animation or the RoboCon gradient background)

## Data Model

Each schedule item from widget.json has:
```typescript
interface ScheduleItem {
  id: number;
  code?: string;           // talk code (absent for breaks)
  title: string | { en: string };  // breaks have {en: "..."} format
  abstract?: string;
  speakers?: string[];     // speaker codes
  start: string;           // ISO datetime
  end: string;             // ISO datetime
  room: number;            // 5060 for RoboCon
  duration?: number;       // minutes
  slot_type?: "break";     // present only for breaks
}
```

Speaker details (name, avatar URL) come from `agenda_response.json` and will be merged at build time into a flat lookup by speaker code.

## File Structure

```
rbcn2026-agenda/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Main agenda display
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── CurrentTalk.tsx
│   │   ├── UpNext.tsx
│   │   ├── PastTalks.tsx
│   │   ├── BreakCard.tsx
│   │   └── ProgressBar.tsx
│   ├── data/
│   │   ├── schedule.ts       # Embedded schedule data (processed)
│   │   └── speakers.ts       # Speaker lookup (code -> name, avatar)
│   ├── hooks/
│   │   └── useCurrentTime.ts
│   └── lib/
│       └── schedule-utils.ts # Time calculations, current/next/past logic
├── public/
│   └── fonts/                # OCR-A, JetBrains Mono
├── next.config.js
├── netlify.toml
├── package.json
└── tsconfig.json
```

## Implementation Steps

1. Initialize Next.js project with TypeScript and Tailwind
2. Process and embed schedule data (filter room 5060, merge speaker details)
3. Build time-tracking hooks and schedule utility functions
4. Implement Header component with clock and day tabs
5. Implement CurrentTalk card with speaker avatars and progress bar
6. Implement UpNext list
7. Implement PastTalks section
8. Implement BreakCard variant
9. Add before-start and after-end states
10. Style everything to match robocon.io branding
11. Configure Netlify deployment
12. Test with simulated time for different points in the schedule
