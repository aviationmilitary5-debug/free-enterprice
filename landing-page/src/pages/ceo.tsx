import React from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Twitter, Instagram, Youtube, Facebook, Mail, Rocket, Globe, Zap, Star, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import founderPhoto1 from "@assets/WhatsApp_Image_2026-05-27_at_4.08.06_AM_(1)_1779928355538.jpeg";
import founderPhoto2 from "@assets/WhatsApp_Image_2026-05-27_at_4.08.06_AM_1779928366978.jpeg";

const socials = [
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@jeepsyintel",
    href: "https://www.instagram.com/jeepsyintel?igsh=eW5laXd6ODMzNmYw",
    color: "from-pink-500 to-orange-400",
  },
  {
    icon: Twitter,
    label: "Twitter / X",
    handle: "@JeepsyTech",
    href: "https://x.com/JeepsyTech",
    color: "from-sky-400 to-blue-500",
  },
  {
    icon: Youtube,
    label: "YouTube",
    handle: "@pulseclips-v2u",
    href: "https://youtube.com/@pulseclips-v2u?si=yJ4eToMLBmtp-2n4",
    color: "from-red-500 to-rose-600",
  },
  {
    icon: Facebook,
    label: "Facebook",
    handle: "JeepsyX",
    href: "https://www.facebook.com/profile.php?id=61578397056761",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Mail,
    label: "Email",
    handle: "prospertaku098@gmail.com",
    href: "mailto:prospertaku098@gmail.com",
    color: "from-emerald-400 to-cyan-500",
  },
];

const milestones = [
  { year: "2024", title: "Founded FreeFileWizard", desc: "Launched a free, enterprise-grade file tools platform to democratize access to online utilities globally." },
  { year: "2025", title: "Ideated JeepsyX", desc: "Conceived JeepsyX — a next-generation space company targeting Africa's largely untapped and low-competition space industry." },
  { year: "2026", title: "Partner Ecosystem Launch", desc: "Launched the FreeFileWizard Partner Program, enabling developers worldwide to monetize through cross-ad revenue sharing and tool embedding." },
  { year: "Future", title: "JeepsyX — African Space Frontier", desc: "Building the infrastructure, satellite systems, and launch capabilities to put Africa at the forefront of the new space economy." },
];

export default function CEO() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Founder & CEO — FreeFileWizard"
        description="Meet the Founder and CEO of FreeFileWizard — visionary developer, idealist, and founder of JeepsyX, Africa's next-generation space company."
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-20 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-xs font-semibold mb-6">
                <Star size={12} /> Founder & CEO — FreeFileWizard
              </div>

              <h1 className="text-5xl md:text-6xl font-black mb-2 leading-tight">
                Prosper Taku
              </h1>
              <p className="text-primary text-xl font-semibold mb-6 tracking-wide">
                Founder & CEO · Developer · Idealist
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Prosper Taku is the founder and CEO of <strong className="text-foreground">FreeFileWizard</strong> — an enterprise-grade, 100% free online file tools platform built to give everyone access to professional-grade utilities, no paywalls, no limits.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                Beyond FreeFileWizard, Prosper is the visionary founder of <strong className="text-foreground">JeepsyX</strong> — a next-generation space company focused on unlocking the vast, low-competition African space industry and positioning the continent as a serious player in humanity's new space age.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="mailto:prospertaku098@gmail.com">
                    <Mail size={15} className="mr-2" /> Send a Message
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-border hover:border-primary/50">
                  <Link href="/partner">
                    <Zap size={15} className="mr-2" /> Join Partner Program
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Photos */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex gap-4 justify-center lg:justify-end"
            >
              <div className="relative">
                <div className="w-56 h-72 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/10 rotate-[-3deg]">
                  <img
                    src={founderPhoto1}
                    alt="Prosper Taku — CEO of FreeFileWizard"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  CEO
                </div>
              </div>
              <div className="relative mt-10">
                <div className="w-52 h-64 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/10 rotate-[2deg]">
                  <img
                    src={founderPhoto2}
                    alt="Prosper Taku — Founder of JeepsyX"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-3 -left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Founder
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* JeepsyX Section */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-semibold mb-6">
                <Rocket size={12} /> Upcoming Venture
              </div>
              <h2 className="text-4xl font-black mb-4">
                JeepsyX — <span className="text-emerald-400">Africa's Space Future</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                While the global space industry is dominated by a handful of western players, <strong className="text-foreground">Africa's space market is wide open</strong>. JeepsyX is being built to change that — from the ground up, on African soil, for African ambitions.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                JeepsyX targets satellite technology, launch services, and space data infrastructure for a continent of 1.4 billion people with enormous demand and minimal competition. Prosper believes the next great space company won't come from Silicon Valley — it will come from Africa.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Globe, label: "Focus", value: "African Space Industry" },
                  { icon: Rocket, label: "Category", value: "Next-Gen Space Tech" },
                  { icon: Sparkles, label: "Status", value: "Pre-launch / Founding" },
                  { icon: Star, label: "Vision", value: "Low-competition, high-impact" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} className="text-emerald-400" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="font-semibold text-foreground text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="bg-card border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6">
                    <Rocket size={28} className="text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">JeepsyX</h3>
                  <p className="text-emerald-400 font-semibold text-sm mb-6">Next-Generation African Space Company</p>

                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                      <p>Satellite development and deployment for African connectivity and Earth observation</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                      <p>Launch service infrastructure to reduce Africa's dependence on foreign launch pads</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                      <p>Space data services for agriculture, weather, resource mapping, and telecoms</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                      <p>Building Africa's first truly vertically integrated commercial space company</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">
                      "The African space industry is the biggest untapped opportunity in the 21st century. We're going to build it."
                    </p>
                    <p className="text-xs text-primary mt-2 font-semibold">— Prosper Taku, Founder of JeepsyX</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 border-b border-border bg-card/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">The Journey</h2>
            <p className="text-muted-foreground">From a developer with a vision to building two transformative companies.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-10">
              {milestones.map(({ year, title, desc }, i) => (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-8 pl-20 relative"
                >
                  <div className={`absolute left-5 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${year === "Future" ? "bg-emerald-500/20 border-emerald-500" : "bg-primary/20 border-primary"}`}>
                    <div className={`w-2 h-2 rounded-full ${year === "Future" ? "bg-emerald-400" : "bg-primary"}`} />
                  </div>
                  <div>
                    <span className={`text-xs font-bold tracking-widest uppercase ${year === "Future" ? "text-emerald-400" : "text-primary"}`}>{year}</span>
                    <h3 className="text-lg font-bold text-foreground mt-1 mb-1">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Connect with Prosper</h2>
            <p className="text-muted-foreground">Follow the journey — FreeFileWizard, JeepsyX, and everything in between.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {socials.map(({ icon: Icon, label, handle, href, color }, i) => (
              <motion.a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group bg-card border border-border hover:border-primary/40 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">{handle}</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground ml-auto shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border bg-card/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-black mb-4">Want to partner or collaborate?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Whether it's the FreeFileWizard partner program or an early conversation about JeepsyX — Prosper is open to ideas, collaborations, and builders who want to make something real.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href="mailto:prospertaku098@gmail.com">
                  <Mail size={16} className="mr-2" /> Email Prosper
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/partner">
                  <Zap size={16} className="mr-2" /> Join the Partner Program
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
