---
name: setting-up-nextjs-tv-app
description: Scaffolds a Next.js 16 project with React 19, Tailwind CSS v4, and TypeScript optimized for TV display. Configures cursor hiding, overflow control, remote image patterns, and installs matter-js and qrcode.react. Use when creating a new TV-optimized web display.
---

# Setting Up a Next.js TV Display App

## Quick Start

```bash
npx create-next-app@latest conference-agenda --typescript --tailwind --app --src-dir
cd conference-agenda
npm install matter-js qrcode.react
npm install -D @types/matter-js
```

## Dependencies

Target versions:
- next: 16.x
- react / react-dom: 19.x
- tailwindcss: 4.x (with @tailwindcss/postcss)
- matter-js: 0.20.x (2D physics engine)
- qrcode.react: 4.x (QR code component)
- typescript: 5.x

## next.config.ts

Configure remote image patterns for speaker avatars:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "your-avatar-host.com",
        pathname: "/media/avatars/**",
      },
    ],
  },
};

export default nextConfig;
```

## Tailwind CSS v4 Setup

Tailwind v4 uses `@theme inline` in CSS instead of tailwind.config.js.

`postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

## TV Display Globals

In `globals.css`:

```css
@import "tailwindcss";

html, body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000011;
}

/* Hide cursor on TV/desktop */
@media (min-width: 1024px) {
  html, body {
    cursor: none;
    user-select: none;
  }
}

/* Allow scroll on mobile */
@media (max-width: 1023px) {
  html, body {
    overflow-y: auto;
    height: auto;
    min-height: 100vh;
  }
}
```

## Root Layout

All components use `"use client"` since the app depends on live time. Load a monospace font via Google Fonts:

```typescript
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata = {
  title: "Conference Agenda",
  description: "Live conference schedule display",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={mono.variable}>{children}</body>
    </html>
  );
}
```

## Dev Server

```bash
npm run dev -- -p 3003
```
