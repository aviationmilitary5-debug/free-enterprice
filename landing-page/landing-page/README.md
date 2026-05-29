# FreeFileWizard — Landing Page

Standalone React + Vite marketing website for [freefilewizard.com](https://www.freefilewizard.com).

## Stack

- React 19 + Vite 7
- Tailwind CSS v4
- Framer Motion
- Wouter (routing)
- shadcn/ui (Radix UI components)
- TypeScript

## Quick Start

```bash
npm install        # or: pnpm install / yarn install
npm run dev        # starts dev server at http://localhost:5173
```

## Build for Production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Import the repo in [vercel.com](https://vercel.com)
3. Framework: **Vite** — Vercel detects it automatically
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy**

`vercel.json` is already configured to handle SPA client-side routing.

## Deploy to Netlify

```bash
npm run build
# Drag the dist/ folder to app.netlify.com/drop
# Or use netlify.toml:
```

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Deploy to Cloudflare Pages

1. Connect GitHub repo in Cloudflare Pages
2. Build command: `npm run build`
3. Build output directory: `dist`

## Project Structure

```
landing-page/
├── src/
│   ├── App.tsx                   ← Routes (15 pages)
│   ├── main.tsx                  ← Entry point
│   ├── index.css                 ← Theme tokens + Tailwind imports
│   ├── assets/                   ← Images (CEO photos, etc.)
│   ├── components/
│   │   ├── AdSenseUnit.tsx       ← Google AdSense ad units
│   │   ├── SEOHead.tsx           ← Per-page meta tag updates
│   │   ├── layout/               ← Navbar, Footer, Layout
│   │   └── ui/                   ← shadcn/ui component library
│   ├── hooks/                    ← use-mobile, use-toast
│   ├── lib/utils.ts              ← cn() utility
│   └── pages/                   ← One file per page (15 pages)
├── public/
│   ├── sitemap.xml
│   ├── robots.txt
│   ├── ads.txt                   ← Google AdSense declaration
│   └── favicon.svg
├── index.html                    ← HTML entry (AdSense + GSC codes)
├── vite.config.ts
├── tsconfig.json
├── vercel.json                   ← SPA routing for Vercel
└── package.json
```

## SEO Configuration

### Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `https://www.freefilewizard.com`
3. Choose **HTML tag** verification → copy the `content="..."` value
4. Open `index.html` → replace `PASTE_YOUR_VERIFICATION_CODE_HERE`
5. Rebuild and deploy → click **Verify**
6. Submit sitemap: `https://www.freefilewizard.com/sitemap.xml`

### Google AdSense

Publisher ID `ca-pub-4262912359957760` is already embedded in `index.html`. Ads load automatically after Google verifies the domain.

## Path Aliases

| Alias | Resolves to |
|-------|------------|
| `@/*` | `src/*` |
| `@assets/*` | `src/assets/*` |
