'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, Clock, CheckCircle2, ShieldAlert, Sparkles, 
  MapPin, IndianRupee, Search, Filter, Calendar, AlertTriangle, ArrowRight,
  TrendingUp, Activity
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
  const [statusFilter, setStatusFilter] = useState('all');

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

  if (!session) return null;

  // Filter tasks based on filters
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id.substring(0,8).includes(searchQuery) ||
                          t.village?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'pending' && (t.status === 'planned' || t.status === 'under_review')) ||
                          (statusFilter === 'in_progress' && t.status === 'under_review' && t.timeline && t.timeline.length > 2) ||
                          t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'under_review' || t.status === 'planned').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const criticalCount = tasks.filter(t => t.urgency === 'critical' || t.urgency === 'high').length;

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
        return <span className="px-2 py-0.5 rounded text-[8px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">Assigned</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase animate-pulse">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[8px] font-black bg-slate-800 text-slate-400 border border-slate-700 uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span>Execution Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Audit assignments, report field updates, and transition development milestones.</p>
        </div>
      </div>

      {/* KPI stats section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Projects', count: totalTasks, icon: <ClipboardCheck className="w-5 h-5 text-blue-450" />, glow: 'group-hover:border-blue-500/40 border-blue-500/15 shadow-blue-500/5 hover:shadow-blue-500/10', bg: 'from-blue-600/10 via-transparent to-transparent' },
          { label: 'Active Workloads', count: pendingCount, icon: <Clock className="w-5 h-5 text-amber-450 animate-pulse" />, glow: 'group-hover:border-amber-500/40 border-amber-500/15 shadow-amber-500/5 hover:shadow-amber-500/10', bg: 'from-amber-600/10 via-transparent to-transparent' },
          { label: 'Completed Deliveries', count: completedCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-450" />, glow: 'group-hover:border-emerald-500/40 border-emerald-500/15 shadow-emerald-500/5 hover:shadow-emerald-500/10', bg: 'from-emerald-600/10 via-transparent to-transparent' },
          { label: 'High Priority Alerts', count: criticalCount, icon: <AlertTriangle className="w-5 h-5 text-rose-450 animate-bounce" style={{ animationDuration: '3s' }} />, glow: 'group-hover:border-rose-500/40 border-rose-500/15 shadow-rose-500/5 hover:shadow-rose-500/10', bg: 'from-rose-600/10 via-transparent to-transparent' }
        ].map(kpi => (
          <motion.div 
            key={kpi.label} 
            whileHover={{ y: -4, scale: 1.01 }}
            className={`group p-5 bg-[#0b1329]/65 backdrop-blur-md border rounded-2xl flex items-center justify-between shadow-xl transition-all duration-355 relative overflow-hidden ${kpi.glow}`}
          >
            <div className={`absolute inset-0 bg-linear-to-br ${kpi.bg} -z-10`} />
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{kpi.label}</span>
              <span className="text-3xl font-extrabold text-white block mt-1.5 tracking-tight">{kpi.count}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800/80 group-hover:scale-105 group-hover:bg-slate-900 transition-all">
              {kpi.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters row */}
      <div className="bg-[#0b1329]/40 backdrop-blur-md rounded-2xl p-4.5 border border-slate-850 flex flex-wrap items-center justify-between gap-5">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-550" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by project name, ID, or village..."
            className="w-full bg-[#080d1e] border border-slate-800 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all font-semibold"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-black text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Workflow Filter:</span>
          </div>
          <div className="flex bg-[#080d1e] rounded-xl p-1.5 border border-slate-800/80">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'pending', label: 'Pending / Planned' },
              { id: 'under_review', label: 'In Progress' },
              { id: 'completed', label: 'Completed' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all cursor-pointer ${
                  statusFilter === tab.id 
                    ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10 border border-blue-400/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task card list */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
          Loading assigned department tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-[#070d1e]/40 border border-slate-850 p-16 rounded-3xl text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Workloads Found</h3>
          <p className="text-xs text-slate-500">There are no matching task cards assigned under this filter query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map(t => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ duration: 0.25 }}
                className="bg-[#0b1329]/50 backdrop-blur-sm border border-slate-850 hover:border-blue-500/25 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-950/10 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Subtle card highlight light glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-all" />
                
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-3.5 mb-3.5">
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Task #{t.id.substring(0,8)}</span>
                    <div className="flex items-center space-x-1.5">
                      {getUrgencyBadge(t.urgency)}
                      {getStatusBadge(t.status)}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-white text-xs leading-snug group-hover:text-blue-405 transition-colors">
                    <Link href={`/department/tasks/${t.id}`}>{t.title}</Link>
                  </h3>
                  
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 bg-slate-900/40 border border-slate-850/50 p-3.5 rounded-2xl mt-4 text-[10px] text-slate-350">
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Field Location</span>
                      <p className="flex items-center space-x-1 font-bold text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{t.village || 'Hazratganj'}, {t.block || 'Lucknow Central'}</span>
                      </p>
                    </div>
                    <div className="space-y-1.5 border-l border-slate-850 pl-4">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Fund Allocated</span>
                      <p className="flex items-center space-x-1 font-mono font-black text-amber-400">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{t.estimated_cost_lakhs || 0} Lakhs</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-5">
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Assigned: {new Date(t.created_at).toLocaleDateString('en-IN')}</span>
                  </div>

                  <Link
                    href={`/department/tasks/${t.id}`}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all cursor-pointer"
                  >
                    <span>Execute Console</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
