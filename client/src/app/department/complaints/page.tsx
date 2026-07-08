'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, CheckCircle2, Clock, Filter, 
  MapPin, Search, Sparkles, Users, X, ChevronRight,
  TrendingUp, ShieldAlert, Target, Flame, Activity
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface DeptSession {
  id: string;
  name: string;
  email: string;
  officer: string;
  category: string;
  role: string;
}

interface Suggestion {
  id: string;
  complaint_number?: string;
  citizen_id: string;
  title: string;
  category: string;
  description: string;
  location_lat?: number;
  location_lng?: number;
  village?: string;
  block?: string;
  district: string;
  state: string;
  estimated_beneficiaries: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  ai_score_completeness?: number;
  ai_score_impact?: string;
  ai_score_confidence?: number;
  supporters?: number;
  support_count: number;
  consensus_score: number;
  estimated_cost_lakhs?: number;
  created_at: string;
  updated_at: string;
}

const CATEGORY_MAP: Record<string, string[]> = {
  pwd: ['Road', 'Roads', 'Bridge'],
  water: ['Drainage', 'Water Supply', 'Water'],
  health: ['PHC', 'Healthcare', 'Hospital'],
  education: ['School', 'Education', 'College', 'Library'],
  electricity: ['Street Lights', 'Electricity'],
  municipal: ['Municipal', 'Waste Management', 'Parks', 'Sports Ground']
};

