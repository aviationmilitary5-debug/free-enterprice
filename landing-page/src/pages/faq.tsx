import React from "react";
import { SEOHead } from "@/components/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    category: "General",
    questions: [
      { q: "Is FreeFileWizard really 100% free?", a: "Yes. We don't have premium tiers, subscriptions, or hidden fees. We sustain the platform through our partner ecosystem and non-intrusive cross-ads." },
      { q: "Do I need to create an account?", a: "No account is required to use any of our 55+ tools. You only need an account if you want to join our Partner Program to monetize your own website." },
      { q: "How is it possible to be totally free?", a: "By leveraging client-side processing (WebAssembly and modern browser APIs), your device does the heavy lifting. This eliminates massive server costs for us, allowing us to keep it free." }
    ]
  },
  {
    category: "Security & Privacy",
    questions: [
      { q: "Are my files safe?", a: "Extremely. For the vast majority of our tools, your files never leave your browser. Processing happens locally on your machine." },
      { q: "Do you store my converted files?", a: "No. Since processing happens locally, we have no access to your files. For the few tools that do require server processing, files are automatically deleted immediately after the task is complete." },
      { q: "What data do you collect?", a: "We collect standard anonymous analytics (page views, tool usage) to improve the platform. We do not collect personal data unless you explicitly sign up for a Partner account." }
    ]
  },
  {
    category: "Partner Program",
    questions: [
      { q: "What is the Partner Program?", a: "It's a way for developers and site owners to integrate our tools into their sites, or to display our cross-ads to earn revenue from their traffic." },
      { q: "How do cross-ads work?", a: "Cross-ads are ethical, non-intrusive advertisements from other partners in the ecosystem. You earn a share of revenue based on impressions and clicks generated from your site." },
      { q: "Can I embed tools on a commercial site?", a: "Yes, you can embed our tools anywhere. We provide iframes and API access for seamless integration." }
    ]
  }
];

export default function Faq() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <SEOHead title="FAQ - FreeFileWizard" description="Frequently asked questions about FreeFileWizard." />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground">Everything you need to know about the platform.</p>
      </div>

      <div className="space-y-12">
        {FAQS.map((section) => (
          <div key={section.category}>
            <h2 className="text-2xl font-bold mb-6 text-primary">{section.category}</h2>
            <Accordion type="single" collapsible className="w-full bg-card border border-border rounded-xl px-4">
              {section.questions.map((faq, i) => (
                <AccordionItem key={i} value={`item-${section.category}-${i}`} className="border-border">
                  <AccordionTrigger className="text-left text-lg font-medium hover:text-primary">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}