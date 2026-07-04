'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, X, MapPin, Users, AlertTriangle,
  Building2, Droplets, GraduationCap, Heart,
  Lightbulb, Shield, TreePine, Layers
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface VillageNode {
  name: string;
  block: string;
  lat: number;
  lng: number;
  suggestions: number;
  urgencyLevel: string;
  categories: Record<string, number>;
  totalBeneficiaries: number;
  topSuggestion: string;
  infraGap?: InfraGap;
}

interface InfraGap {
  village: string;
  population: number;
  schoolGap: number;
  phcGap: number;
  roadGap: number;
  waterGap: number;
}

interface PriorityItem {
  id: string;
  title: string;
  category: string;
  village: string;
  urgency: string;
  supporters: number;
  estimatedCostLakhs: number;
}

const VILLAGE_COORDS: Record<string, { x: number; y: number }> = {
  'Sigra': { x: 380, y: 220 },
  'Ramnagar': { x: 550, y: 370 },
  'Sarnath': { x: 480, y: 120 },
  'Cholapur': { x: 220, y: 140 },
  'Harahua': { x: 180, y: 400 },
  'Sevapuri': { x: 550, y: 180 },
};

const urgencyColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const categoryIcons: Record<string, React.ReactNode> = {
  Road: <Building2 className="w-3 h-3" />,
  School: <GraduationCap className="w-3 h-3" />,
  Hospital: <Heart className="w-3 h-3" />,
  PHC: <Heart className="w-3 h-3" />,
  'Water Supply': <Droplets className="w-3 h-3" />,
  'Street Lights': <Lightbulb className="w-3 h-3" />,
  Drainage: <Droplets className="w-3 h-3" />,
  "Women's Safety": <Shield className="w-3 h-3" />,
  Agriculture: <TreePine className="w-3 h-3" />,
  Environment: <TreePine className="w-3 h-3" />,
};