export default function DepartmentComplaints() {
  const [session, setSession] = useState<DeptSession | null>(null);
  const [complaints, setComplaints] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Suggestion | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('dept-session');
    if (raw) {
      setSession(JSON.parse(raw) as DeptSession);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/suggestions`);
        if (res.ok) {
          const allSuggestions = await res.json() as Suggestion[];
          
          const deptComplaints = allSuggestions.filter(s => {
            const matchesCategory = CATEGORY_MAP[session.id]?.some(
              cat => s.category.toLowerCase().includes(cat.toLowerCase())
            );
            return matchesCategory;
          });

          setComplaints(deptComplaints);
        }
      } catch (err) {
        console.error('Failed to load department complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [session]);

  if (!session) return null;

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.id.substring(0,8).includes(searchQuery) ||
                          c.village?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUrgency = urgencyFilter === 'all' || c.urgency === urgencyFilter;

    return matchesSearch && matchesUrgency;
  });

  const criticalCount = complaints.filter(c => c.urgency === 'critical' || c.urgency === 'high').length;
  const highConsensus = complaints.filter(c => c.consensus_score >= 60).length;

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-red-500/15 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-orange-500/15 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]">High</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-sky-500/15 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.2)]">Medium</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/15 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] uppercase">Completed</span>;
      case 'planned':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-indigo-500/15 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)] uppercase">Assigned</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-amber-500/15 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)] uppercase animate-pulse">Review</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-slate-800 text-slate-400 uppercase">Submitted</span>;
    }
  };

  return (
    <div className="space-y-6 pb-10 font-sans">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center space-x-3 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-400" />
            </div>
            <span>Citizen Problem Console</span>
          </h2>
          <p className="text-sm text-slate-450 mt-2 font-medium">
            Real-time public problems and local infrastructure requirements for the <strong className="text-blue-400 font-bold">{session.name}</strong>.
          </p>
        </div>
      </div>

      {/* KPI mini row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:bg-slate-900/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all" />
          <div className="relative z-10">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Total Problems</span>
            <span className="text-3xl font-black text-white block mt-1 tracking-tighter">{complaints.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center relative z-10">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="p-5 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:bg-slate-900/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-rose-500/20 transition-all" />
          <div className="relative z-10">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">High Urgency Alerts</span>
            <span className="text-3xl font-black text-rose-450 block mt-1 tracking-tighter">{criticalCount}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center relative z-10">
            <Flame className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        <div className="p-5 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:bg-slate-900/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="relative z-10">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">High Consensus</span>
            <span className="text-3xl font-black text-emerald-450 block mt-1 tracking-tighter">{highConsensus}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center relative z-10">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Search & filters row */}
      <div className="bg-slate-900/40 backdrop-blur-2xl rounded-2xl p-4 border border-white/5 flex flex-wrap items-center justify-between gap-5 shadow-xl">
        <div className="relative flex-1 min-w-[280px] max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search problems by title, ID or village..."
            className="w-full bg-slate-950/50 border border-white/5 text-xs text-white pl-12 pr-4 py-3 rounded-xl outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all font-semibold shadow-inner"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Urgency</span>
          </div>
          <div className="flex bg-slate-950/50 rounded-xl p-1.5 border border-white/5 shadow-inner">
            {[
              { id: 'all', label: 'All' },
              { id: 'critical', label: 'Critical' },
              { id: 'high', label: 'High' },
              { id: 'medium', label: 'Medium' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setUrgencyFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer ${
                  urgencyFilter === tab.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Complaints (3 columns, compact cards) */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
          Loading citizen problems...
        </div>
      ) : filteredComplaints.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/20 border border-dashed border-white/10 p-16 rounded-[32px] text-center space-y-4 shadow-inner">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest">No Problems Found</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">No matching citizen problems exist under this filter.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredComplaints.map((c, idx) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-blue-500/30 rounded-3xl p-5 shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] flex flex-col justify-between group relative overflow-hidden transition-all"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-blue-500/15 transition-all" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest bg-slate-950 px-2 py-1 rounded-lg">
                      #{c.id.substring(0,8)}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {getUrgencyBadge(c.urgency)}
                      {getStatusBadge(c.status)}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-[13px] leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  
                  <p className="text-[10px] text-slate-450 mt-2 line-clamp-1 font-medium">
                    {c.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-[10px] font-black bg-slate-950/50 p-2.5 rounded-xl border border-white/5 shadow-inner">
                    <span className="text-slate-500 uppercase tracking-widest">Consensus</span>
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <Target className="w-3.5 h-3.5" />
                      <span>{c.consensus_score}%</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center space-x-1" title="Location">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-[60px]">{c.village || 'City'}</span>
                      </span>
                      <span className="flex items-center space-x-1 border-l border-white/10 pl-3" title="Supporters">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.support_count}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all cursor-pointer group/btn"
                    >
                      <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Details Slideover Panel Drawer */}
      <AnimatePresence>
        {selectedComplaint && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
            />

            {/* Slideover Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-slate-900 border-l border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 overflow-y-auto z-50 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-5 mb-6">
                  <div>
                    <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3 h-3 animate-pulse" /> AI Overview
                    </span>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">#{selectedComplaint.id.substring(0,12)}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedComplaint(null)}
                    className="w-9 h-9 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status/Category Row */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 border border-white/5 rounded-2xl shadow-inner">
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">AI Category</span>
                      <span className="text-[13px] font-black text-blue-400 block mt-1.5">{selectedComplaint.category}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Urgency Status</span>
                      <div>{getUrgencyBadge(selectedComplaint.urgency)}</div>
                    </div>
                  </div>

                  {/* Description Info block */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Problem Title</h4>
                    <p className="text-sm text-white font-bold leading-snug">{selectedComplaint.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium mt-3 pt-3 border-t border-white/5">{selectedComplaint.description}</p>
                  </div>

                  {/* Coordinates & Location widgets */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Logistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-300">
                      <div className="space-y-1.5 bg-slate-950/30 p-3 rounded-xl border border-white/5">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Target Location</span>
                        <p className="flex items-center space-x-1.5 text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          <span>{selectedComplaint.village || 'N/A'}, {selectedComplaint.block || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="space-y-1.5 bg-slate-950/30 p-3 rounded-xl border border-white/5">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Beneficiaries</span>
                        <p className="flex items-center space-x-1.5 text-slate-200">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>{selectedComplaint.estimated_beneficiaries || 0} Citizens</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Scores diagnostic */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>AI Verification Metrics</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Completeness</span>
                        <span className="text-lg font-black text-white font-mono block mt-1">{selectedComplaint.ai_score_completeness || 70}%</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Impact Priority</span>
                        <span className="text-lg font-black text-amber-400 block mt-1">{selectedComplaint.ai_score_impact || 'Medium'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Footer info card */}
              <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-3xl flex items-start space-x-3 mt-8 shadow-lg">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block">Read-Only View</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium mt-1.5">
                    This data is monitored directly. To execute development projects, the MP must assign specific tasks via the MP Command Console.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
