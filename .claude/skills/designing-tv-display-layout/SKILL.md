---
name: designing-tv-display-layout
description: Designs a fixed-viewport layout optimized for TV/large screen display with responsive mobile fallback. Covers 75% width constraint, overflow control, three-section layout, and auto-scroll. Use when building a full-screen display for TVs or kiosks.
---

# Designing a TV Display Layout

## Core Principle

Fills entire screen with no scrolling on desktop/TV. On mobile, becomes scrollable.

## Page Structure

```tsx
<div className="w-screen min-h-screen lg:h-screen bg-navy lg:overflow-hidden flex justify-center">
  <AuroraBackground />
  <ShootingStars />

  {/* Content — 75% width on large screens */}
  <div className="w-full lg:w-[75%] h-full flex flex-col lg:overflow-hidden relative z-10">
    <Header />
    <main className="flex-1 flex flex-col lg:overflow-hidden lg:min-h-0
                     px-4 py-4 gap-5 lg:px-20 lg:py-10 lg:gap-10">
      {/* Content sections */}
    </main>
  </div>

  {/* QR code — desktop only, fixed top-right */}
  <div className="hidden lg:flex fixed top-6 right-6 z-20">...</div>
</div>
```

## Width Constraint

`lg:w-[75%]` with `flex justify-center` prevents content from stretching edge-to-edge on TVs. Leaves room for aurora background visibility.

## Three-Section Layout

```
┌─────────────────────────────────┐
│ Header (clock, day tabs, logo)  │ ← shrink-0
├─────────────────────────────────┤
│ Past talks (collapsed)          │ ← shrink-0
│ ─────────────────────────────── │
│ NOW: Current Talk / Break       │ ← shrink-0
│ ─────────────────────────────── │
│ Up Next (fills remaining space) │ ← flex-1
└─────────────────────────────────┘
```

Three states: **Live View** (during talks/breaks), **Before Start** (welcome + countdown), **After End** (farewell).

## Overflow Strategy

- **Desktop (lg+)**: `lg:overflow-hidden` everywhere. Up Next clips at bottom
- **Mobile**: `overflow-y: auto` on body. All sections stack and scroll

## Mobile Auto-Scroll

Past talks are above current talk. Auto-scroll to NOW on mount:

```typescript
const nowRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (nowRef.current && window.innerWidth < 1024) {
    nowRef.current.scrollIntoView({ behavior: "instant", block: "start" });
  }
}, []);
```

## Responsive Breakpoint

Single breakpoint at `1024px` (Tailwind `lg`):
- Below: scrollable, stacked, cursor visible
- Above: fixed viewport, no scroll, no cursor

## Flex Hierarchy

```
Page:          h-screen, flex flex-col, overflow-hidden
├── Header:    shrink-0
└── Main:      flex-1, flex flex-col, overflow-hidden, min-h-0
    ├── Past:      shrink-0
    ├── Current:   shrink-0
    ├── Divider:   shrink-0
    └── Up Next:   flex-1, min-h-0, overflow-hidden
```

`lg:min-h-0` on flex-1 containers is critical — without it, flex items won't shrink below content height.

## Spacing Scale

| Context | Mobile | Desktop |
|---------|--------|---------|
| Section padding | `px-4 py-4` | `lg:px-20 lg:py-10` |
| Section gaps | `gap-5` | `lg:gap-10` |
| Component gaps | `gap-3` | `lg:gap-5` |
| Header padding | `pt-4 pb-3` | `lg:pt-10 lg:pb-8` |
