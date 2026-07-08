'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Trophy, MapPin, Users, ChevronRight, Info, 
  HeartPulse, Shield, Layers, TrendingDown, Droplets,
  GraduationCap, Flame, Lightbulb, FileText, Sparkles, 
  Activity, Zap, UserCheck, Landmark, AlertTriangle,
  Search, Filter, ArrowUpDown, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface PriorityItem {
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
  aiCompleteness: number;
  aiConfidence: number;
  isVerifiedCitizen?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Road': return <Layers className="w-3.5 h-3.5 text-sky-400" />;
    case 'Drainage': return <TrendingDown className="w-3.5 h-3.5 text-indigo-400" />;
    case 'School': return <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />;
    case 'PHC':
    case 'Hospital': return <HeartPulse className="w-3.5 h-3.5 text-rose-400" />;
    case 'Water Supply': return <Droplets className="w-3.5 h-3.5 text-blue-400" />;
    case 'Street Lights': return <Lightbulb className="w-3.5 h-3.5 text-amber-400" />;
    case 'Electricity': return <Flame className="w-3.5 h-3.5 text-amber-500" />;
    case "Women's Safety": return <Shield className="w-3.5 h-3.5 text-fuchsia-400" />;
    default: return <FileText className="w-3.5 h-3.5 text-slate-400" />;
  }
};

