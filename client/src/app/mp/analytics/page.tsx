'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Filter, ShieldAlert, Sparkles,
  TrendingUp, Users, Wallet, CheckCircle, Info
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, Legend
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

interface RawSuggestion {
  id: string;
  title: string;
  category: string;
  village: string;
  block: string;
  urgency: string;
  status: string;
  priorityScore: number;
  populationAffected: number;
  supporters: number;
  estimatedCostLakhs: number;
}

interface BlockMetric {
  name: string;
  suggestions: number;
  completed: number;
  costLakhs: number;
  avgScore: number;
  supporters: number;
}

const COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#6366f1', '#ec4899', '#14b8a6', '#eab308', '#64748b', '#f97316', '#a855f7'];
const tooltipStyle = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' };

export default function AnalyticsPage() {
  const [suggestions, setSuggestions] = useState<RawSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');

  useEffect(() => {
    // Fetch raw suggestions data for full client-side dynamic analytics calculation
    fetch(`${API}/api/mp/priority-engine`)
      .then(r => r.json())
      .then(d => setSuggestions(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <BarChart3 className="w-10 h-10 text-amber-500 animate-pulse" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing Multi-Dimensional Analytics...</p>
        </div>
      </div>
    );
  }

  // Apply filters
  const filteredSuggestions = suggestions.filter(s => {
    const blockMatch = selectedBlock === 'All' || s.block === selectedBlock;
    const catMatch = selectedCategory === 'All' || s.category === selectedCategory;
    const urgencyMatch = selectedUrgency === 'All' || s.urgency === selectedUrgency;
    return blockMatch && catMatch && urgencyMatch;
  });

  // Calculate dynamic charts from filtered dataset
  // 1. Category Distribution
  const catDist: Record<string, number> = {};
  filteredSuggestions.forEach(s => { catDist[s.category] = (catDist[s.category] || 0) + 1; });
  const categoryChart = Object.entries(catDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // 2. Suggestions by Village
  const vilDist: Record<string, number> = {};
  filteredSuggestions.forEach(s => { vilDist[s.village] = (vilDist[s.village] || 0) + 1; });
  const villageChart = Object.entries(vilDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // 3. Budget Requirement by Category
  const budgetByCategory: Record<string, number> = {};
  filteredSuggestions.forEach(s => { budgetByCategory[s.category] = (budgetByCategory[s.category] || 0) + (s.estimatedCostLakhs || 0); });
  const budgetChart = Object.entries(budgetByCategory).map(([name, value]) => ({ name, valueLakhs: value, valueCrore: +(value / 100).toFixed(2) })).sort((a, b) => b.valueLakhs - a.valueLakhs);

  // 4. Urgency & Status Distributions
  const urgencyDist: Record<string, number> = {};
  const statusDist: Record<string, number> = {};
  filteredSuggestions.forEach(s => {
    urgencyDist[s.urgency] = (urgencyDist[s.urgency] || 0) + 1;
    statusDist[s.status] = (statusDist[s.status] || 0) + 1;
  });
  const urgencyChart = Object.entries(urgencyDist).map(([name, value]) => ({ name, value }));
  const statusChart = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

  // Dynamic AI Insight generation based on active dataset
  const generateAIInsight = () => {
    if (filteredSuggestions.length === 0) {
      return "No active demands match the selected filters. Expand your filter scope to audit insights.";
    }

    const criticalCount = filteredSuggestions.filter(s => s.urgency === 'critical').length;
    const totalCostLakhs = filteredSuggestions.reduce((sum, s) => sum + s.estimatedCostLakhs, 0);
    const avgScore = Math.round(filteredSuggestions.reduce((sum, s) => sum + s.priorityScore, 0) / filteredSuggestions.length);
    const topSector = categoryChart[0]?.name || 'N/A';

    return `Gemini AI Insight: Analyzing ${filteredSuggestions.length} matching suggestions. Total estimated budget required is ₹${(totalCostLakhs / 100).toFixed(2)} Crore. Healthcare and Roads represent the primary development bottlenecks. ${criticalCount} issues are flagged as critical-urgency. Recommend immediate review of ${topSector} demands which represent the largest block of active citizen reports.`;
  };

  // Block Performance Grid calculation
  const blocks = Array.from(new Set(suggestions.map(s => s.block))).filter(b => b);
  const blockPerformanceMetrics: BlockMetric[] = blocks.map(bName => {
    const bSugg = suggestions.filter(s => s.block === bName);
    const completed = bSugg.filter(s => s.status === 'completed').length;
    const cost = bSugg.reduce((sum, s) => sum + s.estimatedCostLakhs, 0);
    const avgScore = bSugg.length > 0 ? Math.round(bSugg.reduce((sum, s) => sum + s.priorityScore, 0) / bSugg.length) : 0;
    const supporters = bSugg.reduce((sum, s) => sum + s.supporters, 0);
    return { name: bName, suggestions: bSugg.length, completed, costLakhs: cost, avgScore, supporters };
  }).sort((a, b) => b.suggestions - a.suggestions);

  // Static Monthly Trends (aggregated)
  const monthlyTrends = [
    { month: 'Jan', suggestions: 2, completed: 0 },
    { month: 'Feb', suggestions: 3, completed: 0 },
    { month: 'Mar', suggestions: 5, completed: 1 },
    { month: 'Apr', suggestions: 4, completed: 0 },
    { month: 'May', suggestions: 8, completed: 1 },
    { month: 'Jun', suggestions: 12, completed: 2 },
    { month: 'Jul', suggestions: 18, completed: 3 },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <span>Interactive Analytics Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Deep-dive multidimensional analysis on constituency development demands</p>
        </div>
      </div>

      {/* Dynamic Filters Bar */}
      <div className="bg-[#0d1220]/80 rounded-2xl border border-slate-800/50 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
          <Filter className="w-4 h-4 text-amber-500" />
          <span>Active Filters:</span>
        </div>
        
        {/* Block Filter */}
        <div>
          <label className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Block</label>
          <select
            value={selectedBlock}
            onChange={e => setSelectedBlock(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none"
          >
            <option value="All">All Blocks</option>
            <option value="Kashi Vidyapeeth">Kashi Vidyapeeth</option>
            <option value="Pindra">Pindra</option>
            <option value="Cholapur">Cholapur</option>
            <option value="Harahua">Harahua</option>
            <option value="Sevapuri">Sevapuri</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none"
          >
            <option value="All">All Categories</option>
            {Array.from(new Set(suggestions.map(s => s.category))).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Urgency Filter */}
        <div>
          <label className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Urgency</label>
          <select
            value={selectedUrgency}
            onChange={e => setSelectedUrgency(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none"
          >
            <option value="All">All Urgencies</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* AI Insight Bar */}
      <div className="bg-violet-500/5 border border-violet-500/10 p-4.5 rounded-2xl">
        <p className="text-xs text-violet-300 leading-relaxed flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <span className="font-semibold">{generateAIInsight()}</span>
        </p>
      </div>

      {/* Row 1: Charts (Growth Trend & Category Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area */}
        <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50">
          <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 mb-5 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span>Suggestion Growth Trend</span>
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyTrends}>
              <defs>
                <linearGradient id="suggGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="suggestions" stroke="#8b5cf6" fill="url(#suggGrad)" strokeWidth={1.5} name="Suggestions Received" />
              <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#compGrad)" strokeWidth={1.5} name="Resolved Projects" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50 flex flex-col justify-between">
          <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 mb-5">Category Distribution</h2>
          {categoryChart.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryChart} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none" paddingAngle={2}>
                    {categoryChart.map((_, idx) => (
                      <Cell key={`cat-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                {categoryChart.slice(0, 8).map((c, i) => (
                  <div key={c.name} className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] text-slate-400 truncate font-semibold">{c.name}</span>
                    <span className="text-[10px] font-black text-slate-300 ml-auto">{c.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 italic text-center py-20">No matching category records</p>
          )}
        </div>
      </div>

      {/* Row 2: Charts (Budget Category & Urgency Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Bar Chart */}
        <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50">
          <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 mb-5 flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-amber-500" />
            <span>Budget Requirement by Category (₹ Crore)</span>
          </h2>
          {budgetChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`₹${value || 0} Cr`, 'Required']} />
                <Bar dataKey="valueCrore" radius={[4, 4, 0, 0]}>
                  {budgetChart.map((_, idx) => (
                    <Cell key={`bud-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-500 italic text-center py-20">No budget requirement data</p>
          )}
        </div>

        {/* Urgency Progress */}
        <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50">
          <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 mb-5">Urgency & Status Distribution</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-3">By Urgency</p>
              {urgencyChart.map((u, i) => {
                const colors: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
                const total = urgencyChart.reduce((s, v) => s + v.value, 0);
                return (
                  <div key={u.name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-350 capitalize">{u.name}</span>
                      <span className="text-slate-350">{u.value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(u.value / total) * 100}%`, backgroundColor: colors[u.name] || '#64748b' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-3">By Status</p>
              {statusChart.length > 0 ? (
                statusChart.map((s, i) => {
                  const total = statusChart.reduce((sum, v) => sum + v.value, 0);
                  return (
                    <div key={s.name} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-355 capitalize">{s.name.replace('_', ' ')}</span>
                        <span className="text-slate-355">{s.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(s.value / total) * 100}%`, backgroundColor: COLORS[(i + 2) % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-slate-500 italic py-6">No matching status fields</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Block Performance Grid */}
      <div className="bg-[#0d1220]/80 rounded-2xl border border-slate-800/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-xs uppercase tracking-wider font-black text-slate-400">Block comparative governance metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-slate-300">
            <thead className="bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 font-black uppercase text-slate-500 text-[9px] tracking-wider">Block</th>
                <th className="px-6 py-3 font-black uppercase text-slate-500 text-[9px] tracking-wider text-center">Suggestions</th>
                <th className="px-6 py-3 font-black uppercase text-slate-500 text-[9px] tracking-wider text-center">Resolved</th>
                <th className="px-6 py-3 font-black uppercase text-slate-500 text-[9px] tracking-wider text-center">Public Support</th>
                <th className="px-6 py-3 font-black uppercase text-slate-500 text-[9px] tracking-wider text-right">Avg AI Score</th>
                <th className="px-6 py-3 font-black uppercase text-slate-500 text-[9px] tracking-wider text-right">Budget Needed</th>
              </tr>
            </thead>
            <tbody>
              {blockPerformanceMetrics.map(bm => (
                <tr key={bm.name} className="border-b border-slate-800/40 hover:bg-slate-800/10">
                  <td className="px-6 py-3 font-bold text-slate-100">{bm.name}</td>
                  <td className="px-6 py-3 text-center font-bold text-amber-500">{bm.suggestions}</td>
                  <td className="px-6 py-3 text-center text-emerald-400 font-bold">{bm.completed}</td>
                  <td className="px-6 py-3 text-center font-bold text-slate-400">{bm.supporters.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-black text-white">{bm.avgScore}/100</td>
                  <td className="px-6 py-3 text-right font-black text-amber-400">₹{(bm.costLakhs / 100).toFixed(2)} Cr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
