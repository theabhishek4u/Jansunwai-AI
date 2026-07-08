"use client";

import { motion } from "framer-motion";
import { XCircle, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

export function ManualVsAI() {
  const comparisons = [
    {
      feature: "Grievance Logging",
      traditional: "Manual queue visits, paper applications, and courier delays (3 to 5 days lag).",
      ai: "Instant multilingual submission via voice notes, text, or photos with auto-GPS coordinates (5 seconds).",
    },
    {
      feature: "Triage & Routing",
      traditional: "Manual sorting by office clerks, leading to misrouting and desk hopping (7 to 14 days delay).",
      ai: "AI instantly categorizes, estimates budgets, detects urgency, and routes directly to the nodal officer (<1 second).",
    },
    {
      feature: "SLA Accountability",
      traditional: "No alerts, no deadlines, and files frequently get lost in departmental folders.",
      ai: "Strict digital SLA timelines. AI autonomously escalates the ticket to higher officials upon delay.",
    },
    {
      feature: "Citizen Tracking",
      traditional: "No progress updates. Citizens must physically visit government offices to check status.",
      ai: "Real-time updates via SMS and WhatsApp. View actual post-resolution photos uploaded by engineers.",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-background/5" id="comparison">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-linear-to-r from-gov-blue/5 to-ai-purple/5 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ai-purple/10 border border-ai-purple/20 text-xs font-bold text-ai-purple uppercase tracking-wider mb-4 animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5" />
            Comparison Matrix
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Traditional Portals vs. <span className="gradient-text">Jansunwai AI</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            See how smart automation eliminates the friction, delays, and lack of transparency of manual governance.
          </p>
        </motion.div>

        {/* Comparison Grid */}
        <div className="space-y-6">
          {comparisons.map((item, i) => (
            <motion.div
              key={item.feature}
              className="bg-card/45 border border-border/40 hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl hover:bg-card/60 group grid grid-cols-1 md:grid-cols-12 gap-5 items-center"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {/* Subtle hover glow at the left edge */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-linear-to-b from-primary to-ai-purple opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Feature Title */}
              <div className="md:col-span-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  Feature 0{i + 1}
                </span>
                <h4 className="font-extrabold text-base md:text-lg text-foreground/90 tracking-tight">{item.feature}</h4>
              </div>

              {/* Traditional (Negative) */}
              <div className="md:col-span-4 bg-red-500/5 border border-red-500/10 hover:border-red-500/20 rounded-xl p-4.5 flex items-start gap-3 h-full transition-colors shadow-[0_4px_20px_rgba(239,68,68,0.01)]">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-red-400 block mb-1 uppercase tracking-wider">Traditional System</span>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    {item.traditional}
                  </p>
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="hidden md:col-span-1 md:flex justify-center">
                <div className="w-8 h-8 rounded-full bg-border/20 border border-border/10 flex items-center justify-center text-muted-foreground/30 group-hover:text-primary/70 group-hover:border-primary/20 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Jansunwai AI (Positive) */}
              <div className="md:col-span-4 bg-emerald-500/5 border border-emerald-500/15 hover:border-emerald-500/35 hover:shadow-[0_0_15px_rgba(16,185,129,0.03)] rounded-xl p-4.5 flex items-start gap-3 h-full transition-all shadow-[0_4px_20px_rgba(16,185,129,0.01)]">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-emerald-400 block mb-1 uppercase tracking-wider">Jansunwai AI</span>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    {item.ai}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
