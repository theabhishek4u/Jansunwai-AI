"use client";

import { motion } from "framer-motion";
import {
  Mic,
  Brain,
  Building2,
  CheckCircle2,
  Shield,
  Activity,
} from "lucide-react";

const steps = [
  {
    icon: Mic,
    step: "01",
    title: "Citizen Submits",
    titleHi: "Citizen Submits",
    description: "Citizens report issues instantly via text, voice notes, or photos. GPS auto-detects the precise incident location.",
    color: "#3B82F6",
    example: '"Government school ki nayi building ka kaam 6 mahine se ruka hua hai, contractors gaayab hain."',
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Analyzes",
    titleHi: "AI Analyzes",
    description: "The NLP engine instantly translates, classifies the issue, detects severity, and generates a structured summary.",
    color: "#7C3AED",
    example: "Category: Education Infrastructure → Priority: CRITICAL → Urgency: Immediate",
  },
  {
    icon: Shield,
    step: "03",
    title: "MP Priority Review",
    titleHi: "MP Priority Review",
    description: "The AI surfaces critical issues to the local MP. The MP reviews the AI's budget estimation and assigns an operational priority.",
    color: "#F59E0B",
    example: "MP Action: Sanctioned ₹5,00,000 for school building completion. Priority marked as HIGH.",
  },
  {
    icon: Building2,
    step: "04",
    title: "Direct Dept Transfer",
    titleHi: "Direct Dept Transfer",
    description: "The MP approves the budget and directly routes the verified task to the relevant local execution department (e.g., Jal Nigam or PWD).",
    color: "#06B6D4",
    example: "Transferred to: PWD & BSA → Nodal Officer: Er. Alok Srivastava",
  },
  {
    icon: Activity,
    step: "05",
    title: "Department Execution",
    titleHi: "Department Execution",
    description: "Department engineers receive the task on their portal, deploy repair crews, and upload proof-of-work photos.",
    color: "#8B5CF6",
    example: "Status Update: Contractor summoned. Construction resumed at school site.",
  },
  {
    icon: CheckCircle2,
    step: "06",
    title: "Resolution & Notification",
    titleHi: "Resolution & Notification",
    description: "Once marked complete, the citizen receives a real-time WhatsApp/SMS notification with repair photos.",
    color: "#10B981",
    example: "SMS: \"Your complaint (JS-948) has been resolved by PWD. View construction photos: [Link]\"",
  },
];

export function DemoWorkflow() {
  return (
    <section className="py-24 bg-muted/30" id="demo">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From voice input to automated resolution — in under 5 seconds.
          </p>
        </motion.div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              className="bg-card/40 border border-border/40 hover:border-primary/40 hover:bg-card/60 transition-all duration-500 rounded-2xl p-6 shadow-lg hover:shadow-xl relative overflow-hidden group flex flex-col h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Glowing Background on Hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" 
                style={{ background: `radial-gradient(circle at 100% 100%, ${step.color}, transparent 70%)` }}
              />

              {/* Header: Icon + Step + Title */}
              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}25, ${step.color}10)`,
                    border: `1px solid ${step.color}35`,
                  }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 inline-block"
                    style={{
                      background: `${step.color}15`,
                      color: step.color,
                    }}
                  >
                    STEP {step.step}
                  </span>
                  <h3 className="font-semibold text-lg text-foreground/90">{step.title}</h3>
                </div>
              </div>

              {/* Body */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1 relative z-10">
                {step.description}
              </p>

              {/* Terminal Block */}
              <div className="bg-background/80 rounded-lg px-4 py-3 text-[13px] font-mono text-foreground/80 border border-border/40 relative z-10 mt-auto">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors" style={{ backgroundColor: step.color }} />
                {step.example}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
