import React from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const REVIEWS = [
  { id: 1, name: "Sarah Chen", role: "Frontend Developer", company: "TechFlow", text: "FreeFileWizard replaced three separate paid subscriptions for our team. The local processing means our client data stays secure. Absolutely phenomenal tool.", rating: 5 },
  { id: 2, name: "Marcus Johnson", role: "Freelance Designer", company: "Studio M", text: "The image compression and format conversion tools are blazing fast. I use this every single day.", rating: 5 },
  { id: 3, name: "Elena Rodriguez", role: "Content Manager", company: "GrowthScale", text: "We integrate FreeFileWizard's tools directly into our workflow. The lack of paywalls and ads makes it the best platform out there.", rating: 5 },
  { id: 4, name: "David Kim", role: "Software Engineer", company: "BuildCorp", text: "The JSON formatter and RegEx tester are better than dedicated apps. Plus, it's great knowing it all runs client-side.", rating: 4 },
  { id: 5, name: "Aisha Patel", role: "Student", company: "University of Tech", text: "Saved my life during finals week for PDF editing and merging. Thank you so much!", rating: 5 },
  { id: 6, name: "James Wilson", role: "SEO Specialist", company: "RankHigher", text: "The cross-ads partner program is actually profitable. I embedded a few tools on my blog and the monetization works seamlessly.", rating: 5 },
];

export default function Reviews() {
  return (
    <div className="container mx-auto px-4 py-16">
      <SEOHead title="Reviews - FreeFileWizard" description="See what our users say about FreeFileWizard." />
      
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Loved by Thousands</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Developers, designers, and businesses trust FreeFileWizard for their daily workflows.
        </p>
        
        <div className="flex items-center justify-center gap-8 bg-card/50 backdrop-blur border border-border p-6 rounded-2xl max-w-xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">4.9/5</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="flex gap-1 text-accent">
            {[...Array(5)].map((_, i) => <Star key={i} className="fill-current w-6 h-6" />)}
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">10k+</div>
            <div className="text-sm text-muted-foreground">Reviews</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {REVIEWS.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-xl flex flex-col"
          >
            <div className="flex gap-1 text-accent mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-muted opacity-30"}`} />
              ))}
            </div>
            <p className="text-foreground/90 italic mb-6 flex-1">"{review.text}"</p>
            <div>
              <div className="font-bold text-foreground">{review.name}</div>
              <div className="text-sm text-muted-foreground">{review.role}, {review.company}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}