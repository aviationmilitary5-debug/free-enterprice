import React, { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const POSITIONS = [
  { id: "fe", title: "Senior Frontend Engineer", type: "Remote / Full-time", dept: "Engineering" },
  { id: "be", title: "Backend Engineer (Rust/Go)", type: "Remote / Full-time", dept: "Engineering" },
  { id: "devrel", title: "Developer Relations", type: "Remote / Full-time", dept: "Community" },
  { id: "content", title: "Content Writer", type: "Remote / Part-time", dept: "Marketing" },
  { id: "growth", title: "Growth Marketing Manager", type: "Remote / Full-time", dept: "Marketing" },
  { id: "community", title: "Community Manager", type: "Remote / Full-time", dept: "Community" }
];

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  resume: z.string().url("Must be a valid URL linking to your resume/LinkedIn"),
  coverNote: z.string().min(10, "Tell us a bit more about yourself")
});

export default function Careers() {
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", resume: "", coverNote: "" }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Application Submitted",
      description: "Thanks for applying! We'll review your application and get back to you soon.",
    });
    form.reset();
    setActiveJob(null);
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <SEOHead title="Careers - FreeFileWizard" description="Join our mission to provide free tools for everyone." />
      
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Join the Wizardry</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We're a fully remote team building the internet's best free tool ecosystem. No paywalls, no limits, just great software.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">Why work with us?</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li>✓ 100% remote team across 12 timezones</li>
            <li>✓ Focus on open source and community</li>
            <li>✓ Competitive salary & equity</li>
            <li>✓ Unlimited PTO (minimum 20 days required)</li>
            <li>✓ Home office & learning stipends</li>
          </ul>
        </div>
        <div className="glass-card p-8 rounded-2xl flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-4">Our Culture</h3>
          <p className="text-muted-foreground">
            We value high agency, deep focus, and craftsmanship. We don't care how many hours you work, we care about the quality of what you ship. If you love building tools that millions of people use every day, you'll fit right in.
          </p>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
      <div className="space-y-4">
        {POSITIONS.map((job) => (
          <motion.div 
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group"
          >
            <div>
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                <span className="bg-card px-2 py-1 rounded-md border border-border">{job.dept}</span>
                <span>{job.type}</span>
              </div>
            </div>
            <Button onClick={() => setActiveJob(job.title)} data-testid={`button-apply-${job.id}`}>Apply Now</Button>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!activeJob} onOpenChange={(open) => !open && setActiveJob(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for {activeJob}</DialogTitle>
            <DialogDescription>
              Fill out the form below to apply.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="jane@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume/LinkedIn URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coverNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Note</FormLabel>
                    <FormControl><Textarea placeholder="Why this role?" className="min-h-[100px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit">Submit Application</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}