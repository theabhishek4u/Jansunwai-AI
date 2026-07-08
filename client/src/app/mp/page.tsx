'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, FileText, AlertTriangle, Activity,
  Wallet, HeartPulse, TrendingUp, Clock,
  Bot, Trophy, BarChart3, ChevronRight,
  ArrowUp, ArrowDown, Sparkles, Building2,
  ListTodo, Check, AlertCircle, Play,
  Shield, Layers, TrendingDown, Droplets,
  GraduationCap, Flame, Lightbulb, UserCheck, Zap, Award,
  MapPin, Landmark
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

interface DashboardStats {
  citizenCount: number;
  totalComplaints: number;
  highPriority: number;
  activeProjects: number;
  completed: number;
  pendingReview: number;
  totalBeneficiaries: number;
  totalCostLakhs: number;
  budgetAllocated: number;
  budgetUsed: number;
  budgetUtilization: number;
  constituencyHealthScore: number;
  developmentIndex: number;
}

interface HealthData {
  overallScore: number;
  grade: string;
  factors: { name: string; score: number; max: number; status: string }[];
  recommendations: string[];
}

interface PriorityItem {
  id: string;
  title: string;
  category: string;
  village: string;
  district: string;
  priorityScore: number;
  populationAffected: number;
  supporters: number;
  urgency: string;
  estimatedCostLakhs: number;
}

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#6366f1', '#ec4899', '#14b8a6', '#eab308', '#64748b'];

const urgencyColor: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border border-red-500/20',
  high: 'text-orange-400 bg-orange-500/10 border border-orange-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20',
  low: 'text-green-400 bg-green-500/10 border border-green-500/20'
};

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

