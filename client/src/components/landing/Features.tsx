"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Route,
  Languages,
  MapPin,
  BellRing,
  BarChart3,
  Sparkles,
  Shield,
  Mic,
  Image as ImageIcon,
  Clock,
  TrendingUp,
  Users,
  Building2,
  Activity,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Citizen Complaint AI (Voice/Text)",
    description: "Citizens can report issues effortlessly using voice notes or text. AI converts unstructured speech into formal complaints instantly.",
    color: "#EC4899",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description: "Submit in Hindi, Hinglish, Urdu, or English. Get updates in your preferred language. Voice input supported.",
    color: "#10B981",
  },
  {
    icon: Brain,
    title: "AI Classification Engine",
    description: "Automatically understands complaints in Hindi, English, or Urdu. Detects category, priority, and urgency in milliseconds.",
    color: "#7C3AED",
  },
  {
    icon: Sparkles,
    title: "AI Semantic Deduplication",
    description: "AI scans historical records to group similar local complaints into unified, high-impact petitions to prevent duplicate workflows.",
    color: "#F43F5E",
  },
  {
    icon: Route,
    title: "Smart Department Routing",
    description: "AI routes complaints to the correct department — Nagar Nigam, Jal Nigam, PWD, or others — with 94% accuracy.",
    color: "#1D4ED8",
  },
  {
    icon: Users,
    title: "MP Dashboard & Priority Review",
    description: "A centralized command center for MPs to view, prioritize, and instantly allocate budgets for verified issues across their constituency.",
    color: "#3B82F6",
  },
  {
    icon: Building2,
    title: "Department Execution Portal",
    description: "Dedicated interfaces for PWD and other departments to receive routed tasks, update statuses, and submit proof of work.",
    color: "#14B8A6",
  },
  {
    icon: MapPin,
    title: "Live Complaint Tracking",
    description: "Amazon/Swiggy-style tracking timeline. Know exactly where your complaint stands — from submission to resolution.",
    color: "#F59E0B",
  },
  {
    icon: BellRing,
    title: "Autonomous Follow-Ups",
    description: "AI agent automatically reminds departments, escalates overdue complaints, and keeps citizens updated.",
    color: "#EF4444",
  },
  {
    icon: Clock,
    title: "SLA-Driven Escalation Engine",
    description: "If a department misses their deadline, the system automatically escalates the issue to higher authorities for immediate intervention.",
    color: "#F97316",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Heatmaps, trend analysis, and predictive governance. Know where problems will arise before they happen.",
    color: "#06B6D4",
  },
  {
    icon: Activity,
    title: "Admin Live Analytics & Monitoring",
    description: "Real-time geographical heatmaps and performance metrics allowing super admins to monitor resolution rates globally.",
    color: "#8B5CF6",
  },
];

export function Features() {
  return (
    <section className="py-24 relative" id="features">
      {/* Decorative blurred dot */}
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] rounded-full bg-gov-blue/5 blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ai-purple/8 border border-ai-purple/15 text-xs font-semibold text-ai-purple uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Citizens
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything You Need for{" "}
            <span className="gradient-text">Smart Governance</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From complaint submission to real-time resolution — every step is automated,
            transparent, and powered by advanced AI.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="bg-card/40 border border-border/40 rounded-2xl p-6 group cursor-default backdrop-blur-md shadow-xl hover:bg-card/60 hover:border-primary/30 transition-colors duration-300 relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ 
                y: -6,
                boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              }}
            >
              {/* Icon container */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4.5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)`,
                  border: `1px solid ${feature.color}25`,
                }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>

              {/* Title & subtitle */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
