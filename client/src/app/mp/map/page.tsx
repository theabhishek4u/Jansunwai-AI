'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, X, MapPin, Users, AlertTriangle,
  Building2, Droplets, GraduationCap, Heart,
  Lightbulb, Shield, TreePine, Layers, Globe,
  ArrowLeft, ZoomIn, TrendingUp, Info, Trophy
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface VillageNode {
  name: string;
  block: string;
  lat: number;
  lng: number;
  complaints: number;
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
  status: string;
  supporters: number;
  estimatedCostLakhs: number;
  priorityScore: number;
  populationAffected: number;
}

const STATE_MAP_NODES = [
  { id: 'IN-UP', name: 'Uttar Pradesh', x: 390, y: 170, color: '#f59e0b', complaints: 842 },
  { id: 'IN-MH', name: 'Maharashtra', x: 270, y: 290, color: '#8b5cf6', complaints: 450 },
  { id: 'IN-KA', name: 'Karnataka', x: 280, y: 390, color: '#06b6d4', complaints: 430 },
  { id: 'IN-DL', name: 'Delhi', x: 320, y: 120, color: '#ef4444', complaints: 140 },
  { id: 'IN-BR', name: 'Bihar', x: 480, y: 190, color: '#10b981', complaints: 300 },
  { id: 'IN-RJ', name: 'Rajasthan', x: 230, y: 190, color: '#ec4899', complaints: 270 }
];

