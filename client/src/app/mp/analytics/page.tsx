'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AnalyticsData {
  categoryChart: { name: string; value: number }[];
  villageChart: { name: string; value: number }[];
  urgencyChart: { name: string; value: number }[];
  statusChart: { name: string; value: number }[];
  monthlyTrends: { month: string; suggestions: number; completed: number }[];
  budgetChart: { name: string; valueLakhs: number; valueCrore: number }[];
  confidenceScores: { name: string; confidence: number; completeness: number }[];
}

const COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#6366f1', '#ec4899', '#14b8a6', '#eab308', '#64748b', '#f97316', '#a855f7'];
const tooltipStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' };

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/mp/analytics`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <BarChart3 className="w-8 h-8 text-amber-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-amber-400" />
          <span>Analytics Dashboard</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Deep-dive analytics on constituency development data</p>
      </div>

      {/* Row 1: Monthly Trends + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
          <h2 className="text-sm font-bold text-white mb-5">Suggestion Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyTrends}>
              <defs>
                <linearGradient id="suggGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Area type="monotone" dataKey="suggestions" stroke="#8b5cf6" fill="url(#suggGrad)" strokeWidth={2} name="Suggestions" />
              <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#compGrad)" strokeWidth={2} name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
          <h2 className="text-sm font-bold text-white mb-5">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.categoryChart} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" stroke="none" paddingAngle={2}>
                {data.categoryChart.map((_, idx) => (
                  <Cell key={`cat-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {data.categoryChart.map((c, i) => (
              <div key={c.name} className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] text-slate-400 truncate">{c.name}</span>
                <span className="text-[10px] font-bold text-slate-300 ml-auto">{c.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: Budget by Category + Urgency Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
          <h2 className="text-sm font-bold text-white mb-5">Budget Requirement by Category (₹ Crore)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.budgetChart} margin={{ left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`₹${value} Cr`, 'Budget']} />
              <Bar dataKey="valueCrore" radius={[6, 6, 0, 0]}>
                {data.budgetChart.map((_, idx) => (
                  <Cell key={`bud-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
          <h2 className="text-sm font-bold text-white mb-5">Urgency & Status Distribution</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-wider">By Urgency</p>
              {data.urgencyChart.map((u, i) => {
                const colors: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
                const total = data.urgencyChart.reduce((s, v) => s + v.value, 0);
                return (
                  <div key={u.name} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-300 capitalize">{u.name}</span>
                      <span className="text-xs font-bold text-slate-300">{u.value}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(u.value / total) * 100}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: colors[u.name] || '#64748b' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-wider">By Status</p>
              {data.statusChart.map((s, i) => {
                const total = data.statusChart.reduce((sum, v) => sum + v.value, 0);
                return (
                  <div key={s.name} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-300 capitalize">{s.name.replace('_', ' ')}</span>
                      <span className="text-xs font-bold text-slate-300">{s.value}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.value / total) * 100}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: COLORS[(i + 3) % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 3: Village Comparison + AI Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
          <h2 className="text-sm font-bold text-white mb-5">Suggestions by Village</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.villageChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.villageChart.map((_, idx) => (
                  <Cell key={`vil-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
          <h2 className="text-sm font-bold text-white mb-5">AI Confidence vs Completeness</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.confidenceScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 8 }} angle={-45} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} name="Confidence" />
              <Line type="monotone" dataKey="completeness" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} name="Completeness" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