export default function MpDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supportedProposals, setSupportedProposals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<{ categoryChart: CategoryData[]; villageChart: CategoryData[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/mp/dashboard-stats`).then(r => r.json()),
      fetch(`${API}/api/mp/constituency-health`).then(r => r.json()),
      fetch(`${API}/api/mp/priority-engine`).then(r => r.json()),
      fetch(`${API}/api/mp/analytics`).then(r => r.json()),
      fetch(`${API}/api/suggestions`).then(r => r.json()),
    ]).then(([s, h, p, a, sug]) => {
      setStats(s);
      setHealth(h);
      setPriorities(p.slice(0, 5));
      setAnalytics(a);
      if (Array.isArray(sug)) {
        const sorted = [...sug].sort((x, y) => {
          const scoreX = x.consensus_score || 0;
          const scoreY = y.consensus_score || 0;
          if (scoreY !== scoreX) return scoreY - scoreX;
          return (y.support_count || y.supporters || 0) - (x.support_count || x.supporters || 0);
        });
        setSupportedProposals(sorted.slice(0, 10));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500 to-amber-700 animate-pulse flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Loading Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Registered Citizens', value: stats?.citizenCount || 0, icon: <Users className="w-5 h-5" />, color: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400', change: '+12%', sparkline: [{ v: 20 }, { v: 22 }, { v: 24 }, { v: 25 }, { v: 27 }, { v: 30 }], lineColor: '#3b82f6' },
    { label: 'Total Complaints', value: stats?.totalComplaints || 0, icon: <FileText className="w-5 h-5" />, color: 'from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400', change: '+8%', sparkline: [{ v: 12 }, { v: 14 }, { v: 15 }, { v: 18 }, { v: 17 }, { v: 22 }], lineColor: '#8b5cf6' },
    { label: 'High Priority', value: stats?.highPriority || 0, icon: <AlertTriangle className="w-5 h-5" />, color: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400', change: '-2', sparkline: [{ v: 10 }, { v: 8 }, { v: 7 }, { v: 5 }, { v: 4 }, { v: 3 }], lineColor: '#ef4444' },
    { label: 'Active Projects', value: stats?.activeProjects || 0, icon: <Activity className="w-5 h-5" />, color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400', change: '+3', sparkline: [{ v: 2 }, { v: 3 }, { v: 3 }, { v: 4 }, { v: 5 }, { v: 6 }], lineColor: '#10b981' },
    { label: 'Completed Projects', value: stats?.completed || 0, icon: <Building2 className="w-5 h-5" />, color: 'from-teal-500/20 to-teal-600/5 border-teal-500/20 text-teal-400', change: '+2', sparkline: [{ v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: 3 }, { v: 4 }], lineColor: '#14b8a6' },
    { label: 'Pending Review', value: stats?.pendingReview || 0, icon: <Clock className="w-5 h-5" />, color: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400', change: 'New', sparkline: [{ v: 8 }, { v: 7 }, { v: 9 }, { v: 10 }, { v: 8 }, { v: 7 }], lineColor: '#f59e0b' },
    { label: 'Budget Utilized', value: `${stats?.budgetUtilization || 0}%`, icon: <Wallet className="w-5 h-5" />, color: 'from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400', change: '+5%', sparkline: [{ v: 20 }, { v: 30 }, { v: 42 }, { v: 50 }, { v: 52 }, { v: 57 }], lineColor: '#ec4899' },
    { label: 'Health Score', value: stats?.constituencyHealthScore || 0, icon: <HeartPulse className="w-5 h-5" />, color: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400', change: '+4', sparkline: [{ v: 65 }, { v: 68 }, { v: 70 }, { v: 72 }, { v: 71 }, { v: 72 }], lineColor: '#06b6d4' },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto relative font-sans pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-6 z-50 bg-[#0f172a] border border-amber-500/40 rounded-2xl shadow-2xl p-4 flex items-center space-x-3 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Action Triggered</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/60 pb-4 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-amber-100">Executive Overview</h1>
          <p className="text-xs text-slate-400 mt-1">AI-powered constituency intelligence for data-driven decisions</p>
        </div>
      </div>

      {/* Persistent KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4.5 border border-slate-800/80 hover:border-amber-500/45 transition-all duration-300 group flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className={`w-8 h-8 rounded-xl bg-linear-to-br ${card.color} flex items-center justify-center shadow-md border border-slate-850`}>
                  {card.icon}
                </div>
                {card.change && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md flex items-center space-x-0.5 bg-slate-950 border border-slate-850 ${card.change.startsWith('+') ? 'text-emerald-400' : card.change.startsWith('-') ? 'text-rose-450' : 'text-slate-400'}`}>
                    {card.change.startsWith('+') ? <ArrowUp className="w-2.5 h-2.5" /> : card.change.startsWith('-') ? <ArrowDown className="w-2.5 h-2.5" /> : null}
                    <span>{card.change}</span>
                  </span>
                )}
              </div>
              <p className="text-xl md:text-2xl font-black text-white">{card.value}</p>
            </div>
            <div className="flex items-end justify-between mt-3.5">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">{card.label}</p>
              <div className="w-14 h-6 opacity-60 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={card.sparkline}>
                    <Line type="monotone" dataKey="v" stroke={card.lineColor} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Unified Overview Layout (No Tabs!) */}
      <div className="space-y-8">
        {/* ROW 1: Constituency Health Score & AI Priority Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Constituency Health Score */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between lg:col-span-1 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs uppercase tracking-widest font-black text-slate-455 flex items-center space-x-2">
                  <HeartPulse className="w-4.5 h-4.5 text-cyan-400" />
                  <span>Constituency Health</span>
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide ${health?.grade === 'Good' ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {health?.grade.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#090d1a" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="url(#healthGradient)" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(health?.overallScore || 0) * 3.14} 314`}
                      transform="rotate(-90 60 60)"
                    />
                    <defs>
                      <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{health?.overallScore}</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black mt-0.5">Score / 100</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {health?.factors.slice(0, 4).map((f) => (
                <div key={f.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-455">{f.name}</span>
                    <span className="text-slate-200 font-extrabold">{f.score}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div
                      className={`h-full rounded-full ${f.score >= 70 ? 'bg-emerald-500' : f.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Priority Rankings */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 lg:col-span-2 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-5 border-b border-slate-800/60 pb-3">
              <h2 className="text-xs uppercase tracking-widest font-black text-slate-400 flex items-center space-x-2">
                <Trophy className="w-4.5 h-4.5 text-amber-500" />
                <span>AI Priority Rankings</span>
              </h2>
              <Link href="/mp/priority" className="text-[10px] text-amber-450 hover:text-amber-350 font-black flex items-center space-x-1 uppercase tracking-wider bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-850">
                <span>Analyze Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {priorities.map((p, i) => {
                const isRanked1 = i === 0;
                const isRanked2 = i === 1;
                const isRanked3 = i === 2;
                
                return (
                  <Link
                    href={`/mp/complaints/${p.id}`}
                    key={p.id}
                    className="flex items-center space-x-4 p-3 rounded-2xl bg-slate-955/40 hover:bg-slate-850/50 transition-all border border-slate-900 hover:border-slate-800/80 group cursor-pointer hover:translate-x-1 duration-200"
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                      isRanked1 
                        ? 'bg-linear-to-br from-amber-300 via-yellow-500 to-amber-600 text-slate-950 shadow-md shadow-yellow-500/10' 
                        : isRanked2
                          ? 'bg-linear-to-br from-slate-200 via-slate-400 to-slate-500 text-slate-950'
                          : isRanked3
                            ? 'bg-linear-to-br from-amber-600 via-amber-700 to-amber-900 text-white'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      <span>#{i + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-400 transition-colors leading-relaxed">{p.title}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[9px] font-semibold text-slate-500">
                        <span className="text-slate-300 bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded-md">{p.village}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          {getCategoryIcon(p.category)}
                          <span className="uppercase tracking-wider">{p.category}</span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-450">{p.populationAffected.toLocaleString()} affected</span>
                        <span>•</span>
                        <span className="text-indigo-400/90 font-black flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5 text-indigo-500" />
                          {p.supporters} Supporters
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3.5 shrink-0 pl-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                        p.urgency === 'critical' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.05)] animate-pulse' :
                        p.urgency === 'high' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                        p.urgency === 'medium' ? 'text-yellow-455 bg-yellow-500/10 border-yellow-500/20' :
                        'text-green-450 bg-green-500/10 border-green-500/20'
                      }`}>
                        {p.urgency}
                      </span>
                      
                      <div className="text-right">
                        <p className="text-xs font-black text-amber-400">{p.priorityScore}<span className="text-[8px] text-slate-655 font-bold">/100</span></p>
                        <p className="text-[7px] text-slate-500 uppercase font-black tracking-wider">AI Priority</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>



        {/* ROW 3: Complaint Categories (Pie Chart) & Complaints by Village (Bar Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-800/40 pt-6">
          {/* Category Distribution */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between shadow-2xl">
            <h2 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-5 flex items-center space-x-2">
              <BarChart3 className="w-4.5 h-4.5 text-violet-400" />
              <span>Complaint Categories</span>
            </h2>
            {analytics?.categoryChart && (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={analytics.categoryChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                    paddingAngle={3}
                  >
                    {analytics.categoryChart.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0d1220', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-900">
              {analytics?.categoryChart.map((c, i) => (
                <div key={c.name} className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] text-slate-300 truncate grow font-semibold flex items-center gap-1">
                    {getCategoryIcon(c.name)}
                    {c.name}
                  </span>
                  <span className="text-[10px] font-black text-slate-105 ml-auto">{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Complaints by Village */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-2xl">
            <h2 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-5 flex items-center space-x-2">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
              <span>Complaints by Village</span>
            </h2>
            {analytics?.villageChart && (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.villageChart} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0d1220', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {analytics.villageChart.map((_, idx) => (
                      <Cell key={`bar-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
