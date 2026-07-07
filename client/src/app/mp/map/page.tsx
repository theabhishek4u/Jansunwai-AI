'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, X, Users, AlertTriangle, Search, Filter,
  Building2, Droplets, GraduationCap, Heart,
  Lightbulb, Shield, TreePine, Globe,
  ZoomIn, ZoomOut, Info, Settings, RefreshCw, Navigation, Eye
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

// State nodes for National Explorer View (shown when zoomed out)
const STATE_MAP_NODES = [
  { id: 'IN-UP', name: 'Uttar Pradesh (Lucknow)', x: 390, y: 170, color: '#f97316', complaints: 842 },
  { id: 'IN-MH', name: 'Maharashtra', x: 270, y: 290, color: '#8b5cf6', complaints: 450 },
  { id: 'IN-KA', name: 'Karnataka', x: 280, y: 390, color: '#06b6d4', complaints: 430 },
  { id: 'IN-DL', name: 'Delhi', x: 320, y: 120, color: '#ef4444', complaints: 140 },
  { id: 'IN-BR', name: 'Bihar', x: 480, y: 190, color: '#10b981', complaints: 300 },
  { id: 'IN-RJ', name: 'Rajasthan', x: 230, y: 190, color: '#ec4899', complaints: 270 }
];

// Percentage coordinates mapping to position nodes accurately over the dark street map of Lucknow
const LUCKNOW_COORDS: Record<string, { left: string; top: string }> = {
  'Hazratganj': { left: "46%", top: "42%" },
  'Gomti Nagar': { left: "70%", top: "36%" },
  'Alambagh': { left: "22%", top: "58%" },
  'Chowk': { left: "20%", top: "28%" },
  'Indira Nagar': { left: "62%", top: "18%" },
  'Aminabad': { left: "36%", top: "38%" },
  'Mahanagar': { left: "50%", top: "26%" },
  'Jankipuram': { left: "42%", top: "12%" },
  'Ashiyana': { left: "25%", top: "78%" },
  'Charbagh': { left: "36%", top: "54%" },
};

const urgencyColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const categoryIcons: Record<string, React.ReactNode> = {
  Road: <Building2 className="w-3.5 h-3.5 text-sky-400" />,
  School: <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />,
  Hospital: <Heart className="w-3.5 h-3.5 text-rose-400" />,
  PHC: <Heart className="w-3.5 h-3.5 text-rose-400" />,
  'Water Supply': <Droplets className="w-3.5 h-3.5 text-blue-400" />,
  'Street Lights': <Lightbulb className="w-3.5 h-3.5 text-amber-400" />,
  Drainage: <Droplets className="w-3.5 h-3.5 text-indigo-400" />,
  "Women's Safety": <Shield className="w-3.5 h-3.5 text-fuchsia-400" />,
  Agriculture: <TreePine className="w-3.5 h-3.5 text-emerald-500" />,
  Environment: <TreePine className="w-3.5 h-3.5 text-emerald-555" />,
};

