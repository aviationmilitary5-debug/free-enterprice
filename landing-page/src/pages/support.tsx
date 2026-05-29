import React from "react";
import { SEOHead } from "@/components/SEOHead";
import { Search, Book, Wrench, Users, Settings, MessagesSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { icon: Book, title: "Getting Started", desc: "Basic guides and platform overview" },
  { icon: Wrench, title: "Using Tools", desc: "Help with specific conversions or edits" },
  { icon: Users, title: "Partner Program", desc: "Monetization and integration help" },
  { icon: Settings, title: "Account & Settings", desc: "Managing your optional profile" },
  { icon: MessagesSquare, title: "Community", desc: "Forums and user discussions" }
];

export default function Support() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <SEOHead title="Support - FreeFileWizard" description="Get help with FreeFileWizard tools and services." />
      
      <div className="text-center mb-16 bg-card border border-border rounded-3xl p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent z-0" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-6">How can we help?</h1>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              type="search" 
              placeholder="Search for articles, guides, or troubleshooting..." 
              className="pl-12 h-14 text-lg rounded-full bg-background"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="glass-card p-6 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group">
            <cat.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">{cat.title}</h3>
            <p className="text-sm text-muted-foreground">{cat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h3 className="text-2xl font-bold mb-6">Popular Articles</h3>
          <ul className="space-y-4">
            <li><a href="#" className="text-foreground hover:text-primary transition-colors flex items-center gap-2"><Book className="w-4 h-4 text-muted-foreground" /> Why is my PDF not converting properly?</a></li>
            <li><a href="#" className="text-foreground hover:text-primary transition-colors flex items-center gap-2"><Book className="w-4 h-4 text-muted-foreground" /> Setting up Cross-Ads on a WordPress site</a></li>
            <li><a href="#" className="text-foreground hover:text-primary transition-colors flex items-center gap-2"><Book className="w-4 h-4 text-muted-foreground" /> How client-side processing keeps data secure</a></li>
            <li><a href="#" className="text-foreground hover:text-primary transition-colors flex items-center gap-2"><Book className="w-4 h-4 text-muted-foreground" /> Understanding Partner API rate limits</a></li>
            <li><a href="#" className="text-foreground hover:text-primary transition-colors flex items-center gap-2"><Book className="w-4 h-4 text-muted-foreground" /> Removing watermarks from output files</a></li>
          </ul>
        </div>
        <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl text-center flex flex-col justify-center items-center">
          <h3 className="text-xl font-bold mb-4">Still need help?</h3>
          <p className="text-muted-foreground mb-6">Our support team is ready to assist you with any technical issues or partner questions.</p>
          <Button size="lg" className="w-full" onClick={() => alert("Live chat connecting...")}>Start Live Chat</Button>
          <a href="#" className="text-sm text-primary mt-4 hover:underline">Check System Status</a>
        </div>
      </div>
    </div>
  );
}