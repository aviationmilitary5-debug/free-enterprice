import React, { useState } from "react"; 
import { SEOHead } from "@/components/SEOHead"; 
import { motion } from "framer-motion"; 
import { Calendar, Clock, ArrowRight } from "lucide-react"; 

const CATEGORIES = ["All", "Tutorials", "Product Updates", "Developer Tips", "Community"]; 

const POSTS = [ 
  { id: 1, title: "How to Monetize Your Blog with Cross-Ads", excerpt: "Learn how the FreeFileWizard partner network can increase your site's RPM by up to 40% without intrusive popups.", date: "Oct 12, 2026", time: "5 min read", cat: "Developer Tips" }, 
  { id: 2, title: "Introducing: Client-Side Video Processing", excerpt: "We've rebuilt our video format converter to use WebAssembly, meaning massive files process entirely in your browser.", date: "Oct 05, 2026", time: "3 min read", cat: "Product Updates" }, 
  { id: 3, title: "The Future of Free Software Tools", excerpt: "Why paywalls are obsolete and how client-side processing is changing the SaaS landscape.", date: "Sep 28, 2026", time: "8 min read", cat: "Community" }, 
  { id: 4, title: "Integrating the PDF API", excerpt: "A step-by-step guide to embedding our PDF extraction and compression tools directly into your web app.", date: "Sep 15, 2026", time: "6 min read", cat: "Tutorials" }, 
  { id: 5, title: "New Feature: Custom Database Connections", excerpt: "Partners can now hook their own Supabase or Firebase instances directly into embedded tools.", date: "Sep 02, 2026", time: "4 min read", cat: "Product Updates" }, 
  { id: 6, title: "Case Study: How TechFlow Saved $5K/mo", excerpt: "An inside look at how a mid-sized agency replaced all their utility SaaS subscriptions with FreeFileWizard.", date: "Aug 20, 2026", time: "7 min read", cat: "Community" }, 
]; 

export default function Blog() { 
  const [activeCat, setActiveCat] = useState("All"); 
  const [activePost, setActivePost] = useState<number | null>(null); 
  
  const filtered = activeCat === "All" ? POSTS : POSTS.filter(p => p.cat === activeCat); 
  
  if (activePost) { 
    const post = POSTS.find(p => p.id === activePost); 
    return ( 
      <div className="container mx-auto px-4 py-16 max-w-3xl"> 
        <button onClick={() => setActivePost(null)} className="text-primary hover:underline flex items-center gap-2 mb-8"> 
          &larr; Back to Blog 
        </button> 
        <div className="mb-8"> 
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4"> 
            <span className="bg-primary/10 text-primary px-2 py-1 rounded">{post?.cat}</span> 
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post?.date}</span> 
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post?.time}</span> 
          </div> 
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{post?.title}</h1> 
          <p className="text-xl text-muted-foreground border-l-4 border-primary pl-4">{post?.excerpt}</p> 
        </div> 
        <div className="prose prose-invert prose-primary max-w-none mt-12"> 
          <p>This is a placeholder for the full blog post content. In a fully implemented version, this would fetch markdown or rich text from a CMS.</p> 
          <h2>The Main Concept</h2> 
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p> 
          <div className="p-6 bg-card border border-border rounded-xl my-8"> 
            <h3 className="mt-0">Join the Newsletter</h3> 
            <p className="mb-4">Get the latest updates directly in your inbox.</p> 
            <BlogNewsletterForm /> 
          </div> 
        </div> 
      </div> 
    ); 
  } 
  
  return ( 
    <div className="container mx-auto px-4 py-16 max-w-6xl"> 
      <SEOHead title="Blog - FreeFileWizard" description="News, tutorials, and updates from the FreeFileWizard team." /> 
      <div className="text-center mb-16"> 
        <h1 className="text-4xl md:text-5xl font-bold mb-6">The Wizard's Scroll</h1> 
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto"> 
          Insights, tutorials, and updates from the team building a free internet. 
        </p> 
      </div> 
      <div className="flex flex-wrap justify-center gap-2 mb-12"> 
        {CATEGORIES.map(cat => ( 
          <button key={cat} onClick={() => setActiveCat(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCat === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent/10"}`} > 
            {cat} 
          </button> 
        ))} 
      </div> 
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"> 
        {filtered.map((post, i) => ( 
          <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer" onClick={() => setActivePost(post.id)} > 
            <div className="h-48 bg-muted/30 border-b border-border/50 relative overflow-hidden"> 
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-105 transition-transform duration-500" /> 
            </div> 
            <div className="p-6 flex flex-col flex-1"> 
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3"> 
                <span className="text-primary font-medium">{post.cat}</span> 
                <span>•</span> 
                <span>{post.date}</span> 
              </div> 
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h3> 
              <p className="text-muted-foreground text-sm mb-6 flex-1">{post.excerpt}</p> 
              <div className="flex items-center text-sm font-medium text-primary mt-auto"> 
                Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /> 
              </div> 
            </div> 
          </motion.div> 
        ))} 
      </div> 
    </div> 
  ); 
} 

function BlogNewsletterForm() { 
  const [email, setEmail] = React.useState(""); 
  const [status, setStatus] = React.useState("idle"); 
  
  const handleSubscribe = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!email) return; 
    setStatus("submitting"); 
    try { 
      const formspreePromise = fetch("https://formspree.io/f/mqejjnbg", { 
        method: "POST", 
        headers: { "Content-Type": "application/json", "Accept": "application/json" }, 
        body: JSON.stringify({ email: email }), 
      }); 
      
      const loopsPromise = fetch("https://loops.so", { 
        method: "POST", 
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
        body: new URLSearchParams({ email: email }), 
      }); 
      
      await Promise.all([formspreePromise, loopsPromise]); 
      setStatus("success"); 
      setEmail(""); 
    } catch (error) { 
      console.error("Sync Error:", error); 
      setStatus("error"); 
    } 
  }; 
  
  return ( 
    <div className="w-full"> 
      {status === "success" ? ( 
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center font-medium"> 
          🎉 Welcome to the community! Check your inbox for your wizard greeting. 
        </div> 
      ) : ( 
        <form onSubmit={handleSubscribe} className="flex gap-2"> 
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-primary" /> 
          <button type="submit" disabled={status === "submitting"} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50" > 
            {status === "submitting" ? "Joining..." : "Subscribe"} 
          </button> 
        </form> 
      )} 
      {status === "error" && ( 
        <p className="text-xs text-red-400 mt-2 text-center">Network sync timeout. Please try again.</p> 
      )} 
    </div> 
  ); 
}
