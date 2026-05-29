import React from "react";
import { Link } from "wouter";
import { Twitter, Github, Linkedin, Youtube, MessageCircle, Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto py-12">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Product</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/tools" className="hover:text-primary transition-colors">Tools</Link></li>
            <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
            <li><Link href="/reviews" className="hover:text-primary transition-colors">Reviews</Link></li>
            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Resources</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li><Link href="/docs" className="hover:text-primary transition-colors">Docs</Link></li>
            <li><Link href="/guide" className="hover:text-primary transition-colors">Dev Guide</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            <li><Link href="/support" className="hover:text-primary transition-colors">Support</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Legal</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Use</Link></li>
            <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Connect</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/partner" className="hover:text-primary transition-colors">Partner Program</Link></li>
            <li><Link href="/guide" className="hover:text-primary transition-colors">Integration Guide</Link></li>
            <li><Link href="/ceo" className="hover:text-primary transition-colors">Meet the Founder</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-sm font-bold text-foreground mb-1">FreeFileWizard</p>
            <p className="text-sm text-muted-foreground">
              © 2026 FreeFileWizard. All rights reserved.
            </p>
            <p className="text-xs text-primary/70 italic mt-1">"Free tools for everyone. No paywalls. No limits."</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Follow Us</p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <a href="https://x.com/JeepsyTech" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" title="Twitter/X"
                className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200">
                <Twitter size={16} />
              </a>
              <a href="#" aria-label="GitHub" title="GitHub"
                className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200">
                <Github size={16} />
              </a>
              <a href="#" aria-label="LinkedIn" title="LinkedIn"
                className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200">
                <Linkedin size={16} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61578397056761" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"
                className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200">
                <Facebook size={16} />
              </a>
              <a href="https://www.instagram.com/jeepsyintel?igsh=eW5laXd6ODMzNmYw" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"
                className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200">
                <Instagram size={16} />
              </a>
              <a href="https://youtube.com/@pulseclips-v2u?si=yJ4eToMLBmtp-2n4" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube"
                className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200">
                <Youtube size={16} />
              </a>
              <a href="#" aria-label="Discord" title="Discord"
                className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
