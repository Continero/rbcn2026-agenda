---
name: deploying-to-netlify
description: Deploys a Next.js conference agenda app to Netlify with the Next.js plugin. Covers build settings, environment config, and continuous deployment from GitHub. Use when deploying the conference display to production.
---

# Deploying to Netlify

## Prerequisites

Install the Netlify Next.js plugin:
```bash
npm install @netlify/plugin-nextjs
```

## Build Settings

In Netlify dashboard or `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Deployment Steps

1. **Push to GitHub** — Netlify auto-deploys from the connected repo
2. **Connect repo** — In Netlify: New site → Import from Git → Select repo
3. **Build settings** — Framework: Next.js (auto-detected), Build command: `npm run build`
4. **Deploy** — Netlify builds and deploys automatically

## Environment

No environment variables needed — all data is static in the codebase.

## Custom Domain

Configure in Netlify: Domain settings → Add custom domain.

## Continuous Deployment

Every push to `main` triggers a new build. Preview deploys are created for pull requests.

## Performance Notes

- Static assets cached by Netlify CDN
- Next.js Image Optimization works with Netlify's image CDN
- Remote images (speaker avatars) require `remotePatterns` in `next.config.ts`

## Pre-Deploy Checklist

- [ ] Schedule data is up to date (`src/data/schedule.ts`)
- [ ] Speaker data matches schedule (`src/data/speakers.ts`)
- [ ] Time simulation params removed from URL
- [ ] QR code URL points to correct deployment URL
- [ ] Build succeeds locally (`npm run build`)
