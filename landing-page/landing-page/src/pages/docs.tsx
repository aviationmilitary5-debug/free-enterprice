import React, { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";

const SECTIONS = [
  "Getting Started",
  "Tool Reference",
  "Partner API",
  "Cross-Ads Integration",
  "Database Connector",
  "Embedding Tools",
  "FAQ"
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl flex flex-col md:flex-row gap-8 items-start">
      <SEOHead title="Documentation - FreeFileWizard" description="Developer docs and integration guides." />
      
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 shrink-0 sticky top-24">
        <div className="glass-card p-4 rounded-xl">
          <h3 className="font-bold text-lg mb-4 px-2">Documentation</h3>
          <nav className="flex flex-col space-y-1">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === s ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
              >
                {s}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 glass-card p-8 rounded-2xl min-h-[600px] w-full">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="prose prose-invert max-w-none prose-primary"
        >
          <h1>{activeSection}</h1>
          
          {activeSection === "Getting Started" && (
            <>
              <p className="lead">Welcome to the FreeFileWizard developer documentation. Here you'll find everything you need to integrate our tools, utilize our cross-ads network, and tap into our ecosystem.</p>
              <h3>Platform Overview</h3>
              <p>FreeFileWizard operates on a unique model: tools run client-side to save costs, while partners can embed these tools to increase retention and monetize traffic.</p>
              <div className="p-4 bg-muted/30 border border-border rounded-lg not-prose my-6">
                <div className="font-mono text-sm text-primary mb-2">// Quick Start: Embed a tool</div>
                <code className="text-sm">
                  &lt;iframe src="https://freefilewizard.com/embed/qr-generator" width="100%" height="500px" frameborder="0"&gt;&lt;/iframe&gt;
                </code>
              </div>
            </>
          )}

          {activeSection === "Partner API" && (
            <>
              <p>The Partner API allows you to programmatically manage your cross-ads campaigns, track conversions, and sync custom data to your integrated tools.</p>
              <h3>Authentication</h3>
              <p>All API requests require a Bearer token in the Authorization header.</p>
              <div className="p-4 bg-muted/30 border border-border rounded-lg not-prose my-6">
                <pre className="text-sm font-mono overflow-x-auto text-foreground">
                  <span className="text-accent">GET</span> /api/v1/partner/stats{'\n'}
                  Authorization: Bearer YOUR_API_KEY{'\n'}
                  {'\n'}
                  {'{'}{'\n'}
                  {'  "status": "success",'}{'\n'}
                  {'  "data": {'}{'\n'}
                  {'    "impressions": 124500,'}{'\n'}
                  {'    "clicks": 3420,'}{'\n'}
                  {'    "revenue_share": 1450.50'}{'\n'}
                  {'  }'}{'\n'}
                  {'}'}
                </pre>
              </div>
            </>
          )}

          {activeSection !== "Getting Started" && activeSection !== "Partner API" && (
            <>
              <p className="text-muted-foreground italic">Content for {activeSection} is currently being updated. Check back soon for detailed guides and API references.</p>
              <div className="h-32 bg-muted/20 border border-dashed border-border rounded-lg flex items-center justify-center mt-8">
                <span className="text-muted-foreground text-sm">Documentation coming soon</span>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}