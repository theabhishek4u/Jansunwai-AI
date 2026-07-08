'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, IndianRupee, Sparkles, Loader2,
  Check, CheckSquare, Square, Users, Trophy,
  FileText, ArrowRight, Printer, AlertTriangle, X,
  HeartPulse, Shield, Layers, TrendingDown, Droplets,
  GraduationCap, Flame, Lightbulb, Coins, Award, Plus, Minus,
  ShieldAlert, RefreshCw, BarChart2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

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

interface SuggestionItem {
  id: string;
  title: string;
  category: string;
  village: string;
  urgency: string;
  supporters: number;
  estimatedCostLakhs: number;
  priorityScore: number;
  populationAffected: number;
}

const COLORS = [
  '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', 
  '#6366f1', '#ec4899', '#14b8a6', '#eab308', '#64748b'
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Road': return <Layers className="w-4 h-4 text-sky-400" />;
    case 'Drainage': return <TrendingDown className="w-4 h-4 text-indigo-400" />;
    case 'School': return <GraduationCap className="w-4 h-4 text-emerald-400" />;
    case 'PHC':
    case 'Hospital': return <HeartPulse className="w-4 h-4 text-rose-400" />;
    case 'Water Supply': return <Droplets className="w-4 h-4 text-blue-400" />;
    case 'Street Lights': return <Lightbulb className="w-4 h-4 text-amber-400" />;
    case 'Electricity': return <Flame className="w-4 h-4 text-amber-500" />;
    case "Women's Safety": return <Shield className="w-4 h-4 text-fuchsia-400" />;
    default: return <FileText className="w-4 h-4 text-slate-400" />;
  }
};

