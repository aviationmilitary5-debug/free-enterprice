import React from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <SEOHead title="About Us - FreeFileWizard" description="Learn about the FreeFileWizard platform, our mission, and our partner ecosystem." />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About FreeFileWizard</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Mission: "Free online tools for everyone, forever."
        </p>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">The Vision</h2>
          <p className="text-muted-foreground">
            We started FreeFileWizard because we were tired of encountering paywalls for simple tasks like converting a PDF or resizing an image. Software utilities should be universally accessible. By shifting processing to the client-side (your browser), we eliminate massive server costs and pass those savings—meaning $0—directly to you.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">The Platform Ecosystem</h2>
          <p className="text-muted-foreground mb-6">
            FreeFileWizard isn't just a set of tools. It's a partner ecosystem. We serve two main groups:
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 not-prose mb-12">
            <div className="glass-card p-6 rounded-xl border-t-4 border-t-primary">
              <h3 className="text-xl font-bold mb-2">For End Users</h3>
              <p className="text-muted-foreground">100% free, unlimited, unrestricted tools. No sign-ups required. Your data never leaves your device, guaranteeing absolute privacy and blazing fast speeds.</p>
            </div>
            <div className="glass-card p-6 rounded-xl border-t-4 border-t-accent">
              <h3 className="text-xl font-bold mb-2">For Partners & Devs</h3>
              <p className="text-muted-foreground">Connect your site, integrate databases, display our cross-ads to earn revenue, and share audiences. We offer APIs and embeddable widgets.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">Our Values</h2>
          <ul className="space-y-4 text-muted-foreground">
            <li><strong className="text-foreground">Open & Free:</strong> No hidden fees. No artificial limits.</li>
            <li><strong className="text-foreground">Privacy First:</strong> What happens in your browser, stays in your browser.</li>
            <li><strong className="text-foreground">Community Driven:</strong> Built for and improved by our users.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}