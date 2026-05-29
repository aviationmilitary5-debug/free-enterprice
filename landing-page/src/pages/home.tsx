import React from "react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, Shield, Globe, Layers, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead title="FreeFileWizard - Free. Unlimited. Yours." description="Enterprise-grade free online tools platform for conversion, compression, editing and more." />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-[-1]" />
        
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Free. Unlimited. <span className="text-gradient">Yours.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            An enterprise-grade, 100% free online platform offering 55+ file conversion, compression, editing, and utility tools. Client-side, secure, and blazing fast.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full" asChild data-testid="button-visit-tools-hero">
              <Link href="https://tools.freefilewizard.com/">Visit Tools <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-primary/50 hover:bg-primary/10" asChild data-testid="button-become-partner-hero">
              <Link href="https://www.freefilewizard.com/about">Become a Partner</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-12 md:gap-24 text-center">
          {[
            { label: "Active Tools", value: "55+" },
            { label: "Happy Users", value: "100K+" },
            { label: "Cost Forever", value: "$0" },
            { label: "Data Uploaded", value: "0 MB" }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise Grade. <span className="text-primary">Zero Cost.</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We ripped down the paywalls. Everything happens directly in your browser.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Blazing Fast", desc: "Client-side processing means zero upload wait times. Instant results." },
              { icon: Shield, title: "100% Secure", desc: "Your files never leave your device. We don't see your data." },
              { icon: Globe, title: "Multi-device", desc: "Works perfectly on desktop, tablet, and mobile browsers." },
              { icon: Layers, title: "Ecosystem", desc: "Not just tools. A full partner network to monetize your own sites." }
            ].map((feat, i) => (
              <motion.div 
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl"
              >
                <feat.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
                <p className="text-muted-foreground">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary/5 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to simplify your workflow?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">Join hundreds of thousands of users who have ditched expensive subscriptions for FreeFileWizard.</p>
          <Button size="lg" className="px-10 py-6 text-lg rounded-full" asChild data-testid="button-cta-bottom">
            <Link href="/tools">Explore All Tools</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}