'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users2,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  ArrowUpDown,
  Search,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

interface AreaPopulation {
  id: string;
  district: string;
  area: string;
  total_population: number;
  male_percentage: number;
  female_percentage: number;
  age_0_18_percentage: number;
  age_18_60_percentage: number;
  age_60_plus_percentage: number;
}

const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#a855f7'];
const tooltipStyle = { background: '#0f142c', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' };

export default function MpDemographicsPage() {
  const [populations, setPopulations] = useState<AreaPopulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'total_population' | 'area'>('total_population');

  useEffect(() => {
    fetch(`${API}/api/mp/populations`)
      .then(r => r.json())
      .then(data => setPopulations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Users2 className="w-10 h-10 text-blue-500 animate-pulse" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing Constituency Demographics Census...</p>
        </div>
      </div>
    );
  }

  // Basic math calculations
  const totalConstituencyPop = populations.reduce((sum, p) => sum + p.total_population, 0);
  const avgMalePct = populations.length ? +(populations.reduce((sum, p) => sum + p.male_percentage, 0) / populations.length).toFixed(1) : 0;
  const avgFemalePct = populations.length ? +(populations.reduce((sum, p) => sum + p.female_percentage, 0) / populations.length).toFixed(1) : 0;
  const avgYouthPct = populations.length ? +(populations.reduce((sum, p) => sum + p.age_0_18_percentage, 0) / populations.length).toFixed(1) : 0;
  const avgWorkingPct = populations.length ? +(populations.reduce((sum, p) => sum + p.age_18_60_percentage, 0) / populations.length).toFixed(1) : 0;
  const avgSeniorPct = populations.length ? +(populations.reduce((sum, p) => sum + p.age_60_plus_percentage, 0) / populations.length).toFixed(1) : 0;

  // Pie chart demographic structures
  const genderData = [
    { name: 'Male Population', value: avgMalePct },
    { name: 'Female Population', value: avgFemalePct }
  ];

  const ageData = [
    { name: '0 - 18 Years (Youth)', value: avgYouthPct },
    { name: '18 - 60 Years (Working Age)', value: avgWorkingPct },
    { name: '60+ Years (Senior)', value: avgSeniorPct }
  ];

  // Filtering & Sorting Area population list
  const filtered = populations
    .filter(p => p.area.toLowerCase().includes(searchQuery.toLowerCase()) || p.district.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'total_population') {
        return b.total_population - a.total_population;
      } else {
        return a.area.localeCompare(b.area);
      }
    });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-100 tracking-tight">Constituency Demographics & Census</h1>
        <p className="text-sm text-slate-400 mt-1">AI-informed population datasets and age/gender indices across Lucknow division</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Population */}
        <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-2xl p-5 group flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                <Users2 className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-950 border border-[#1e293b]/30 text-blue-400 font-mono tracking-wide">
                District Total
              </span>
            </div>
            <p className="text-2xl font-mono font-black text-white">{totalConstituencyPop.toLocaleString()}</p>
          </div>
          <div className="flex items-end justify-between mt-3.5 border-t border-[#1e293b]/20 pt-2">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Estimated Population</p>
            <span className="text-[9px] text-slate-400 font-bold">11 Areas Tracked</span>
          </div>
        </div>

        {/* Gender Distribution KPI */}
        <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-2xl p-5 group flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shadow-inner">
                <Percent className="w-4.5 h-4.5 text-pink-400" />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-950 border border-[#1e293b]/30 text-pink-400 font-mono tracking-wide">
                Male:Female
              </span>
            </div>
            <p className="text-2xl font-mono font-black text-white">{avgMalePct}% / {avgFemalePct}%</p>
          </div>
          <div className="flex items-end justify-between mt-3.5 border-t border-[#1e293b]/20 pt-2">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Average Gender Ratio</p>
            <span className="text-[9px] text-emerald-400 font-bold">Balanced Ratio</span>
          </div>
        </div>

        {/* Youth Demographic */}
        <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-2xl p-5 group flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                <Calendar className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-950 border border-[#1e293b]/30 text-amber-400 font-mono tracking-wide">
                Age 0 - 18
              </span>
            </div>
            <p className="text-2xl font-mono font-black text-white">{avgYouthPct}%</p>
          </div>
          <div className="flex items-end justify-between mt-3.5 border-t border-[#1e293b]/20 pt-2">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Youth Percentage</p>
            <span className="text-[9px] text-slate-400 font-semibold">Consolidated</span>
          </div>
        </div>

        {/* Working Age Demographic */}
        <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-2xl p-5 group flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-950 border border-[#1e293b]/30 text-emerald-400 font-mono tracking-wide">
                Age 18 - 60
              </span>
            </div>
            <p className="text-2xl font-mono font-black text-white">{avgWorkingPct}%</p>
          </div>
          <div className="flex items-end justify-between mt-3.5 border-t border-[#1e293b]/20 pt-2">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Working Class Ratio</p>
            <span className="text-[9px] text-emerald-400 font-bold">High Growth</span>
          </div>
        </div>
      </div>

      {/* Charts Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Population by Area Bar Chart */}
        <div className="lg:col-span-2 bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-5 shadow-sm space-y-4">
          <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black">Population by Area Registry</span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={populations} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="area" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="total_population" name="Total Population" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Pie Charts */}
        <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3">Age bracket Distribution</span>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ageData} innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 border-t border-[#1e293b]/20 pt-3 text-[10px]">
            {ageData.map((d, i) => (
              <div key={d.name} className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[i] }} />
                  {d.name}
                </span>
                <span className="text-slate-200 font-extrabold">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Census Area Data Grid */}
      <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Detailed Constituency Census</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-550" />
              <input
                type="text"
                placeholder="Search area..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-[#1e293b]/30 rounded-lg text-xs text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <button
              onClick={() => setSortBy(sortBy === 'total_population' ? 'area' : 'total_population')}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border border-[#1e293b]/30 rounded-lg text-[10px] font-semibold text-slate-350 hover:text-white"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort by {sortBy === 'total_population' ? 'Name' : 'Pop'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b]/30 text-slate-500 uppercase font-black tracking-wider text-[9px]">
                <th className="pb-3 pl-2">District</th>
                <th className="pb-3">Area Name</th>
                <th className="pb-3 text-right">Population</th>
                <th className="pb-3 text-right">Male %</th>
                <th className="pb-3 text-right">Female %</th>
                <th className="pb-3 text-right">Age 0-18</th>
                <th className="pb-3 text-right">Age 18-60</th>
                <th className="pb-3 text-right">Age 60+</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id} className="border-b border-[#1e293b]/10 hover:bg-slate-950/20 text-slate-300 font-bold transition-colors">
                  <td className="py-3 pl-2 font-mono text-[10px] text-slate-500">{p.district}</td>
                  <td className="py-3 text-slate-100">{p.area}</td>
                  <td className="py-3 text-right font-mono text-slate-200">{p.total_population.toLocaleString()}</td>
                  <td className="py-3 text-right text-blue-450">{p.male_percentage}%</td>
                  <td className="py-3 text-right text-pink-450">{p.female_percentage}%</td>
                  <td className="py-3 text-right text-amber-500">{p.age_0_18_percentage}%</td>
                  <td className="py-3 text-right text-emerald-450">{p.age_18_60_percentage}%</td>
                  <td className="py-3 text-right text-violet-450">{p.age_60_plus_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
