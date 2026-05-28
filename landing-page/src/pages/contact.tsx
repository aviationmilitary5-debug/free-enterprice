import React from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Twitter, Github, Linkedin, MessageCircle, Facebook, Instagram, Youtube } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

export default function Contact() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Message sent!",
      description: "We've received your message and will respond shortly.",
    });
    form.reset();
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <SEOHead title="Contact Us - FreeFileWizard" description="Get in touch with the FreeFileWizard team." />
      
      <div className="grid md:grid-cols-2 gap-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Have questions about our tools or partner program? Send us a message. We typically respond within 24 hours.
          </p>

          <div className="space-y-6 mb-12">
            <div>
              <h3 className="font-semibold mb-1 text-foreground">Email Support</h3>
              <p className="text-muted-foreground">support@freefilewizard.com</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-foreground">Partner Inquiries</h3>
              <p className="text-muted-foreground">partners@freefilewizard.com</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Follow Us</h3>
            <div className="flex flex-wrap gap-3">
              <a href="https://x.com/JeepsyTech" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" title="Twitter/X" className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"><Twitter size={18} /></a>
              <a href="#" aria-label="GitHub" title="GitHub" className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"><Github size={18} /></a>
              <a href="#" aria-label="LinkedIn" title="LinkedIn" className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"><Linkedin size={18} /></a>
              <a href="https://www.facebook.com/profile.php?id=61578397056761" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook" className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"><Facebook size={18} /></a>
              <a href="https://www.instagram.com/jeepsyintel?igsh=eW5laXd6ODMzNmYw" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"><Instagram size={18} /></a>
              <a href="https://youtube.com/@pulseclips-v2u?si=yJ4eToMLBmtp-2n4" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube" className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"><Youtube size={18} /></a>
              <a href="#" aria-label="Discord" title="Discord" className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"><MessageCircle size={18} /></a>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 rounded-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-contact-name" />
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="How can we help?" {...field} data-testid="input-contact-subject" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Your message here..." className="min-h-[150px]" {...field} data-testid="input-contact-message" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg" data-testid="button-contact-submit">Send Message</Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}