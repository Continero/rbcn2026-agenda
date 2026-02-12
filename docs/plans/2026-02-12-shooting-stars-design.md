# Shooting Stars — Robot Framework Logo Falling Stars

**Date:** 2026-02-12
**Status:** Planned (test locally before pushing)

## Overview

Playful ambient animation: small Robot Framework logos shoot across the screen like falling stars with comet tails. When they burn out, they fall via physics simulation and pile up at the bottom of the screen in a messy heap.

## Visual Spec

### Flying Star
- **Head:** RF robot logo SVG, ~20x20px, teal (#00c0b5), opacity 0.7
- **Tail:** `::after` pseudo-element, ~80px gradient streak (white → teal → transparent), aligned to flight direction via CSS custom property, slight blur
- **Glow:** `filter: drop-shadow(0 0 6px rgba(0,192,181,0.5))` during flight
- **Spawn:** Random position along top or left edge, every 10-20 seconds (randomized interval)
- **Trajectory:** Random diagonal (roughly 30-60° downward-right), flight duration 2-4 seconds
- **Burn-out:** At 70-85% of path, tail fades (300ms), glow dims, CSS animation ends

### Fallen Logo
- Dimmer: opacity 0.4, no glow, tinted teal-dim (#01968f)
- Random rotation from physics tumble
- "Cooled down" appearance

### Pile
- Accumulates along bottom edge of viewport
- Physics-driven stacking: logos bounce slightly, settle, stack on each other
- Max 50 logos on screen — oldest fade out (2s opacity transition) when cap hit
- Bottom 30-40px gradually fills with scattered robot heads

## Technical Design

### Dependencies
- `matter-js` (~30KB gzipped) — lightweight 2D physics engine
- `@types/matter-js` — TypeScript definitions (dev dependency)

### New Files

#### `src/components/ShootingStars.tsx`
Single self-contained client component. Internal structure:

1. **RF Logo SVG:** Small inline SVG component for the robot head icon
2. **Star Spawner:** `setInterval` with randomized 10-20s delay. Creates a DOM element with:
   - Random spawn position (top or left edge)
   - Random angle (30-60°) and speed (2-4s duration)
   - CSS custom properties `--dx`, `--dy` for flight direction
   - CSS animation class for diagonal translate
3. **Burn-out Handler:** Timeout matching flight duration × 0.7-0.85 (random). Captures element position via `getBoundingClientRect()`, removes flying element, creates matter.js rigid body at that position.
4. **Physics Engine:** Initialized on mount:
   - `Matter.Engine.create()` with reduced gravity (~0.8)
   - Static ground body at viewport bottom
   - Static wall bodies at left/right edges
   - Bodies: ~20x20 rectangles, restitution 0.3, friction 0.8, random initial rotation
   - Updated via `requestAnimationFrame` loop calling `Matter.Engine.update()`
5. **Pile Renderer:** React state array `{ id, x, y, angle }[]` synced from matter.js body positions each frame. Rendered as positioned `<div>`s with RF logo SVG, using `transform: translate(x,y) rotate(angle)`.
6. **Performance Cap:** When pile exceeds 50 items, oldest entries fade out (CSS opacity transition 2s), then their matter.js bodies and DOM elements are removed.
7. **Cleanup:** On unmount — clear spawner interval, destroy matter.js engine, cancel animation frame.

#### `src/app/shooting-stars.css`
- `@keyframes star-flight` — translates element by `var(--dx)`, `var(--dy)`
- `.shooting-star` — positioned absolute, pointer-events none
- `.shooting-star::after` — comet tail gradient, rotated by `var(--tail-angle)`
- `.shooting-star-burnout` — tail fade + glow dim transition
- `.fallen-logo` — dimmed styling for pile logos

### Changes to Existing Files
- **`page.tsx`:** Add `<ShootingStars />` between `<AuroraBackground>` and content div, at z-index 1

### Layering
```
z-0:  AuroraBackground (gradient layers + twinkling stars)
z-1:  ShootingStars (flying stars + fallen pile)
z-10: Content (header, agenda, QR code)
```

## Constraints
- **Test locally only** — do not push until verified on the TV display
- **Performance:** Must run smoothly all day. The 50-logo cap and RAF-based physics prevent unbounded growth.
- **Non-disruptive:** Stars fly behind content (z-1). Pile builds in the bottom margin area. Agenda readability is not affected.

## Implementation Steps
1. Install `matter-js` and `@types/matter-js`
2. Create the RF logo inline SVG component (find/create the Robot Framework icon)
3. Create `shooting-stars.css` with flight keyframes and tail styling
4. Build `ShootingStars.tsx` — spawner → flight → burn-out → physics fall → pile render
5. Add `<ShootingStars />` to `page.tsx`
6. Test locally with time simulation, verify performance and visuals
7. Tune: spawn rate, flight speed, physics params, pile cap, opacity values
