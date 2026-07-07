'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, AlertTriangle, CheckCircle2, Clock, Filter, 
  MapPin, Search, Sparkles, User, Users, X, ChevronRight,
  TrendingUp, BarChart3, ShieldAlert
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
          
          // Filter citizen grievances/complaints in this department's domain
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

  // Filter complaints based on query & urgency
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
        return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">High</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">Medium</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Completed</span>;
      case 'planned':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">Assigned Task</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">Under Review</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[8px] font-black bg-slate-800/60 text-slate-450 border border-slate-800 uppercase">Submitted</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            <span>Citizen Grievances Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time public requests, community consensus tracking, and local infrastructure requirements for the <strong className="text-blue-400 font-bold">{session.name}</strong>.
          </p>
        </div>
      </div>

      {/* KPI mini row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0b1329]/60 border border-slate-850 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Grievances</span>
            <span className="text-2xl font-black text-white block mt-1">{complaints.length}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
            <Users className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="p-4 bg-[#0b1329]/60 border border-slate-850 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">High Urgency Alerts</span>
            <span className="text-2xl font-black text-rose-450 block mt-1">{criticalCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
        </div>

        <div className="p-4 bg-[#0b1329]/60 border border-slate-850 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">High Consensus Requests</span>
            <span className="text-2xl font-black text-emerald-450 block mt-1">{highConsensus}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Search & filters row */}
      <div className="bg-[#0b1329]/40 backdrop-blur-md rounded-2xl p-4.5 border border-slate-850 flex flex-wrap items-center justify-between gap-5">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-550" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search grievances by title, ID or village..."
            className="w-full bg-[#080d1e] border border-slate-800 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all font-semibold"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-black text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-550" />
            <span>Urgency:</span>
          </div>
          <div className="flex bg-[#080d1e] rounded-xl p-1.5 border border-slate-800/80">
            {[
              { id: 'all', label: 'All' },
              { id: 'critical', label: 'Critical' },
              { id: 'high', label: 'High' },
              { id: 'medium', label: 'Medium' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setUrgencyFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all cursor-pointer ${
                  urgencyFilter === tab.id 
                    ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Complaints */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
          Ingesting citizen grievances...
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-[#070d1e]/45 border border-slate-850 p-16 rounded-3xl text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-slate-750 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Grievances Found</h3>
          <p className="text-xs text-slate-500">No matching requests exist in this department&apos;s category map.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredComplaints.map(c => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-[#0b1329]/50 backdrop-blur-sm border border-slate-850 hover:border-blue-500/20 rounded-3xl p-6 shadow-xl flex flex-col justify-between group relative overflow-hidden transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-3 mb-3">
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">
                      GRIEVANCE #{c.id.substring(0,8)}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {getUrgencyBadge(c.urgency)}
                      {getStatusBadge(c.status)}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-white text-xs leading-snug group-hover:text-blue-400 transition-colors">
                    {c.title}
                  </h3>
                  
                  <p className="text-[11px] text-slate-450 mt-2 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Consensus Tracker slider */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 tracking-wider">
                      <span>Public Consensus</span>
                      <span className="font-mono text-emerald-450">{c.consensus_score}% Score</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                      <div 
                        className="bg-linear-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all" 
                        style={{ width: `${c.consensus_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-5">
                  <div className="flex items-center space-x-3 text-[10px] text-slate-450 font-bold">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" />
                      <span>{c.village || 'Hazratganj'}</span>
                    </span>
                    <span className="flex items-center space-x-1 border-l border-slate-850 pl-3">
                      <User className="w-3.5 h-3.5 text-slate-600" />
                      <span>{c.support_count} Supporters</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedComplaint(c)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-slate-850 transition-all cursor-pointer"
                  >
                    <span>View Grievance</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
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
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slideover Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-[#070d1e] border-l border-slate-850 shadow-2xl p-6 overflow-y-auto z-50 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-5">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest">Grievance Detail Card</span>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider mt-0.5">#{selectedComplaint.id.substring(0,12)}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedComplaint(null)}
                    className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-850 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status/Category Row */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-4 border border-slate-850/50 rounded-2xl">
                    <div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">AI Category</span>
                      <span className="text-xs font-extrabold text-blue-400 block mt-1">{selectedComplaint.category}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Urgency Status</span>
                      <div className="mt-1">{getUrgencyBadge(selectedComplaint.urgency)}</div>
                    </div>
                  </div>

                  {/* Description Info block */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Proposal Title</h4>
                    <p className="text-xs text-slate-100 font-extrabold leading-snug">{selectedComplaint.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-850/50">{selectedComplaint.description}</p>
                  </div>

                  {/* Coordinates & Location widgets */}
                  <div className="space-y-3 pt-3 border-t border-slate-850/50">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Field Logistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-300">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-550 uppercase tracking-widest block">Target Location</span>
                        <p className="flex items-center space-x-1.5 text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{selectedComplaint.village || 'N/A'}, {selectedComplaint.block || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-slate-550 uppercase tracking-widest block">Beneficiaries</span>
                        <p className="flex items-center space-x-1.5 text-slate-200">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>{selectedComplaint.estimated_beneficiaries || 0} Citizens</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Scores diagnostic */}
                  <div className="space-y-3 pt-4 border-t border-slate-850/50">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span>AI Verification Metrics</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-3.5 rounded-2xl border border-slate-850/40">
                      <div>
                        <span className="text-[8px] font-black text-slate-550 uppercase tracking-widest block">Completeness</span>
                        <span className="text-sm font-extrabold text-white font-mono block mt-1">{selectedComplaint.ai_score_completeness || 70}%</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-550 uppercase tracking-widest block">Impact Priority</span>
                        <span className="text-sm font-extrabold text-amber-450 block mt-1">{selectedComplaint.ai_score_impact || 'Medium'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Footer info card */}
              <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-start space-x-3 mt-6">
                <AlertCircle className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Read-Only View</span>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1">
                    Grievance data is monitored directly. To execute development projects, the MP must assign specific tasks via the MP Command Console.
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
