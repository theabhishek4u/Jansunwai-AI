"use client";

import { motion } from "framer-motion";
import { Lock, Cloud, CalendarDays, ShieldCheck } from "lucide-react";

export function SecurityBadges() {
  const badges = [
    {
      icon: Lock,
      title: "AES-256 Encrypted",
      desc: "All citizen files, GPS markers, and speech transcribings are encrypted at rest and in transit.",
      color: "#3B82F6",
    },
    {
      icon: Cloud,
      title: "NIC Cloud Ready",
      desc: "Configured for government hosting architectures in line with National Informatics Centre standards.",
      color: "#10B981",
    },
    {
      icon: CalendarDays,
      title: "SLA Compliant",
      desc: "Automated routing triggers aligning with municipal citizen service charter timelines.",
      color: "#F59E0B",
    },
    {
      icon: ShieldCheck,
      title: "DPDP Protected",
      desc: "Compliant with personal data safety and privacy rules outlined in the Indian DPDP Act.",
      color: "#EC4899",
    },
  ];

  return (
    <section className="py-12 border-t border-b border-border/30 bg-muted/10 relative overflow-hidden" id="compliance">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((b, i) => (
            <motion.div
              key={b.title}
              className="flex flex-col items-center text-center p-4 hover:bg-card/30 rounded-2xl transition-colors group cursor-default"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform"
                style={{
                  background: `${b.color}10`,
                  border: `1px solid ${b.color}25`,
                }}
              >
                <b.icon className="w-5 h-5" style={{ color: b.color }} />
              </div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-foreground mb-1">
                {b.title}
              </h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px]">
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