export default function ConstituencyMapPage() {
  const [villages, setVillages] = useState<VillageNode[]>([]);
  const [infraGaps, setInfraGaps] = useState<InfraGap[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<VillageNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState('all');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/mp/priority-engine`).then(r => r.json()),
      fetch(`${API}/api/mp/infrastructure-gaps`).then(r => r.json()),
    ]).then(([priorities, gaps]) => {
      // Build village nodes from priority data
      const villageMap: Record<string, VillageNode> = {};
      (priorities as PriorityItem[]).forEach(p => {
        if (!villageMap[p.village]) {
          villageMap[p.village] = {
            name: p.village,
            block: '',
            lat: 0, lng: 0,
            suggestions: 0,
            urgencyLevel: 'low',
            categories: {},
            totalBeneficiaries: 0,
            topSuggestion: '',
          };
        }
        villageMap[p.village].suggestions += 1;
        villageMap[p.village].categories[p.category] = (villageMap[p.village].categories[p.category] || 0) + 1;
        if (p.urgency === 'critical' || (p.urgency === 'high' && villageMap[p.village].urgencyLevel !== 'critical')) {
          villageMap[p.village].urgencyLevel = p.urgency;
        }
        if (!villageMap[p.village].topSuggestion) {
          villageMap[p.village].topSuggestion = p.title;
        }
      });

      // Add infra gaps
      const gapMap: Record<string, InfraGap> = {};
      (gaps as InfraGap[]).forEach(g => { gapMap[g.village] = g; });

      const nodes = Object.values(villageMap).map(v => ({
        ...v,
        infraGap: gapMap[v.name],
        totalBeneficiaries: gapMap[v.name]?.population || 0,
      }));

      setVillages(nodes);
      setInfraGaps(gaps);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Map className="w-8 h-8 text-amber-400 animate-pulse" />
      </div>
    );
  }

  const layers = [
    { id: 'all', label: 'All Issues' },
    { id: 'Road', label: 'Roads' },
    { id: 'School', label: 'Education' },
    { id: 'Hospital', label: 'Healthcare' },
    { id: 'Water Supply', label: 'Water' },
    { id: 'Environment', label: 'Environment' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Map className="w-6 h-6 text-amber-400" />
            <span>Constituency Digital Twin</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Interactive view of development demand across Varanasi constituency</p>
        </div>
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-500" />
          {layers.map(l => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(l.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${activeLayer === l.id ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-3 bg-[#111827] rounded-2xl border border-slate-800/50 p-6 relative overflow-hidden" style={{ minHeight: '520px' }}>
          {/* SVG Constituency Map */}
          <svg viewBox="0 0 700 500" className="w-full h-full" style={{ minHeight: '480px' }}>
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect width="700" height="500" fill="url(#grid)" />

            {/* Constituency boundary */}
            <path
              d="M 120 80 C 150 40, 350 20, 550 60 C 620 80, 640 200, 600 350 C 580 440, 400 480, 250 460 C 150 440, 100 350, 100 250 C 100 180, 110 100, 120 80 Z"
              fill="none"
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="8 4"
            />
            <text x="350" y="490" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600">
              VARANASI PARLIAMENTARY CONSTITUENCY
            </text>

            {/* Connection lines between villages */}
            {villages.map((v, i) => {
              const coords = VILLAGE_COORDS[v.name];
              if (!coords) return null;
              return villages.slice(i + 1).map(v2 => {
                const coords2 = VILLAGE_COORDS[v2.name];
                if (!coords2) return null;
                return (
                  <line key={`${v.name}-${v2.name}`} x1={coords.x} y1={coords.y} x2={coords2.x} y2={coords2.y}
                    stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                );
              });
            })}

            {/* Village Nodes */}
            {villages.map((v) => {
              const coords = VILLAGE_COORDS[v.name];
              if (!coords) return null;
              const radius = Math.max(20, Math.min(40, v.suggestions * 8));
              const color = urgencyColors[v.urgencyLevel] || urgencyColors.low;
              const filteredCount = activeLayer === 'all' ? v.suggestions : (v.categories[activeLayer] || 0);
              if (activeLayer !== 'all' && filteredCount === 0) return null;

              return (
                <g key={v.name} className="cursor-pointer" onClick={() => setSelectedVillage(v)}>
                  {/* Pulse ring */}
                  <circle cx={coords.x} cy={coords.y} r={radius + 8} fill="none" stroke={color} strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" values={`${radius + 5};${radius + 15};${radius + 5}`} dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
                  </circle>
                  {/* Main circle */}
                  <circle cx={coords.x} cy={coords.y} r={radius} fill={color} opacity="0.15" stroke={color} strokeWidth="2" filter="url(#glow)" />
                  <circle cx={coords.x} cy={coords.y} r={radius * 0.6} fill={color} opacity="0.4" />
                  {/* Count */}
                  <text x={coords.x} y={coords.y + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="800">
                    {activeLayer === 'all' ? v.suggestions : filteredCount}
                  </text>
                  {/* Label */}
                  <text x={coords.x} y={coords.y + radius + 16} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
                    {v.name}
                  </text>
                  <text x={coords.x} y={coords.y + radius + 28} textAnchor="middle" fill="#475569" fontSize="8" fontWeight="500">
                    Pop: {(v.totalBeneficiaries / 1000).toFixed(0)}K
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-[#0d1220]/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
            <p className="text-[9px] text-slate-400 font-bold mb-2 uppercase tracking-wider">Urgency Level</p>
            {Object.entries(urgencyColors).map(([level, color]) => (
              <div key={level} className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-slate-400 capitalize">{level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1 space-y-4">
          <AnimatePresence mode="wait">
            {selectedVillage ? (
              <motion.div
                key={selectedVillage.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#111827] rounded-2xl border border-slate-800/50 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>{selectedVillage.name}</span>
                  </h3>
                  <button onClick={() => setSelectedVillage(null)} className="text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">Population</span>
                    <span className="text-xs font-bold text-white">{selectedVillage.totalBeneficiaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">Suggestions</span>
                    <span className="text-xs font-bold text-amber-400">{selectedVillage.suggestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-400">Max Urgency</span>
                    <span className={`text-xs font-bold capitalize ${selectedVillage.urgencyLevel === 'critical' ? 'text-red-400' : selectedVillage.urgencyLevel === 'high' ? 'text-orange-400' : 'text-yellow-400'}`}>
                      {selectedVillage.urgencyLevel}
                    </span>
                  </div>
                </div>

                {/* Categories breakdown */}
                <div className="mb-4">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-2 tracking-wider">Issue Categories</p>
                  <div className="space-y-1.5">
                    {Object.entries(selectedVillage.categories).map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/30">
                        <span className="flex items-center space-x-1.5 text-[10px] text-slate-300">
                          {categoryIcons[cat] || <AlertTriangle className="w-3 h-3" />}
                          <span>{cat}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Infra Gaps */}
                {selectedVillage.infraGap && (
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-2 tracking-wider">Infrastructure Gaps</p>
                    <div className="space-y-1.5">
                      {[
                        { label: 'School Gap', value: selectedVillage.infraGap.schoolGap, icon: <GraduationCap className="w-3 h-3" /> },
                        { label: 'PHC Gap', value: selectedVillage.infraGap.phcGap, icon: <Heart className="w-3 h-3" /> },
                        { label: 'Road Gap (km)', value: selectedVillage.infraGap.roadGap, icon: <Building2 className="w-3 h-3" /> },
                        { label: 'Water Gap', value: selectedVillage.infraGap.waterGap, icon: <Droplets className="w-3 h-3" /> },
                      ].filter(g => g.value > 0).map(g => (
                        <div key={g.label} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10">
                          <span className="flex items-center space-x-1.5 text-[10px] text-red-300">
                            {g.icon}
                            <span>{g.label}</span>
                          </span>
                          <span className="text-[10px] font-bold text-red-400">-{g.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top suggestion */}
                <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-[9px] text-amber-500/60 uppercase font-bold mb-1">Top Priority</p>
                  <p className="text-[11px] text-amber-200 leading-relaxed">{selectedVillage.topSuggestion}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111827] rounded-2xl border border-slate-800/50 p-5">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-white">Village Summary</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">Click on any village node on the map to see detailed information.</p>
                <div className="space-y-2">
                  {villages.map(v => (
                    <button
                      key={v.name}
                      onClick={() => setSelectedVillage(v)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors text-left"
                    >
                      <span className="text-xs text-slate-300 font-medium">{v.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-500">{v.suggestions} issues</span>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: urgencyColors[v.urgencyLevel] }} />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Total Stats */}
          <div className="bg-[#111827] rounded-2xl border border-slate-800/50 p-5">
            <p className="text-[9px] text-slate-500 uppercase font-bold mb-3 tracking-wider">Constituency Totals</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xl font-black text-white">{villages.length}</p>
                <p className="text-[9px] text-slate-500">Villages</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-amber-400">{villages.reduce((s, v) => s + v.suggestions, 0)}</p>
                <p className="text-[9px] text-slate-500">Total Issues</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-white">{(infraGaps.reduce((s, g) => s + g.population, 0) / 1000).toFixed(0)}K</p>
                <p className="text-[9px] text-slate-500">Population</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-red-400">{infraGaps.filter(g => g.phcGap > 0).length}</p>
                <p className="text-[9px] text-slate-500">PHC Gaps</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
