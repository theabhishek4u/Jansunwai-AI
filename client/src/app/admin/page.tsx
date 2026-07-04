'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Activity, Server, Users, FileText,
  AlertTriangle, CheckCircle, Cpu, Wifi,
  HardDrive, Zap, Info, Radio, RefreshCw
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface StatePerformance {
  state: string;
  performanceScore: number;
  activeConstituencies: number;
  suggestions: number;
  activeMps: number;
}

interface CommandStats {
  citizenCount: number;
  totalSuggestions: number;
  highPriority: number;
  activeProjects: number;
  completed: number;
  pendingReview: number;
  totalBeneficiaries: number;
  totalCostLakhs: number;
  activeConstituencies: number;
  aiRequestsProcessed: number;
  serverHealth: string;
  serverCpu: number;
  serverRam: number;
  apiLatency: number;
  activeMpsOnline: number;
  storageUsage: string;
  stateStats: StatePerformance[];
}

// Customized India Map SVG outline data (simplified coordinates for main active states)
const STATE_MAP_NODES = [
  { id: 'IN-UP', name: 'Uttar Pradesh', d: 'M 350 140 C 370 120, 420 150, 440 180 C 420 220, 380 230, 360 210 Z', textX: 380, textY: 175 },
  { id: 'IN-MH', name: 'Maharashtra', d: 'M 220 260 C 260 250, 290 280, 300 320 C 250 350, 200 320, 220 260 Z', textX: 250, textY: 300 },
  { id: 'IN-KA', name: 'Karnataka', d: 'M 230 330 C 250 340, 270 380, 260 420 C 220 400, 210 360, 230 330 Z', textX: 240, textY: 380 },
  { id: 'IN-DL', name: 'Delhi', d: 'M 310 120 C 320 120, 320 130, 310 130 Z', textX: 305, textY: 115 },
  { id: 'IN-BR', name: 'Bihar', d: 'M 450 160 C 480 150, 500 170, 510 190 C 480 210, 450 200, 450 160 Z', textX: 475, textY: 180 },
  { id: 'IN-RJ', name: 'Rajasthan', d: 'M 200 130 C 240 120, 270 150, 280 180 C 230 200, 180 170, 200 130 Z', textX: 230, textY: 155 }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<CommandStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredState, setHoveredState] = useState<StatePerformance | null>(null);
  
  // Real-time ticker logs
  const [suggestionTicker, setSuggestionTicker] = useState<number>(4892);
  const [aiRequestsTicker, setAiRequestsTicker] = useState<number>(15420);
  const [logs, setLogs] = useState<string[]>([
    'AI index completed: Varanasi Census Data 2011',
    'Ingesting public datasets for Uttar Pradesh health registry',
    'Broadcast Alert queued: Maintenance Scheduled for Q3 Server upgrades',
    'Priority Engine synced: 18 active requests re-computed'
  ]);

  useEffect(() => {
    fetch(`${API}/api/admin/command-center-stats`)
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setSuggestionTicker(data.totalSuggestions);
        setAiRequestsTicker(data.aiRequestsProcessed);
        setLoading(false);
      })
      .catch(console.error);

    // Live counts simulated increments
    const interval = setInterval(() => {
      setSuggestionTicker(prev => prev + (Math.random() > 0.6 ? 1 : 0));
      setAiRequestsTicker(prev => prev + Math.floor(Math.random() * 2));
      
      // Inject random log events
      const mockLogs = [
        'AI assessed suggestion: Road repairs in Ramnagar (Completeness 94%)',
        'Duplicate check triggered: Sarnath Water tank installation request',
        'System audit log: MP account status checked',
        'Speech-to-Text: Handled voice suggestion in Bhojpuri (Varanasi block)',
        'Storage footprint: Media attachments sync complete',
        'Gemini API request: Confidence verification for road damage photo'
      ];
      setLogs(prev => [mockLogs[Math.floor(Math.random() * mockLogs.length)], ...prev.slice(0, 3)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 animate-pulse flex items-center justify-center">
            <Radio className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
          <p className="text-slate-400 text-xs tracking-widest font-semibold uppercase">Connecting Operations Center...</p>
        </div>
      </div>
    );
  }

  // Find hover state metrics
  const getHoverStateDetails = (name: string) => {
    return stats.stateStats.find(s => s.state === name) || {
      state: name, performanceScore: 80, activeConstituencies: 1, suggestions: 120, activeMps: 1
    };
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-indigo-400">National Governance Command Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time nationwide overview of Jansunwai AI public demand systems</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Feed Streaming</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cumulative Suggestions', value: suggestionTicker.toLocaleString(), icon: <FileText className="w-5 h-5 text-cyan-400" />, desc: 'Real-time counters' },
          { label: 'AI Processed Requests', value: aiRequestsTicker.toLocaleString(), icon: <Cpu className="w-5 h-5 text-indigo-400" />, desc: 'Gemini 2.5 Flash' },
          { label: 'Active Constituencies', value: stats.activeConstituencies, icon: <Shield className="w-5 h-5 text-amber-400" />, desc: 'Across 5 states' },
          { label: 'System Latency', value: `${stats.apiLatency} ms`, icon: <Wifi className="w-5 h-5 text-emerald-400" />, desc: '99.98% Network Health' },
        ].map((card) => (
          <div key={card.label} className="bg-[#0b1329]/80 rounded-2xl p-4 border border-cyan-500/10 relative overflow-hidden group hover:border-cyan-500/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">{card.label}</span>
              {card.icon}
            </div>
            <p className="text-2xl font-black text-white">{card.value}</p>
            <p className="text-[9px] text-slate-500 mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Interactive Map Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Interactive India Map */}
        <div className="lg:col-span-2 bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-6 relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '520px' }}>
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>State-wise Active Performance</span>
            </h2>
            <p className="text-[10px] text-slate-500">Hover over high-demand state segments to audit stats</p>
          </div>

          {/* India SVG outline wrapper */}
          <div className="flex items-center justify-center flex-1 my-4">
            <svg viewBox="100 80 500 380" className="w-full max-h-[380px]">
              <defs>
                <pattern id="gridPattern" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#162544" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect x="100" y="80" width="500" height="380" fill="url(#gridPattern)" />

              {/* State boundaries */}
              {STATE_MAP_NODES.map((state) => {
                const isHovered = hoveredState?.state === state.name;
                return (
                  <path
                    key={state.id}
                    d={state.d}
                    fill={isHovered ? 'rgba(6, 182, 212, 0.25)' : 'rgba(30, 41, 59, 0.4)'}
                    stroke={isHovered ? '#22d3ee' : '#1e293b'}
                    strokeWidth="1.5"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredState(getHoverStateDetails(state.name))}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                );
              })}

              {/* Text labels on map */}
              {STATE_MAP_NODES.map(s => (
                <text key={s.id} x={s.textX} y={s.textY} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle" className="pointer-events-none uppercase">
                  {s.name.substring(0, 3)}
                </text>
              ))}
            </svg>
          </div>

          {/* Interactive Map Tooltip */}
          <div className="absolute bottom-4 right-4 bg-[#070d1e]/90 backdrop-blur-md rounded-xl p-3 border border-cyan-500/20 w-52 pointer-events-none">
            {hoveredState ? (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{hoveredState.state}</p>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Score:</span>
                  <span className="font-bold text-white">{hoveredState.performanceScore}/100</span>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Constituencies:</span>
                  <span className="font-bold text-white">{hoveredState.activeConstituencies}</span>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Suggestions:</span>
                  <span className="font-bold text-white">{hoveredState.suggestions}</span>
                </div>
              </div>
            ) : (
              <p className="text-[9px] text-slate-500 italic text-center">Hover on map segments to load performance tooltips</p>
            )}
          </div>
        </div>

        {/* Server & AI Operations monitor panel */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>System & Host Health</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <p className="text-[9px] text-slate-500 uppercase font-semibold">Server CPU</p>
                <p className="text-lg font-black text-cyan-400 mt-1">{stats.serverCpu}%</p>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <p className="text-[9px] text-slate-500 uppercase font-semibold">RAM Usage</p>
                <p className="text-lg font-black text-indigo-400 mt-1">{stats.serverRam}%</p>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <p className="text-[9px] text-slate-500 uppercase font-semibold">Database Storage</p>
                <p className="text-lg font-black text-amber-400 mt-1">{stats.storageUsage}</p>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                <p className="text-[9px] text-slate-500 uppercase font-semibold">Online MPs</p>
                <p className="text-lg font-black text-emerald-400 mt-1">{stats.activeMpsOnline}</p>
              </div>
            </div>
          </div>

          {/* Real-time event log streams */}
          <div className="bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Live Operations Stream</span>
            </h3>
            
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              <AnimatePresence>
                {logs.map((log, index) => (
                  <motion.div
                    key={`${log}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/40 text-[10px] text-slate-300 leading-relaxed font-mono flex items-start space-x-2"
                  >
                    <span className="text-cyan-500/60 font-bold shrink-0">&gt;</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* State performance listings table */}
      <div className="bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">State Development Index</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-900/20">
                <th className="px-6 py-3 text-left text-[9px] font-bold text-slate-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-right text-[9px] font-bold text-slate-500 uppercase tracking-wider">Active MP Accounts</th>
                <th className="px-6 py-3 text-right text-[9px] font-bold text-slate-500 uppercase tracking-wider">Constituencies Active</th>
                <th className="px-6 py-3 text-right text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Suggestions</th>
                <th className="px-6 py-3 text-right text-[9px] font-bold text-slate-500 uppercase tracking-wider">AI Quality Index</th>
              </tr>
            </thead>
            <tbody>
              {stats.stateStats.map((st) => (
                <tr key={st.state} className="border-b border-slate-900/30 hover:bg-slate-900/35 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-200">{st.state}</td>
                  <td className="px-6 py-3 text-right text-slate-300">{st.activeMps}</td>
                  <td className="px-6 py-3 text-right text-slate-300">{st.activeConstituencies}</td>
                  <td className="px-6 py-3 text-right text-slate-300">{st.suggestions.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`font-black ${st.performanceScore >= 80 ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {st.performanceScore}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
