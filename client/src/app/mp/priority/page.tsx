'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, MapPin, Users, ChevronRight, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface PriorityItem {
  id: string;
  title: string;
  category: string;
  village: string;
  urgency: string;
  status: string;
  priorityScore: number;
  populationAffected: number;
  supporters: number;
  estimatedCostLakhs: number;
  aiCompleteness: number;
  aiConfidence: number;
}

const urgencyBadge: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400',
  high: 'bg-orange-500/10 text-orange-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  low: 'bg-green-500/10 text-green-400',
};

const COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#6366f1', '#ec4899', '#14b8a6', '#eab308', '#64748b'];

export default function PriorityEnginePage() {
  const [items, setItems] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/mp/priority-engine`)
      .then(r => r.json())
      .then(data => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
      </div>
    );
  }

  const top10 = items.slice(0, 10).map(i => ({
    name: i.title.length > 25 ? i.title.substring(0, 25) + '...' : i.title,
    score: i.priorityScore
  }));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span>AI Priority Engine</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Projects ranked by composite AI score: urgency × supporters × completeness × infrastructure gap</p>
      </div>

      {/* Top 10 Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
        <h2 className="text-sm font-bold text-white mb-4">Top 10 Projects by Priority Score</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={top10} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={180} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' }} />
            <Bar dataKey="score" radius={[0, 8, 8, 0]}>
              {top10.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Full Ranking Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111827] rounded-2xl border border-slate-800/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-sm font-bold text-white">Full Priority Rankings ({items.length} projects)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Village</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Urgency</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">People</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supporters</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cost (₹L)</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Score</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors cursor-pointer ${hoveredItem === item.id ? 'bg-slate-800/30' : ''}`}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-black ${i < 3 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-slate-200 truncate max-w-[250px]">{item.title}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{item.category}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span>{item.village}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${urgencyBadge[item.urgency]}`}>{item.urgency}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300 font-medium">{item.populationAffected.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="flex items-center justify-end space-x-1 text-slate-300">
                      <Users className="w-3 h-3" />
                      <span>{item.supporters.toLocaleString()}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">₹{item.estimatedCostLakhs}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-black text-amber-400">{item.priorityScore}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/mp/complaints/${item.id}`} className="text-slate-600 hover:text-amber-400 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* AI Reasoning Note */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
        <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-violet-300 mb-1">How AI Priority Score Works</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The priority score (0–100) is computed from 4 weighted factors: <span className="text-violet-300">Urgency Level (25%)</span> — critical=100, high=75; <span className="text-violet-300">Citizen Supporters (25%)</span> — more supporters = higher community demand; <span className="text-violet-300">AI Completeness (25%)</span> — quality of the suggestion submission; <span className="text-violet-300">Population Impact (25%)</span> — estimated number of beneficiaries.
          </p>
        </div>
      </div>
    </div>
  );
}
