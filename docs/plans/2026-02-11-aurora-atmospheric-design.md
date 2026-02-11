# Aurora Atmospheric Background Design

**Date:** 2026-02-11
**Status:** Implemented

## Overview

Full atmospheric aurora background for the RoboCon 2026 agenda display, inspired by the robocon.io aesthetic. Pure CSS implementation — zero JS animation overhead, GPU-accelerated, suitable for all-day conference display.

## Components

### Aurora Background (`AuroraBackground.tsx`)
Three stacked gradient layers with different drift speeds creating organic aurora motion:
- **Layer 1** (40s cycle): Deep indigo/magenta base, bottom-left positioned
- **Layer 2** (25s cycle): Teal/lime aurora band, mid-screen
- **Layer 3** (15s cycle): Bright teal highlight shimmer, free-moving

### Twinkling Stars
~70 CSS-animated stars with seeded random placement:
- Small (1px, ~50 stars), Medium (1.5px, ~20), Large (2px, ~8)
- Three twinkle speeds: slow (8s), mid (5s), fast (3s)
- Cyan-colored with a few pure white large stars

### Transition Accents
- **Aurora pulse**: Layer 2 opacity spike on talk change (4s duration)
- **Card glow**: Breathing box-shadow on the NOW card (4s cycle)
- **Progress shimmer**: Light sweep across progress bar (8s cycle)
- **Border shift**: Teal-to-lime animated left border on first Up Next item (10s cycle)

## Architecture

### New Files
- `src/app/aurora.css` — All keyframes and aurora-specific styles
- `src/components/AuroraBackground.tsx` — Self-contained background component

### Modified Files
- `globals.css` — Imports aurora.css
- `page.tsx` — Adds AuroraBackground with pulse logic, z-index on content
- `CurrentTalk.tsx` — glow-breathe class on card
- `ProgressBar.tsx` — shimmer-bar class on fill
- `UpNext.tsx` — border-shift-active class on first item

## Technical Decisions
- Pure CSS over Canvas/WebGL: minimal CPU for all-day display
- Seeded random for stars: consistent across renders, no layout shift
- `will-change: background-position` on aurora layers for GPU compositing
- Fixed positioning with z-index layering (aurora: 0, content: 10)
