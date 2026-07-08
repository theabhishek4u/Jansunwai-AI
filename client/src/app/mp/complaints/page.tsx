'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ListTodo, Search, Filter, ChevronRight,
  MapPin, Users, AlertTriangle, CheckCircle,
  Clock, XCircle, ArrowUpDown,
  Zap, Droplet, Heart, BookOpen, Trash2, ShieldAlert, Bus, FileText
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

interface SuggestionItem {
  id: string;
  complaint_number?: string;
  title: string;
  category: string;
  village: string;
  block: string;
  district: string;
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

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: 'Submitted', color: 'text-blue-400 bg-blue-500/10', icon: <Clock className="w-3 h-3" /> },
  under_review: { label: 'Under Review', color: 'text-amber-400 bg-amber-500/10', icon: <AlertTriangle className="w-3 h-3" /> },
  accepted: { label: 'Accepted', color: 'text-green-400 bg-green-500/10', icon: <CheckCircle className="w-3 h-3" /> },
  planned: { label: 'Planned', color: 'text-violet-400 bg-violet-500/10', icon: <CheckCircle className="w-3 h-3" /> },
  completed: { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'text-red-400 bg-red-500/10', icon: <XCircle className="w-3 h-3" /> },
};

const categoryIcons: Record<string, React.ReactNode> = {
  'electricity': <Zap className="w-4 h-4 text-amber-400" />,
  'road': <MapPin className="w-4 h-4 text-blue-400" />,
  'bridge': <MapPin className="w-4 h-4 text-sky-400" />,
  'water supply': <Droplet className="w-4 h-4 text-cyan-400" />,
  'drainage': <Droplet className="w-4 h-4 text-teal-400" />,
  'health': <Heart className="w-4 h-4 text-rose-400" />,
  'hospital': <Heart className="w-4 h-4 text-rose-400" />,
  'phc': <Heart className="w-4 h-4 text-rose-400" />,
  'school': <BookOpen className="w-4 h-4 text-indigo-400" />,
  'college': <BookOpen className="w-4 h-4 text-indigo-400" />,
  'education': <BookOpen className="w-4 h-4 text-indigo-400" />,
  'library': <BookOpen className="w-4 h-4 text-indigo-400" />,
  'waste management': <Trash2 className="w-4 h-4 text-emerald-400" />,
  'municipal': <Trash2 className="w-4 h-4 text-emerald-400" />,
  "women's safety": <ShieldAlert className="w-4 h-4 text-pink-400" />,
  'public transport': <Bus className="w-4 h-4 text-violet-400" />,
  'others': <FileText className="w-4 h-4 text-slate-400" />
};

const getCategoryIcon = (catName: string) => {
  const norm = catName.toLowerCase().trim();
  return categoryIcons[norm] || <FileText className="w-4 h-4 text-slate-400" />;
};