export default function BudgetPlannerPage() {
  const [budgetInput, setBudgetInput] = useState('5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BudgetResult | null>(null);
  
  // Category weights (multipliers for priority scoring)
  const [weights, setWeights] = useState<Record<string, number>>({
    'Road': 1.0,
    'PHC': 1.0,
    'School': 1.0,
    'Hospital': 1.0,
    'Water Supply': 1.0,
    'Street Lights': 1.0,
    'Drainage': 1.0,
    "Women's Safety": 1.2,
    'Agriculture': 1.0,
    'Electricity': 1.0,
    'Bridge': 1.0,
    'Park': 1.0,
    'Internet': 1.0,
    'Waste Management': 1.0,
    'Skill Center': 1.0,
    'Environment': 1.0
  });

  // Lucknow suggestions from priority engine
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  // Set of approved project IDs
  const [approvedProjectIds, setApprovedProjectIds] = useState<Set<string>>(new Set());
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('');
  const [showSanctionModal, setShowSanctionModal] = useState(false);

  useEffect(() => {
    // Fetch suggestions from priority engine on mount
    fetch(`${API}/api/mp/priority-engine`)
      .then(r => r.json())
      .then(data => {
        setSuggestions(data);
        if (data.length > 0) {
          // Find unique categories
          const uniqueCats = Array.from(new Set(data.map((s: SuggestionItem) => s.category))) as string[];
          setSelectedCategoryTab(uniqueCats[0] || '');
        }
      })
      .catch(console.error);
  }, []);

  const planBudget = async () => {
    const val = parseFloat(budgetInput);
    if (!val || val <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/mp/budget-planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetCrore: val })
      });
      const data = await res.json();
      setResult(data);

      // Auto sanction based on AI recommendations (proportional allocation)
      const allocatedBudgetLakhs = val * 100;
      let remainingLakhs = allocatedBudgetLakhs;
      const approvedIds = new Set<string>();

      // Sort suggestions by priorityScore descending
      const sortedSugg = [...suggestions].sort((a, b) => b.priorityScore - a.priorityScore);
      for (const sugg of sortedSugg) {
        if (sugg.estimatedCostLakhs <= remainingLakhs) {
          approvedIds.add(sugg.id);
          remainingLakhs -= sugg.estimatedCostLakhs;
        }
      }
      setApprovedProjectIds(approvedIds);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectToggle = (id: string) => {
    const nextApproved = new Set(approvedProjectIds);
    if (nextApproved.has(id)) {
      nextApproved.delete(id);
    } else {
      nextApproved.add(id);
    }
    setApprovedProjectIds(nextApproved);
  };

  const adjustBudget = (amount: number) => {
    const nextVal = Math.max(1, parseFloat(budgetInput || '0') + amount);
    setBudgetInput(String(nextVal));
  };

  const handleAIAutoSanction = () => {
    const totalBudgetLakhs = parseFloat(budgetInput) * 100;
    let remaining = totalBudgetLakhs;
    const nextApproved = new Set<string>();
    
    // Sort suggestions by priorityScore with weights multiplier
    const sorted = [...suggestions].sort((a, b) => {
      const weightA = weights[a.category] || 1.0;
      const weightB = weights[b.category] || 1.0;
      return (b.priorityScore * weightB) - (a.priorityScore * weightA);
    });

    for (const sugg of sorted) {
      if (sugg.estimatedCostLakhs <= remaining) {
        nextApproved.add(sugg.id);
        remaining -= sugg.estimatedCostLakhs;
      }
    }
    setApprovedProjectIds(nextApproved);
  };

  // Reactive real-time allocation updates when weights or capital input changes!
  useEffect(() => {
    if (suggestions.length > 0) {
      handleAIAutoSanction();
    }
  }, [weights, budgetInput, suggestions]);

  // Compute live impact statistics
  const approvedSuggestions = suggestions.filter(s => approvedProjectIds.has(s.id));
  const totalCostLakhsApproved = approvedSuggestions.reduce((sum, s) => sum + s.estimatedCostLakhs, 0);
  const totalCostCroreApproved = totalCostLakhsApproved / 100;
  const totalBudgetLakhs = parseFloat(budgetInput) * 100;
  const remainingBudgetLakhs = totalBudgetLakhs - totalCostLakhsApproved;
  const remainingBudgetCrore = remainingBudgetLakhs / 100;
  
  const livesImpacted = approvedSuggestions.reduce((sum, s) => sum + s.populationAffected, 0);
  const avgPriorityScore = approvedSuggestions.length > 0
    ? Math.round(approvedSuggestions.reduce((sum, s) => sum + s.priorityScore, 0) / approvedSuggestions.length)
    : 0;

  // Categories in current database suggestions
  const categoriesList = Array.from(new Set(suggestions.map(s => s.category)));

  // Pie chart data based on active sanctions
  const approvedByCategory = categoriesList.map(cat => {
    const catSugg = suggestions.filter(s => s.category === cat && approvedProjectIds.has(s.id));
    const cost = catSugg.reduce((sum, s) => sum + s.estimatedCostLakhs, 0);
    return { name: cat, value: cost };
  }).filter(c => c.value > 0);

  // Dynamic Efficiency rating
  const efficiencyIndex = approvedSuggestions.length > 0
    ? Math.min(100, Math.round((livesImpacted / (totalCostCroreApproved || 1)) / 1000))
    : 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans relative pb-10">
      {/* Top Header Card */}
      <div className="relative overflow-hidden bg-linear-to-r from-slate-950 via-[#0d1324] to-slate-950 p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                AI Budget Planning Chamber
              </h1>
              <p className="text-xs text-slate-400 leading-normal">
                Optimize and release MPLAD (Member of Parliament Local Area Development) capital with intelligent priority models.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-sm shadow-emerald-500/5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>AI Simulation Engaged</span>
          </div>
        </div>
      </div>

      {/* Top Key Statistics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Capital', value: `₹${parseFloat(budgetInput || '0').toFixed(2)} Cr`, desc: 'Max Sanction Limit', icon: <Coins className="w-5 h-5 text-amber-400" /> },
          { label: 'Sanction Committed', value: `₹${totalCostCroreApproved.toFixed(2)} Cr`, desc: `${approvedProjectIds.size} Projects Approved`, icon: <CheckSquare className="w-5 h-5 text-emerald-400" /> },
          { label: 'Remaining Balance', value: `₹${remainingBudgetCrore.toFixed(2)} Cr`, desc: remainingBudgetLakhs < 0 ? 'Overcommitted' : 'Capital Reserves', icon: <Wallet className="w-5 h-5 text-sky-400" />, highlight: remainingBudgetLakhs < 0 },
          { label: 'Efficiency Index', value: `${efficiencyIndex}/100`, desc: 'Avg Beneficiaries / Cr', icon: <Award className="w-5 h-5 text-violet-400" /> }
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{stat.label}</span>
              <p className={`text-xl font-black ${stat.highlight ? 'text-rose-500' : 'text-white'}`}>{stat.value}</p>
              <p className="text-[9px] text-slate-400">{stat.desc}</p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Budget Input, Weights & Live Impact */}
        <div className="space-y-6 lg:col-span-1">
          {/* Budget Input Card */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">Sanction Capital</h2>
              <span className="text-[9px] bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-bold border border-slate-800">LUCKNOW</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                onClick={() => adjustBudget(-1)} 
                className="w-10 h-10 rounded-lg bg-slate-850 border border-slate-750 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-all shrink-0 font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="flex-1 relative flex items-center justify-center">
                <IndianRupee className="absolute left-4 w-4 h-4 text-amber-500 font-bold" />
                <input
                  type="number"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  min={1}
                  step={0.5}
                  className="w-full px-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-lg font-black text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-500/40 shadow-inner"
                />
              </div>

              <button 
                type="button"
                onClick={() => adjustBudget(1)} 
                className="w-10 h-10 rounded-lg bg-slate-850 border border-slate-750 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-all shrink-0 font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1">
              {[2, 5, 10, 20, 50].map(v => (
                <button
                  key={v}
                  onClick={() => setBudgetInput(String(v))}
                  className={`py-2 rounded-lg text-[9px] font-black uppercase transition-all border ${
                    budgetInput === String(v) 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/5' 
                      : 'text-slate-500 hover:text-slate-350 bg-slate-950/50 border-slate-850'
                  }`}
                >
                  ₹{v} Cr
                </button>
              ))}
            </div>

            <button
              onClick={planBudget}
              disabled={loading || !parseFloat(budgetInput)}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-black shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Simulating Allocations...' : 'Sync AI Allocation'}</span>
            </button>
          </div>

          {/* Live Impact Meter */}
          {approvedProjectIds.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 space-y-4 shadow-xl"
            >
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">Sanction Impact Meter</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-855 text-center">
                  <p className="text-xl font-black text-amber-400">{approvedProjectIds.size}</p>
                  <p className="text-[8px] text-slate-550 uppercase tracking-widest font-black mt-0.5">Approved Projects</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-855 text-center">
                  <p className="text-xl font-black text-white">{livesImpacted.toLocaleString()}</p>
                  <p className="text-[8px] text-slate-555 uppercase tracking-widest font-black mt-0.5">Lives Impacted</p>
                </div>
              </div>

              {/* Progress visual */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Budget Consumed:</span>
                  <span className="text-amber-400 font-extrabold">₹{totalCostCroreApproved.toFixed(2)} Cr / ₹{budgetInput} Cr</span>
                </div>
                
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850 p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      remainingBudgetLakhs < 0 
                        ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
                        : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    }`}
                    style={{ width: `${Math.min(100, (totalCostLakhsApproved / totalBudgetLakhs) * 100)}%` }}
                  />
                </div>
                
                {remainingBudgetLakhs < 0 ? (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center space-x-1 justify-center bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Over budget by ₹{Math.abs(remainingBudgetCrore).toFixed(2)} Cr! Please deselect some tasks.</span>
                  </p>
                ) : (
                  <div className="flex justify-between text-[9px] font-semibold text-slate-400 px-1">
                    <span>Remaining Balance:</span>
                    <span className="text-slate-200">₹{remainingBudgetCrore.toFixed(2)} Cr</span>
                  </div>
                )}
              </div>

              {/* Priority Average */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px]">
                <span className="text-slate-400 font-semibold">Average Priority Score:</span>
                <span className="font-black text-amber-400 text-xs">{avgPriorityScore}/100</span>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  onClick={handleAIAutoSanction}
                  className="grow py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:text-white hover:bg-violet-600 text-[10px] font-black transition-all flex items-center justify-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>AI Auto-Select</span>
                </button>
                <button
                  onClick={() => setShowSanctionModal(true)}
                  disabled={remainingBudgetLakhs < 0 || approvedProjectIds.size === 0}
                  className="grow py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-450 hover:text-slate-950 hover:bg-amber-500 text-[10px] font-black transition-all disabled:opacity-40 flex items-center justify-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Sanction Order</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Allocation Weights */}
          {result && (
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">AI Category Boosts</h2>
                <div className="p-1 bg-slate-800/50 rounded-md text-[8px] text-slate-400 border border-slate-700/30">Multiplier</div>
              </div>
              <div className="space-y-4">
                {['Women\'s Safety', 'Road', 'PHC', 'School', 'Water Supply'].map((sector) => (
                  <div key={sector} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        {getCategoryIcon(sector)}
                        {sector}
                      </span>
                      <span className="text-amber-400 font-extrabold">{(weights[sector] || 1.0).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={weights[sector] || 1.0}
                      onChange={e => setWeights(prev => ({ ...prev, [sector]: parseFloat(e.target.value) }))}
                      className="w-full h-1 bg-slate-955 rounded-full appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Project selector / Category lists with modern split sidebar layout */}
        <div className="lg:col-span-2 space-y-6">
          {suggestions.length > 0 ? (
            <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3.5">
                <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-amber-500" />
                  <span>MPLAD Eligible Proposals</span>
                </h2>
                <span className="text-[10px] font-extrabold bg-slate-950 px-2.5 py-1 rounded-lg text-slate-400 border border-slate-850">{suggestions.length} Found</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px]">
                {/* Category Vertical Sidebar (1/3 width) */}
                <div className="md:col-span-1 space-y-1.5 border-r border-slate-805 pr-4 max-h-[420px] overflow-y-auto scrollbar-none">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3 px-2">Sector Categories</p>
                  {categoriesList.map(cat => {
                    const catCount = suggestions.filter(s => s.category === cat).length;
                    const isSelected = selectedCategoryTab === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryTab(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-left border ${
                          isSelected
                            ? 'bg-linear-to-r from-amber-500/10 to-transparent text-amber-400 border-amber-500/30 font-bold shadow-xs border-l-4 border-l-amber-500'
                            : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-850/40 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <span className={isSelected ? 'text-amber-400 scale-110 transition-transform' : 'text-slate-500'}>
                            {getCategoryIcon(cat)}
                          </span>
                          <span className="text-[11px] uppercase tracking-wider font-extrabold truncate">{cat}</span>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-black ${
                          isSelected ? 'bg-amber-500/25 text-amber-300' : 'bg-slate-950 text-slate-500 border border-slate-850'
                        }`}>
                          {catCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Proposals List (2/3 width) */}
                <div className="md:col-span-2 space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                  <div className="bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-855/60 mb-2 flex items-center justify-between">
                    <p className="text-[10px] text-slate-450 uppercase tracking-widest font-black">
                      Active: <span className="text-amber-400">{selectedCategoryTab}</span>
                    </p>
                    <span className="text-[9px] text-slate-500 font-bold">
                      {suggestions.filter(s => s.category === selectedCategoryTab).length} Proposal(s) Available
                    </span>
                  </div>

                  {suggestions.filter(s => s.category === selectedCategoryTab).map(sugg => {
                    const isApproved = approvedProjectIds.has(sugg.id);
                    return (
                      <div
                        key={sugg.id}
                        onClick={() => handleProjectToggle(sugg.id)}
                        className={`p-4 rounded-2xl border text-left flex items-start space-x-4 cursor-pointer transition-all duration-200 group hover:translate-x-1 ${
                          isApproved
                            ? 'bg-amber-500/5 border-amber-500/40 shadow-md shadow-amber-500/2 border-l-4 border-l-amber-500'
                            : 'bg-slate-950/40 border-slate-900 hover:bg-slate-850/40 hover:border-slate-855 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="mt-0.5 text-amber-500 shrink-0">
                          {isApproved ? (
                            <CheckSquare className="w-4.5 h-4.5 text-amber-400 fill-amber-500/10 group-hover:scale-105 transition-transform" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-slate-600 group-hover:text-slate-400 group-hover:scale-105 transition-transform" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-200 leading-relaxed group-hover:text-white transition-colors">{sugg.title}</p>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-3 text-[9px] font-semibold text-slate-450">
                            <span className="text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">{sugg.village}</span>
                            <span className="flex items-center space-x-1 text-slate-500">
                              <Users className="w-3 h-3" />
                              <span>{sugg.populationAffected.toLocaleString()} affected</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Rating: {sugg.priorityScore}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[8px] border ${
                              sugg.urgency === 'critical' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)] animate-pulse' 
                                : sugg.urgency === 'high'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-slate-800/30 text-slate-450 border-slate-700/30'
                            }`}>
                              {sugg.urgency}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-black text-white">₹{(sugg.estimatedCostLakhs / 100).toFixed(2)} Cr</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{sugg.estimatedCostLakhs} Lakhs</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 text-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing Project Records...</p>
            </div>
          )}

          {/* Allocation graph */}
          {approvedByCategory.length > 0 && (
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/5 rounded-full blur-[60px] pointer-events-none" />
              
              <div>
                <h3 className="text-xs uppercase tracking-wider font-black text-slate-400 mb-4 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-violet-400" />
                  <span>Budget Breakdown by Category</span>
                </h3>
                <div className="relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={approvedByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="#0f172a" strokeWidth={3} paddingAngle={2}>
                        {approvedByCategory.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Tooltip contentStyle={{ background: '#0d1220', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' }} formatter={(value: any) => [`₹${(Number(value || 0) / 100).toFixed(2)} Cr`, 'Allocation']} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute flex flex-col items-center justify-center">
                    <p className="text-[9px] text-slate-550 uppercase font-black tracking-wider">Total Allocated</p>
                    <p className="text-lg font-black text-white">₹{totalCostCroreApproved.toFixed(2)} Cr</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 justify-center flex flex-col">
                {approvedByCategory.map((d, i) => (
                  <div key={d.name} className="flex items-center space-x-2 bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] text-slate-300 truncate grow font-semibold flex items-center gap-1">
                      {getCategoryIcon(d.name)}
                      {d.name}
                    </span>
                    <span className="text-[10px] font-black text-slate-100">₹{(d.value / 100).toFixed(2)} Cr</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sanction Order Report Modal */}
      <AnimatePresence>
        {showSanctionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0f19] border border-slate-805 rounded-3xl w-full max-w-3xl shadow-2xl p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowSanctionModal(false)}
                className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6 pt-4" id="sanction-print-section">
                {/* Official Letterhead */}
                <div className="text-center border-b-2 border-amber-600/40 pb-5 space-y-2">
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">SANSAD NIDHI SANCTION ORDER</h3>
                  <h2 className="text-xl font-black text-white">OFFICE OF MEMBER OF PARLIAMENT, LUCKNOW</h2>
                  <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">STATE OF UTTAR PRADESH • DISTRICT OFFICE LUCKNOW</p>
                </div>

                {/* Metadata */}
                <div className="flex justify-between text-[10px] font-bold text-slate-400 border-b border-slate-855 pb-3">
                  <div>
                    <span>Ref No:</span> <span className="text-white ml-1">MPLAD-LKO/2026/092</span>
                  </div>
                  <div>
                    <span>Constituency:</span> <span className="text-amber-500 ml-1">Lucknow</span>
                  </div>
                  <div>
                    <span>Date:</span> <span className="text-white ml-1">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Body Text */}
                <p className="text-xs text-slate-350 leading-relaxed font-medium">
                  Administrative approval is hereby accorded for the release of funding from the <strong>Member of Parliament Local Area Development Scheme (MPLADS)</strong> for Lucknow constituency for the following development projects. The executing agency is directed to initiate tender procedures immediately.
                </p>

                {/* Table of projects */}
                <div className="border border-slate-855 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-slate-900 border-b border-slate-855">
                      <tr>
                        <th className="px-4 py-2.5 text-slate-500 uppercase font-black">Project Description</th>
                        <th className="px-4 py-2.5 text-slate-500 uppercase font-black">Category</th>
                        <th className="px-4 py-2.5 text-slate-500 uppercase font-black">Village / Ward</th>
                        <th className="px-4 py-2.5 text-right text-slate-500 uppercase font-black">Sanction Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedSuggestions.map(s => (
                        <tr key={s.id} className="border-b border-slate-855 last:border-0 text-slate-355 font-semibold">
                          <td className="px-4 py-2.5">{s.title}</td>
                          <td className="px-4 py-2.5 text-slate-455">{s.category}</td>
                          <td className="px-4 py-2.5 text-slate-455">{s.village}</td>
                          <td className="px-4 py-2.5 text-right text-amber-400 font-black">₹{(s.estimatedCostLakhs / 100).toFixed(2)} Cr</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-900/60 font-bold text-white border-t border-slate-855">
                        <td colSpan={3} className="px-4 py-3 text-right uppercase text-[9px] tracking-wider text-slate-455">Total Sanctioned Amount:</td>
                        <td className="px-4 py-3 text-right text-amber-500 text-xs font-black">₹{totalCostCroreApproved.toFixed(2)} Cr</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Sign-off */}
                <div className="flex justify-between items-end pt-6">
                  <div className="text-[9px] font-semibold text-slate-500 leading-normal">
                    <p>Copy forwarded to:</p>
                    <p>1. District Magistrate, Lucknow (Nodal Officer)</p>
                    <p>2. Chief Development Officer, Lucknow</p>
                    <p>3. Department of Rural Development, Uttar Pradesh</p>
                  </div>
                  <div className="text-center space-y-1 text-slate-300 font-bold text-[10px]">
                    <div className="border border-emerald-500/30 bg-emerald-500/10 rounded px-2.5 py-1 text-[8px] tracking-wider uppercase text-emerald-400 font-black mb-1">
                      VERIFIED BY GEMINI AI
                    </div>
                    <p className="italic">Dr. Vikram Singh</p>
                    <p className="text-[8px] text-slate-500 font-semibold uppercase">MP (Lucknow)</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-end space-x-2 mt-6 border-t border-slate-855 pt-4">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-855 text-[10px] font-bold text-slate-300 hover:text-white transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowSanctionModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-black hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
                >
                  Confirm & Archive Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
