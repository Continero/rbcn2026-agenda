---
name: integrating-physics-animations
description: Adds physics-based flying objects using matter.js - shooting logos that fly diagonally, bounce off walls with spark effects, and accumulate in a physics pile at the bottom. Uses requestAnimationFrame with direct DOM manipulation for 60fps. Use when adding interactive physics animations to a web display.
---

# Integrating Physics Animations

Flying objects (conference logos) that soar across screen, bounce off walls, and pile up at the bottom using matter.js 2D physics.

## Architecture

- **requestAnimationFrame loop** — bypasses React state for 60fps performance
- **Direct DOM manipulation** — create/modify DOM elements without React re-renders
- **matter.js physics** — handles pile accumulation and collisions at the bottom
- **CSS for visual effects** — tails, sparks, glows defined in shooting-stars.css

## Component Structure

```tsx
"use client";
import { useEffect, useRef } from "react";
import Matter from "matter-js";

export function ShootingStars() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Initialize physics engine, spawn loop, animation loop
    // All DOM manipulation happens directly, not through React state
    return () => { /* cleanup */ };
  }, []);

  return <div ref={containerRef} className="shooting-stars-container" />;
}
```

## Flying Object System

### Spawning

Objects spawn every 10-20 seconds from either top or left edge:
- **From top**: fly diagonally downward-right
- **From left**: fly diagonally rightward-down
- Random velocity and angle within constrained ranges

### Flight Path

Each flying object is a DOM element with:
- An inline SVG (conference logo)
- A glowing tail (CSS gradient pseudo-element)
- Position updated every frame via `requestAnimationFrame`

```typescript
// Each frame:
star.x += star.vx;
star.y += star.vy;
star.el.style.transform = `translate(${star.x}px, ${star.y}px) rotate(${angle}deg)`;
```

### Wall Bouncing

When a flying object hits a side wall:
1. Reverse horizontal velocity (`vx = -vx`)
2. Spawn spark particles at impact point
3. Continue flying

For patterns, see [reference/matter-js-patterns.md](reference/matter-js-patterns.md).

### Bottom Impact → Physics Pile

When a flying object hits the bottom:
1. Remove the flying DOM element
2. Create a matter.js body at impact position
3. Render a static logo at the body's position
4. Let physics handle pile accumulation

### Pile Management

Cap at 50 logos in the pile. When exceeded, oldest fade out and are removed:
```typescript
if (piledLogos.length > 50) {
  const oldest = piledLogos.shift();
  // Fade out and remove from physics world
}
```

### Golden Power-Ups

Logos that hit the bottom with high velocity glow gold and pulse:
```css
.golden-logo {
  filter: brightness(1.5) drop-shadow(0 0 8px #bbc446);
  animation: golden-pulse 2s ease-in-out infinite;
}
```

## CSS Structure (shooting-stars.css)

```css
.shooting-stars-container {
  position: fixed;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  overflow: hidden;
}

/* Flying object tail */
.star-tail {
  position: absolute;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(0, 192, 181, 0.6));
  /* Angle set via CSS custom property --tail-angle */
  transform: rotate(var(--tail-angle));
}

/* Spark particles */
.spark {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #00c0b5;
  /* dx/dy set via CSS custom properties */
}
```

## Performance

- **RAF loop**: single `requestAnimationFrame` drives all animations
- **DOM pooling**: reuse elements where possible
- **Physics cap**: max 50 bodies in pile
- **No React state**: all updates are direct DOM manipulation
- **GPU hints**: `will-change: transform` on animated elements
