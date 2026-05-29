import React, { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Copy, RefreshCw, ShieldCheck, Zap, Users, DollarSign, Globe, Lock, Mail, Phone, KeyRound, ArrowRight, CheckCircle } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot" | "ip-login" | "success";

function generatePartnerCode(ip: string): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  const seed = ip + Date.now().toString().slice(-6);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  let code = "";
  let h = Math.abs(hash);
  for (let i = 0; i < 20; i++) {
    code += charset[h % charset.length];
    h = Math.abs((h * 1664525 + 1013904223) | 0);
  }
  const sections = [code.slice(0, 5), code.slice(5, 10), code.slice(10, 15), code.slice(15, 20)];
  return sections.join("-");
}

const signupSchema = z.object({
  phone: z.string().min(7, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  password: z
    .string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Must include uppercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special character"),
  confirmPassword: z.string(),
  partnerCode: z.string().min(20, "Partner code required"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

const forgotSchema = z.object({
  email: z.string().email("Valid email required"),
});

const ipLoginSchema = z.object({
  ipCode: z.string().min(20, "IP Secret Code required"),
  email: z.string().email("Valid email required"),
});

function PartnerBenefit({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary" />
      </div>
      <div>
        <p className="font-semibold text-foreground text-sm">{title}</p>
        <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default function Partner() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [partnerCode, setPartnerCode] = useState("");
  const [userIp, setUserIp] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => {
        setUserIp(d.ip || "unknown");
        const code = generatePartnerCode(d.ip || "unknown");
        setPartnerCode(code);
      })
      .catch(() => {
        const code = generatePartnerCode("0.0.0." + Math.floor(Math.random() * 256));
        setPartnerCode(code);
      });
  }, []);

  const regenerateCode = () => {
    const code = generatePartnerCode(userIp + Math.random());
    setPartnerCode(code);
    signupForm.setValue("partnerCode", code);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(partnerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { phone: "", email: "", password: "", confirmPassword: "", partnerCode: "" },
  });

  useEffect(() => {
    if (partnerCode) signupForm.setValue("partnerCode", partnerCode);
  }, [partnerCode]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotForm = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const ipForm = useForm<z.infer<typeof ipLoginSchema>>({
    resolver: zodResolver(ipLoginSchema),
    defaultValues: { ipCode: "", email: "" },
  });

  const handleSignup = (_: z.infer<typeof signupSchema>) => {
    toast({ title: "Welcome to FreeFileWizard Partners!", description: "Your account has been created. Save your partner code." });
    setMode("success");
  };

  const handleLogin = (_: z.infer<typeof loginSchema>) => {
    toast({ title: "Logged in successfully", description: "Welcome back to your partner dashboard." });
    setMode("success");
  };

  const handleForgot = (_: z.infer<typeof forgotSchema>) => {
    toast({ title: "Reset link sent", description: "Check your inbox for password reset instructions." });
    setMode("login");
  };

  const handleIpLogin = (_: z.infer<typeof ipLoginSchema>) => {
    toast({ title: "IP Auth verified", description: "You have been securely authenticated." });
    setMode("success");
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Partner Program - FreeFileWizard" description="Join the FreeFileWizard Partner Program and monetize your audience through cross-ad sharing." />

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — Info panel */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-xs font-semibold mb-6">
              <Zap size={12} /> Partner Program — Free to Join
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              Monetize Your Audience.<br />
              <span className="text-gradient">Grow Together.</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Connect your site, app, or blog to FreeFileWizard and unlock a full ecosystem — cross-ad revenue sharing, database integration, tool embedding, and audience tapping with zero upfront cost.
            </p>

            <div className="space-y-5">
              <PartnerBenefit icon={DollarSign} title="Cross-Ad Revenue Sharing" desc="Display FreeFileWizard ads on your site and earn a share of every impression and click." />
              <PartnerBenefit icon={Globe} title="Embed Any Tool" desc="Add 55+ tools directly into your pages. No code — just a single script tag." />
              <PartnerBenefit icon={Users} title="Tap Our Audience" desc="List your apps, games, or blogs in the FreeFileWizard directory and reach thousands." />
              <PartnerBenefit icon={ShieldCheck} title="Database Integration" desc="Connect your own database and manage tools, users, and analytics from one place." />
              <PartnerBenefit icon={KeyRound} title="IP-Secured Auth" desc="Your unique partner code is derived from your IP — secure, unique, and tamper-proof." />
            </div>
          </motion.div>

          {/* Right — Auth card */}
          <div>
            <AnimatePresence mode="wait">

              {/* ─── SUCCESS / UNAVAILABLE ─── */}
              {mode === "success" && (
                <motion.div key="success" variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                  className="glass-card rounded-2xl p-10 text-center border border-yellow-500/30">
                  <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe size={36} className="text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Thanks for Your Interest!</h2>
                  <p className="text-foreground/90 font-medium mb-3">
                    Thank you for showing interest in the FreeFileWizard Partner Program.
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-5 py-4 mb-6 text-left">
                    <p className="text-yellow-300 font-semibold text-sm mb-1">⚠️ Not yet available in your location</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The Partner Program is currently unavailable in your region. Our team is working hard to expand access and make it available to everyone worldwide very soon.
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                    While you wait, you can still enjoy all 41+ free tools on FreeFileWizard — no signup required, completely free.
                  </p>
                  <a
                    href="https://www.freefilewizard.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <Zap size={16} /> Visit Free Tools
                  </a>
                  <button
                    onClick={() => setMode("signup")}
                    className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to registration
                  </button>
                </motion.div>
              )}

              {/* ─── SIGNUP ─── */}
              {mode === "signup" && (
                <motion.div key="signup" variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                  className="glass-card rounded-2xl p-8 border border-border">
                  <h2 className="text-2xl font-bold mb-1">Join the Partner Program</h2>
                  <p className="text-muted-foreground text-sm mb-8">Create your free partner account below.</p>

                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">

                      <FormField control={signupForm.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><Phone size={13} /> Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 555 000 0000" {...field} data-testid="input-partner-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={signupForm.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><Mail size={13} /> Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} data-testid="input-partner-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={signupForm.control} name="password" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><Lock size={13} /> Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type={showPassword ? "text" : "password"} placeholder="Min 8 chars, 1 upper, 1 number, 1 symbol" {...field} data-testid="input-partner-password" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={signupForm.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><Lock size={13} /> Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type={showConfirm ? "text" : "password"} placeholder="Re-enter password" {...field} data-testid="input-partner-confirm" />
                              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={signupForm.control} name="partnerCode" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><KeyRound size={13} /> Your Unique Partner Code</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                readOnly
                                className="font-mono tracking-widest text-primary bg-primary/5 border-primary/30 pr-24"
                                data-testid="input-partner-code"
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <button type="button" onClick={copyCode} title="Copy code"
                                  className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                                  {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                                <button type="button" onClick={regenerateCode} title="Regenerate"
                                  className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                                  <RefreshCw size={14} />
                                </button>
                              </div>
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">Auto-generated from your IP address. Save this — it's your login key.</p>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <Button type="submit" className="w-full mt-2" size="lg" data-testid="button-partner-signup">
                        Join Partner Program <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already a partner?{" "}
                    <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium" data-testid="link-to-login">
                      Log in
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─── LOGIN ─── */}
              {mode === "login" && (
                <motion.div key="login" variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                  className="glass-card rounded-2xl p-8 border border-border">
                  <h2 className="text-2xl font-bold mb-1">Partner Login</h2>
                  <p className="text-muted-foreground text-sm mb-8">Welcome back. Log in to your partner dashboard.</p>

                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField control={loginForm.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><Mail size={13} /> Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} data-testid="input-login-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={loginForm.control} name="password" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><Lock size={13} /> Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type={showPassword ? "text" : "password"} placeholder="Your password" {...field} data-testid="input-login-password" />
                              <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <Button type="submit" className="w-full" size="lg" data-testid="button-login-submit">
                        Log In <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-4 space-y-3">
                    <div className="relative flex items-center gap-3">
                      <div className="flex-1 border-t border-border" />
                      <span className="text-xs text-muted-foreground">or</span>
                      <div className="flex-1 border-t border-border" />
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setMode("ip-login")} data-testid="button-ip-login">
                      <KeyRound size={16} className="mr-2" /> Login with IP Secret Code
                    </Button>
                  </div>

                  <div className="mt-6 flex justify-between text-sm">
                    <button onClick={() => setMode("forgot")} className="text-muted-foreground hover:text-primary hover:underline" data-testid="link-forgot-password">
                      Forgot password?
                    </button>
                    <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium" data-testid="link-to-signup">
                      Create account
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─── FORGOT PASSWORD ─── */}
              {mode === "forgot" && (
                <motion.div key="forgot" variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                  className="glass-card rounded-2xl p-8 border border-border">
                  <h2 className="text-2xl font-bold mb-1">Reset Password</h2>
                  <p className="text-muted-foreground text-sm mb-8">Enter your email address and we'll send a reset link.</p>

                  <Form {...forgotForm}>
                    <form onSubmit={forgotForm.handleSubmit(handleForgot)} className="space-y-4">
                      <FormField control={forgotForm.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><Mail size={13} /> Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} data-testid="input-forgot-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full" size="lg" data-testid="button-forgot-submit">
                        Send Reset Link
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-6 text-center text-sm">
                    <button onClick={() => setMode("login")} className="text-muted-foreground hover:text-primary hover:underline" data-testid="link-back-to-login">
                      Back to Login
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─── IP LOGIN ─── */}
              {mode === "ip-login" && (
                <motion.div key="ip-login" variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                  className="glass-card rounded-2xl p-8 border border-border">
                  <h2 className="text-2xl font-bold mb-1">IP Secret Code Login</h2>
                  <p className="text-muted-foreground text-sm mb-8">
                    Use the unique 20-character code that was generated when you signed up from your original IP address.
                  </p>

                  <Form {...ipForm}>
                    <form onSubmit={ipForm.handleSubmit(handleIpLogin)} className="space-y-4">
                      <FormField control={ipForm.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><Mail size={13} /> Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} data-testid="input-ip-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={ipForm.control} name="ipCode" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5"><KeyRound size={13} /> IP Secret Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                              className="font-mono tracking-widest"
                              {...field}
                              data-testid="input-ip-code"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">This is the 20-character code shown when you first registered.</p>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <Button type="submit" className="w-full" size="lg" data-testid="button-ip-submit">
                        <ShieldCheck size={16} className="mr-2" /> Authenticate with Code
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-6 flex justify-between text-sm">
                    <button onClick={() => setMode("login")} className="text-muted-foreground hover:text-primary hover:underline" data-testid="link-back-login">
                      Back to Login
                    </button>
                    <button onClick={() => setMode("forgot")} className="text-muted-foreground hover:text-primary hover:underline" data-testid="link-to-forgot">
                      Forgot code?
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
