---
name: animating-ui-elements
description: Adds CSS animation effects to conference UI - progress bar shimmer sweep, current talk glow breathe, up-next border shift, and golden shimmer for special events. All pure CSS, no JavaScript. Use when adding polish animations to UI components.
---

# Animating UI Elements

Four CSS animation effects. All pure CSS — no JS animation loops.

## 1. Progress Bar Shimmer Sweep

White highlight sweeps across the progress bar every 8 seconds:

```css
@keyframes shimmer-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}

.shimmer-bar {
  position: relative;
  overflow: hidden;
}

.shimmer-bar::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 45%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.08) 55%,
    transparent 100%);
  animation: shimmer-sweep 8s ease-in-out infinite;
  border-radius: inherit;
}
```

## 2. Current Talk Glow Breathe

Gentle teal box-shadow pulse on the current talk card:

```css
@keyframes glow-breathe {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 192, 181, 0.06), 0 0 60px rgba(0, 192, 181, 0.03);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 192, 181, 0.12), 0 0 80px rgba(0, 192, 181, 0.06);
  }
}
.glow-breathe { animation: glow-breathe 4s ease-in-out infinite; }
```

## 3. Up Next Border Shift

First Up Next item border shifts teal → gold:

```css
@keyframes border-shift {
  0%, 100% { border-left-color: #00c0b5; }
  50% { border-left-color: #bbc446; }
}
.border-shift-active {
  border-left: 3px solid #00c0b5;
  animation: border-shift 10s ease-in-out infinite;
}
```

## 4. Golden Shimmer for Special Events

Special events (karaoke, after-party) get golden highlight:

```css
@keyframes highlight-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.upnext-highlight {
  position: relative;
  background: rgba(187, 196, 70, 0.06);
  border: 1px solid rgba(187, 196, 70, 0.25);
  overflow: hidden;
}

.upnext-highlight::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(187, 196, 70, 0.1) 45%,
    rgba(255, 215, 0, 0.15) 50%,
    rgba(187, 196, 70, 0.1) 55%,
    transparent 100%);
  background-size: 200% 100%;
  animation: highlight-shimmer 4s ease-in-out infinite;
  pointer-events: none;
}
```

## Integration

All animations go in CSS files imported from globals.css:
```css
@import "tailwindcss";
@import "./aurora.css";
@import "./shooting-stars.css";
```

Apply via className: `shimmer-bar`, `glow-breathe`, `border-shift-active`, `upnext-highlight`.
