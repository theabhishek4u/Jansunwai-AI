'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, IndianRupee, Sparkles, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Allocation {
  category: string;
  allocatedLakhs: number;
  allocatedCrore: string;
  totalNeededLakhs: number;
  projectCount: number;
  topProject: string;
  justification: string;
}

interface BudgetResult {
  inputBudgetCrore: number;
  inputBudgetLakhs: number;
  allocations: Allocation[];
  summary: string;
}

const COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#6366f1', '#ec4899', '#14b8a6', '#eab308', '#64748b', '#f97316', '#a855f7'];

export default function BudgetPlannerPage() {
  const [budgetInput, setBudgetInput] = useState('5');
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [sliderOverrides, setSliderOverrides] = useState<Record<string, number>>({});

  const planBudget = async () => {
    const val = parseFloat(budgetInput);
    if (!val || val <= 0) return;
    setLoading(true);
    setSliderOverrides({});
    try {
      const res = await fetch(`${API}/api/mp/budget-planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetCrore: val })
      });
      setResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayAllocations = () => {
    if (!result) return [];
    return result.allocations.map(a => ({
      ...a,
      displayLakhs: sliderOverrides[a.category] !== undefined ? sliderOverrides[a.category] : a.allocatedLakhs,
      displayCrore: ((sliderOverrides[a.category] !== undefined ? sliderOverrides[a.category] : a.allocatedLakhs) / 100).toFixed(2)
    }));
  };

  const pieData = getDisplayAllocations().map(a => ({
    name: a.category,
    value: a.displayLakhs
  }));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Wallet className="w-6 h-6 text-amber-400" />
          <span>AI Budget Planner</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Enter your available budget and let AI distribute it optimally across development categories</p>
      </div>

      {/* Budget Input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1">
            <label className="text-xs text-slate-400 font-semibold mb-2 block">Available Budget</label>
            <div className="flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-amber-400" />
              <input
                type="number"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                min={0.1}
                step={0.5}
                className="w-32 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xl font-bold text-white text-center focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <span className="text-sm text-slate-400 font-semibold">Crore</span>
            </div>
          </div>
          <button
            onClick={planBudget}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Planning...' : 'Generate AI Plan'}</span>
          </button>
        </div>

        {/* Quick presets */}
        <div className="flex items-center space-x-2 mt-4">
          <span className="text-[10px] text-slate-500">Quick:</span>
          {[1, 2, 5, 10, 25, 50].map(v => (
            <button
              key={v}
              onClick={() => setBudgetInput(String(v))}
              className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${budgetInput === String(v) ? 'bg-amber-500/10 text-amber-400' : 'text-slate-500 hover:text-slate-300 bg-slate-800/30'}`}
            >
              ₹{v} Cr
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="bg-violet-500/5 rounded-2xl p-5 border border-violet-500/10">
              <p className="text-xs text-violet-300 leading-relaxed flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <span>{result.summary}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie Chart */}
              <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
                <h2 className="text-sm font-bold text-white mb-4">Allocation Breakdown</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" stroke="none" paddingAngle={2}>
                      {pieData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' }} formatter={(value: number) => [`₹${(value / 100).toFixed(2)} Cr`, 'Allocated']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] text-slate-400 truncate flex-1">{d.name}</span>
                      <span className="text-[10px] font-bold text-slate-300">₹{(d.value / 100).toFixed(2)}Cr</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allocation Sliders */}
              <div className="lg:col-span-2 bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
                <h2 className="text-sm font-bold text-white mb-4">Category Allocations (Adjust AI recommendations)</h2>
                <div className="space-y-4">
                  {getDisplayAllocations().map((a, i) => (
                    <div key={a.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs font-semibold text-slate-200">{a.category}</span>
                          <span className="text-[9px] text-slate-500">({a.projectCount} projects)</span>
                        </div>
                        <span className="text-xs font-bold text-amber-400">₹{a.displayCrore} Cr</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={a.totalNeededLakhs > 0 ? a.totalNeededLakhs : 500}
                        value={a.displayLakhs}
                        onChange={e => setSliderOverrides(prev => ({ ...prev, [a.category]: parseInt(e.target.value) }))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, ${COLORS[i % COLORS.length]} ${(a.displayLakhs / (a.totalNeededLakhs || 500)) * 100}%, #1e293b ${(a.displayLakhs / (a.totalNeededLakhs || 500)) * 100}%)` }}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-slate-500 truncate max-w-[60%]">{a.topProject}</span>
                        <span className="text-[9px] text-slate-500">Need: ₹{(a.totalNeededLakhs / 100).toFixed(1)} Cr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cost-Benefit Table */}
            <div className="bg-[#111827] rounded-2xl border border-slate-800/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800/50">
                <h2 className="text-sm font-bold text-white">AI Justification per Category</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase">Allocated</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase">Total Need</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase">Coverage</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Justification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.allocations.map(a => (
                      <tr key={a.category} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                        <td className="px-4 py-3 font-semibold text-slate-200">{a.category}</td>
                        <td className="px-4 py-3 text-right text-amber-400 font-bold">₹{a.allocatedCrore} Cr</td>
                        <td className="px-4 py-3 text-right text-slate-400">₹{(a.totalNeededLakhs / 100).toFixed(1)} Cr</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold ${(a.allocatedLakhs / a.totalNeededLakhs * 100) >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {Math.min(100, Math.round((a.allocatedLakhs / a.totalNeededLakhs) * 100))}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 max-w-xs">{a.justification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
