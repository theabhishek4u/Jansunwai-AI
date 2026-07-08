"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Hourglass, Landmark, Zap, Shield } from "lucide-react";

export function ROICalculator() {
  const [complaints, setComplaints] = useState(3000);

  // Math equations for impact metrics
  const hoursSaved = Math.round(complaints * 1.8);
  const moneySaved = Math.round(complaints * 350); // Average of Rs. 350 per manual grievance file processing
  const resolutionSpeedup = 12; // 12x faster routing

  return (
    <section className="py-20 relative overflow-hidden" id="roi-calculator">
      {/* Blurred background orb */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-trust-green/5 blur-[90px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-green/10 border border-trust-green/20 text-xs font-bold text-trust-green uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5" />
            Impact Estimator
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Constituency <span className="gradient-text">ROI Calculator</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Estimate the monthly time and taxpayer money saved when implementing Jansunwai AI in your constituency.
          </p>
        </motion.div>

        {/* Calculator Card */}
        <motion.div
          className="bg-card/40 border border-border/40 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Slider Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <label className="block text-sm font-bold text-foreground/90 mb-2">
                  Monthly Grievance Volume
                </label>
                <div className="text-3xl font-black text-primary font-mono mb-4">
                  {complaints.toLocaleString()}
                  <span className="text-xs text-muted-foreground font-semibold ml-1.5">Grievances/mo</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="500"
                  value={complaints}
                  onChange={(e) => setComplaints(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold mt-1">
                  <span>500</span>
                  <span>7,500</span>
                  <span>15,000</span>
                </div>
              </div>

              <div className="bg-background/80 rounded-xl p-4 border border-border/40 flex items-start gap-3">
                <Shield className="w-5 h-5 text-trust-green shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Based on administrative metrics from standard Indian municipal desks, including manual labor, verification delays, and logistics.
                </p>
              </div>
            </div>

            {/* Results Output Column */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Metric 1 */}
              <div className="bg-background/40 border border-border/40 rounded-2xl p-5 flex flex-col justify-between h-[130px] hover:border-trust-green/30 transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-trust-green/10 flex items-center justify-center text-trust-green mb-3">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground font-mono">
                    ₹{moneySaved.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                    Taxpayer Funds Saved
                  </div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-background/40 border border-border/40 rounded-2xl p-5 flex flex-col justify-between h-[130px] hover:border-gov-blue/30 transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-gov-blue/10 flex items-center justify-center text-gov-blue mb-3">
                  <Hourglass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground font-mono">
                    {hoursSaved.toLocaleString()} hrs
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                    Officer Hours Saved
                  </div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-background/40 border border-border/40 rounded-2xl p-5 flex flex-col justify-between h-[130px] hover:border-ai-purple/30 transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-ai-purple/10 flex items-center justify-center text-ai-purple mb-3">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground font-mono">
                    {resolutionSpeedup}x
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                    Routing Acceleration
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
