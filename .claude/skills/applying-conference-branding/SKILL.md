---
name: applying-conference-branding
description: Establishes conference visual identity with custom fonts, color palettes, and Tailwind CSS v4 design tokens. Covers self-hosted font setup, @theme inline configuration, and typography hierarchy. Use when applying brand styling to a conference display.
---

# Applying Conference Branding

## Design Token System

Tailwind CSS v4 uses `@theme inline` in CSS instead of tailwind.config.js:

```css
@theme inline {
  --color-navy: #000011;          /* Background */
  --color-teal: #00c0b5;          /* Primary accent */
  --color-teal-dim: #01968f;      /* Muted accent */
  --color-teal-glow: rgba(0, 192, 181, 0.15);
  --color-cyan: rgb(230, 248, 246); /* Primary text */

  /* Text hierarchy via opacity variants */
  --color-cyan-60: rgba(230, 248, 246, 0.7);   /* Secondary */
  --color-cyan-30: rgba(230, 248, 246, 0.5);   /* Tertiary */
  --color-cyan-10: rgba(230, 248, 246, 0.15);  /* Borders */

  /* White variants for overlays */
  --color-white: #ffffff;
  --color-white-10: rgba(255, 255, 255, 0.1);

  /* Accent / gradient colors */
  --color-gradient-1: #bbc446;    /* Gold/lime highlights */
  --color-gradient-2: #00c0b5;    /* Teal */
  --color-gradient-3: #ff00e1;    /* Magenta (aurora only) */
  --color-gradient-4: #1f1b9f;    /* Deep indigo (aurora only) */

  /* Font stacks */
  --font-mono: "JetBrains Mono", "Courier New", monospace;
  --font-heading: "OCR-RBCN", "OCR-A", "JetBrains Mono", monospace;
}
```

These tokens become Tailwind utilities: `text-cyan`, `bg-navy`, `border-teal`, etc.

## Custom Font Setup

### Self-Hosted Fonts

Place `.woff2` files in `public/fonts/`:

```css
@font-face {
  font-family: "OCR-RBCN";
  src: url("/fonts/OCR-RBCN.woff2") format("woff2");
  font-display: swap;
}
```

### Google Fonts

Load JetBrains Mono via Next.js font optimization in `layout.tsx`:

```typescript
import { JetBrains_Mono } from "next/font/google";
const mono = JetBrains_Mono({ subsets: ["latin"] });
```

## Typography Hierarchy

| Element | Font | Size (Desktop) | Color |
|---------|------|----------------|-------|
| Conference title | `--font-heading` | 3xl | `text-cyan` |
| Talk titles | `--font-heading` | 3xl | `text-cyan` |
| Section labels | `--font-heading` | base | `text-cyan-60` |
| Clock | `--font-mono` | 5xl | `text-teal` |
| Body text | `--font-mono` | base | `text-cyan-30` |
| Speaker names | `--font-mono` | xl | `text-cyan/90` |

### Applying Heading Font

`--font-heading` is a CSS variable, apply inline:
```tsx
<h2 style={{ fontFamily: "var(--font-heading)" }}>Talk Title</h2>
```

## Color Usage Patterns

- **Navy (#000011)** — page background
- **Teal (#00c0b5)** — active elements: NOW badge, progress bar, active day tab
- **Cyan** — text hierarchy via opacity: 100% headings, 70% secondary, 50% tertiary, 15% borders
- **Gold (#bbc446)** — special event highlights, gradient endpoints
- **Magenta/Indigo** — aurora background layers only

## Dark-on-Dark Contrast Rules

- Text: light (cyan/white) on navy
- Borders: very low opacity (`rgba(..., 0.06-0.15)`)
- Card backgrounds: near-transparent tints (`rgba(0, 192, 181, 0.04)`)
- Active states: slightly higher opacity of same colors