// Active districts per state
const DISTRICTS_DATA: Record<string, { name: string; complaints: number; score: number; categories: Record<string, number> }[]> = {
  'Uttar Pradesh': [
    { name: 'Varanasi', complaints: 18, score: 72, categories: { PHC: 2, Road: 2, School: 1, 'Water Supply': 1, 'Street Lights': 1, Drainage: 1, "Women's Safety": 1, Agriculture: 1, Electricity: 1, Bridge: 1, Park: 1, Internet: 1, 'Waste Management': 1, 'Skill Center': 1, Environment: 1 } },
    { name: 'Lucknow', complaints: 124, score: 79, categories: { Road: 40, School: 30, Healthcare: 25, Water: 15, Drainage: 14 } },
    { name: 'Prayagraj', complaints: 82, score: 68, categories: { Road: 25, Water: 20, Electricity: 18, School: 19 } },
    { name: 'Kanpur', complaints: 98, score: 64, categories: { Infrastructure: 35, Safety: 25, School: 18, Water: 20 } },
    { name: 'Noida', complaints: 140, score: 85, categories: { Internet: 40, Safety: 30, Environment: 35, Park: 35 } }
  ],
  'Maharashtra': [
    { name: 'Mumbai', complaints: 210, score: 81, categories: { Drainage: 60, Road: 50, Safety: 45, Internet: 55 } },
    { name: 'Pune', complaints: 150, score: 78, categories: { School: 40, Road: 35, Environment: 45, Water: 30 } },
    { name: 'Nagpur', complaints: 90, score: 69, categories: { Electricity: 30, PHC: 25, Agriculture: 20, Road: 15 } }
  ],
  'Karnataka': [
    { name: 'Bengaluru', complaints: 280, score: 83, categories: { Road: 90, Water: 70, Drainage: 60, Environment: 60 } },
    { name: 'Mysuru', complaints: 90, score: 74, categories: { Tourism: 30, School: 25, Road: 20, Water: 15 } },
    { name: 'Hubli', complaints: 60, score: 65, categories: { Electricity: 20, Road: 18, School: 12, PHC: 10 } }
  ],
  'Delhi': [
    { name: 'Central Delhi', complaints: 140, score: 82, categories: { Safety: 45, Environment: 35, School: 30, Park: 30 } }
  ],
  'Bihar': [
    { name: 'Patna', complaints: 180, score: 61, categories: { Road: 60, PHC: 45, School: 40, Water: 35 } },
    { name: 'Gaya', complaints: 70, score: 58, categories: { Tourism: 20, Water: 25, Road: 15, School: 10 } },
    { name: 'Bhagalpur', complaints: 50, score: 54, categories: { Electricity: 18, PHC: 15, Agriculture: 12, School: 5 } }
  ],
  'Rajasthan': [
    { name: 'Jaipur', complaints: 130, score: 76, categories: { Water: 40, Tourism: 30, Road: 30, School: 30 } },
    { name: 'Jodhpur', complaints: 80, score: 70, categories: { Water: 35, Road: 20, Electricity: 15, PHC: 10 } },
    { name: 'Udaipur', complaints: 60, score: 72, categories: { Environment: 20, Water: 15, Road: 15, Tourism: 10 } }
  ]
};

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
  const [mapMode, setMapMode] = useState<'india' | 'constituency'>('india');
  const [villages, setVillages] = useState<VillageNode[]>([]);
  const [infraGaps, setInfraGaps] = useState<InfraGap[]>([]);
  const [dbComplaints, setDbComplaints] = useState<PriorityItem[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<VillageNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState('all');

  // National Explorer States
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ name: string; complaints: number; score: number; categories: Record<string, number> } | null>(null);
  const [hoveredStateNode, setHoveredStateNode] = useState<typeof STATE_MAP_NODES[0] | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/mp/priority-engine`).then(r => r.json()),
      fetch(`${API}/api/mp/infrastructure-gaps`).then(r => r.json()),
    ]).then(([priorities, gaps]) => {
      setDbComplaints(priorities);
      // Build village nodes from priority data
      const villageMap: Record<string, VillageNode> = {};
      (priorities as PriorityItem[]).forEach(p => {
        if (!villageMap[p.village]) {
          villageMap[p.village] = {
            name: p.village,
            block: '',
            lat: 0, lng: 0,
            complaints: 0,
            urgencyLevel: 'low',
            categories: {},
            totalBeneficiaries: 0,
            topSuggestion: '',
          };
        }
        villageMap[p.village].complaints += 1;
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
        <div className="flex flex-col items-center space-y-4">
          <Globe className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing Spatial Models...</p>
        </div>
      </div>
    );
  }

  const localLayers = [
    { id: 'all', label: 'All Issues' },
    { id: 'Road', label: 'Roads' },
    { id: 'School', label: 'Education' },
    { id: 'Hospital', label: 'Healthcare' },
    { id: 'Water Supply', label: 'Water' },
    { id: 'Environment', label: 'Environment' },
  ];

  const totalIndiaComplaints = STATE_MAP_NODES.reduce((sum, s) => sum + s.complaints, 0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <Globe className="w-6 h-6 text-amber-400" />
            <span>Digital Twin Governance Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mapMode === 'india' 
              ? 'Nationwide audit of public complaints, state scorecards, and district-level feedback' 
              : 'Interactive micro-twin modeling of development demands across Varanasi'}
          </p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0 self-start md:self-center">
          <button 
            onClick={() => { setMapMode('india'); setSelectedDistrict(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${mapMode === 'india' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>National Explorer</span>
          </button>
          <button 
            onClick={() => setMapMode('constituency')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${mapMode === 'constituency' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Constituency Local Twin</span>
          </button>
        </div>
      </div>

      {mapMode === 'india' ? (
        // ================= NATIONAL MAP EXPLORER =================
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map display */}
          <div className="lg:col-span-3 bg-[#0d1220]/80 rounded-2xl border border-slate-800/50 p-6 relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '540px' }}>
            <div className="flex justify-between items-center z-10">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ZoomIn className="w-4 h-4 text-amber-400" />
                  <span>{selectedState ? `${selectedState} - Districts` : 'India Governance Heatmap'}</span>
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {selectedState ? 'Click on a district node to inspect localized feedback' : 'Hover over states and click to drill down'}
                </p>
              </div>
              {selectedState && (
                <button 
                  onClick={() => { setSelectedState(null); setSelectedDistrict(null); }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to India Map</span>
                </button>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center my-6 relative min-h-[380px]">
              <AnimatePresence mode="wait">
                {!selectedState ? (
                  // SVG India Map
                  <motion.svg 
                    key="india-svg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    viewBox="100 80 500 380" 
                    className="w-full max-h-[400px]"
                  >
                    <defs>
                      <pattern id="indiaGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#161e33" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect x="100" y="80" width="500" height="380" fill="url(#indiaGrid)" rx="16" />

                    {/* Network Connection Lines */}
                    <path d="M 320 120 L 230 190 L 270 290 L 280 390" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                    <path d="M 320 120 L 390 170 L 480 190" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                    <path d="M 230 190 L 390 170 L 270 290" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />

                    {/* State Nodes */}
                    {STATE_MAP_NODES.map((state) => {
                      const isHovered = hoveredStateNode?.id === state.id;
                      const radius = isHovered ? 24 : 18;
                      return (
                        <g 
                          key={state.id} 
                          className="cursor-pointer transition-all duration-300"
                          onMouseEnter={() => setHoveredStateNode(state)}
                          onMouseLeave={() => setHoveredStateNode(null)}
                          onClick={() => { setSelectedState(state.name); setHoveredStateNode(null); }}
                        >
                          {/* Outer pulse ring */}
                          <circle cx={state.x} cy={state.y} r={radius + 10} fill="none" stroke={state.color} strokeWidth="1" opacity={isHovered ? 0.6 : 0.05}>
                            {isHovered && <animate attributeName="r" values={`${radius + 8};${radius + 16};${radius + 8}`} dur="2s" repeatCount="indefinite" />}
                            {isHovered && <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />}
                          </circle>
                          
                          {/* Node glow effect */}
                          <circle 
                            cx={state.x} cy={state.y} r={radius} 
                            fill={isHovered ? state.color : 'rgba(30, 41, 59, 0.9)'}
                            stroke={state.color} strokeWidth="2.5"
                            className="transition-all duration-300"
                          />
                          
                          {/* Node value */}
                          <text 
                            x={state.x} y={state.y + 4} 
                            fill={isHovered ? '#fff' : state.color} 
                            fontSize="11" fontWeight="900" textAnchor="middle"
                            className="pointer-events-none transition-all duration-300"
                          >
                            {state.complaints}
                          </text>
                          
                          {/* State Label */}
                          <text 
                            x={state.x} y={state.y + radius + 16} 
                            fill={isHovered ? '#fff' : '#64748b'} 
                            fontSize="9" fontWeight="900" textAnchor="middle"
                            className="pointer-events-none uppercase tracking-widest transition-all duration-300 drop-shadow-md"
                          >
                            {state.name}
                          </text>
                        </g>
                      );
                    })}
                  </motion.svg>
                ) : (
                  // District Node Grid (District selection for clicked State)
                  <motion.div 
                    key="district-grid"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl px-6"
                  >
                    {DISTRICTS_DATA[selectedState]?.map((dist) => (
                      <button
                        key={dist.name}
                        onClick={() => setSelectedDistrict(dist)}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 ${
                          selectedDistrict?.name === dist.name 
                            ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700/80 hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-200">{dist.name}</span>
                          <MapPin className={`w-3.5 h-3.5 ${selectedDistrict?.name === dist.name ? 'text-amber-400' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <p className="text-xl font-black text-white">{dist.complaints}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[8px] text-slate-500 uppercase font-black">Complaints</span>
                            <span className="text-[9px] font-black text-amber-500/80">Index: {dist.score}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Legend / Tooltip Container */}
            <div className="flex justify-between items-end border-t border-slate-800/50 pt-4 z-10">
              <div className="bg-slate-900/50 rounded-xl px-3 py-2 border border-slate-850 flex space-x-4 text-[9px] font-bold text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500" />
                  <span>Active Hotspots</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <span>Inactive States</span>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 w-56 text-left">
                {hoveredStateNode ? (
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold text-amber-400 uppercase">{hoveredStateNode.name}</p>
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                      <span>Total Complaints:</span>
                      <span className="text-white">{hoveredStateNode.complaints}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                      <span>National Contribution:</span>
                      <span className="text-white">{((hoveredStateNode.complaints / totalIndiaComplaints) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[9px] text-slate-500 italic text-center font-medium">Hover over states to view contribution stats</p>
                )}
              </div>
            </div>
          </div>

          {/* District details side panel */}
          <div className="lg:col-span-1 space-y-4">
            <AnimatePresence mode="wait">
              {selectedDistrict ? (
                <motion.div
                  key={selectedDistrict.name}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="bg-[#0d1220]/80 rounded-2xl border border-slate-800/50 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs uppercase tracking-wider font-black text-white">{selectedDistrict.name}</h3>
                    </div>
                    <button onClick={() => setSelectedDistrict(null)} className="text-slate-500 hover:text-white">
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* High level stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 text-center">
                      <p className="text-lg font-black text-amber-400">{selectedDistrict.complaints}</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black mt-0.5">District Total</p>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 text-center">
                      <p className="text-lg font-black text-white">{selectedDistrict.score}</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black mt-0.5">Perf Index</p>
                    </div>
                  </div>

                  {/* Comparative Scope */}
                  <div className="space-y-2">
                    <p className="text-[8px] uppercase tracking-wider text-slate-500 font-black">Comparison Index</p>
                    <div className="space-y-1.5 text-[10px] font-semibold text-slate-400">
                      <div className="flex justify-between">
                        <span>Varanasi baseline:</span>
                        <span className="text-white">18 complaints</span>
                      </div>
                      <div className="flex justify-between">
                        <span>State Total:</span>
                        <span className="text-white">{selectedState === 'Uttar Pradesh' ? '464' : '230'} complaints</span>
                      </div>
                      <div className="flex justify-between">
                        <span>National Contribution:</span>
                        <span className="text-white">{((selectedDistrict.complaints / totalIndiaComplaints) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Category counts */}
                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-slate-500 font-black mb-2">Category distribution</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {Object.entries(selectedDistrict.categories).map(([cat, count]) => (
                        <div key={cat} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/30 border border-slate-850/50">
                          <span className="flex items-center space-x-1.5 text-[10px] text-slate-300 font-medium">
                            {categoryIcons[cat] || <AlertTriangle className="w-3.5 h-3.5 text-amber-500/40" />}
                            <span>{cat}</span>
                          </span>
                          <span className="text-[10px] font-black text-slate-300">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Varanasi specific database check */}
                  {selectedDistrict.name === 'Varanasi' && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <p className="text-[8px] text-amber-500 font-black uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span>Varanasi Database Connection</span>
                      </p>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                        Real complaints: {dbComplaints.filter(s => s.urgency === 'critical').length} critical, {dbComplaints.filter(s => s.status === 'completed').length} completed.
                      </p>
                      <Link href="/mp/complaints" className="text-[9px] font-black text-amber-400 mt-2 block hover:underline">
                        Launch complaints manager →
                      </Link>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-[#0d1220]/80 rounded-2xl border border-slate-800/50 p-5 text-center py-10 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-black text-slate-200">State & District Drilldown</h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Select active states on the left Map representation. Then pick a district node to view real-time feedback channels.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        // ================= VARANASI LOCAL DIGITAL TWIN =================
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SVG Local Map */}
          <div className="lg:col-span-3 bg-[#0d1220]/80 rounded-2xl border border-slate-800/50 p-6 relative overflow-hidden" style={{ minHeight: '520px' }}>
            <svg viewBox="0 0 700 500" className="w-full h-full" style={{ minHeight: '480px' }}>
              <defs>
                <pattern id="localGrid" width="40" height="40" patternUnits="userSpaceOnUse">
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
              <rect width="700" height="500" fill="url(#localGrid)" />

              {/* Constituency boundary */}
              <path
                d="M 120 80 C 150 40, 350 20, 550 60 C 620 80, 640 200, 600 350 C 580 440, 400 480, 250 460 C 150 440, 100 350, 100 250 C 100 180, 110 100, 120 80 Z"
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="8 4"
              />
              <text x="350" y="490" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600" className="tracking-widest">
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
                      stroke="#161e33" strokeWidth="0.8" strokeDasharray="4 4" />
                  );
                });
              })}

              {/* Village Nodes */}
              {villages.map((v) => {
                const coords = VILLAGE_COORDS[v.name];
                if (!coords) return null;
                const radius = Math.max(20, Math.min(40, v.complaints * 8));
                const color = urgencyColors[v.urgencyLevel] || urgencyColors.low;
                const filteredCount = activeLayer === 'all' ? v.complaints : (v.categories[activeLayer] || 0);
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
                      {activeLayer === 'all' ? v.complaints : filteredCount}
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

            {/* Active Layer Filters */}
            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md rounded-xl p-1.5 border border-slate-800 flex space-x-1 shadow-md">
              {localLayers.map(l => (
                <button
                  key={l.id}
                  onClick={() => setActiveLayer(l.id)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${activeLayer === l.id ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-[#0d1220]/90 backdrop-blur-sm rounded-xl p-3 border border-slate-800">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider mb-2">Urgency Level</p>
              {Object.entries(urgencyColors).map(([level, color]) => (
                <div key={level} className="flex items-center space-x-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[9px] font-bold text-slate-400 capitalize">{level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Local twin detail panel */}
          <div className="lg:col-span-1 space-y-4">
            <AnimatePresence mode="wait">
              {selectedVillage ? (
                <motion.div
                  key={selectedVillage.name}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="bg-[#0d1220]/80 rounded-2xl border border-slate-800/50 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <h3 className="text-xs uppercase tracking-wider font-black text-white flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>{selectedVillage.name}</span>
                    </h3>
                    <button onClick={() => setSelectedVillage(null)} className="text-slate-500 hover:text-white">
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-[10px] font-semibold text-slate-400">
                    <div className="flex justify-between">
                      <span>Population:</span>
                      <span className="text-white">{selectedVillage.totalBeneficiaries.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Complaints:</span>
                      <span className="text-amber-400 font-bold">{selectedVillage.complaints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Urgency:</span>
                      <span className={`capitalize font-bold ${selectedVillage.urgencyLevel === 'critical' ? 'text-red-400' : 'text-orange-450'}`}>
                        {selectedVillage.urgencyLevel}
                      </span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-black mb-2 tracking-wider">Issue Breakdown</p>
                    <div className="space-y-1.5">
                      {Object.entries(selectedVillage.categories).map(([cat, count]) => (
                        <div key={cat} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/30 border border-slate-850/50">
                          <span className="flex items-center space-x-1.5 text-[10px] text-slate-300 font-medium">
                            {categoryIcons[cat] || <AlertTriangle className="w-3.5 h-3.5 text-amber-500/30" />}
                            <span>{cat}</span>
                          </span>
                          <span className="text-[10px] font-black text-slate-300">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Infra Gaps */}
                  {selectedVillage.infraGap && (
                    <div>
                      <p className="text-[8px] text-slate-500 uppercase font-black mb-2 tracking-wider">Infrastructure Deficits</p>
                      <div className="space-y-1.5">
                        {[
                          { label: 'School Deficit', value: selectedVillage.infraGap.schoolGap, icon: <GraduationCap className="w-3.5 h-3.5" /> },
                          { label: 'PHC Deficit', value: selectedVillage.infraGap.phcGap, icon: <Heart className="w-3.5 h-3.5" /> },
                          { label: 'Road Deficit (km)', value: selectedVillage.infraGap.roadGap, icon: <Building2 className="w-3.5 h-3.5" /> },
                          { label: 'Water Connection Deficit', value: selectedVillage.infraGap.waterGap, icon: <Droplets className="w-3.5 h-3.5" /> },
                        ].filter(g => g.value > 0).map(g => (
                          <div key={g.label} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10">
                            <span className="flex items-center space-x-1.5 text-[10px] text-red-300 font-medium">
                              {g.icon}
                              <span>{g.label}</span>
                            </span>
                            <span className="text-[10px] font-black text-red-400">-{g.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top suggestion */}
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[8px] text-amber-500/60 uppercase font-black mb-1">Top Priority Demand</p>
                    <p className="text-[11px] text-amber-200 leading-relaxed font-semibold">{selectedVillage.topSuggestion}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-[#0d1220]/80 rounded-2xl border border-slate-800/50 p-5 text-center py-10 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-black text-slate-200">Village Twin Selector</h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Select one of the glowing village hotspot nodes inside Varanasi&apos;s digital twin to view demands, health factor gaps, and populations.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Summary details */}
            <div className="bg-[#0d1220]/80 rounded-2xl border border-slate-800/50 p-5 space-y-3">
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-wider">Varanasi Summary</p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-lg font-black text-white">{villages.length}</p>
                  <p className="text-[8px] text-slate-500 uppercase font-bold mt-0.5">Villages</p>
                </div>
                <div>
                  <p className="text-lg font-black text-amber-450">{villages.reduce((s, v) => s + v.complaints, 0)}</p>
                  <p className="text-[8px] text-slate-500 uppercase font-bold mt-0.5">Complaints</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
