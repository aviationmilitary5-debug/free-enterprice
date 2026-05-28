# FreeFileWizard — Setup & Deployment Guide

## Quick Start (Run Locally)

### Prerequisites
- Node.js 20 or higher: https://nodejs.org
- pnpm: `npm install -g pnpm`
- Git (optional)

### Option A — Using the full download (includes node_modules)

```bash
# 1. Extract the archive
tar -xzf freefilewizard-full.tar.gz
cd freefilewizard

# 2. Start the development server directly (no install needed)
cd artifacts/freefilewizard
PORT=5173 BASE_PATH=/ npx vite

# 3. Open your browser at http://localhost:5173
```

### Option B — Fresh install from source code only

```bash
# 1. Extract the source archive
tar -xzf freefilewizard-source.tar.gz

# 2. Install all dependencies
cd freefilewizard
pnpm install

# 3. Start the frontend
pnpm --filter @workspace/freefilewizard run dev

# 4. Open your browser at the URL shown in the terminal
```

---

## Build for Production

```bash
# From the project root
cd artifacts/freefilewizard

# Build the site (outputs to artifacts/freefilewizard/dist/public/)
PORT=3000 BASE_PATH=/ npx vite build

# Preview the production build locally
PORT=4173 BASE_PATH=/ npx vite preview
```

The built files will be in `artifacts/freefilewizard/dist/public/`. Upload this folder to any static hosting provider.

---

## Merge Into an Existing Website

### If your site uses React + Vite:

```bash
# 1. Copy the pages folder
cp -r artifacts/freefilewizard/src/pages/* your-project/src/pages/

# 2. Copy the components
cp -r artifacts/freefilewizard/src/components/* your-project/src/components/

# 3. Install missing dependencies
pnpm add framer-motion react-hook-form @hookform/resolvers zod wouter lucide-react @tanstack/react-query

# 4. Register routes in your App.tsx (copy the Route entries from src/App.tsx)
```

### If your site uses plain HTML/static hosting:

```bash
# Build first, then copy the output
PORT=3000 BASE_PATH=/ npx vite build
cp -r artifacts/freefilewizard/dist/public/* /your-website-folder/
```

---

## Point freefilewizard.com to This Site

### Using Replit Deployments (recommended):

1. Click **Publish** in the Replit editor (Deploy button)
2. Choose **Autoscale** deployment
3. In deployment settings → **Custom Domains** → Add `www.freefilewizard.com`
4. Replit will show you DNS records to add
5. In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
   - Add a **CNAME** record: `www` → the value Replit gives you
   - For root domain, add an **A record** pointing to Replit's IP

### Using Static Hosting (Netlify, Vercel, Cloudflare Pages):

```bash
# 1. Build the site
PORT=3000 BASE_PATH=/ npx vite build

# 2. Upload the dist/public/ folder to your host
# 3. In your host's dashboard, connect your freefilewizard.com domain
```

---

## Google Search Console Verification

1. Go to https://search.google.com/search-console/
2. Click **Add Property** → enter `https://www.freefilewizard.com`
3. Choose **HTML tag** method
4. Copy the `content="..."` value from the meta tag shown
5. Open `artifacts/freefilewizard/index.html`
6. Replace `PASTE_YOUR_VERIFICATION_CODE_HERE` with your code
7. Rebuild and deploy → click **Verify** in Search Console
8. Submit sitemap: go to **Sitemaps** → add `https://www.freefilewizard.com/sitemap.xml`

---

## Submit Sitemap to Google

After verifying your domain in Search Console:

1. In Search Console, go to **Sitemaps** (left sidebar)
2. Enter: `https://www.freefilewizard.com/sitemap.xml`
3. Click **Submit**
4. Google will begin indexing all 15 pages within 24–72 hours

The sitemap file is at: `artifacts/freefilewizard/public/sitemap.xml`

---

## Google AdSense

Your AdSense code is already embedded in `index.html`:

```html
<meta name="google-adsense-account" content="ca-pub-4262912359957760" />
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4262912359957760" crossorigin="anonymous"></script>
```

Ad units render on every page automatically (top banner, left sidebar, right sidebar, bottom banner).
Ads will appear once Google verifies `freefilewizard.com` as an approved AdSense site.

**Google Ad Network declaration** (for `ads.txt`):
```
google.com, pub-4262912359957760, DIRECT, f08c47fec0942fa0
```
This file is located at `artifacts/freefilewizard/public/ads.txt` and will be served at `https://www.freefilewizard.com/ads.txt`.

---

## Project Structure Summary

```
artifacts/freefilewizard/
├── src/
│   ├── App.tsx              ← All page routes
│   ├── index.css            ← Theme (colors, fonts, dark mode)
│   ├── pages/               ← One file per page
│   └── components/
│       ├── layout/          ← Navbar, Footer, Layout, Banner
│       ├── AdSenseUnit.tsx  ← Google Ads component
│       ├── SEOHead.tsx      ← Per-page SEO meta tags
│       └── ui/              ← shadcn/ui component library
├── public/
│   ├── sitemap.xml          ← Google sitemap
│   ├── robots.txt           ← Search engine rules
│   └── ads.txt              ← AdSense declaration
├── index.html               ← HTML entry (AdSense + GSC codes here)
└── vite.config.ts           ← Vite build configuration
```

---

## Environment Variables

No environment variables are required for the frontend to run.
Optional (for the API server):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/freefilewizard
SESSION_SECRET=your-random-secret
PORT=5000        # Set automatically by Replit
BASE_PATH=/      # Set automatically by Replit
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7 |
| Routing | Wouter |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| UI Components | shadcn/ui (Radix UI) |
| Backend | Express 5 (optional) |
| Database | PostgreSQL + Drizzle ORM (optional) |
| Package Manager | pnpm workspaces |

---

*Generated: May 28, 2026 — FreeFileWizard by Prosper Taku*
