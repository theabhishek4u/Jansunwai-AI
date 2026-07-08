'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Loader2, Users, IndianRupee, Clock, 
  Heart, GraduationCap, TrendingUp, Zap, CheckCircle2, 
  AlertTriangle, ArrowRight, ShieldCheck, Target, Sparkles
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SuggestionOption {
  id: string;
  title: string;
  category: string;
  village: string;
  urgency: string;
  populationAffected: number;
  estimatedCostLakhs: number;
}

interface Scenario {
  id: string;
  title: string;
  category: string;
  village: string;
  populationImpacted: number;
  estimatedCostCrore: string;
  supporters: number;
  urgency: string;
  travelTimeReduction: string;
  healthcareImprovement: string;
  educationImpact: string;
  economicBenefit: string;
  longTermScore: number;
  completionTimeline: string;
}

interface SimResult {
  scenarioA: Scenario;
  scenarioB: Scenario;
}

export default function SimulatorPage() {
  const [projects, setProjects] = useState<SuggestionOption[]>([]);
  const [projectA, setProjectA] = useState('');
  const [projectB, setProjectB] = useState('');
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/mp/priority-engine`)
      .then(r => r.json())
      .then(data => {
        setProjects(data);
        if (data.length >= 2) {
          setProjectA(data[0].id);
          setProjectB(data[1].id);
        }
      })
      .catch(console.error)
      .finally(() => setPageLoading(false));
  }, []);

  const simulate = async () => {
    if (!projectA || !projectB) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/mp/development-simulator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIdA: projectA, projectIdB: projectB })
      });
      setResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <FlaskConical className="w-10 h-10 text-cyan-500 animate-pulse" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Initializing AI Simulator...</p>
      </div>
    );
  }

  // --- AI Report Generator Logic ---
  const generateAIReport = (res: SimResult) => {
    const a = res.scenarioA;
    const b = res.scenarioB;
    const aWins = a.longTermScore >= b.longTermScore;
    
    const winner = aWins ? a : b;
    const loser = aWins ? b : a;
    
    const winnerLabel = aWins ? 'Scenario A' : 'Scenario B';
    const winnerColor = aWins ? 'text-cyan-400' : 'text-fuchsia-400';
    
    const advantages: string[] = [];
    const tradeoffs: string[] = [];
    
    // Population
    if (winner.populationImpacted > loser.populationImpacted) {
      advantages.push(`Impacts ${winner.populationImpacted - loser.populationImpacted} more citizens directly.`);
    } else if (winner.populationImpacted < loser.populationImpacted) {
      tradeoffs.push(`Addresses a smaller immediate population footprint (-${loser.populationImpacted - winner.populationImpacted} citizens).`);
    }

    // Cost
    const costWin = parseFloat(winner.estimatedCostCrore);
    const costLose = parseFloat(loser.estimatedCostCrore);
    if (costWin < costLose) {
      advantages.push(`More cost-effective, saving ₹${(costLose - costWin).toFixed(2)} Cr in budget.`);
    } else if (costWin > costLose) {
      tradeoffs.push(`Requires an additional capital allocation of ₹${(costWin - costLose).toFixed(2)} Cr.`);
    }

    // Support
    if (winner.supporters > loser.supporters) {
      advantages.push(`Stronger public backing with ${winner.supporters - loser.supporters} additional verified supporters.`);
    }

    // Score
    advantages.push(`Yields a higher long-term ROI score (${Math.round(winner.longTermScore)}/100 vs ${Math.round(loser.longTermScore)}/100).`);

    return { winner, loser, winnerLabel, winnerColor, advantages, tradeoffs };
  };

  const aiReport = result ? generateAIReport(result) : null;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-10">
      
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-955 via-[#0c1222] to-slate-955 p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400 shrink-0">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                AI Development Simulator
              </h1>
              <p className="text-xs text-slate-450 leading-normal">
                Run predictive modeling to compare resource allocation outcomes and maximize constituency impact.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selectors */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-6 relative z-10">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-cyan-400 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" /> Scenario A
            </label>
            <div className="relative">
              <select
                value={projectA}
                onChange={e => setProjectA(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 shadow-inner shadow-cyan-500/5 transition-all appearance-none"
              >
                <option value="">Select Project A</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.village})</option>
                ))}
              </select>
              <ArrowRight className="w-4 h-4 text-cyan-500/50 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-90 md:rotate-0" />
            </div>
          </div>

          <div className="flex items-center justify-center shrink-0">
            <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-lg relative z-20">
              <span className="text-slate-400 text-[10px] font-black uppercase">VS</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-fuchsia-400 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" /> Scenario B
            </label>
            <div className="relative">
              <select
                value={projectB}
                onChange={e => setProjectB(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-fuchsia-500/30 text-xs font-semibold text-white focus:outline-none focus:border-fuchsia-400 shadow-inner shadow-fuchsia-500/5 transition-all appearance-none"
              >
                <option value="">Select Project B</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.village})</option>
                ))}
              </select>
              <ArrowRight className="w-4 h-4 text-fuchsia-500/50 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-90 md:rotate-0" />
            </div>
          </div>

          <button
            onClick={simulate}
            disabled={loading || !projectA || !projectB}
            className="flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-black hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 shrink-0 border border-amber-500/50"
          >
            {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Zap className="w-4.5 h-4.5" />}
            <span>{loading ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>
      </motion.div>

      {/* Results Arena */}
      <AnimatePresence mode="wait">
        {result && aiReport && (
          <motion.div key="sim-result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* The Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 rounded-3xl p-6 border-2 border-cyan-500/20 shadow-lg shadow-cyan-500/5 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none" />
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <span className="text-xs font-black text-cyan-400">A</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${result.scenarioA.urgency === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    {result.scenarioA.urgency}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-relaxed">{result.scenarioA.title}</h3>
                <p className="text-[11px] text-slate-400 font-semibold">{result.scenarioA.category} • {result.scenarioA.village}</p>
              </div>

              <div className="bg-slate-900/60 rounded-3xl p-6 border-2 border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/5 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-[40px] pointer-events-none" />
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500/30">
                    <span className="text-xs font-black text-fuchsia-400">B</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${result.scenarioB.urgency === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    {result.scenarioB.urgency}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-relaxed">{result.scenarioB.title}</h3>
                <p className="text-[11px] text-slate-400 font-semibold">{result.scenarioB.category} • {result.scenarioB.village}</p>
              </div>
            </div>

            {/* Quantitative Comparison Matrix */}
            <div className="bg-slate-900/60 rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-slate-800/60 bg-slate-950/50">
                <h2 className="text-sm font-black text-slate-200 flex items-center gap-2">
                  <Target className="w-4.5 h-4.5 text-amber-500" />
                  <span>Quantitative Impact Analysis</span>
                </h2>
              </div>
              <div className="divide-y divide-slate-800/40 p-2">
                {[
                  { key: 'populationImpacted', label: 'Population Impacted', icon: <Users className="w-4 h-4 text-slate-400" />, format: (v: any) => v.toLocaleString() },
                  { key: 'estimatedCostCrore', label: 'Estimated Cost', icon: <IndianRupee className="w-4 h-4 text-slate-400" />, format: (v: any) => `₹${v} Cr` },
                  { key: 'supporters', label: 'Citizen Supporters', icon: <Heart className="w-4 h-4 text-slate-400" />, format: (v: any) => v.toLocaleString() },
                  { key: 'longTermScore', label: 'AI Priority Score', icon: <Zap className="w-4 h-4 text-slate-400" />, format: (v: any) => `${Math.round(v)}/100` },
                ].map((metric) => {
                  const valA = result.scenarioA[metric.key as keyof Scenario];
                  const valB = result.scenarioB[metric.key as keyof Scenario];
                  const numA = typeof valA === 'number' ? valA : parseFloat(valA as string);
                  const numB = typeof valB === 'number' ? valB : parseFloat(valB as string);
                  const total = numA + numB || 1;

                  return (
                    <div key={metric.key} className="px-6 py-5">
                      <div className="flex items-center space-x-2 mb-4">
                        {metric.icon}
                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">{metric.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-8 relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/50 -translate-x-1/2" />
                        <div>
                          <p className="text-lg font-black text-cyan-400 mb-2">{metric.format(valA)}</p>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 flex justify-end">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(numA / total) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.1, type: 'spring' }}
                              className="h-full bg-gradient-to-l from-cyan-400 to-cyan-600 rounded-full"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-black text-fuchsia-400 mb-2">{metric.format(valB)}</p>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(numB / total) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.1, type: 'spring' }}
                              className="h-full bg-gradient-to-r from-fuchsia-400 to-fuchsia-600 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Qualitative Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { title: 'Timeline & Speed', valA: result.scenarioA.completionTimeline, valB: result.scenarioB.completionTimeline, icon: <Clock className="w-4 h-4 text-amber-500" /> },
                { title: 'Economic Benefit', valA: result.scenarioA.economicBenefit, valB: result.scenarioB.economicBenefit, icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
                { title: 'Social Impact', valA: result.scenarioA.healthcareImprovement || result.scenarioA.educationImpact, valB: result.scenarioB.healthcareImprovement || result.scenarioB.educationImpact, icon: <ShieldCheck className="w-4 h-4 text-blue-500" /> }
              ].map((q, idx) => (
                <div key={idx} className="bg-slate-900/60 rounded-3xl p-5 border border-slate-800/80 shadow-lg">
                  <div className="flex items-center space-x-2 mb-4 border-b border-slate-800/60 pb-3">
                    {q.icon}
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">{q.title}</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-1 block">Scenario A</span>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">{q.valA}</p>
                    </div>
                    <div className="w-full h-px bg-slate-800/50" />
                    <div>
                      <span className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest mb-1 block">Scenario B</span>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">{q.valB}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* The Verdict (Advanced AI Report) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 relative overflow-hidden bg-gradient-to-br from-slate-900 to-[#0c1222] border border-amber-500/20 rounded-3xl p-1 shadow-2xl shadow-amber-500/5"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="bg-slate-950/80 backdrop-blur-xl rounded-[22px] p-8 border border-slate-800/50">
                <div className="flex items-center space-x-3 mb-6 border-b border-slate-800/80 pb-4">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">AI Executive Report</h2>
                    <p className="text-[10px] text-slate-450 uppercase tracking-widest font-bold">Comprehensive Strategic Assessment</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Verdict Headline */}
                  <div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">The Verdict</h3>
                    <p className="text-sm md:text-base text-slate-200 font-semibold leading-relaxed">
                      Based on multi-dimensional predictive modeling, Gemini AI recommends prioritizing <strong className={`${aiReport.winnerColor} font-black bg-slate-900 px-2 py-0.5 rounded-md`}>{aiReport.winnerLabel}: {aiReport.winner.title}</strong> over the alternative proposal.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Advantages */}
                    <div>
                      <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Key Advantages
                      </h3>
                      <ul className="space-y-2.5">
                        {aiReport.advantages.map((adv, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-350 font-medium leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tradeoffs */}
                    {aiReport.tradeoffs.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" /> Strategic Trade-offs
                        </h3>
                        <ul className="space-y-2.5">
                          {aiReport.tradeoffs.map((td, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-350 font-medium leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                              {td}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-3">
                    <Target className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Final Recommendation</h4>
                      <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                        Executing this project aligns best with overall constituency development goals, maximizing public satisfaction and infrastructure ROI. Proceed with budget allocation planning for <strong>{aiReport.winnerLabel}</strong>.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
