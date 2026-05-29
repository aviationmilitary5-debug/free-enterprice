import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/tools", label: "Tools" },
    { href: "/about", label: "About" },
    { href: "/docs", label: "Docs" },
    { href: "/reviews", label: "Reviews" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
    { href: "/support", label: "Support" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-black text-xl tracking-tight text-gradient shrink-0" data-testid="link-logo">
          FreeFileWizard
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium flex-1 justify-center">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-primary whitespace-nowrap ${location === link.href ? "text-primary" : "text-foreground/60"}`}
              data-testid={`link-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA buttons */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10" data-testid="button-partner-nav">
            <Link href="/partner">
              <Zap size={14} className="mr-1.5" /> Join Partners
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-get-started-nav">
            <Link href="/tools">Get Started Free</Link>
          </Button>
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className="xl:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-mobile-menu"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="xl:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-xl p-4 flex flex-col gap-2 z-40">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-base font-medium px-3 py-2.5 rounded-lg transition-all ${location === link.href ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-card hover:text-foreground"}`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border mt-2 pt-3 flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full border-primary/40 text-primary" onClick={() => setIsOpen(false)}>
              <Link href="/partner"><Zap size={14} className="mr-2" /> Join Partner Program</Link>
            </Button>
            <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
              <Link href="/tools">Get Started Free</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
