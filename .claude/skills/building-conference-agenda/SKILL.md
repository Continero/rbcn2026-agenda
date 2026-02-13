---
name: building-conference-agenda
description: Orchestrates building a live conference agenda display from scratch using Next.js, Tailwind CSS, and animated backgrounds. Guides through 5 phases referencing specialized sub-skills. Use when starting a new conference agenda project or replicating the RoboCon 2026 display.
---

# Building a Conference Agenda Display

Master orchestration skill for building a TV-optimized, live conference agenda display.

## Architecture Overview

```
Tech Stack:
- Next.js 16 (App Router, "use client" components)
- React 19
- Tailwind CSS v4 (@theme inline tokens)
- TypeScript 5
- matter.js (2D physics for animations)
- qrcode.react (QR code for mobile access)
```

```
src/
├── app/
│   ├── layout.tsx          # Root layout, font imports
│   ├── page.tsx            # Main orchestrator page
│   ├── globals.css         # @theme tokens, font-faces, animation CSS
│   ├── aurora.css          # Aurora background keyframes
│   └── shooting-stars.css  # Character/projectile CSS
├── components/
│   ├── Header.tsx          # Clock, date, day tabs, logo
│   ├── CurrentTalk.tsx     # Active talk with speaker avatars
│   ├── BreakCard.tsx       # Break display with countdown
│   ├── UpNext.tsx          # Upcoming talks list
│   ├── PastTalks.tsx       # Completed talks
│   ├── ProgressBar.tsx     # Animated progress bar
│   ├── AuroraBackground.tsx # CSS aurora + twinkling stars
│   └── ShootingStars.tsx   # Physics animations + characters
├── data/
│   ├── schedule.ts         # Conference schedule data
│   └── speakers.ts         # Speaker lookup table
├── hooks/
│   └── useCurrentTime.ts   # Live clock with time simulation
└── lib/
    └── schedule-utils.ts   # Schedule state engine
```

## Phase 1: Foundation

### Step 1.1: Project Setup
**Skill:** `setting-up-nextjs-tv-app`

Create Next.js 16 project with Tailwind CSS v4, TypeScript, and dependencies. Configure for TV display (no cursor, no scroll on desktop).

### Step 1.2: Data Modeling
**Skill:** `modeling-conference-data`

Define `ScheduleItem` interface, speaker lookup, and populate with conference data. All times in UTC, displayed in event timezone.

### Step 1.3: Branding
**Skill:** `applying-conference-branding`

Custom fonts (OCR-style heading + monospace body), color palette as Tailwind v4 `@theme inline` tokens.

## Phase 2: Core Schedule Engine

### Step 2.1: Live Clock
**Skill:** `building-live-schedule-engine`

`useCurrentTime` hook with URL-based time simulation, and `getScheduleState` that computes current/past/upcoming items.

### Step 2.2: Layout
**Skill:** `designing-tv-display-layout`

Fixed-viewport TV layout (75% width, centered, no scroll) with responsive mobile fallback.

### Step 2.3: Components
**Skill:** `building-schedule-components`

Header, CurrentTalk, BreakCard, UpNext, PastTalks, ProgressBar. Wire together in page.tsx.

## Phase 3: Visual Atmosphere

### Step 3.1: Aurora Background
**Skill:** `creating-aurora-background`

Multi-layer CSS aurora gradients with twinkling stars and pulse on talk transitions.

### Step 3.2: UI Animations
**Skill:** `animating-ui-elements`

Shimmer sweep, glow breathe, border shift, golden shimmer for special events.

## Phase 4: Interactive Animations

### Step 4.1: Physics System
**Skill:** `integrating-physics-animations`

Flying objects with matter.js physics, wall bouncing, spark effects, pile accumulation.

### Step 4.2: Walking Characters
**Skill:** `creating-walking-characters`

SVG characters walking along bottom, speech bubbles, interactions, power-ups.

## Phase 5: Polish & Deploy

### Step 5.1: QR Code
Desktop-only QR code (top-right) linking to mobile URL using `qrcode.react`.

### Step 5.2: Deploy
**Skill:** `deploying-to-netlify`

## Key Design Principles

1. **All components are client components** — `"use client"` since everything depends on live time
2. **State flows down** — `useCurrentTime` → `getScheduleState` → components receive props
3. **CSS animations where possible** — JS only for physics and interactive elements
4. **Direct DOM manipulation** for 60fps — bypass React state for high-frequency updates
5. **TV-first, mobile-second** — optimize for TV, then make scrollable on mobile
6. **Time simulation via URL** — `?time=ISO&speed=N` for development testing

## Testing Strategy

Use time simulation URL params for visual testing:
- `?time=2026-02-12T07:00:00Z` — before Day 1
- `?time=2026-02-12T09:00:00Z` — during a talk
- `?time=2026-02-12T08:10:00Z` — during a break
- `?time=2026-02-12T16:00:00Z` — after Day 1
- `?speed=60` — 60x speed for full day cycle
