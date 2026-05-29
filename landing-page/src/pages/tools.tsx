import React, { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Search, Zap, ShieldCheck, Infinity, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const TOOLS_SITE = "https://tools.freefilewizard.com";

const TOOLS = [
  { id: "qr", name: "QR Generator", desc: "Create custom QR codes instantly.", cat: "Images & Media" },
  { id: "pdf-ext", name: "PDF Extractor", desc: "Extract text and images from PDFs.", cat: "Documents & PDF" },
  { id: "cv", name: "CV Builder", desc: "Build professional resumes quickly.", cat: "Productivity" },
  { id: "img-comp", name: "Image Compressor", desc: "Reduce image file sizes with no quality loss.", cat: "Images & Media" },
  { id: "word-count", name: "Word Counter", desc: "Count words, characters, and sentences.", cat: "Text & Code" },
  { id: "unit", name: "Unit Converter", desc: "Convert between various units of measurement.", cat: "Calculators & Finance" },
  { id: "pass", name: "Password Generator", desc: "Generate secure, random passwords.", cat: "Security" },
  { id: "contrast", name: "Contrast Checker", desc: "Check color contrast for accessibility.", cat: "Text & Code" },
  { id: "currency", name: "Currency Converter", desc: "Live exchange rate conversions.", cat: "Calculators & Finance" },
  { id: "hash", name: "Hash Generator", desc: "Generate MD5, SHA-1, SHA-256 hashes.", cat: "Text & Code" },
  { id: "thumb", name: "Thumbnail Safe Zone", desc: "Check YouTube thumbnail safe zones.", cat: "Images & Media" },
  { id: "vid-aud", name: "Video to Audio", desc: "Extract audio tracks from video files.", cat: "Images & Media" },
  { id: "screen", name: "Screen Recorder", desc: "Record your screen right in the browser.", cat: "Productivity" },
  { id: "audio-rec", name: "Audio Recorder", desc: "Record audio from your microphone.", cat: "Productivity" },
  { id: "color", name: "Color Picker", desc: "Extract colors from images.", cat: "Images & Media" },
  { id: "srt", name: "SRT Shifter", desc: "Shift subtitle timings easily.", cat: "Text & Code" },
  { id: "format", name: "Format Converter", desc: "Convert files between different formats.", cat: "Documents & PDF" },
  { id: "shadow", name: "CSS Shadow Generator", desc: "Visual tool for CSS box-shadows.", cat: "Text & Code" },
  { id: "svg-opt", name: "SVG Optimizer", desc: "Minify and optimize SVG code.", cat: "Images & Media" },
  { id: "watermark", name: "Watermark Tool", desc: "Add watermarks to images in bulk.", cat: "Images & Media" },
  { id: "csv", name: "CSV Viewer", desc: "View and edit CSV files online.", cat: "Documents & PDF" },
  { id: "markdown", name: "Markdown Preview", desc: "Live preview for Markdown text.", cat: "Text & Code" },
  { id: "expense", name: "Expense Ledger", desc: "Track expenses locally.", cat: "Calculators & Finance" },
  { id: "json", name: "JSON Validator", desc: "Format and validate JSON data.", cat: "Text & Code" },
  { id: "base64", name: "Base64 Tool", desc: "Encode and decode Base64 strings.", cat: "Text & Code" },
  { id: "regex", name: "RegEx Tester", desc: "Test regular expressions safely.", cat: "Text & Code" },
  { id: "case", name: "Case Converter", desc: "Change text to UPPER, lower, camelCase.", cat: "Text & Code" },
  { id: "compound", name: "Compound Interest", desc: "Calculate compound interest over time.", cat: "Calculators & Finance" },
  { id: "timezone", name: "Timezone Converter", desc: "Compare times across the globe.", cat: "Productivity" },
  { id: "pomodoro", name: "Pomodoro Timer", desc: "Stay focused with Pomodoro technique.", cat: "Productivity" },
  { id: "habit", name: "Habit Tracker", desc: "Daily habit tracking dashboard.", cat: "Productivity" },
  { id: "bmi", name: "BMI Calculator", desc: "Calculate Body Mass Index.", cat: "Calculators & Finance" },
  { id: "loan", name: "Loan Calculator", desc: "Estimate loan payments and interest.", cat: "Calculators & Finance" },
  { id: "subnet", name: "Subnet Calculator", desc: "IP Subnetting tool for networks.", cat: "Text & Code" },
  { id: "recipe", name: "Recipe Scaler", desc: "Scale recipe ingredients up or down.", cat: "Productivity" },
  { id: "barcode", name: "Barcode Generator", desc: "Generate barcodes in multiple formats.", cat: "Images & Media" },
  { id: "signature", name: "Signature Maker", desc: "Draw and export your digital signature.", cat: "Productivity" },
  { id: "volume", name: "Volume Calculator", desc: "Calculate volumes of 3D shapes.", cat: "Calculators & Finance" },
  { id: "metronome", name: "Metronome", desc: "Accurate browser-based metronome.", cat: "Productivity" },
  { id: "momo", name: "Mobile Money Calculator", desc: "Calculate MoMo transfer fees.", cat: "Calculators & Finance" },
  { id: "crossads", name: "Cross-Ads Partner", desc: "Partner dashboard to monetize traffic.", cat: "Community" },
];

const CATEGORIES = ["All", ...Array.from(new Set(TOOLS.map(t => t.cat)))];

const catColors: Record<string, string> = {
  "Images & Media": "text-violet-400",
  "Documents & PDF": "text-blue-400",
  "Productivity": "text-emerald-400",
  "Text & Code": "text-amber-400",
  "Calculators & Finance": "text-cyan-400",
  "Security": "text-red-400",
  "Community": "text-pink-400",
};

export default function Tools() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = TOOLS.filter(t => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || t.cat === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Free Online Tools — FreeFileWizard"
        description="Browse 41+ free, no-signup online tools — file converters, calculators, image editors, and more."
      />

      {/* Header */}
      <div className="border-b border-border bg-card/40 py-14">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-primary text-xs font-semibold">
                <Zap size={11} /> No account needed
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-emerald-400 text-xs font-semibold">
                <ShieldCheck size={11} /> 100% free
              </span>
              <span className="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 text-violet-400 text-xs font-semibold">
                <Infinity size={11} /> Unlimited use
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-3">
              All Tools — <span className="text-gradient">Start Instantly</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              {TOOLS.length}+ free online tools. No signup, no limits, no paywalls. Just click and go.
            </p>

            {/* Main CTA */}
            <a
              href={TOOLS_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-4 rounded-full text-base transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 mb-8"
            >
              <Zap size={18} /> Start Using Tools for Free
              <ArrowUpRight size={16} />
            </a>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="Search tools (e.g. PDF, Image, BMI)..."
                className="pl-12 h-14 text-base rounded-full bg-card border-border focus:border-primary"
                value={search}
                onChange={e => setSearch(e.target.value)}
                data-testid="input-tool-search"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tool cards — display only, no click */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="bg-card border border-border rounded-xl p-5 flex flex-col h-full"
              data-testid={`card-tool-${tool.id}`}
            >
              <div className={`text-xs font-semibold mb-2 uppercase tracking-wider ${catColors[tool.cat] ?? "text-primary"}`}>
                {tool.cat}
              </div>
              <h3 className="text-base font-bold mb-1.5 leading-tight text-foreground">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                {tool.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <Search size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No tools found for "{search}"</p>
            <p className="text-sm mt-1">Try a different keyword or browse all categories.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-card border border-primary/20 rounded-2xl p-10"
        >
          <h2 className="text-2xl font-black mb-2">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            All {TOOLS.length}+ tools are 100% free, unlimited, and client-side — your files never leave your device.
          </p>
          
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://tools.freefilewizard.com/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-4 rounded-full text-base transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5"> 
              <Zap size={18} /> Start Using Tools for Free <ArrowUpRight size={16} /> 
            </a> 
          </div>
          <p className="text-xs text-muted-foreground mt-4">Open https://tools.freefilewizard.com · No signup required · Always free</p> 
        </motion.div> 
      </div> 
    </div> 
  ); 
}