export default function ConstituencyMapPage() {
  const [villages, setVillages] = useState<VillageNode[]>([]);
  const [dbComplaints, setDbComplaints] = useState<PriorityItem[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<VillageNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState('all');

  // Zoom and Pan States
  // Start scale at 1.5 (zoomed into Lucknow view)
  const [scale, setScale] = useState(1.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedDistance, setDraggedDistance] = useState(0);

  const mapAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/mp/priority-engine`).then(r => r.json()),
      fetch(`${API}/api/mp/infrastructure-gaps`).then(r => r.json()),
    ]).then(([priorities, gaps]) => {
      setDbComplaints(priorities);
      
      const villageMap: Record<string, VillageNode> = {};
      (priorities as PriorityItem[]).forEach(p => {
        const name = p.village || 'Hazratganj';
        if (!villageMap[name]) {
          villageMap[name] = {
            name,
            block: '',
            lat: 0, lng: 0,
            complaints: 0,
            urgencyLevel: 'low',
            categories: {},
            totalBeneficiaries: 0,
            topSuggestion: '',
          };
        }
        villageMap[name].complaints += 1;
        villageMap[name].categories[p.category] = (villageMap[name].categories[p.category] || 0) + 1;
        
        if (p.urgency === 'critical' || (p.urgency === 'high' && villageMap[name].urgencyLevel !== 'critical')) {
          villageMap[name].urgencyLevel = p.urgency;
        }
        if (!villageMap[name].topSuggestion) {
          villageMap[name].topSuggestion = p.title;
        }
      });

      const gapMap: Record<string, InfraGap> = {};
      (gaps as InfraGap[]).forEach(g => { gapMap[g.village] = g; });

      const nodes = Object.values(villageMap).map(v => ({
        ...v,
        infraGap: gapMap[v.name],
        totalBeneficiaries: gapMap[v.name]?.population || 12000,
      }));

      const filteredNodes = nodes.filter(n => LUCKNOW_COORDS[n.name]);
      setVillages(filteredNodes);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Mouse Drag Panning Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    setDraggedDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const dx = newX - position.x;
    const dy = newY - position.y;
    setDraggedDistance(prev => prev + Math.abs(dx) + Math.abs(dy));

    // Allow wider bounds when zoomed out (national explorer view) to pan around the subcontinent
    const maxBound = scale >= 0.75 ? (scale - 1) * 350 : 250;
    setPosition({
      x: Math.max(-maxBound, Math.min(maxBound, newX)),
      y: Math.max(-maxBound, Math.min(maxBound, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom Button Controls (Supporting semantic zoom levels down to 0.3x)
  const zoomIn = () => setScale(prev => Math.min(4, prev + 0.3));
  const zoomOut = () => setScale(prev => {
    const next = Math.max(0.3, prev - 0.3);
    if (next < 0.75) {
      // Clear local selection if entering India level overview
      setSelectedVillage(null);
    }
    return next;
  });
  
  const resetToLucknow = () => {
    setScale(1.5);
    setPosition({ x: 0, y: 0 });
  };

  const resetToIndia = () => {
    setScale(0.4);
    setPosition({ x: 0, y: 0 });
    setSelectedVillage(null);
  };

  // Wheel Zoom support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
    setScale(prev => {
      const next = Math.max(0.3, Math.min(4, prev * zoomFactor));
      if (next < 0.75) {
        setSelectedVillage(null);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Globe className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing Multi-scale Telemetry...</p>
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
    { id: 'Drainage', label: 'Drainage' },
  ];

  const filteredVillages = villages.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.topSuggestion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalGridTickets = villages.reduce((s, v) => s + v.complaints, 0);
  const totalHighThreat = villages.filter(v => v.urgencyLevel === 'critical' || v.urgencyLevel === 'high').reduce((s, v) => s + v.complaints, 0);
  
  const totalIndiaTickets = 2432;
  const isNationalView = scale < 0.75;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans pb-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2.5">
            <Globe className="w-6 h-6 text-indigo-500 animate-pulse" />
            <span>Live Telemetry Map</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isNationalView 
              ? 'National level governance heatmap. Hover over states or click Uttar Pradesh to zoom into Lucknow.' 
              : 'Detailed tactical twin of Lucknow. Drag to pan, scroll to zoom out to India level.'}
          </p>
        </div>
        
        {/* Toggle Mode Buttons (Interactive Zoom Shortcuts) */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0 self-start md:self-center">
          <button 
            onClick={resetToIndia}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${isNationalView ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>National Explorer (0.4x)</span>
          </button>
          <button 
            onClick={resetToLucknow}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${!isNationalView ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Lucknow Twin (1.5x)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div 
          ref={mapAreaRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`lg:col-span-3 bg-slate-955 rounded-3xl border border-slate-800/60 p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`} 
          style={{ minHeight: '620px' }}
        >
          {/* Zoom and Pan Layer */}
          <div 
            className="absolute inset-0 z-0 origin-center transition-all duration-300 ease-out"
            style={{ 
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              pointerEvents: 'auto'
            }}
          >
            {/* LUCKNOW VIEW LAYER (Visible when scale >= 0.75) */}
            <div 
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                backgroundImage: `linear-gradient(rgba(11, 15, 25, 0.7), rgba(11, 15, 25, 0.88)), url('/lucknow_dark_map.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: isNationalView ? 0 : 1,
                pointerEvents: isNationalView ? 'none' : 'auto'
              }}
            >
              {/* SVG Network Grid Overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="streetGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#334155" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#streetGrid)" />
                
                {/* Decorative boundary outline */}
                <path
                  d="M 120 80 C 150 40, 350 20, 550 60 C 620 80, 640 200, 600 350 C 580 440, 400 480, 250 460 C 150 440, 100 350, 100 250 C 100 180, 110 100, 120 80 Z"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />
              </svg>

              {/* Local markers */}
              {!isNationalView && filteredVillages.map((v) => {
                const coords = LUCKNOW_COORDS[v.name];
                if (!coords) return null;
                
                const count = v.complaints;
                const radius = Math.max(14, Math.min(26, 12 + count * 1.5));
                const color = urgencyColors[v.urgencyLevel] || urgencyColors.low;

                return (
                  <div 
                    key={v.name}
                    className="absolute flex flex-col items-center group pointer-events-auto"
                    style={{ 
                      left: coords.left, 
                      top: coords.top, 
                      transform: 'translate(-50%, -50%)',
                      zIndex: selectedVillage?.name === v.name ? 30 : 10
                    }}
                    onClick={(e) => {
                      if (draggedDistance > 12) return;
                      e.stopPropagation();
                      setSelectedVillage(v);
                    }}
                  >
                    {/* Pulsing Radar Ring */}
                    <div 
                      className="absolute rounded-full border opacity-50 animate-ping pointer-events-none"
                      style={{ 
                        width: radius * 2.5, 
                        height: radius * 2.5, 
                        borderColor: color,
                        animationDuration: '2.5s'
                      }}
                    />
                    
                    {/* Center Dot Map Pin */}
                    <div 
                      className="rounded-full flex items-center justify-center font-extrabold text-[10px] text-white shadow-lg border border-white/10"
                      style={{ 
                        width: radius * 1.8, 
                        height: radius * 1.8, 
                        backgroundColor: color,
                        boxShadow: `0 0 20px ${color}50`
                      }}
                    >
                      <span>{v.complaints}</span>
                    </div>

                    {/* Tooltip Label */}
                    <span className="mt-1.5 px-2 py-0.5 rounded-md bg-slate-950/90 text-white font-extrabold text-[9px] uppercase tracking-wider border border-slate-800 shadow-lg">
                      {v.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* INDIA VIEW LAYER (Visible when scale < 0.75) */}
            <div 
              className="absolute inset-0 transition-opacity duration-500 bg-[#060813] flex items-center justify-center"
              style={{
                opacity: isNationalView ? 1 : 0,
                pointerEvents: isNationalView ? 'auto' : 'none'
              }}
            >
              <svg 
                viewBox="100 80 500 380" 
                className="w-full h-full max-h-[500px] pointer-events-auto"
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
                  const isUP = state.id === 'IN-UP';
                  return (
                    <g 
                      key={state.id} 
                      className="cursor-pointer group"
                      onClick={(e) => {
                        if (draggedDistance > 12) return;
                        e.stopPropagation();
                        if (isUP) {
                          // Zoom into Lucknow
                          resetToLucknow();
                        }
                      }}
                    >
                      {/* Outer pulse for UP to guide user */}
                      {isUP && (
                        <circle cx={state.x} cy={state.y} r={28} fill="none" stroke={state.color} strokeWidth="1" opacity="0.4">
                          <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      
                      <circle 
                        cx={state.x} 
                        cy={state.y} 
                        r={isUP ? 20 : 16} 
                        fill={state.color} 
                        opacity="0.15" 
                        stroke={state.color} 
                        strokeWidth="2" 
                      />
                      <circle cx={state.x} cy={state.y} r={8} fill={state.color} />
                      
                      {/* Count text */}
                      <text x={state.x} y={state.y - (isUP ? 26 : 22)} textAnchor="middle" fill="white" fontSize="10.5" fontWeight="950" className="uppercase tracking-wide">
                        {state.name}
                      </text>
                      <text x={state.x} y={state.y + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="900">
                        {state.complaints}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Top-Left HUD Controls */}
          <div className="z-10 w-full max-w-sm space-y-3 pointer-events-auto">
            <div className="relative group">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 group-hover:text-slate-350 transition-colors" />
              <input 
                type="text" 
                placeholder={isNationalView ? "Search state or district..." : "Search Gomti Nagar, ID, issue..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0b0f19]/90 backdrop-blur-md text-xs font-bold text-slate-200 pl-10 pr-4 py-3.5 rounded-xl border border-slate-800 focus:border-indigo-500/50 outline-none transition-colors"
                onMouseDown={e => e.stopPropagation()} 
              />
            </div>
            <button 
              className="flex items-center space-x-2 bg-[#0b0f19]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-[10px] uppercase font-bold text-slate-300 hover:text-white transition-all shadow-lg shadow-black/30"
              onMouseDown={e => e.stopPropagation()}
            >
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tactical Filters</span>
            </button>
          </div>

          {/* Semantic Map View Status Tag (Top Center) */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 bg-[#0b0f19]/95 border border-slate-800 rounded-full px-4 py-1.5 shadow-2xl text-[9px] uppercase tracking-widest font-black text-slate-300 flex items-center space-x-2">
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            <span>Map Zoom: {isNationalView ? "India Level" : `Lucknow Twin (${scale.toFixed(1)}x)`}</span>
          </div>

          {/* Real-time Telemetry HUD Overlay (Top-Right) */}
          <div className="absolute top-6 right-6 z-10 w-64 bg-[#0b0f19]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-black/55 space-y-4 pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Telemetry Summary
              </span>
              <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase">Active</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-900">
                <p className="text-xl font-black text-white">{isNationalView ? totalIndiaTickets : totalGridTickets}</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black mt-0.5">{isNationalView ? "India Tickets" : "Lucknow Tickets"}</p>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-900">
                <p className="text-xl font-black text-red-500">{isNationalView ? 842 : totalHighThreat}</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black mt-0.5">{isNationalView ? "UP Tickets" : "High Threat"}</p>
              </div>
            </div>

            {isNationalView ? (
              <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl text-[9px] text-slate-400 font-semibold leading-relaxed">
                💡 <span className="text-amber-450 font-bold">Hint:</span> Click on the <span className="font-extrabold text-white">Uttar Pradesh</span> node or use the tab above to drill down to Lucknow.
              </div>
            ) : (
              <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl flex items-start space-x-2 text-[9px] leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <p className="font-bold text-red-400 uppercase tracking-wider">Hotspot Alerts</p>
                  <p className="text-slate-400 font-medium">{villages.filter(v => v.urgencyLevel === 'critical').length} critical zones active</p>
                </div>
              </div>
            )}
          </div>

          {/* Tactical Zoom HUD Controls (Bottom-Right Panel) */}
          <div 
            className="absolute bottom-16 right-6 z-10 flex flex-col bg-[#0b0f19]/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-2xl space-y-1 pointer-events-auto"
            onMouseDown={e => e.stopPropagation()}
          >
            <button 
              onClick={zoomIn}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={zoomOut}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={resetToLucknow}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title="Reset View"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Indicators HUD */}
          <div className="z-10 w-full flex items-end justify-between mt-auto pointer-events-none">
            <div className="bg-[#0b0f19]/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5 text-[9px] text-slate-450 font-bold max-w-sm flex items-center space-x-2 shadow-lg pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Drag to move map • Zoom out (&lt; 0.75x) to view full India map</span>
            </div>
            
            <div className="bg-[#0b0f19]/90 backdrop-blur-md border border-slate-800 rounded-lg px-2 py-1 text-[8px] text-slate-600 font-bold tracking-wider pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
              Leaflet | © OpenStreetMap contributors
            </div>
          </div>
        </div>

        {/* Local twin detail panel */}
        <div className="lg:col-span-1 space-y-4">
          <AnimatePresence mode="wait">
            {!isNationalView && selectedVillage ? (
              <motion.div
                key={selectedVillage.name}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="bg-[#0d1220]/90 backdrop-blur-md rounded-3xl border border-slate-800/60 p-5 space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs uppercase tracking-wider font-black text-white flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>{selectedVillage.name}</span>
                  </h3>
                  <button onClick={() => setSelectedVillage(null)} className="text-slate-500 hover:text-white">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="space-y-2 text-[10px] font-bold text-slate-455">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Population Scope:</span>
                    <span className="text-slate-200">{(selectedVillage.totalBeneficiaries).toLocaleString()} Citizens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Grid Tickets:</span>
                    <span className="text-amber-450 font-extrabold">{selectedVillage.complaints} Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Threat Matrix:</span>
                    <span className={`capitalize font-black uppercase text-[9px] px-1.5 py-0.5 rounded ${
                      selectedVillage.urgencyLevel === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {selectedVillage.urgencyLevel}
                    </span>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-black mb-2 tracking-widest">Issue breakdown</p>
                  <div className="space-y-1.5">
                    {Object.entries(selectedVillage.categories).map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-850/50">
                        <span className="flex items-center space-x-1.5 text-[10px] text-slate-300 font-semibold">
                          {categoryIcons[cat] || <AlertTriangle className="w-3.5 h-3.5 text-amber-500/30" />}
                          <span>{cat}</span>
                        </span>
                        <span className="text-[10px] font-black text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Infra Gaps */}
                {selectedVillage.infraGap && (
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase font-black mb-2 tracking-widest">Infrastructure Deficits</p>
                    <div className="space-y-1.5">
                      {[
                        { label: 'School Deficit', value: selectedVillage.infraGap.schoolGap, icon: <GraduationCap className="w-3.5 h-3.5" /> },
                        { label: 'PHC Deficit', value: selectedVillage.infraGap.phcGap, icon: <Heart className="w-3.5 h-3.5" /> },
                        { label: 'Road Deficit (km)', value: selectedVillage.infraGap.roadGap, icon: <Building2 className="w-3.5 h-3.5" /> },
                        { label: 'Water Connection Deficit', value: selectedVillage.infraGap.waterGap, icon: <Droplets className="w-3.5 h-3.5" /> },
                      ].filter(g => g.value > 0).map(g => (
                        <div key={g.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/10">
                          <span className="flex items-center space-x-1.5 text-[10px] text-red-300 font-bold">
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
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-1">
                  <p className="text-[8px] text-amber-500/60 uppercase font-black tracking-wider">Top Priority Demand</p>
                  <p className="text-[10.5px] text-amber-200 leading-relaxed font-bold">{selectedVillage.topSuggestion}</p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#0d1220]/90 backdrop-blur-md rounded-3xl border border-slate-800/60 p-5 text-center py-12 space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <Info className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-black text-slate-200">
                    {isNationalView ? "National Overview" : "Grievance Node Drilldown"}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    {isNationalView 
                      ? "Select the Uttar Pradesh node or zoom in to activate local telemetry mode for Lucknow." 
                      : "Select a localized hotspot marker on the Lucknow street grid telemetry map to audit active public grievances."}
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Summary details */}
          <div className="bg-[#0d1220]/90 backdrop-blur-md rounded-3xl border border-slate-800/60 p-5 space-y-3">
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">
              {isNationalView ? "India Grid Summary" : "Lucknow Grid Summary"}
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-black text-white">{isNationalView ? STATE_MAP_NODES.length : villages.length}</p>
                <p className="text-[8px] text-slate-500 uppercase font-bold mt-0.5">{isNationalView ? "States Active" : "Regions"}</p>
              </div>
              <div>
                <p className="text-lg font-black text-amber-450">{isNationalView ? totalIndiaTickets : totalGridTickets}</p>
                <p className="text-[8px] text-slate-500 uppercase font-bold mt-0.5">Tickets</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
