'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, X, Users, AlertTriangle, Filter,
  Building2, Droplets, GraduationCap, Heart,
  Lightbulb, Shield, TreePine, Globe,
  RefreshCw, Eye, ListTodo, ChevronRight, ArrowLeft
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
  location_lat?: number;
  location_lng?: number;
}

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

// Dynamically import Leaflet Map to bypass SSR window undefined errors
const InteractiveGrievanceMap = dynamic(
  () => import('@/components/InteractiveGrievanceMap'),
  { ssr: false, loading: () => (
    <div className="w-full h-full min-h-[550px] flex flex-col items-center justify-center bg-[#0a0d1e] rounded-3xl border border-[#1e293b]/40">
      <Globe className="w-8 h-8 text-blue-500 animate-spin" />
      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-3 animate-pulse">Initializing GIS Interface...</span>
    </div>
  )}
);

export default function ConstituencyMapPage() {
  const [villages, setVillages] = useState<VillageNode[]>([]);
  const [dbComplaints, setDbComplaints] = useState<PriorityItem[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<VillageNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState('all');

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

      setVillages(nodes);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Globe className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing Tactical Telemetry...</p>
        </div>
      </div>
    );
  }

  const categoryFilters = [
    { id: 'all', label: 'All Issues' },
    { id: 'Road', label: 'Roads' },
    { id: 'School', label: 'Education' },
    { id: 'Hospital', label: 'Healthcare' },
    { id: 'Water Supply', label: 'Water' },
    { id: 'Drainage', label: 'Drainage' },
  ];

  // Sorting nodes in descending order by complaints count
  const sortedVillagesDesc = [...villages].sort((a, b) => b.complaints - a.complaints);
  const totalGridTickets = villages.reduce((s, v) => s + v.complaints, 0);
  
  // Actual complaints matching the selected Lucknow region
  const selectedRegionComplaints = dbComplaints.filter(c => selectedVillage && c.village === selectedVillage.name);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans pb-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1e293b]/30 pb-4">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-100 tracking-tight flex items-center space-x-2.5">
            <Globe className="w-6 h-6 text-blue-400 shrink-0" />
            <span>Constituency GIS Telemetry Map</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tactical twin of Lucknow constituency with direct, live GIS coordinates mapping.
          </p>
        </div>
      </div>

      {/* 2-Column Layout: Left/Center Column for Map (3/4 Width), Right Column for Sidebar (1/4 Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: Map Area (3/4 Width) */}
        <div className="lg:col-span-3 bg-[#0d1220]/40 rounded-3xl border border-[#1e293b]/30 p-5 relative overflow-hidden flex flex-col justify-between shadow-2xl space-y-4">
          
          {/* Category Layer Filter Toggles HUD (Top Row) */}
          <div className="flex flex-wrap gap-1.5 z-10">
            {categoryFilters.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                  activeLayer === layer.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-[#0f142c] border-[#1e293b]/30 text-slate-400 hover:text-white'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Interactive Leaflet Dark Map */}
          <div className="flex-1 min-h-[550px] relative">
            <InteractiveGrievanceMap
              complaints={dbComplaints}
              selectedVillage={selectedVillage}
              onSelectVillage={setSelectedVillage}
              villages={villages}
              activeLayer={activeLayer}
            />
          </div>

          {/* Map Info Bar (Bottom Row) */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-[#1e293b]/20 pt-3 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Real-time coordinates verification system synced</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Low</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Grievance Regions List / Detail Panel (1/4 Width) */}
        <div className="lg:col-span-1 space-y-4">
          <AnimatePresence mode="wait">
            {selectedVillage ? (
              // 1. DETAIL VIEW FOR SELECTED NODE/REGION
              <motion.div
                key="detail-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col justify-between"
                style={{ minHeight: '480px' }}
              >
                <div>
                  {/* Back button to return to region list */}
                  <button 
                    onClick={() => setSelectedVillage(null)}
                    className="flex items-center space-x-1 text-[9px] text-blue-400 font-black hover:text-blue-300 transition-colors uppercase tracking-wider pb-2 border-b border-[#1e293b]/20 w-full cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Regions List</span>
                  </button>

                  <div className="flex items-center justify-between border-b border-[#1e293b]/20 pb-3 mt-3">
                    <h3 className="text-xs uppercase tracking-wider font-black text-white flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>{selectedVillage.name}</span>
                    </h3>
                  </div>

                  <div className="space-y-2 mt-3 text-[10px] font-bold text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Population Scope:</span>
                      <span className="text-slate-200">{(selectedVillage.totalBeneficiaries).toLocaleString()} Citizens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Grievances:</span>
                      <span className="text-blue-400 font-black">{selectedVillage.complaints} Cases</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Threat Matrix:</span>
                      <span className={`capitalize font-black uppercase text-[8px] px-2 py-0.5 rounded ${
                        selectedVillage.urgencyLevel === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {selectedVillage.urgencyLevel}
                      </span>
                    </div>
                  </div>

                  {/* Grievance list under active node */}
                  <div className="mt-4">
                    <p className="text-[8px] text-slate-500 uppercase font-black mb-2.5 tracking-widest border-b border-[#1e293b]/20 pb-1.5">Grievance Register</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {selectedRegionComplaints.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic py-2">No active complaints found</p>
                      ) : (
                        selectedRegionComplaints.map(c => (
                          <Link 
                            key={c.id} 
                            href={`/mp/complaints`} 
                            className="block p-2 bg-slate-950/50 hover:bg-slate-950 border border-[#1e293b]/10 hover:border-blue-500/20 rounded-xl transition-all"
                          >
                            <p className="text-[10px] font-bold text-slate-200 truncate">{c.title}</p>
                            <div className="flex items-center justify-between text-[8px] text-slate-500 font-semibold mt-1">
                              <span className="inline-flex items-center gap-1">
                                {categoryIcons[c.category] || <AlertTriangle className="w-2.5 h-2.5 text-amber-500/35" />}
                                <span>{c.category}</span>
                              </span>
                              <span className="text-blue-400 font-black">Score: {c.priorityScore}</span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Deficits */}
                  {selectedVillage.infraGap && (
                    <div className="mt-4">
                      <p className="text-[8px] text-slate-500 uppercase font-black mb-2 tracking-widest">Infrastructure Deficits</p>
                      <div className="space-y-1.5">
                        {[
                          { label: 'School Deficit', value: selectedVillage.infraGap.schoolGap, icon: <GraduationCap className="w-3.5 h-3.5" /> },
                          { label: 'PHC Deficit', value: selectedVillage.infraGap.phcGap, icon: <Heart className="w-3.5 h-3.5" /> },
                          { label: 'Road Deficit (km)', value: selectedVillage.infraGap.roadGap, icon: <Building2 className="w-3.5 h-3.5" /> },
                          { label: 'Water Connection Deficit', value: selectedVillage.infraGap.waterGap, icon: <Droplets className="w-3.5 h-3.5" /> },
                        ].filter(g => g.value > 0).map(g => (
                          <div key={g.label} className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-red-500/5 border border-red-500/10">
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
                </div>

                {/* Top suggestion */}
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-0.5 mt-4">
                  <p className="text-[8px] text-blue-500/60 uppercase font-black tracking-wider">Top Priority Demand</p>
                  <p className="text-[10px] text-blue-200 leading-relaxed font-bold">{selectedVillage.topSuggestion}</p>
                </div>
              </motion.div>
            ) : (
              // 2. LIST VIEW FOR ALL REGIONS
              <motion.div
                key="list-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col justify-between"
                style={{ minHeight: '480px' }}
              >
                <div>
                  <div className="flex items-center space-x-2 border-b border-[#1e293b]/20 pb-3">
                    <ListTodo className="w-4 h-4 text-blue-400" />
                    <h2 className="text-xs uppercase tracking-widest font-black text-white">
                      Lucknow Grievance Regions
                    </h2>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 mt-2 font-semibold">
                    Sorted by active complaint volume
                  </p>

                  <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                    {sortedVillagesDesc.map((v, idx) => {
                      const color = urgencyColors[v.urgencyLevel] || urgencyColors.low;
                      return (
                        <button
                          key={v.name}
                          onClick={() => setSelectedVillage(v)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#1e293b]/10 bg-slate-950/20 hover:bg-slate-950/60 hover:border-blue-500/20 text-left transition-all duration-200 hover:translate-x-0.5 cursor-pointer"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-950 border border-[#1e293b]/35 flex items-center justify-center text-[9px] font-black text-slate-400 shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-200 truncate">{v.name}</span>
                              <span className="text-[8px] text-slate-500 font-semibold mt-0.5">{v.block || 'Lucknow District'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-xs font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/15">
                              {v.complaints}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Database summary index */}
                <div className="bg-slate-950/40 border border-[#1e293b]/20 rounded-2xl p-3.5 text-center">
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Active Database Index</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Grievance Twin contains {totalGridTickets} Lucknow tickets.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent Summary Index Box */}
          <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-5 space-y-3 shadow-sm">
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">
              Lucknow Grid Summary
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-black text-white">{villages.length}</p>
                <p className="text-[8px] text-slate-500 uppercase font-bold mt-0.5">Regions</p>
              </div>
              <div>
                <p className="text-lg font-black text-blue-400">{totalGridTickets}</p>
                <p className="text-[8px] text-slate-500 uppercase font-bold mt-0.5">Tickets</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
