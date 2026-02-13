# RoboCon 2026 Live Agenda Display

A live conference agenda display built for [RoboCon 2026](https://robocon.io) in Helsinki. Designed to run on a TV screen at the venue, showing the current talk, upcoming schedule, and a healthy dose of animated chaos.

**Live:** [robocon2026-agenda.netlify.app](https://robocon2026-agenda.netlify.app)

## What Is This?

A real-time conference agenda that knows what's happening now, what's coming up, and when it's time for coffee. Built in one evening through "vibe coding" — describing features in plain English and watching them appear.

## Features

### Schedule Display
- **Live schedule** with automatic current talk detection and countdown timers
- **Day 1 / Day 2 tabs** with automatic day switching
- **Current talk card** with speaker info, abstract, and animated progress bar
- **Up Next list** with expandable abstracts and auto-scroll on mobile
- **Past talks** section (mobile: scroll up to see them)
- **QR code** (desktop/TV only) for mobile access

### Aurora Atmospheric Background
- **3 animated aurora layers** — CSS gradient animations drifting at different speeds
- **70 twinkling stars** — seeded random placement with varying sizes and animation timings
- **Pulse effect** — aurora brightens when the current talk changes
- **Shimmer sweep** on the progress bar

### Shooting Stars
- **RF logo comets** — the Robot Framework logo flies across the screen with a glowing teal tail
- **Bidirectional** — stars come from both sides randomly
- **Wall bouncing** — stars bounce off side walls with spark effects
- **Physics pile** — stars that reach the bottom become fallen logos with matter.js physics
- **Golden power-ups** — bottom-impact stars glow gold and pulse

### Walking Gnomes
- **Two amigurumi-style gnomes** (red hat & green hat) walk along the bottom
- **Physics interaction** — gnomes push fallen RF logos as they walk (matter.js static bodies)
- **Speech bubbles** — random Robot Framework messages and Finnish greetings every 20-40s
- **Pancake break** — when gnomes meet, they sit down and eat pancakes together 🥞
- **Shooting** — both gnomes fire teal projectiles at flying stars (15% hit rate with homing)
- **Super Saiyan mode** — picking up a golden logo triggers: 1.5x size, 3x speed, golden aura, explosive push on nearby logos, and instant gold laser shots that always hit
- **Singing duets** — gnomes alternate lines from well-known songs every 2 minutes:
  - Bohemian Rhapsody, Never Gonna Give You Up, We Will Rock You, Don't Stop Believin', Hakuna Matata, YMCA, Baby Shark

### Walking Characters (Pekka, Mikka & René)
- **Pekka Klärck** (RF creator), **Mikka Solmela** (RF Executive Director), and **René Rohner** (RF Foundation Board Chairman) walk along the bottom
- Independent from gnomes — no shooting, no pancakes, no super saiyan
- **Conversations** — alternating speech bubbles every ~1 minute with RF insider jokes, technical talk, sponsor hunting, and board meeting humor
- Distinct bubble colors: warm golden-brown (Pekka), pink (Mikka), and cool blue-purple (René)

### Special Events
- **Community Dinner** at Ravintola Laulu with venue details and meetup info
- **Karaoke Party** at Karaokebar Erottaja — highlighted with golden shimmer effect, always-expanded description

## Tech Stack

- **Next.js 16** with Turbopack
- **React 19**
- **Tailwind CSS v4** (`@theme` syntax)
- **matter.js** — 2D physics for fallen logo pile and gnome interactions
- **qrcode.react** — QR code for mobile access
- **TypeScript** throughout
- Direct DOM manipulation for animations (performance over React state)
- `requestAnimationFrame` loop for smooth 60fps updates

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#000011` | Background |
| Teal | `#00c0b5` | Accent, active elements |
| Cyan | `rgb(230, 248, 246)` | Primary text |
| Gold | `#bbc446` | Highlights, super saiyan, power-ups |
| Font Heading | OCR-RBCN, OCR-A | Headers, tabs |
| Font Mono | JetBrains Mono | Body text |

## Development

```bash
npm install
npm run dev
```

### Testing Parameters

Add `?timeboost=N` to the URL to speed up animations for testing:

- `?timeboost=1` — normal speed (default)
- `?timeboost=10` — 10x faster spawns, bubbles, songs, announcements
- `?timeboost=50` — chaos mode

## How This Was Built

This entire project was built through conversational "vibe coding" with [Claude Code](https://claude.ai/claude-code). Every feature — from the aurora background to the super saiyan gnomes — was described in plain English and implemented iteratively in a single session.

The escalation went something like this:

> "nice aurora background" &#8594; "shooting stars with RF logos" &#8594; "walking gnomes" &#8594; "make them talk" &#8594; "what if they dance?" &#8594; "give them guns" &#8594; "SUPER SAIYAN MODE" &#8594; "they should sing Baby Shark" &#8594; "add Pekka & René as walking characters"

Zero tests. Zero regrets.

---

Created by [David Fogl](https://github.com/xfoggi) @ [Continero](https://continero.com) | RF Board Member

## License

MIT
