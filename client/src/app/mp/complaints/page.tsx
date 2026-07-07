'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ListTodo, Search, Filter, ChevronRight,
  MapPin, Users, AlertTriangle, CheckCircle2,
  Clock, XCircle, ArrowUpDown
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  accepted: { label: 'Accepted', color: 'text-green-400 bg-green-500/10', icon: <CheckCircle2 className="w-3 h-3" /> },
  planned: { label: 'Planned', color: 'text-violet-400 bg-violet-500/10', icon: <CheckCircle2 className="w-3 h-3" /> },
  completed: { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10', icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'text-red-400 bg-red-500/10', icon: <XCircle className="w-3 h-3" /> },
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
      <div>
        <h1 className="text-2xl font-bold text-white">Complaint Management</h1>
        <p className="text-sm text-slate-400 mt-1">Review, prioritize, and manage citizen development complaints</p>
      </div>

      {/* Filters */}
      <div className="bg-[#111827] rounded-2xl p-4 border border-slate-800/50">
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
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 focus:outline-none">
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
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

      {/* Complaints List */}
      <div className="space-y-3">
        {filtered.map((s, i) => {
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
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#111827] border border-slate-800/50 hover:border-slate-700/80 transition-all group"
              >
                {/* Rank */}
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center shrink-0 border border-amber-500/10">
                  <span className="text-xs font-black text-amber-400">#{i + 1}</span>
                </div>

                {/* Content */}
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

                {/* Meta */}
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
        })}
      </div>
    </div>
  );
}
