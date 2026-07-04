'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, FileText, AlertTriangle, Activity,
  Wallet, HeartPulse, TrendingUp, Clock,
  Bot, Trophy, BarChart3, ChevronRight,
  ArrowUp, ArrowDown, Sparkles, Building2,
  ListTodo
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface DashboardStats {
  citizenCount: number;
  totalSuggestions: number;
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
  critical: 'text-red-400 bg-red-500/10',
  high: 'text-orange-400 bg-orange-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  low: 'text-green-400 bg-green-500/10'
};

export default function MpDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [analytics, setAnalytics] = useState<{ categoryChart: CategoryData[]; villageChart: CategoryData[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/mp/dashboard-stats`).then(r => r.json()),
      fetch(`${API}/api/mp/constituency-health`).then(r => r.json()),
      fetch(`${API}/api/mp/priority-engine`).then(r => r.json()),
      fetch(`${API}/api/mp/analytics`).then(r => r.json()),
    ]).then(([s, h, p, a]) => {
      setStats(s);
      setHealth(h);
      setPriorities(p.slice(0, 5));
      setAnalytics(a);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 animate-pulse flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-400 text-sm">Loading Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Registered Citizens', value: stats?.citizenCount || 0, icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-blue-700', change: '+12%' },
    { label: 'Total Suggestions', value: stats?.totalSuggestions || 0, icon: <FileText className="w-5 h-5" />, color: 'from-violet-500 to-violet-700', change: '+8%' },
    { label: 'High Priority', value: stats?.highPriority || 0, icon: <AlertTriangle className="w-5 h-5" />, color: 'from-red-500 to-red-700', change: '-2' },
    { label: 'Active Projects', value: stats?.activeProjects || 0, icon: <Activity className="w-5 h-5" />, color: 'from-emerald-500 to-emerald-700', change: '+3' },
    { label: 'Completed', value: stats?.completed || 0, icon: <Building2 className="w-5 h-5" />, color: 'from-teal-500 to-teal-700', change: '+2' },
    { label: 'Pending Review', value: stats?.pendingReview || 0, icon: <Clock className="w-5 h-5" />, color: 'from-amber-500 to-amber-700', change: '' },
    { label: 'Budget Used', value: `${stats?.budgetUtilization || 0}%`, icon: <Wallet className="w-5 h-5" />, color: 'from-pink-500 to-pink-700', change: '+5%' },
    { label: 'Health Score', value: stats?.constituencyHealthScore || 0, icon: <HeartPulse className="w-5 h-5" />, color: 'from-cyan-500 to-cyan-700', change: '+4' },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Executive Overview</h1>
          <p className="text-sm text-slate-400 mt-1">AI-powered constituency intelligence for data-driven decisions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/mp/copilot" className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-violet-500/20 transition-all">
            <Bot className="w-4 h-4" />
            <span>Ask AI Copilot</span>
          </Link>
          <Link href="/mp/budget" className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all border border-slate-700">
            <Wallet className="w-4 h-4" />
            <span>Plan Budget</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#111827] rounded-2xl p-4 border border-slate-800/50 hover:border-slate-700/80 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                {card.icon}
              </div>
              {card.change && (
                <span className={`text-[10px] font-semibold flex items-center space-x-0.5 ${card.change.startsWith('+') ? 'text-emerald-400' : card.change.startsWith('-') ? 'text-red-400' : 'text-slate-500'}`}>
                  {card.change.startsWith('+') ? <ArrowUp className="w-3 h-3" /> : card.change.startsWith('-') ? <ArrowDown className="w-3 h-3" /> : null}
                  <span>{card.change}</span>
                </span>
              )}
            </div>
            <p className="text-xl md:text-2xl font-bold text-white">{card.value}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Constituency Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <HeartPulse className="w-4 h-4 text-cyan-400" />
              <span>Constituency Health</span>
            </h2>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${health?.grade === 'Good' ? 'bg-emerald-500/10 text-emerald-400' : health?.grade === 'Needs Improvement' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
              {health?.grade}
            </span>
          </div>

          {/* Health Gauge */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="url(#healthGradient)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(health?.overallScore || 0) * 3.14} 314`}
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{health?.overallScore}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">/ 100</span>
              </div>
            </div>
          </div>

          {/* Factor Bars */}
          <div className="space-y-2.5">
            {health?.factors.map((f) => (
              <div key={f.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 font-medium">{f.name}</span>
                  <span className="text-[10px] font-bold text-slate-300">{f.score}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.score}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className={`h-full rounded-full ${f.score >= 75 ? 'bg-emerald-500' : f.score >= 55 ? 'bg-amber-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Priority Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>AI Priority Rankings</span>
            </h2>
            <Link href="/mp/priority" className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1">
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {priorities.map((p, i) => (
              <Link
                href={`/mp/suggestions/${p.id}`}
                key={p.id}
                className="flex items-center space-x-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-all group cursor-pointer"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                  <span className="text-xs font-black text-amber-400">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{p.title}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-[10px] text-slate-500">{p.village}</span>
                    <span className="text-[10px] text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500">{p.category}</span>
                    <span className="text-[10px] text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500">{p.populationAffected.toLocaleString()} people</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${urgencyColor[p.urgency]}`}>
                    {p.urgency.toUpperCase()}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-black text-amber-400">{p.priorityScore}</p>
                    <p className="text-[8px] text-slate-500 uppercase">Score</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50"
        >
          <h2 className="text-sm font-bold text-white mb-5 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <span>Suggestion Categories</span>
          </h2>
          {analytics?.categoryChart && (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={analytics.categoryChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={3}
                >
                  {analytics.categoryChart.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {analytics?.categoryChart.map((c, i) => (
              <div key={c.name} className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] text-slate-400 truncate">{c.name}</span>
                <span className="text-[10px] font-bold text-slate-300 ml-auto">{c.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Village Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50"
        >
          <h2 className="text-sm font-bold text-white mb-5 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Suggestions by Village</span>
          </h2>
          {analytics?.villageChart && (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={analytics.villageChart} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {analytics.villageChart.map((_, idx) => (
                    <Cell key={`bar-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Quick Actions + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50"
        >
          <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>AI Recommendations</span>
          </h2>
          <div className="space-y-3">
            {health?.recommendations.map((rec, i) => (
              <div key={i} className="flex space-x-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                <div className="w-5 h-5 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-violet-400">{i + 1}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50"
        >
          <h2 className="text-sm font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/mp/suggestions', label: 'Review Suggestions', desc: `${stats?.pendingReview || 0} pending`, icon: <ListTodo className="w-5 h-5" />, color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400' },
              { href: '/mp/copilot', label: 'Ask AI Copilot', desc: 'Natural language queries', icon: <Bot className="w-5 h-5" />, color: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400' },
              { href: '/mp/budget', label: 'Plan Budget', desc: `₹${((stats?.totalCostLakhs || 0) / 100).toFixed(0)} Cr needed`, icon: <Wallet className="w-5 h-5" />, color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400' },
              { href: '/mp/map', label: 'View Heatmap', desc: '6 villages mapped', icon: <BarChart3 className="w-5 h-5" />, color: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex flex-col items-center justify-center text-center p-5 rounded-xl bg-gradient-to-br border hover:scale-[1.02] transition-all ${action.color}`}
              >
                {action.icon}
                <p className="text-xs font-semibold mt-2">{action.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{action.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
