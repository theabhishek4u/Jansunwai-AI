"use client";

import { motion } from "framer-motion";
import {
  Mic,
  Brain,
  Building2,
  FileSearch,
  Send,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: Mic,
    step: "01",
    title: "Citizen Submits",
    titleHi: "Citizen Submits",
    description: "Citizens report issues instantly via text, voice notes, or photos. GPS auto-detects the precise incident location.",
    color: "#3B82F6",
    example: '"Gomti Nagar main crossing ke pass drinking water pipeline leak ho gayi hai, subah se paani beh raha hai."',
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Analyzes",
    titleHi: "AI Analyzes",
    description: "The NLP engine instantly translates, classifies the issue, detects severity, and generates a structured summary.",
    color: "#7C3AED",
    example: "Category: Urban Water Supply → Priority: CRITICAL → Urgency: Immediate",
  },
  {
    icon: Building2,
    step: "03",
    title: "Smart Routing",
    titleHi: "Smart Routing",
    description: "The AI autonomously determines jurisdiction and assigns the task directly to the correct local nodal officer.",
    color: "#F59E0B",
    example: "Assigned: Lucknow Jal Nigam → Officer: Er. Alok Srivastava",
  },
  {
    icon: FileSearch,
    step: "04",
    title: "Officer Reviews",
    titleHi: "Officer Reviews",
    description: "The officer views a translated, prioritized AI summary on their dashboard alongside predictive action plans.",
    color: "#06B6D4",
    example: "AI Suggestion: Dispatch emergency pipeline repair crew to Gomti Nagar Main Crossing.",
  },
  {
    icon: Send,
    step: "05",
    title: "Citizen Notified",
    titleHi: "Citizen Notified",
    description: "The citizen receives real-time SMS and WhatsApp updates detailing exactly who is handling their grievance.",
    color: "#10B981",
    example: "SMS: \"Your complaint (JS-948) has been routed to Lucknow Jal Nigam for urgent resolution.\"",
  },
  {
    icon: CheckCircle2,
    step: "06",
    title: "Auto Follow-Up",
    titleHi: "Auto Follow-Up",
    description: "If the issue breaches its SLA deadline, the AI agent autonomously escalates it to higher departmental authorities.",
    color: "#EF4444",
    example: "Day 3: SLA Reminder Sent → Day 7: Escalated to Chief Engineer",
  },
];

export function DemoWorkflow() {
  return (
    <section className="py-24 bg-muted/30" id="demo">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gov-blue/8 border border-gov-blue/15 text-xs font-semibold text-gov-blue uppercase tracking-wider mb-4">
            Live Demo Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            See How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From voice input to automated resolution — in under 5 seconds.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-linear-to-b from-gov-blue via-ai-purple to-trust-green" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                className="relative flex gap-4 sm:gap-6"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Step circle */}
                <div className="relative z-10 shrink-0">
                  <div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}25, ${step.color}10)`,
                      border: `2px solid ${step.color}35`,
                    }}
                  >
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: step.color }} />
                  </div>
                </div>

                {/* Content */}
                <div className="glass-card rounded-xl p-4 sm:p-5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-md"
                      style={{
                        background: `${step.color}15`,
                        color: step.color,
                      }}
                    >
                      STEP {step.step}
                    </span>
                    <h3 className="font-semibold text-base">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs font-mono text-foreground/70 border border-border/50">
                    {step.example}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
