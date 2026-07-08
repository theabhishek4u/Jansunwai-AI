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

// Premium Command Center Topology Relay Map
const STATE_MAP_NODES = [
  { id: 'LKO-HZ', name: 'Hazratganj (Central)', cx: 330, cy: 210, label: 'HZ' },
  { id: 'LKO-GN', name: 'Gomti Nagar (East)', cx: 420, cy: 180, label: 'GN' },
  { id: 'LKO-AB', name: 'Alambagh (South)', cx: 290, cy: 320, label: 'AB' },
  { id: 'LKO-CH', name: 'Chowk (West)', cx: 250, cy: 160, label: 'CH' },
  { id: 'LKO-IN', name: 'Indira Nagar (North-East)', cx: 400, cy: 100, label: 'IN' },
  { id: 'LKO-AM', name: 'Aminabad (Old City)', cx: 300, cy: 230, label: 'AM' }
];

const MAP_RELAYS = [
  { from: 'LKO-HZ', to: 'LKO-GN' },
  { from: 'LKO-HZ', to: 'LKO-AM' },
  { from: 'LKO-AM', to: 'LKO-CH' },
  { from: 'LKO-HZ', to: 'LKO-AB' },
  { from: 'LKO-HZ', to: 'LKO-IN' },
  { from: 'LKO-IN', to: 'LKO-GN' }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<CommandStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredState, setHoveredState] = useState<StatePerformance | null>(null);
  
  // Real-time ticker logs
  const [suggestionTicker, setSuggestionTicker] = useState<number>(0);
  const [aiRequestsTicker, setAiRequestsTicker] = useState<number>(0);
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
        // Override stateStats for Lucknow zones
        data.stateStats = [
          { state: 'Hazratganj (Central)', performanceScore: 92, activeConstituencies: 2, suggestions: 450, activeMps: 1 },
          { state: 'Gomti Nagar (East)', performanceScore: 88, activeConstituencies: 1, suggestions: 320, activeMps: 0 },
          { state: 'Alambagh (South)', performanceScore: 85, activeConstituencies: 2, suggestions: 210, activeMps: 1 },
          { state: 'Chowk (West)', performanceScore: 78, activeConstituencies: 1, suggestions: 415, activeMps: 0 },
          { state: 'Indira Nagar (North-East)', performanceScore: 90, activeConstituencies: 1, suggestions: 290, activeMps: 0 },
          { state: 'Aminabad (Old City)', performanceScore: 72, activeConstituencies: 1, suggestions: 530, activeMps: 0 },
        ];
        data.activeConstituencies = 8;
        
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
            <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-indigo-400">Lucknow District Command Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time citywide overview of Jansunwai AI public demand systems</p>
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
          { label: 'Active Zones', value: stats.activeConstituencies, icon: <Shield className="w-5 h-5 text-amber-400" />, desc: 'Across 6 Key Zones' },
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
              <span>Zone-wise Active Performance</span>
            </h2>
            <p className="text-[10px] text-slate-500">Hover over high-demand zones to audit stats</p>
          </div>

          {/* India SVG outline wrapper */}
          <div className="flex items-center justify-center flex-1 my-4">
            <svg viewBox="100 80 500 380" className="w-full max-h-[380px]">
              <style>
                {`
                  @keyframes dash {
                    to {
                      stroke-dashoffset: -100;
                    }
                  }
                  .animate-dash {
                    animation: dash 8s linear infinite !important;
                  }
                `}
              </style>
              <defs>
                <pattern id="gridPattern" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#162544" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect x="100" y="80" width="500" height="380" fill="url(#gridPattern)" />

              {/* Topology Connecting Relay lines */}
              {MAP_RELAYS.map((relay, idx) => {
                const nodeFrom = STATE_MAP_NODES.find(n => n.id === relay.from);
                const nodeTo = STATE_MAP_NODES.find(n => n.id === relay.to);
                if (!nodeFrom || !nodeTo) return null;
                return (
                  <g key={idx}>
                    {/* Glowing outer line */}
                    <line
                      x1={nodeFrom.cx}
                      y1={nodeFrom.cy}
                      x2={nodeTo.cx}
                      y2={nodeTo.cy}
                      stroke="rgba(6, 182, 212, 0.15)"
                      strokeWidth="3"
                    />
                    {/* Pulsing inner dashed line showing data flow */}
                    <line
                      x1={nodeFrom.cx}
                      y1={nodeFrom.cy}
                      x2={nodeTo.cx}
                      y2={nodeTo.cy}
                      stroke="rgba(34, 211, 238, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="5 5"
                      className="animate-dash"
                      style={{
                        animation: 'dash 15s linear infinite'
                      }}
                    />
                  </g>
                );
              })}

              {/* State Interactive Nodes */}
              {STATE_MAP_NODES.map((state) => {
                const isHovered = hoveredState?.state === state.name;
                return (
                  <g
                    key={state.id}
                    className="cursor-pointer group/node"
                    onMouseEnter={() => setHoveredState(getHoverStateDetails(state.name))}
                    onMouseLeave={() => setHoveredState(null)}
                  >
                    {/* Large Hover target area */}
                    <circle
                      cx={state.cx}
                      cy={state.cy}
                      r="25"
                      fill="transparent"
                    />
                    {/* Outer glowing pulsing ring */}
                    <circle
                      cx={state.cx}
                      cy={state.cy}
                      r={isHovered ? 16 : 12}
                      fill="none"
                      stroke={isHovered ? '#22d3ee' : '#0891b2'}
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                      className="transition-all duration-300"
                    />
                    {/* Inner glowing core circle */}
                    <circle
                      cx={state.cx}
                      cy={state.cy}
                      r={isHovered ? 8 : 5}
                      fill={isHovered ? '#22d3ee' : '#0891b2'}
                      className="transition-all duration-300 shadow-lg shadow-cyan-500/50"
                    />
                    {/* Text Label next to or below node */}
                    <text
                      x={state.cx}
                      y={state.cy + 25}
                      fill={isHovered ? '#e2e8f0' : '#475569'}
                      fontSize="9"
                      fontWeight="black"
                      textAnchor="middle"
                      className="pointer-events-none uppercase tracking-wider transition-colors duration-200"
                    >
                      {state.label}
                    </text>
                  </g>
                );
              })}
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
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zone Development Index</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-900/20">
                <th className="px-6 py-3 text-left text-[9px] font-bold text-slate-500 uppercase tracking-wider">Zone</th>
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
