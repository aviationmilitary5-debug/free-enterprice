import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { X, Rocket } from "lucide-react";

function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem("ffwBannerDismissed") === "1"; } catch { return false; }
  });

  if (dismissed) return null;

  const dismiss = () => {
    try { sessionStorage.setItem("ffwBannerDismissed", "1"); } catch {}
    setDismissed(true);
  };

  return (
    <div className="relative z-50 bg-primary text-primary-foreground text-sm font-medium py-2.5 px-4 flex items-center justify-center gap-3">
      <Rocket size={15} className="shrink-0" />
      <span>
        🚀 FreeFileWizard is live —{" "}
        <a
          href="https://www.freefilewizard.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 font-bold hover:opacity-80 transition-opacity"
        >
          try 41+ free tools now
        </a>
        {" "}· No signup required
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-primary-foreground/20 transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col w-full relative">
      <AnnouncementBanner />
      <Navbar />

      {/* Top horizontal ad banner */}
      <div className="w-full bg-card/30 border-b border-border px-4 py-2 hidden md:block">
        <AdSenseUnit
          slot="3456789012"
          format="horizontal"
          label="Advertisement"
        />
      </div>

      {/* Main layout: sidebar ads on desktop */}
      <div className="flex flex-1 w-full min-w-0">
        {/* Left sidebar ad */}
        <aside className="hidden xl:flex flex-col items-center pt-8 px-2 w-40 shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)]">
          <AdSenseUnit
            slot="1234567890"
            format="vertical"
            className="w-full"
            label="Advertisement"
          />
        </aside>

        {/* Page content */}
        <main className="flex-1 w-full min-w-0">{children}</main>

        {/* Right sidebar ad */}
        <aside className="hidden xl:flex flex-col items-center pt-8 px-2 w-40 shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)]">
          <AdSenseUnit
            slot="0987654321"
            format="vertical"
            className="w-full"
            label="Advertisement"
          />
        </aside>
      </div>

      {/* Bottom horizontal ad before footer */}
      <div className="w-full bg-card/30 border-t border-border px-4 py-2 hidden md:block">
        <AdSenseUnit
          slot="5678901234"
          format="horizontal"
          label="Advertisement"
        />
      </div>

      <Footer />
    </div>
  );
}
