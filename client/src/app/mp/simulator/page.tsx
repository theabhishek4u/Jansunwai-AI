'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, ArrowRight, Loader2, Users,
  IndianRupee, Clock, Heart, GraduationCap,
  TrendingUp, Zap
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <FlaskConical className="w-8 h-8 text-amber-400 animate-pulse" />
      </div>
    );
  }

  const metrics = [
    { key: 'populationImpacted', label: 'Population Impacted', icon: <Users className="w-4 h-4" />, format: (v: number | string) => typeof v === 'number' ? v.toLocaleString() : v },
    { key: 'estimatedCostCrore', label: 'Estimated Cost', icon: <IndianRupee className="w-4 h-4" />, format: (v: number | string) => `₹${v} Cr` },
    { key: 'supporters', label: 'Citizen Supporters', icon: <Users className="w-4 h-4" />, format: (v: number | string) => typeof v === 'number' ? v.toLocaleString() : v },
    { key: 'completionTimeline', label: 'Completion Timeline', icon: <Clock className="w-4 h-4" />, format: (v: number | string) => String(v) },
    { key: 'healthcareImprovement', label: 'Healthcare Impact', icon: <Heart className="w-4 h-4" />, format: (v: number | string) => String(v) },
    { key: 'educationImpact', label: 'Education Impact', icon: <GraduationCap className="w-4 h-4" />, format: (v: number | string) => String(v) },
    { key: 'economicBenefit', label: 'Economic Benefit', icon: <TrendingUp className="w-4 h-4" />, format: (v: number | string) => String(v) },
    { key: 'longTermScore', label: 'Long-term Impact Score', icon: <Zap className="w-4 h-4" />, format: (v: number | string) => `${typeof v === 'number' ? Math.round(v) : v}/100` },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FlaskConical className="w-6 h-6 text-amber-400" />
          <span>Development Simulator</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Compare two projects side-by-side with AI-powered impact analysis</p>
      </div>

      {/* Project Selection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
          <div className="flex-1">
            <label className="text-xs text-slate-400 font-semibold mb-2 block">Scenario A</label>
            <select
              value={projectA}
              onChange={e => setProjectA(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-cyan-500/20 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              <option value="">Select Project A</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.village})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold">VS</span>
            </div>
          </div>

          <div className="flex-1">
            <label className="text-xs text-slate-400 font-semibold mb-2 block">Scenario B</label>
            <select
              value={projectB}
              onChange={e => setProjectB(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-fuchsia-500/20 text-xs text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
            >
              <option value="">Select Project B</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.village})</option>
              ))}
            </select>
          </div>

          <button
            onClick={simulate}
            disabled={loading || !projectA || !projectB}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            <span>{loading ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key="sim-result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Scenario Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Scenario A Header */}
              <div className="bg-[#111827] rounded-2xl p-5 border border-cyan-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-cyan-400">A</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${result.scenarioA.urgency === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'}`}>
                    {result.scenarioA.urgency.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{result.scenarioA.title}</h3>
                <p className="text-[10px] text-slate-500">{result.scenarioA.category} • {result.scenarioA.village}</p>
              </div>

              {/* Scenario B Header */}
              <div className="bg-[#111827] rounded-2xl p-5 border border-fuchsia-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-fuchsia-400">B</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${result.scenarioB.urgency === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'}`}>
                    {result.scenarioB.urgency.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{result.scenarioB.title}</h3>
                <p className="text-[10px] text-slate-500">{result.scenarioB.category} • {result.scenarioB.village}</p>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div className="bg-[#111827] rounded-2xl border border-slate-800/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800/50">
                <h2 className="text-sm font-bold text-white">Impact Comparison</h2>
              </div>
              <div className="divide-y divide-slate-800/30">
                {metrics.map((metric) => {
                  const valA = result.scenarioA[metric.key as keyof Scenario];
                  const valB = result.scenarioB[metric.key as keyof Scenario];
                  const numA = typeof valA === 'number' ? valA : 0;
                  const numB = typeof valB === 'number' ? valB : 0;
                  const total = numA + numB || 1;

                  return (
                    <div key={metric.key} className="px-6 py-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-slate-500">{metric.icon}</span>
                        <span className="text-xs font-semibold text-slate-300">{metric.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-bold text-cyan-400 mb-1">{metric.format(valA)}</p>
                          {typeof valA === 'number' && typeof valB === 'number' && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(numA / total) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="h-1.5 bg-cyan-500 rounded-full"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-fuchsia-400 mb-1">{metric.format(valB)}</p>
                          {typeof valA === 'number' && typeof valB === 'number' && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(numB / total) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="h-1.5 bg-fuchsia-500 rounded-full"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verdict */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10"
            >
              <div className="flex items-center space-x-2 mb-2">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-300">AI Recommendation</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {Math.round(result.scenarioA.longTermScore) > Math.round(result.scenarioB.longTermScore)
                  ? `Based on long-term impact analysis, "${result.scenarioA.title}" scores higher (${Math.round(result.scenarioA.longTermScore)}/100 vs ${Math.round(result.scenarioB.longTermScore)}/100). It impacts ${result.scenarioA.populationImpacted.toLocaleString()} citizens and has ${result.scenarioA.supporters.toLocaleString()} supporters. Consider prioritizing this project for maximum constituency development ROI.`
                  : `Based on long-term impact analysis, "${result.scenarioB.title}" scores higher (${Math.round(result.scenarioB.longTermScore)}/100 vs ${Math.round(result.scenarioA.longTermScore)}/100). It impacts ${result.scenarioB.populationImpacted.toLocaleString()} citizens and has ${result.scenarioB.supporters.toLocaleString()} supporters. Consider prioritizing this project for maximum constituency development ROI.`
                }
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
