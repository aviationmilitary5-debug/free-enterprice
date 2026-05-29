import React, { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { FolderOpen, FileCode, Terminal, Package, GitMerge, Layers, Book, ChevronRight, Copy, CheckCircle } from "lucide-react";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-[#0d1117] border border-border rounded-xl overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50">
        <span className="text-xs text-muted-foreground font-mono">{lang}</span>
        <button onClick={copy} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors">
          {copied ? <><CheckCircle size={12} className="text-green-500" /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-green-400 font-mono leading-relaxed whitespace-pre">{code}</pre>
    </div>
  );
}

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

const toc = [
  { id: "structure", label: "Code Structure", icon: FolderOpen },
  { id: "libraries", label: "Libraries & Dependencies", icon: Package },
  { id: "run-locally", label: "Run Locally", icon: Terminal },
  { id: "merge", label: "Merge Into Existing Site", icon: GitMerge },
  { id: "partner-connect", label: "Connect to Partner Program", icon: Layers },
  { id: "tools-api", label: "Embed Tools on Your Site", icon: FileCode },
];

export default function Guide() {
  const [active, setActive] = useState("structure");

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Developer Guide - FreeFileWizard" description="Complete developer guide: code structure, libraries, local setup, and integration guide for FreeFileWizard." />

      <div className="border-b border-border bg-card/50 py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-xs font-semibold mb-4">
              <Book size={12} /> Developer Reference Guide
            </div>
            <h1 className="text-4xl font-black mb-3">Complete Integration Guide</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Everything you need to run FreeFileWizard locally, understand the codebase, install libraries, and merge it into your existing project.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-12">
        <div className="grid lg:grid-cols-[220px_1fr] gap-12">

          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">On this page</p>
              {toc.map(({ id, label, icon: Icon }) => (
                <a key={id} href={`#${id}`} onClick={() => setActive(id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${active === id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}>
                  <Icon size={14} />
                  {label}
                  {active === id && <ChevronRight size={12} className="ml-auto" />}
                </a>
              ))}
            </div>
          </aside>

          {/* Content */}
          <main>

            {/* ── CODE STRUCTURE ── */}
            <Section id="structure" title="Code Structure Map" icon={FolderOpen}>
              <p>FreeFileWizard is a <strong className="text-foreground">pnpm monorepo</strong> with a React + Vite frontend and an Express backend. Here's the full directory map:</p>
              <CodeBlock lang="text" code={`freefilewizard/
├── artifacts/
│   ├── freefilewizard/          ← Main React + Vite frontend
│   │   ├── src/
│   │   │   ├── App.tsx          ← Router — all page routes registered here
│   │   │   ├── index.css        ← Global theme (CSS variables, dark mode, fonts)
│   │   │   ├── main.tsx         ← React entry point
│   │   │   ├── pages/           ← One file per page/route
│   │   │   │   ├── home.tsx         /
│   │   │   │   ├── tools.tsx        /tools
│   │   │   │   ├── about.tsx        /about
│   │   │   │   ├── contact.tsx      /contact
│   │   │   │   ├── partner.tsx      /partner  ← Auth + signup
│   │   │   │   ├── guide.tsx        /guide    ← This page
│   │   │   │   ├── docs.tsx         /docs
│   │   │   │   ├── blog.tsx         /blog
│   │   │   │   ├── faq.tsx          /faq
│   │   │   │   ├── support.tsx      /support
│   │   │   │   ├── reviews.tsx      /reviews
│   │   │   │   ├── careers.tsx      /careers
│   │   │   │   ├── privacy.tsx      /privacy
│   │   │   │   ├── terms.tsx        /terms
│   │   │   │   └── not-found.tsx    404
│   │   │   └── components/
│   │   │       ├── layout/
│   │   │       │   ├── Layout.tsx   ← Wraps all pages (Navbar + Footer)
│   │   │       │   ├── Navbar.tsx   ← Sticky top navigation bar
│   │   │       │   └── Footer.tsx   ← Site-wide footer
│   │   │       ├── SEOHead.tsx      ← Dynamic <title> + <meta> per page
│   │   │       └── ui/              ← shadcn/ui component library
│   │   ├── package.json         ← Frontend dependencies
│   │   ├── vite.config.ts       ← Vite build config
│   │   └── tsconfig.json        ← TypeScript config
│   │
│   └── api-server/              ← Express 5 backend
│       ├── src/
│       │   ├── app.ts           ← Express app setup
│       │   ├── index.ts         ← Server entry point (listens on PORT)
│       │   ├── routes/
│       │   │   ├── index.ts     ← Route registration
│       │   │   └── health.ts    ← GET /api/healthz
│       │   └── lib/
│       │       └── logger.ts    ← Pino logger (use instead of console.log)
│       └── package.json
│
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml         ← OpenAPI contract (source of truth)
│   ├── api-client-react/
│   │   └── src/generated/       ← Auto-generated React Query hooks
│   ├── api-zod/
│   │   └── src/generated/       ← Auto-generated Zod validation schemas
│   └── db/
│       └── src/
│           ├── index.ts         ← Drizzle ORM + PostgreSQL pool
│           └── schema/          ← Database table definitions
│
├── scripts/                     ← Utility scripts
├── pnpm-workspace.yaml          ← Monorepo workspace config
├── tsconfig.base.json           ← Shared TypeScript config
└── package.json                 ← Root workspace (tooling only)`} />

              <div className="bg-card border border-border rounded-xl p-5 mt-4">
                <p className="font-semibold text-foreground mb-2">Key rules to remember:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All new pages go in <code className="text-primary bg-primary/10 px-1 rounded">artifacts/freefilewizard/src/pages/</code></li>
                  <li>Every new page must be registered in <code className="text-primary bg-primary/10 px-1 rounded">App.tsx</code></li>
                  <li>Add external links to tools in <code className="text-primary bg-primary/10 px-1 rounded">src/pages/tools.tsx</code> inside the <code className="text-primary bg-primary/10 px-1 rounded">tools</code> array</li>
                  <li>Theme colors live in <code className="text-primary bg-primary/10 px-1 rounded">src/index.css</code> — modify the CSS variables there</li>
                  <li>Never use <code className="text-primary bg-primary/10 px-1 rounded">console.log</code> in server code — use <code className="text-primary bg-primary/10 px-1 rounded">req.log</code> or the <code className="text-primary bg-primary/10 px-1 rounded">logger</code> singleton</li>
                </ul>
              </div>
            </Section>

            {/* ── LIBRARIES ── */}
            <Section id="libraries" title="Libraries & Dependencies" icon={Package}>
              <p>Here are all installed packages, where they are used, and what they do:</p>

              <div className="space-y-3">
                {[
                  { pkg: "react + react-dom", version: "^19", use: "Frontend", desc: "Core UI library and DOM renderer." },
                  { pkg: "vite", version: "^7", use: "Frontend (build)", desc: "Dev server and production bundler. Config in vite.config.ts." },
                  { pkg: "@vitejs/plugin-react", version: "^4", use: "Frontend (build)", desc: "React JSX transform for Vite." },
                  { pkg: "tailwindcss + @tailwindcss/vite", version: "^4", use: "Frontend", desc: "Utility-first CSS. Classes in JSX, theme in index.css." },
                  { pkg: "tw-animate-css", version: "^1", use: "Frontend", desc: "CSS keyframe animation helpers used by shadcn components." },
                  { pkg: "wouter", version: "^3", use: "Frontend", desc: "Lightweight React router. All routes in App.tsx use Switch/Route." },
                  { pkg: "@tanstack/react-query", version: "^5", use: "Frontend", desc: "Server state management. Use generated hooks from api-client-react." },
                  { pkg: "framer-motion", version: "^12", use: "Frontend", desc: "Animations and page transitions. motion.div, AnimatePresence." },
                  { pkg: "lucide-react", version: "^0.4", use: "Frontend", desc: "Icon library. Import icons by name: import { Zap } from 'lucide-react'." },
                  { pkg: "react-hook-form", version: "^7", use: "Frontend", desc: "Form state management. Pair with Form components from @/components/ui/form." },
                  { pkg: "@hookform/resolvers", version: "^3", use: "Frontend", desc: "Connects react-hook-form to Zod for validation." },
                  { pkg: "zod", version: "^3 (catalog:)", use: "Frontend + Backend", desc: "Schema validation. Use zod/v4 on backend, regular z on frontend." },
                  { pkg: "next-themes", version: "^0.4", use: "Frontend", desc: "Dark/light mode toggle with localStorage persistence." },
                  { pkg: "shadcn/ui (Radix UI)", version: "^1", use: "Frontend", desc: "Pre-built accessible components in src/components/ui/. All use Radix UI primitives." },
                  { pkg: "express", version: "^5", use: "Backend", desc: "HTTP server. Routes in artifacts/api-server/src/routes/." },
                  { pkg: "pino + pino-http", version: "^9/^10", use: "Backend", desc: "Structured JSON logger. Use req.log in handlers, logger elsewhere." },
                  { pkg: "drizzle-orm + drizzle-zod", version: "catalog:", use: "Backend + DB", desc: "ORM for PostgreSQL. Schema in lib/db/src/schema/." },
                  { pkg: "pg (node-postgres)", version: "^8", use: "Backend + DB", desc: "PostgreSQL client. Connection via DATABASE_URL env var." },
                  { pkg: "cors + cookie-parser", version: "^2/^1", use: "Backend", desc: "CORS headers and cookie parsing middleware." },
                  { pkg: "recharts", version: "^2", use: "Frontend (optional)", desc: "Chart library for data visualization pages." },
                  { pkg: "sonner", version: "^2", use: "Frontend", desc: "Toast notification system. Used alongside @/components/ui/toaster." },
                  { pkg: "react-icons", version: "^5", use: "Frontend", desc: "Additional icon sets (si/* for brand icons). Note: icon names may vary by version." },
                  { pkg: "esbuild", version: "^0.27", use: "Backend (build)", desc: "Bundles the Express server for production. Config in build.mjs." },
                ].map(({ pkg, version, use, desc }) => (
                  <div key={pkg} className="bg-card border border-border rounded-lg p-4 grid grid-cols-[1fr_auto] gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <code className="text-primary font-mono text-sm">{pkg}</code>
                        <span className="text-xs text-muted-foreground font-mono">{version}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{desc}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 h-fit whitespace-nowrap">{use}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── RUN LOCALLY ── */}
            <Section id="run-locally" title="Run Locally" icon={Terminal}>
              <p><strong className="text-foreground">Prerequisites:</strong> Node.js 20+, pnpm 9+, Git.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">1. Clone the repository</h3>
              <CodeBlock code={`git clone https://github.com/your-org/freefilewizard.git
cd freefilewizard`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">2. Install pnpm (if not installed)</h3>
              <CodeBlock code={`npm install -g pnpm`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">3. Install all dependencies</h3>
              <p>Run this once from the project root. It installs dependencies for all workspace packages.</p>
              <CodeBlock code={`pnpm install`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">4. Set up environment variables</h3>
              <p>Create a <code className="text-primary bg-primary/10 px-1 rounded">.env</code> file at the project root:</p>
              <CodeBlock lang="env" code={`# Required for the backend (API server)
DATABASE_URL=postgresql://user:password@localhost:5432/freefilewizard

# Optional: session secret for auth features
SESSION_SECRET=your-random-secret-here`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">5. Start the frontend</h3>
              <CodeBlock code={`pnpm --filter @workspace/freefilewizard run dev`} />
              <p>Frontend runs at <code className="text-primary bg-primary/10 px-1 rounded">http://localhost:25476</code> (or the port shown in the terminal).</p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">6. Start the API server (optional)</h3>
              <CodeBlock code={`pnpm --filter @workspace/api-server run dev`} />
              <p>API server runs at <code className="text-primary bg-primary/10 px-1 rounded">http://localhost:8080/api</code>.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">7. Run a full typecheck</h3>
              <CodeBlock code={`pnpm run typecheck`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">8. Regenerate API client after spec changes</h3>
              <p>Whenever you change <code className="text-primary bg-primary/10 px-1 rounded">lib/api-spec/openapi.yaml</code>, re-run codegen:</p>
              <CodeBlock code={`pnpm --filter @workspace/api-spec run codegen`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">9. Push database schema changes</h3>
              <CodeBlock code={`pnpm --filter @workspace/db run push`} />

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 mt-4">
                <p className="text-yellow-400 font-semibold text-sm mb-1">Important</p>
                <p className="text-sm">Never run <code className="font-mono">pnpm dev</code> at the workspace root — it has no <code className="font-mono">dev</code> script by design. Always use <code className="font-mono">--filter @workspace/&lt;package&gt;</code>.</p>
              </div>
            </Section>

            {/* ── MERGE INTO EXISTING SITE ── */}
            <Section id="merge" title="Merge Into an Existing Site" icon={GitMerge}>
              <p>You can merge specific pages, components, or the full frontend into an existing React/Vite project. Here are the recommended approaches:</p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Option A — Copy individual pages</h3>
              <p>Copy any page file from <code className="text-primary bg-primary/10 px-1 rounded">artifacts/freefilewizard/src/pages/</code> into your project's pages folder, then register the route.</p>
              <CodeBlock lang="tsx" code={`// In your existing App.tsx or router file:
import PartnerPage from "./pages/partner";   // copied from freefilewizard
import GuidePage from "./pages/guide";

// Add routes:
<Route path="/partner" component={PartnerPage} />
<Route path="/guide" component={GuidePage} />`} />
              <p>Make sure your project has these dependencies installed:</p>
              <CodeBlock code={`pnpm add framer-motion react-hook-form @hookform/resolvers zod wouter lucide-react`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Option B — Copy the shadcn/ui component library</h3>
              <p>Copy the <code className="text-primary bg-primary/10 px-1 rounded">src/components/ui/</code> folder into your project. These are standalone shadcn components that only depend on Radix UI and Tailwind CSS.</p>
              <CodeBlock code={`# Install Radix UI primitives your copied components need
pnpm add @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-tabs \\
  @radix-ui/react-toast @radix-ui/react-tooltip class-variance-authority \\
  clsx tailwind-merge`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Option C — Full monorepo merge</h3>
              <p>To bring the entire FreeFileWizard workspace into an existing monorepo:</p>
              <CodeBlock code={`# 1. Copy the artifacts/freefilewizard/ folder into your monorepo artifacts/
cp -r /path/to/freefilewizard/artifacts/freefilewizard your-monorepo/artifacts/

# 2. Register it in your pnpm-workspace.yaml
echo "  - 'artifacts/*'" >> pnpm-workspace.yaml

# 3. Install
pnpm install

# 4. Add a workflow/start script for the new artifact`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Adding external tool links</h3>
              <p>In <code className="text-primary bg-primary/10 px-1 rounded">src/pages/tools.tsx</code>, find the <code className="text-primary bg-primary/10 px-1 rounded">tools</code> array and add an <code className="text-primary bg-primary/10 px-1 rounded">href</code> to any entry:</p>
              <CodeBlock lang="tsx" code={`const tools = [
  {
    id: "pdf-extract",
    name: "PDF Extractor",
    desc: "Extract text from PDF files instantly.",
    cat: "Documents & PDF",
    href: "https://your-tool-domain.com/pdf-extractor",  // ← add this
  },
  // ...
];`} />
              <p>When <code className="text-primary bg-primary/10 px-1 rounded">href</code> is present, clicking the card opens the external URL. Without it, the "coming soon" modal appears.</p>
            </Section>

            {/* ── PARTNER CONNECT ── */}
            <Section id="partner-connect" title="Connect to the Partner Program" icon={Layers}>
              <p>Once registered at <code className="text-primary bg-primary/10 px-1 rounded">/partner</code>, you receive a unique 20-character Partner Code. Here's how to use it:</p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">1. Save your Partner Code</h3>
              <p>Your Partner Code looks like: <code className="text-primary bg-primary/10 px-1 rounded font-mono">AB3%K-7X!QM-P2#WN-Z9@VR</code>. Store it securely — it is linked to your registration IP and email.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">2. Register your site's domain</h3>
              <p>In your partner dashboard, add your site's domain to the allowlist. This enables cross-ad serving and tool embedding from that domain.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">3. Add the cross-ad script to your site</h3>
              <CodeBlock lang="html" code={`<!-- Add this before </body> on every page where you want ads -->
<script
  src="https://cdn.freefilewizard.com/partner.js"
  data-partner-code="YOUR_PARTNER_CODE"
  async
></script>`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">4. Connect your database (optional)</h3>
              <p>Provide a read/write database URL in the partner dashboard. FreeFileWizard can sync tool usage stats, user counts, and ad metrics directly to your database.</p>
              <CodeBlock lang="env" code={`# Add to your site's environment variables
FFW_PARTNER_CODE=YOUR_PARTNER_CODE
FFW_DATABASE_SYNC_URL=postgresql://user:pass@host:5432/yourdb`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">5. Submit your site, app, or game</h3>
              <p>From the partner dashboard, submit your project to be listed in the FreeFileWizard Community Directory. Your submission is reviewed within 48 hours.</p>
            </Section>

            {/* ── EMBED TOOLS ── */}
            <Section id="tools-api" title="Embed Tools on Your Site" icon={FileCode}>
              <p>Any of FreeFileWizard's 55+ tools can be embedded on your site as an iframe or via the JavaScript SDK.</p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Iframe embed</h3>
              <CodeBlock lang="html" code={`<iframe
  src="https://app.freefilewizard.com/embed/pdf-extractor?partner=YOUR_CODE"
  width="100%"
  height="600"
  frameborder="0"
  allow="clipboard-write"
  title="PDF Extractor by FreeFileWizard"
></iframe>`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">JavaScript SDK embed</h3>
              <CodeBlock lang="html" code={`<div id="ffw-tool"></div>
<script src="https://cdn.freefilewizard.com/sdk.js"></script>
<script>
  FreeFileWizard.embed({
    target: "#ffw-tool",
    tool: "image-compressor",
    partnerCode: "YOUR_PARTNER_CODE",
    theme: "dark",          // "dark" or "light"
    width: "100%",
    height: 500,
  });
</script>`} />

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Available tool IDs</h3>
              <CodeBlock lang="text" code={`pdf-extractor       image-compressor    word-counter
unit-converter      password-gen        qr-generator
cv-builder          currency-converter  hash-generator
base64-tool         json-validator      regex-tester
markdown-preview    csv-viewer          color-picker
case-converter      bmi-calculator      loan-calculator
pomodoro-timer      habit-tracker       timezone-converter
barcode-generator   watermark-tool      srt-shifter
svg-optimizer       signature-maker     expense-ledger
compound-interest   volume-calculator   subnet-calculator
recipe-scaler       metronome           momo-calculator
...and 20+ more`} />

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mt-6">
                <p className="text-primary font-semibold text-sm mb-1">Partner revenue note</p>
                <p className="text-sm text-foreground/80">When users interact with embedded tools on your site, ad impressions are attributed to your partner account. Revenue is calculated monthly and viewable in your partner dashboard.</p>
              </div>
            </Section>

          </main>
        </div>
      </div>
    </div>
  );
}
