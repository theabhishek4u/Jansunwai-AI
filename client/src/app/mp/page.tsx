'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, FileText, AlertTriangle, Activity,
  Wallet, HeartPulse, TrendingUp, Clock,
  Bot, Trophy, BarChart3, ChevronRight,
  ArrowUp, ArrowDown, Sparkles, Building2,
  ListTodo, Check, AlertCircle, Play
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export default function MpDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [supportedProposals, setSupportedProposals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<{ categoryChart: CategoryData[]; villageChart: CategoryData[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'demographics' | 'insights'>('summary');
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
    <div className="space-y-6 max-w-[1400px] mx-auto relative font-sans">
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-amber-100">Executive Overview</h1>
          <p className="text-xs text-slate-400 mt-1">AI-powered constituency intelligence for data-driven decisions</p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Link href="/mp/copilot" className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-violet-500/20 transition-all">
            <Bot className="w-4 h-4" />
            <span>Ask AI Copilot</span>
          </Link>
          <Link href="/mp/budget" className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all border border-slate-700">
            <Wallet className="w-4 h-4" />
            <span>Plan Budget</span>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 p-1 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800/80 max-w-md">
        {[
          { id: 'summary', label: 'Summary', icon: <Trophy className="w-3.5 h-3.5" /> },
          { id: 'demographics', label: 'Demographics & Charts', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { id: 'insights', label: 'AI Actions & Insights', icon: <Sparkles className="w-3.5 h-3.5" /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all w-full justify-center ${
              activeTab === t.id
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Persistent KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0d1220]/80 rounded-2xl p-4 border border-slate-800/40 hover:border-amber-500/30 transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl bg-linear-to-br ${card.color} flex items-center justify-center shadow-lg border border-slate-800/60`}>
                  {card.icon}
                </div>
                {card.change && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center space-x-0.5 bg-slate-900 border border-slate-800 ${card.change.startsWith('+') ? 'text-emerald-400' : card.change.startsWith('-') ? 'text-red-400' : 'text-slate-400'}`}>
                    {card.change.startsWith('+') ? <ArrowUp className="w-2.5 h-2.5" /> : card.change.startsWith('-') ? <ArrowDown className="w-2.5 h-2.5" /> : null}
                    <span>{card.change}</span>
                  </span>
                )}
              </div>
              <p className="text-xl md:text-2xl font-black text-white">{card.value}</p>
            </div>
            <div className="flex items-end justify-between mt-3">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">{card.label}</p>
              <div className="w-14 h-6 opacity-60 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={card.sparkline}>
                    <Line type="monotone" dataKey="v" stroke={card.lineColor} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Constituency Health Score */}
              <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50 flex flex-col justify-between lg:col-span-1">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 flex items-center space-x-2">
                      <HeartPulse className="w-4 h-4 text-cyan-400" />
                      <span>Constituency Health</span>
                    </h2>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${health?.grade === 'Good' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {health?.grade.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-36 h-36">
                      <svg viewBox="0 0 120 120" className="w-full h-full">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#111827" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="50" fill="none"
                          stroke="url(#healthGradient)" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${(health?.overallScore || 0) * 3.14} 314`}
                          transform="rotate(-90 60 60)"
                        />
                        <defs>
                          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#d97706" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{health?.overallScore}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Score / 100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {health?.factors.slice(0, 4).map((f) => (
                    <div key={f.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 font-semibold">{f.name}</span>
                        <span className="text-[10px] font-black text-slate-200">{f.score}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${f.score >= 70 ? 'bg-emerald-500' : f.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${f.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Priority Rankings */}
              <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50 lg:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>AI Priority Rankings</span>
                  </h2>
                  <Link href="/mp/priority" className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1">
                    <span>Analyze Engine</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {priorities.map((p, i) => (
                    <Link
                      href={`/mp/complaints/${p.id}`}
                      key={p.id}
                      className="flex items-center space-x-4 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/30 transition-all border border-slate-800/30 hover:border-slate-700/50 group cursor-pointer"
                    >
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center border border-amber-500/10">
                        <span className="text-xs font-black text-amber-400">#{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-400 transition-colors">{p.title}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-[9px] text-slate-500 font-medium">{p.village}, {p.district}</span>
                          <span className="text-[9px] text-slate-700">•</span>
                          <span className="text-[9px] text-slate-500 font-medium">{p.category}</span>
                          <span className="text-[9px] text-slate-700">•</span>
                          <span className="text-[9px] text-amber-500/60 font-semibold">{p.populationAffected.toLocaleString()} affected</span>
                          <span className="text-[9px] text-slate-700">•</span>
                          <span className="text-[9px] text-indigo-400/80 font-bold flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" />
                            {p.supporters} Complaints
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${urgencyColor[p.urgency]}`}>
                          {p.urgency}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-black text-amber-400">{p.priorityScore}</p>
                          <p className="text-[7px] text-slate-500 uppercase font-black">Score</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Most Supported Development Proposals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Most Supported Development Proposals</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium">Ranked by community consensus score and citizen support volume</p>
                  </div>
                  <span className="text-[9px] text-slate-400 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-full font-bold">
                    Top 10 High Consensus
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {supportedProposals.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/30 border border-slate-850 hover:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                        <div className="shrink-0 w-7 h-7 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center font-extrabold text-[10px] text-indigo-400">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/mp/complaints/${p.id}`} className="text-xs font-bold text-slate-200 hover:text-indigo-400 hover:underline truncate block">
                            {p.title}
                          </Link>
                          <div className="flex items-center space-x-2 mt-1 text-[9px] text-slate-500 font-medium">
                            <span className="text-indigo-400/90 font-bold">{p.category}</span>
                            <span>•</span>
                            <span>{p.village || 'Varanasi'}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">👍 {p.support_count || p.supporters || 0} Citizens</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 shrink-0 pl-3">
                        <div className="text-right">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Consensus</span>
                          <span className="text-xs font-black text-indigo-400">{p.consensus_score || 70}/100</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border tracking-wider ${
                          p.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                          p.status === 'planned' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' :
                          'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        }`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Engagement Insights Guide */}
              <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50 lg:col-span-1 space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-black text-slate-400 flex items-center space-x-2 border-b border-slate-800/60 pb-3">
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span>Consensus Engine Rules</span>
                </h3>
                <div className="space-y-3.5 text-[11px] leading-relaxed text-slate-400">
                  <p>
                    Jansunwai AI calculates the <strong className="text-slate-200">Community Consensus Score</strong> out of 100 based on four grounded pillars:
                  </p>
                  <ul className="space-y-2 list-disc pl-4 text-slate-400">
                    <li><strong className="text-indigo-400">Citizen Support (40%):</strong> Total verified resident signatures backing the request.</li>
                    <li><strong className="text-amber-400">Mukhiya Support (25%):</strong> Endorsements from the local Village Head.</li>
                    <li><strong className="text-cyan-400">MLA Recommendation (20%):</strong> Assembly Level MLA routing sanction.</li>
                    <li><strong className="text-rose-400">AI Impact Score (15%):</strong> Need urgency derived from nearest infrastructure deficit.</li>
                  </ul>
                  <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl text-[10px] text-slate-500 leading-normal">
                    💡 <strong>Planning Tip:</strong> Direct development funds towards proposals with consensus scores exceeding <strong>85</strong> to maximize public satisfaction and HDI indicators.
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'demographics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50 flex flex-col justify-between">
                <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 mb-5 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
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
                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4">
                  {analytics?.categoryChart.map((c, i) => (
                    <div key={c.name} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] text-slate-400 truncate">{c.name}</span>
                      <span className="text-[10px] font-black text-slate-300 ml-auto">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complaints by Village */}
              <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50">
                <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 mb-5 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Complaints by Village</span>
                </h2>
                {analytics?.villageChart && (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={analytics.villageChart} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {analytics.villageChart.map((_, idx) => (
                          <Cell key={`bar-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Recommendations */}
              <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50">
                <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>AI Recommendations</span>
                </h2>
                <div className="space-y-3">
                  {health?.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start justify-between p-3.5 rounded-xl bg-violet-500/5 border border-violet-500/10 group/item">
                      <div className="flex space-x-3">
                        <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-violet-400">{i + 1}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-[85%]">{rec}</p>
                      </div>
                      <button
                        onClick={() => triggerToast(`AI Initiated order tracking for: "${rec.substring(0, 40)}..."`)}
                        className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:text-white hover:bg-violet-600 shrink-0 self-center opacity-40 group-hover/item:opacity-100 transition-opacity"
                        title="Take Action"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#0d1220]/80 rounded-2xl p-6 border border-slate-800/50">
                <h2 className="text-xs uppercase tracking-wider font-black text-slate-400 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { href: '/mp/complaints', label: 'Review Complaints', desc: `${stats?.pendingReview || 0} pending`, icon: <ListTodo className="w-5 h-5" />, color: 'from-blue-500/15 to-blue-500/5 border-blue-500/25 text-blue-400 hover:border-blue-500/50' },
                    { href: '/mp/copilot', label: 'Ask AI Copilot', desc: 'Natural language queries', icon: <Bot className="w-5 h-5" />, color: 'from-violet-500/15 to-violet-500/5 border-violet-500/25 text-violet-400 hover:border-violet-500/50' },
                    { href: '/mp/budget', label: 'Plan Budget', desc: `₹${((stats?.totalCostLakhs || 0) / 100).toFixed(0)} Cr needed`, icon: <Wallet className="w-5 h-5" />, color: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/25 text-emerald-400 hover:border-emerald-500/50' },
                    { href: '/mp/map', label: 'View Heatmap', desc: 'Constituency map layers', icon: <BarChart3 className="w-5 h-5" />, color: 'from-amber-500/15 to-amber-500/5 border-amber-500/25 text-amber-400 hover:border-amber-500/50' },
                  ].map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex flex-col items-center justify-center text-center p-5 rounded-xl bg-linear-to-br border hover:scale-[1.02] transition-all duration-300 shadow-sm shadow-slate-950 text-slate-200 border-slate-800"
                      style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.2) 0%, rgba(30, 41, 59, 0.05) 100%)' }}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-900/60 flex items-center justify-center border border-slate-800">
                        {action.icon}
                      </div>
                      <p className="text-xs font-bold mt-3 text-slate-200">{action.label}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{action.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