export default function PriorityEnginePage() {
  const [items, setItems] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [sortBy, setSortBy] = useState<'priorityScore' | 'populationAffected' | 'supporters' | 'estimatedCostLakhs'>('priorityScore');

  useEffect(() => {
    fetch(`${API}/api/mp/priority-engine`)
      .then(r => r.json())
      .then(data => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Trophy className="w-10 h-10 text-amber-455 animate-pulse" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Running Priority Models...</p>
      </div>
    );
  }

  // Filter and Sort Logic
  const filteredItems = items
    .filter(s => {
      if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterCategory && s.category !== filterCategory) return false;
      if (filterUrgency && s.urgency !== filterUrgency) return false;
      return true;
    })
    .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

  const categories = [...new Set(items.map(s => s.category))].sort();

  // Metrics Logic
  const top10 = items.slice(0, 10).map(i => ({
    name: `${i.category} (${i.village})`,
    title: i.title,
    score: i.priorityScore,
    urgency: i.urgency
  }));

  const totalEvaluated = items.length;
  const criticalCount = items.filter(i => i.urgency === 'critical').length;
  const avgScore = items.length > 0 ? Math.round(items.reduce((acc, curr) => acc + curr.priorityScore, 0) / items.length) : 0;
  const verifiedImpacts = items.filter(i => i.isVerifiedCitizen).length;
  const totalBeneficiaries = items.reduce((acc, curr) => acc + curr.populationAffected, 0);

  // Top Recommendation Insight
  const topIssue = items.length > 0 ? items[0] : null;
  const insightText = topIssue 
    ? `Gemini AI recommends immediate action on "${topIssue.category}" in ${topIssue.village}. With a priority score of ${topIssue.priorityScore} and ${topIssue.populationAffected.toLocaleString()} affected residents, this intervention yields the highest community ROI.`
    : 'No active proposals found to analyze.';

  // Radar Chart Data for AI Formulation
  const radarData = [
    { subject: 'Urgency', A: 95, fullMark: 100 },
    { subject: 'Impact', A: 85, fullMark: 100 },
    { subject: 'Demand', A: 78, fullMark: 100 },
    { subject: 'Cost ROI', A: 65, fullMark: 100 },
    { subject: 'Verification', A: 90, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans pb-10">
      
      {/* 1. Header Card */}
      <div className="relative overflow-hidden bg-linear-to-r from-slate-955 via-[#0c1222] to-slate-955 p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                AI Priority Engine
              </h1>
              <p className="text-xs text-slate-450 leading-normal">
                Citizen proposals processed through dynamic multi-weighted ranking algorithms.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-450 animate-pulse" />
            <span>Multi-weighted Ranking Active</span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total Evaluated</p>
            <p className="text-xl font-black text-slate-200">{totalEvaluated}</p>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Critical Issues</p>
            <p className="text-xl font-black text-rose-400">{criticalCount}</p>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Avg AI Score</p>
            <p className="text-xl font-black text-amber-400">{avgScore}<span className="text-[10px] text-slate-500">/100</span></p>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total Beneficiaries</p>
            <p className="text-xl font-black text-emerald-400">{(totalBeneficiaries / 1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>

      {/* 3. AI Executive Summary Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-950/30 border border-indigo-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden flex items-start gap-4"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 shrink-0">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-widest font-black text-indigo-300 mb-1">AI Executive Insight</h3>
          <p className="text-sm font-semibold text-slate-200 leading-relaxed max-w-4xl">{insightText}</p>
        </div>
      </motion.div>

      {/* 4. Top 10 Chart & Radar Formulation Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
          
          <h2 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-6 flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-amber-500" />
            <span>Top 10 Proposals by AI Priority Score</span>
          </h2>
          
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={top10} layout="vertical" margin={{ left: 20, right: 20 }}>
              <defs>
                <linearGradient id="scoreGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} width={140} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0d1220', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '11px', color: '#e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, _: any, props: any) => [
                  <div className="space-y-1" key="tooltip">
                    <p className="font-extrabold text-amber-400 text-xs">Score: {value}/100</p>
                    <p className="text-[10px] text-slate-350 leading-relaxed font-semibold max-w-[200px] whitespace-normal">{props.payload.title}</p>
                    <p className="text-[9px] uppercase tracking-wider text-rose-400 font-black mt-1">Urgency: {props.payload.urgency}</p>
                  </div>,
                  ''
                ]}
              />
              <Bar dataKey="score" radius={[0, 10, 10, 0]} fill="url(#scoreGlow)" barSize={16}>
                {top10.map((_, idx) => (
                  <Cell key={`cell-${idx}`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Radar Formulation Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.05 }}
          className="lg:col-span-1 bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-2xl flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2 flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-violet-400" />
              <span>AI Formulation Metrics</span>
            </h2>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium mb-4">
              Visualizing the multi-dimensional vectors processed by Gemini AI to generate the priority scores.
            </p>

            <div className="h-[250px] w-full flex items-center justify-center -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                  <Radar name="AI Metrics" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Tooltip 
                    contentStyle={{ background: '#0d1220', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px', color: '#e2e8f0' }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 pt-4 border-t border-violet-500/10 flex items-center space-x-2 bg-violet-600/5 p-3 rounded-2xl">
            <Zap className="w-4 h-4 text-violet-400 shrink-0" />
            <p className="text-[9px] text-slate-400 leading-normal">
              Verified Citizen bonus adds <span className="text-violet-300 font-extrabold">+20 Priority Points</span> to accelerate verified issues.
            </p>
          </div>
        </motion.div>
      </div>

      {/* 5. Full Ranking Table Card with Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }} 
        className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="px-6 py-5 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/50">
          <div className="flex flex-col space-y-1">
            <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
              <Landmark className="w-4.5 h-4.5 text-amber-500" />
              <span>Full Priority Rankings</span>
            </h2>
            <span className="text-[10px] font-bold text-slate-500">{filteredItems.length} active proposals ranked</span>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search proposals..."
                className="w-48 pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)} 
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-amber-500/50"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={filterUrgency} 
              onChange={e => setFilterUrgency(e.target.value)} 
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-amber-500/50"
            >
              <option value="">All Urgency</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value as Parameters<typeof setSortBy>[0])} 
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-amber-400 focus:outline-none focus:border-amber-500/50"
            >
              <option value="priorityScore">Sort: Priority Score</option>
              <option value="populationAffected">Sort: Impact (People)</option>
              <option value="supporters">Sort: Supporters</option>
              <option value="estimatedCostLakhs">Sort: Cost</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-md z-10 border-b border-slate-800/80">
              <tr>
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Rank</th>
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Project Proposal</th>
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Urgency</th>
                <th className="px-5 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">Impact (People)</th>
                <th className="px-5 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">Supporters</th>
                <th className="px-5 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">Est. Cost</th>
                <th className="px-5 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">AI Priority</th>
                <th className="px-5 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    No proposals match the current filters
                  </td>
                </tr>
              ) : filteredItems.map((item, i) => {
                const isRanked1 = i === 0;
                const isRanked2 = i === 1;
                const isRanked3 = i === 2;
                
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-805 hover:bg-slate-850/40 transition-all cursor-pointer group ${
                      hoveredItem === item.id ? 'bg-slate-850/30' : ''
                    }`}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Rank cell */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-[10px] font-black tracking-tight transition-transform group-hover:scale-105 ${
                        isRanked1 
                          ? 'bg-linear-to-br from-amber-300 via-yellow-500 to-amber-600 text-slate-950 shadow-md shadow-yellow-500/20' 
                          : isRanked2
                            ? 'bg-linear-to-br from-slate-200 via-slate-400 to-slate-500 text-slate-950 shadow-md shadow-slate-400/10'
                            : isRanked3
                              ? 'bg-linear-to-br from-amber-600 via-amber-700 to-amber-900 text-white shadow-md shadow-amber-800/15'
                              : 'bg-slate-950 text-slate-500 border border-slate-850'
                      }`}>
                        {i + 1}
                      </span>
                    </td>

                    {/* Proposal Title + Sub-locality */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate max-w-[280px]">
                          {item.title}
                        </p>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <span>{item.village}</span>
                          <span>•</span>
                          <span>{item.block || 'Lucknow Block'}</span>
                        </p>
                      </div>
                    </td>

                    {/* Category with icon */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-850/80 text-[10px] font-bold text-slate-350">
                        {getCategoryIcon(item.category)}
                        <span className="uppercase tracking-wider">{item.category}</span>
                      </span>
                    </td>

                    {/* Location Pin */}
                    <td className="px-5 py-4">
                      <span className="flex items-center space-x-1 text-slate-450 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.village}</span>
                      </span>
                    </td>

                    {/* Urgency Badge */}
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                        item.urgency === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : item.urgency === 'high'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : item.urgency === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-450 border-yellow-500/20'
                              : 'bg-slate-800/30 text-slate-450 border-slate-700/30'
                      }`}>
                        {item.urgency}
                      </span>
                    </td>

                    {/* Impact People */}
                    <td className="px-5 py-4 text-right font-black text-slate-300">
                      {item.populationAffected.toLocaleString()}
                    </td>

                    {/* Supporters count with icon */}
                    <td className="px-5 py-4 text-right">
                      <span className="flex items-center justify-end space-x-1 text-slate-400 font-semibold">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{item.supporters.toLocaleString()}</span>
                      </span>
                    </td>

                    {/* Cost formatted in lakhs or Crore */}
                    <td className="px-5 py-4 text-right text-slate-200 font-extrabold">
                      {item.estimatedCostLakhs > 0 ? (
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black">₹{(item.estimatedCostLakhs / 100).toFixed(2)} Cr</p>
                          <p className="text-[7px] text-slate-500 font-semibold">{item.estimatedCostLakhs} Lakhs</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-bold">Unestimated</span>
                      )}
                    </td>

                    {/* AI score badge */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          item.priorityScore >= 90
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black shadow-xs shadow-emerald-500/5'
                            : item.priorityScore >= 75
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black'
                              : 'bg-slate-850 text-slate-400 border border-slate-800'
                        }`}>
                          {item.priorityScore}
                        </span>
                        {item.isVerifiedCitizen && (
                          <span className="text-[6px] text-violet-400 font-black uppercase tracking-wider mt-0.5 flex items-center gap-0.5">
                            <UserCheck className="w-2 h-2" /> Verified
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action button */}
                    <td className="px-5 py-4 text-right">
                      <Link href={`/mp/complaints/${item.id}`} className="p-1 rounded-lg text-slate-650 hover:text-amber-500 hover:bg-slate-850/50 transition-all inline-block shrink-0">
                        <ChevronRight className="w-4.5 h-4.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