const urgencyBadge: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function MpComplaintsPage() {
  const [complaints, setComplaints] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVillage, setFilterVillage] = useState('');
  const [sortBy, setSortBy] = useState<'priorityScore' | 'supporters' | 'estimatedCostLakhs'>('priorityScore');

  useEffect(() => {
    fetch(`${API}/api/mp/priority-engine`)
      .then(r => r.json())
      .then(data => setComplaints(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(complaints.map(s => s.category))].sort();
  const villages = [...new Set(complaints.map(s => s.village))].sort();

  const categoryStats = complaints.reduce((acc, curr) => {
    const cat = curr.category;
    if (!acc[cat]) {
      acc[cat] = { total: 0, active: 0, solved: 0 };
    }
    acc[cat].total += 1;
    if (curr.status === 'completed') {
      acc[cat].solved += 1;
    } else if (curr.status !== 'rejected') {
      acc[cat].active += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number; solved: number }>);

  const activeCategoryList = Object.entries(categoryStats)
    .map(([name, stats]) => ({
      name,
      active: stats.active,
      solved: stats.solved,
      total: stats.total,
      rate: Math.round((stats.solved / (stats.total || 1)) * 100)
    }))
    .filter(cat => cat.active > 0)
    .sort((a, b) => b.active - a.active);

  if (!activeCategoryList.some(c => c.name.toLowerCase() === 'others')) {
    activeCategoryList.push({
      name: 'Others',
      active: 0,
      solved: 0,
      total: 0,
      rate: 0
    });
  }

  const filtered = complaints
    .filter(s => {
      if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterCategory && s.category !== filterCategory) return false;
      if (filterUrgency && s.urgency !== filterUrgency) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      if (filterVillage && s.village !== filterVillage) return false;
      return true;
    })
    .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

  const activeComplaints = filtered.filter(s => s.status !== 'completed' && s.status !== 'rejected');
  const completedComplaints = filtered.filter(s => s.status === 'completed')
    .sort((a, b) => (b.supporters || 0) - (a.supporters || 0));

  const renderComplaintCard = (s: SuggestionItem, i: number) => {
    const sc = statusConfig[s.status] || statusConfig.submitted;
    return (
      <motion.div
        key={s.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.02 }}
      >
        <Link
          href={`/mp/complaints/${s.id}`}
          className="flex items-center gap-4 p-4 rounded-2xl bg-[#0a0d1e] border border-[#1e293b]/20 hover:border-gov-blue-light/30 transition-all group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center shrink-0 border border-amber-500/10">
            <span className="text-xs font-black text-amber-400">#{i + 1}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono mb-1">{s.complaint_number || s.id.substring(0, 8)}</span>
              <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white">{s.title}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="flex items-center space-x-1 text-[10px] text-slate-500">
                <MapPin className="w-3 h-3" />
                <span>{s.village}, {s.district}</span>
              </span>
              <span className="text-[10px] text-slate-600">•</span>
              <span className="text-[10px] text-slate-500">{s.category}</span>
              <span className="text-[10px] text-slate-600">•</span>
              <span className="flex items-center space-x-1 text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                <Users className="w-3 h-3" />
                <span>{s.supporters.toLocaleString()} Duplicate Complaints</span>
              </span>
              <span className="text-[10px] text-slate-600">•</span>
              <span className="text-[10px] text-slate-500">₹{s.estimatedCostLakhs}L</span>
              {s.isVerifiedCitizen && (
                <>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-md text-[9px] font-bold">
                    ✓ Verified Citizen
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${urgencyBadge[s.urgency]}`}>
              {s.urgency.toUpperCase()}
            </span>
            <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${sc.color}`}>
              {sc.icon}
              <span>{sc.label}</span>
            </span>
            <div className="text-right">
              <p className="text-lg font-black text-amber-400">{s.priorityScore}</p>
              <p className="text-[8px] text-slate-500 uppercase">AI Score</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
          </div>
        </Link>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <ListTodo className="w-8 h-8 text-amber-400 animate-pulse" />
          <p className="text-sm text-slate-400">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* ── CATEGORY STATUS OVERVIEW BOARD ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Active categories index</span>
          <span className="text-[9px] text-slate-550 font-bold bg-[#0b1329]/40 border border-[#1e293b]/20 px-3 py-1 rounded-full shadow-inner">
            {activeCategoryList.length} Categories Affected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {activeCategoryList.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setFilterCategory(filterCategory === cat.name ? '' : cat.name)}
              className={`relative p-5 rounded-2xl flex flex-col justify-center text-left hover:-translate-y-1 active:scale-[0.98] transition-all duration-400 cursor-pointer border overflow-hidden group shadow-lg ${
                filterCategory === cat.name 
                  ? 'bg-linear-to-br from-[#1c2242] to-[#131836] border-indigo-500/50 shadow-indigo-500/20' 
                  : 'bg-linear-to-br from-[#0f142c] to-[#0a0d1e] border-[#1e293b]/40 hover:border-[#1e293b]/80 hover:shadow-indigo-500/10'
              }`}
            >
              {/* Subtle top highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Subtle background glow when active */}
              {filterCategory === cat.name && (
                <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-2xl pointer-events-none" />
              )}

              <div className="flex items-center justify-between gap-4 w-full relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner shrink-0 transition-all duration-300 ${
                    filterCategory === cat.name 
                      ? 'bg-indigo-500/20 border-indigo-500/30 group-hover:scale-110' 
                      : 'bg-slate-900/60 border-slate-700/50 group-hover:bg-slate-800/80 group-hover:scale-110'
                  }`}>
                    {getCategoryIcon(cat.name)}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors truncate" title={cat.name}>
                      {cat.name}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-amber-400 font-mono tracking-tight">{cat.active}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-semibold">Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-[#131930]" strokeWidth="4" />
                    <circle 
                      cx="18" cy="18" r="15.915" fill="none" 
                      className={`${filterCategory === cat.name ? 'stroke-indigo-400' : 'stroke-emerald-500'} transition-all duration-1000 ease-out`} 
                      strokeWidth="4"
                      strokeDasharray="100"
                      strokeDashoffset={100 - cat.rate}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute text-[8px] font-black ${filterCategory === cat.name ? 'text-indigo-300 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]' : 'text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]'}`}>
                    {cat.rate}%
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-[#0f142c] rounded-2xl p-4 border border-[#1e293b]/25 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search complaints..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 focus:outline-none">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterVillage} onChange={e => setFilterVillage(e.target.value)} className="px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 focus:outline-none">
            <option value="">All Villages</option>
            {villages.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} className="px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 focus:outline-none">
            <option value="">All Urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="flex items-center space-x-1 ml-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] text-slate-500">{filtered.length} of {complaints.length}</span>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center space-x-3">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Sort by:</span>
        {[
          { key: 'priorityScore' as const, label: 'AI Priority' },
          { key: 'supporters' as const, label: 'Supporters' },
          { key: 'estimatedCostLakhs' as const, label: 'Cost' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${sortBy === opt.key ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Split Complaints View (Active | Completed) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Active Complaints */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800/50 pb-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest">Active Tasks</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black">{activeComplaints.length}</span>
          </div>
          <div className="space-y-3">
            {activeComplaints.map((s, i) => renderComplaintCard(s, i))}
            {activeComplaints.length === 0 && (
              <div className="text-center p-8 border border-slate-800/50 border-dashed rounded-2xl bg-slate-900/20">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No active tasks found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Completed Complaints */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800/50 pb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest">Completed Tasks</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black">{completedComplaints.length}</span>
          </div>
          <div className="space-y-3">
            {completedComplaints.map((s, i) => renderComplaintCard(s, i))}
            {completedComplaints.length === 0 && (
              <div className="text-center p-8 border border-slate-800/50 border-dashed rounded-2xl bg-slate-900/20">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No completed tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
