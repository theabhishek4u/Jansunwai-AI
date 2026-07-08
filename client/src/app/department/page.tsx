'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, Clock, CheckCircle2, ShieldAlert, 
  MapPin, IndianRupee, Search, Calendar, AlertTriangle, ArrowRight,
  Activity, Layers
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

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
  timeline?: Array<{
    id: string;
    status: string;
    notes?: string;
    created_at: string;
  }>;
}

const CATEGORY_MAP: Record<string, string[]> = {
  pwd: ['Road', 'Roads'],
  water: ['Drainage', 'Water Supply', 'Water'],
  health: ['PHC', 'Healthcare'],
  education: ['School', 'Education'],
  electricity: ['Street Lights', 'Electricity'],
  municipal: ['Municipal', 'Waste Management', 'Parks']
};

export default function DepartmentDashboard() {
  const [session, setSession] = useState<DeptSession | null>(null);
  const [tasks, setTasks] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('dept-session');
    if (raw) {
      setSession(JSON.parse(raw) as DeptSession);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/suggestions`);
        if (res.ok) {
          const allSuggestions = await res.json() as Suggestion[];
          
          // Filter tasks belonging to this department
          const deptTasks = allSuggestions.filter(s => {
            const matchesCategory = CATEGORY_MAP[session.id]?.some(
              cat => s.category.toLowerCase().includes(cat.toLowerCase())
            );
            
            const hasTimelineAssignment = s.timeline?.some(event => 
              event.notes?.toLowerCase().includes(session.name.toLowerCase()) ||
              event.notes?.toLowerCase().includes(session.id.toLowerCase())
            );

            return matchesCategory || hasTimelineAssignment;
          });

          setTasks(deptTasks);
        }
      } catch (err) {
        console.error('Failed to load department tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [session]);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API}/api/suggestions/${taskId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: `[Status Update] ${session?.officer.split(' (')[0]} updated state: ${newStatus}`
        })
      });
      if (res.ok) {
        // Optimistically update the local state
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (!session) return null;

  // Search filter
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.substring(0,8).includes(searchQuery) ||
    t.village?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split into Active vs Completed
  const activeTasks = filteredTasks.filter(t => t.status !== 'completed');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  // KPI Calculations
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'under_review' || t.status === 'planned').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const criticalCount = tasks.filter(t => t.urgency === 'critical' || t.urgency === 'high').length;

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]">High</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.2)]">Medium</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] uppercase">Completed</span>;
      case 'planned':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)] uppercase">Assigned</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)] uppercase animate-pulse">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-slate-800 text-slate-400 border border-slate-700 uppercase">{status}</span>;
    }
  };

  const renderTaskCard = (t: Suggestion, idx: number) => (
    <motion.div
      key={t.id}
      layout
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.2, delay: idx * 0.05 }}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all group relative overflow-hidden flex flex-col"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full pointer-events-none group-hover:bg-blue-500/15 transition-all duration-300" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest bg-slate-950 px-2 py-1 rounded-lg border border-white/5">
            #{t.id.substring(0,8)}
          </span>
          <div className="flex items-center space-x-1.5">
            {getUrgencyBadge(t.urgency)}
            {getStatusBadge(t.status)}
          </div>
        </div>

        <h3 className="font-bold text-white text-[13px] leading-snug group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
          <Link href={`/department/tasks/${t.id}`}>{t.title}</Link>
        </h3>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-bold">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {t.village ? (t.village.length > 10 ? t.village.substring(0,10)+'...' : t.village) : 'City'}
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <IndianRupee className="w-3 h-3" />
              {t.estimated_cost_lakhs || 0}L
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={t.status}
              onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
              className="bg-slate-950 border border-white/10 text-slate-300 text-[10px] rounded-lg px-2 py-1 outline-none focus:border-blue-500/50 cursor-pointer uppercase font-bold tracking-wider"
              onClick={(e) => e.stopPropagation()} // prevent link navigation if placed over it
            >
              <option value="planned">Assigned</option>
              <option value="under_review">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <Link
              href={`/department/tasks/${t.id}`}
              className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-400 hover:text-white transition-colors"
            >
              <span>Execute</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-10 font-sans">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center space-x-3 tracking-tight">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <span>Execution Dashboard</span>
          </h2>
          <p className="text-sm text-slate-450 mt-2 font-medium">Audit assignments, report field updates, and transition development milestones.</p>
        </div>
      </div>

      {/* KPI stats section - Premium Floating Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Assigned Projects', count: totalTasks, icon: <ClipboardCheck className="w-6 h-6 text-blue-400" />, shadowGlow: 'shadow-[0_0_40px_rgba(59,130,246,0.1)]', iconBg: 'bg-blue-500/10' },
          { label: 'Active Workloads', count: pendingCount, icon: <Clock className="w-6 h-6 text-amber-400 animate-pulse" />, shadowGlow: 'shadow-[0_0_40px_rgba(245,158,11,0.1)]', iconBg: 'bg-amber-500/10' },
          { label: 'Completed Deliveries', count: completedCount, icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />, shadowGlow: 'shadow-[0_0_40px_rgba(16,185,129,0.1)]', iconBg: 'bg-emerald-500/10' },
          { label: 'High Priority Alerts', count: criticalCount, icon: <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" style={{ animationDuration: '3s' }} />, shadowGlow: 'shadow-[0_0_40px_rgba(244,63,94,0.15)]', iconBg: 'bg-rose-500/10' }
        ].map((kpi, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={kpi.label} 
            className={`group p-6 bg-slate-900/40 backdrop-blur-3xl rounded-3xl flex items-center justify-between transition-all duration-500 relative overflow-hidden ${kpi.shadowGlow} border border-white/5 hover:bg-slate-900/60`}
          >
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">{kpi.label}</span>
              <span className="text-4xl font-black text-white block tracking-tighter">{kpi.count}</span>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${kpi.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative z-10`}>
              {kpi.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Global Search Bar */}
      <div className="bg-slate-900/40 backdrop-blur-2xl rounded-2xl p-4 border border-white/5 shadow-xl">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by project name, ID, or village..."
            className="w-full bg-slate-950/50 border border-white/5 text-sm text-white pl-12 pr-4 py-3 rounded-xl outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium shadow-inner"
          />
        </div>
      </div>

      {/* Two Column Task Arena */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Layers className="w-10 h-10 text-blue-500/50 animate-bounce" />
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Loading execution workloads...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/20 border border-dashed border-white/10 p-16 rounded-[32px] text-center space-y-4 shadow-inner">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-6 h-6 text-slate-600" />
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest">No Workloads Found</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">No tasks match your search query.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Active Workloads Column */}
          <div className="space-y-4 bg-slate-900/20 p-5 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Active Assignments
              </h3>
              <span className="text-[10px] font-black text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md border border-white/5">
                {activeTasks.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {activeTasks.map((t, idx) => renderTaskCard(t, idx))}
              </AnimatePresence>
            </div>
            
            {activeTasks.length === 0 && (
              <div className="text-center py-10 text-xs text-slate-500 font-bold border border-dashed border-white/5 rounded-2xl">
                No active assignments.
              </div>
            )}
          </div>

          {/* Completed Workloads Column */}
          <div className="space-y-4 bg-slate-900/20 p-5 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed Workloads
              </h3>
              <span className="text-[10px] font-black text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md border border-white/5">
                {completedTasks.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {completedTasks.map((t, idx) => renderTaskCard(t, idx))}
              </AnimatePresence>
            </div>

            {completedTasks.length === 0 && (
              <div className="text-center py-10 text-xs text-slate-500 font-bold border border-dashed border-white/5 rounded-2xl">
                No completed workloads.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
