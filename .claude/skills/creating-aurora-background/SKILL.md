---
name: creating-aurora-background
description: Creates a multi-layer CSS aurora gradient background with twinkling stars and talk-change pulse effects. Uses GPU-accelerated CSS animations and seeded random star placement. No JavaScript animation loop. Use when adding atmospheric effects to a dark-themed display.
---

# Creating Aurora Background

Pure-CSS atmospheric background with three drifting aurora layers and 70 twinkling stars. Pulses brighter on talk change.

## Architecture

- **Aurora layers**: 3 divs with radial gradients, animated via CSS `background-position`
- **Stars**: 70 spans with seeded random positions, CSS opacity animation
- **Pulse**: CSS class toggled by React on talk change
- **No JS loop** — all CSS keyframes

## Component

```tsx
"use client";
import { useMemo } from "react";

function generateStars(count: number, seed: number) {
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  // Size distribution: ~60% 1px, ~25% 1.5px, ~15% 2px
  // Three animation speeds: twinkle-slow (8s), twinkle-mid (5s), twinkle-fast (3s)
  // Random delay 0-10s, opacity varies by size
}

export function AuroraBackground({ pulse }: { pulse?: boolean }) {
  const stars = useMemo(() => generateStars(70, 42), []);
  return (
    <div className={`aurora-bg ${pulse ? "aurora-pulse-active" : ""}`}>
      <div className="aurora-layer aurora-layer-1" />
      <div className="aurora-layer aurora-layer-2" />
      <div className="aurora-layer aurora-layer-3" />
      {stars.map((star, i) => <span key={i} style={{...}} />)}
    </div>
  );
}
```

## Aurora CSS (aurora.css)

### Container
```css
.aurora-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.aurora-layer { position: absolute; inset: 0; }
```

### Three Layers

**Layer 1 — Deep base (magenta/indigo, 40s)**:
```css
.aurora-layer-1 {
  background:
    radial-gradient(ellipse 80% 60% at 20% 80%, rgba(31, 27, 159, 0.35) 0%, transparent 70%),
    radial-gradient(ellipse 60% 50% at 80% 70%, rgba(255, 0, 225, 0.15) 0%, transparent 60%);
  background-size: 200% 200%;
  animation: aurora-drift-1 40s ease-in-out infinite;
  will-change: background-position;
}
```

**Layer 2 — Mid band (teal/lime, 25s)**:
```css
.aurora-layer-2 {
  background:
    radial-gradient(ellipse 70% 40% at 50% 30%, rgba(0, 192, 181, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse 50% 35% at 30% 50%, rgba(187, 196, 70, 0.08) 0%, transparent 50%);
  background-size: 250% 250%;
  animation: aurora-drift-2 25s ease-in-out infinite;
}
```

**Layer 3 — Highlight (bright teal, 15s)**:
```css
.aurora-layer-3 {
  background:
    radial-gradient(ellipse 40% 30% at 60% 40%, rgba(0, 192, 181, 0.10) 0%, transparent 50%);
  background-size: 300% 300%;
  animation: aurora-drift-3 15s ease-in-out infinite;
}
```

### Drift Keyframes

Each layer shifts `background-position` between waypoints. Different numbers of waypoints create non-repeating patterns:

```css
@keyframes aurora-drift-1 {
  0%, 100% { background-position: 0% 80%; }
  50% { background-position: 80% 20%; }
}
/* Layer 2: 3 waypoints, Layer 3: 4 waypoints */
```

### Star Twinkle

```css
@keyframes twinkle-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
@keyframes twinkle-mid  { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.6; } }
@keyframes twinkle-fast { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }
```

### Pulse on Talk Change

```css
.aurora-bg.aurora-pulse-active .aurora-layer-2 {
  animation: aurora-drift-2 25s ease-in-out infinite, aurora-pulse 4s ease-out forwards;
}
@keyframes aurora-pulse {
  0% { opacity: 1; } 15% { opacity: 2.3; } 100% { opacity: 1; }
}
```

Trigger in page.tsx:
```typescript
useEffect(() => {
  if (prevItemId.current !== null && currentId !== prevItemId.current) {
    setAuroraPulse(true);
    setTimeout(() => setAuroraPulse(false), 4000);
  }
  prevItemId.current = currentId;
}, [state.currentItem?.id]);
```

## Performance

- `will-change: background-position` on aurora layers
- Stars use `will-change: opacity`
- Seeded random via `useMemo` — no re-computation
- ~73 DOM elements total, all CSS-animated
