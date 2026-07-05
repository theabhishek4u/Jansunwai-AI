'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { 
  FileText, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  TrendingUp, 
  PlusCircle, 
  MessageSquare, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Map
} from 'lucide-react';

interface Suggestion {
  id: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  ai_score_completeness: number;
  created_at: string;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMapLayer, setActiveMapLayer] = useState<'roads' | 'water' | 'hospitals' | 'green'>('roads');

  useEffect(() => {
    if (user) {
      fetchSuggestions();
    }
  }, [user]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/suggestions?citizen_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Failed to load user suggestions from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute stat counts
  const total = suggestions.length;
  const underReview = suggestions.filter(s => s.status === 'under_review').length;
  const completed = suggestions.filter(s => s.status === 'completed').length;
  const activeCount = suggestions.filter(s => s.status !== 'completed' && s.status !== 'rejected').length;

  const averageAiScore = suggestions.length > 0 
    ? Math.round(suggestions.reduce((acc, curr) => acc + (curr.ai_score_completeness || 0), 0) / suggestions.length)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ai_processing': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'duplicate_checked': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'under_review': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'planned': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'low': return 'text-slate-400';
      case 'medium': return 'text-sky-400';
      case 'high': return 'text-orange-400 font-semibold';
      case 'critical': return 'text-red-500 font-bold animate-pulse';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-900/40 via-indigo-950/20 to-slate-900 border border-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-3xl -z-10" />
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Jai Hind, {user?.full_name}! 🇮🇳</h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Welcome to your Jansunwai AI dashboard. Here you can submit development ideas, track live works, and earn badges for verified location audits.
          </p>
        </div>
        <Link 
          href="/dashboard/submit" 
          className="bg-linear-to-r from-orange-500 to-indigo-600 hover:from-orange-400 hover:to-indigo-500 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-2 shrink-0 self-stretch md:self-auto text-center justify-center transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Suggestion</span>
        </Link>
      </div>

      {/* TODAY'S AI CONSTITUENCY INSIGHTS */}
      <div className="bg-linear-to-b from-indigo-950/30 to-slate-950/20 border border-indigo-900/35 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.03)]">
        {/* Glow grid in background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-indigo-650/5 to-transparent blur-3xl -z-10" />
        <div className="absolute bottom-0 left-12 w-64 h-64 bg-orange-500/5 blur-3xl -z-10" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-950 pb-5 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                Today&apos;s AI Insights & Constituency Health
                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Live Heuristics</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Active spatial scanner evaluating demographic constraints, GIS routing delays, and crowdsourced demands.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-semibold text-slate-400 self-start sm:self-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Grounded Datasets Verified</span>
          </div>
        </div>

        {/* Heuristics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Road Quality */}
          <div className="bg-slate-900/40 border border-indigo-950/20 p-5 rounded-2xl relative group hover:border-indigo-600/30 transition-all hover:bg-slate-900/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-md">Roads & Connectivity</span>
              <TrendingUp className="w-4 h-4 text-amber-500 animate-bounce" />
            </div>
            <h4 className="text-xs font-bold text-white mb-2">Road Demand Spike</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Spatial suggestion clusters indicate road quality demands increased <span className="text-amber-500 font-extrabold">24%</span> in Sigra & Lahartara blocks.
            </p>
            <div className="mt-3 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
              Source: Local telemetry feeds
            </div>
          </div>

          {/* Card 2: Water issue */}
          <div className="bg-slate-900/40 border border-indigo-950/20 p-5 rounded-2xl relative group hover:border-indigo-600/30 transition-all hover:bg-slate-900/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider bg-sky-400/15 border border-sky-400/25 px-2 py-0.5 rounded-md">Water Resources</span>
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-white mb-2">Groundwater Dip Alert</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Aquifer drop detected. Heavy water scarcity signatures registered across <span className="text-sky-400 font-extrabold">3 rural villages</span>.
            </p>
            <div className="mt-3 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
              Source: Aquifer sensor data
            </div>
          </div>

          {/* Card 3: Healthcare shortage */}
          <div className="bg-slate-900/40 border border-indigo-950/20 p-5 rounded-2xl relative group hover:border-indigo-600/30 transition-all hover:bg-slate-900/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider bg-rose-400/15 border border-rose-400/25 px-2 py-0.5 rounded-md">Healthcare Coverage</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <h4 className="text-xs font-bold text-white mb-2">Hospital Shortage</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Travel time to the nearest emergency clinic in <span className="font-semibold text-white">Block B (Harahua)</span> has crossed <span className="text-rose-400 font-extrabold">45 minutes</span>.
            </p>
            <div className="mt-3 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
              Source: Routing delay optimization
            </div>
          </div>

          {/* Card 4: Prescription */}
          <div className="bg-indigo-950/20 border border-indigo-500/25 p-5 rounded-2xl relative group hover:border-indigo-500/45 transition-all hover:bg-indigo-950/30 shadow-[0_0_20px_rgba(99,102,241,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider bg-indigo-500/25 border border-indigo-500/35 px-2 py-0.5 rounded-md">AI Prescription</span>
              <Sparkles className="w-4 h-4 text-indigo-300 animate-spin-slow" />
            </div>
            <h4 className="text-xs font-bold text-indigo-300 mb-2">Build Primary Health Centre</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              AI model recommends allocating budget for <span className="text-emerald-400 font-extrabold">1 new PHC</span> in Harahua block to close geographic travel gap.
            </p>
            <div className="mt-3 text-[9px] text-indigo-400 font-bold uppercase tracking-wider flex items-center space-x-1">
              <span>Optimizes travel time by 82%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Submitted</span>
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{total}</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tasks</span>
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{activeCount}</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Under MP Review</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{underReview}</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Implemented</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{completed}</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg AI Score</span>
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-indigo-400">{averageAiScore}%</span>
        </div>
      </div>

      {/* Main Grid: Recent suggestions & Gamification overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Suggestions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Your Recent Suggestions</h2>
            <Link href="/dashboard/suggestions" className="text-xs font-bold text-indigo-400 hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-10 text-center text-slate-500 text-sm">
              Loading recent requests...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-12 text-center space-y-4">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">No suggestions yet</p>
                <p className="text-slate-500 text-xs">Your voice counts! Draft your first development idea today.</p>
              </div>
              <Link 
                href="/dashboard/submit" 
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl"
              >
                <span>Draft Suggestion</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.slice(0, 4).map((sugg) => (
                <Link
                  key={sugg.id}
                  href={`/dashboard/suggestions/${sugg.id}`}
                  className="block bg-slate-900/20 hover:bg-slate-900/50 border border-slate-900 hover:border-slate-850 p-5 rounded-2xl transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        {sugg.category}
                      </span>
                      <h3 className="text-sm font-bold text-white">{sugg.title}</h3>
                      <p className="text-xs text-slate-500">
                        Submitted: {new Date(sugg.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right sm:text-center text-xs px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-xl">
                        <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">AI Complete</span>
                        <span className="font-bold text-slate-300">{sugg.ai_score_completeness || 0}%</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">Status</span>
                        <span className={`inline-block border text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(sugg.status)}`}>
                          {sugg.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Gamification Sidebar summary */}
        <div className="space-y-6">
          {/* MINI HEATMAP WIDGET */}
          <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 relative overflow-hidden space-y-4 shadow-[0_0_20px_rgba(99,102,241,0.02)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Map className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">GIS Priority Heatmap</h3>
              </div>
              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center space-x-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 mr-1 animate-ping" />
                <span>Live Feed</span>
              </span>
            </div>

            {/* Map Area Mockup (SVG based) */}
            <div className="relative">
              <svg viewBox="0 0 200 120" className="w-full h-36 rounded-2xl bg-slate-950 border border-slate-800/80 p-2 shadow-inner">
                {/* stylized map grid */}
                <defs>
                  <radialGradient id="glow-amber" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </radialGradient>
                  <radialGradient id="glow-blue" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </radialGradient>
                  <radialGradient id="glow-red" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </radialGradient>
                  <radialGradient id="glow-green" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </radialGradient>
                </defs>

                {/* Grid lines representing street overlay */}
                <path d="M10,0 L10,120 M40,0 L40,120 M80,0 L80,120 M120,0 L120,120 M160,0 L160,120" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" opacity={0.3} />
                <path d="M0,20 L200,20 M0,50 L200,50 M0,80 L200,80 M0,110 L200,110" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" opacity={0.3} />

                {/* Varanasi River Ganga boundary curve mockup */}
                <path d="M 0,90 Q 70,80 120,120" fill="none" stroke="#1d4ed8" strokeWidth="3" opacity={0.3} />
                <text x="35" y="112" fill="#3b82f6" fontSize="5" fontWeight="bold" opacity={0.4}>Ganga River</text>

                {/* Major streets */}
                <line x1="20" y1="0" x2="180" y2="120" stroke="#1e293b" strokeWidth="2.5" />
                <line x1="0" y1="40" x2="200" y2="40" stroke="#1e293b" strokeWidth="2" />
                <line x1="100" y1="0" x2="100" y2="120" stroke="#1e293b" strokeWidth="2" />

                {/* Dynamic Heat Zones based on layer selection */}
                {activeMapLayer === 'roads' && (
                  <>
                    {/* Sigra road quality heat dot */}
                    <circle cx="65" cy="35" r="22" fill="url(#glow-amber)" />
                    <circle cx="65" cy="35" r="4" fill="#f59e0b" />
                    {/* Lahartara connector heat dot */}
                    <circle cx="130" cy="78" r="18" fill="url(#glow-amber)" />
                    <circle cx="130" cy="78" r="3.5" fill="#f59e0b" />
                    
                    <text x="65" y="27" fill="#fde047" fontSize="5" fontWeight="bold" textAnchor="middle">Sigra Bottleneck (24% Spike)</text>
                    <text x="130" y="70" fill="#fde047" fontSize="5" fontWeight="bold" textAnchor="middle">Lahartara Road</text>
                  </>
                )}

                {activeMapLayer === 'water' && (
                  <>
                    <circle cx="45" cy="70" r="20" fill="url(#glow-blue)" />
                    <circle cx="45" cy="70" r="4.5" fill="#38bdf8" />
                    <circle cx="160" cy="30" r="24" fill="url(#glow-blue)" />
                    <circle cx="160" cy="30" r="5" fill="#38bdf8" />

                    <text x="45" y="62" fill="#7dd3fc" fontSize="5" fontWeight="bold" textAnchor="middle">Susuwahi Aquifer (Crit)</text>
                    <text x="160" y="22" fill="#7dd3fc" fontSize="5" fontWeight="bold" textAnchor="middle">Kapoori Village</text>
                  </>
                )}

                {activeMapLayer === 'hospitals' && (
                  <>
                    <circle cx="110" cy="45" r="25" fill="url(#glow-red)" />
                    <circle cx="110" cy="45" r="5" fill="#f43f5e" />
                    
                    <text x="110" y="36" fill="#fda4af" fontSize="5" fontWeight="bold" textAnchor="middle">Harahua Travel Exclusion Zone</text>
                  </>
                )}

                {activeMapLayer === 'green' && (
                  <>
                    <circle cx="85" cy="55" r="20" fill="url(#glow-green)" />
                    <circle cx="85" cy="55" r="4" fill="#10b981" />
                    <circle cx="140" cy="50" r="24" fill="url(#glow-green)" />
                    <circle cx="140" cy="50" r="5" fill="#10b981" />

                    <text x="85" y="47" fill="#6ee7b7" fontSize="5" fontWeight="bold" textAnchor="middle">Cantonment Park Area</text>
                  </>
                )}
              </svg>
            </div>

            {/* Layer Selection buttons */}
            <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveMapLayer('roads')}
                className={`py-1.5 px-0.5 rounded-lg text-[9px] font-bold transition-all text-center ${activeMapLayer === 'roads' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Roads
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer('water')}
                className={`py-1.5 px-0.5 rounded-lg text-[9px] font-bold transition-all text-center ${activeMapLayer === 'water' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Water
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer('hospitals')}
                className={`py-1.5 px-0.5 rounded-lg text-[9px] font-bold transition-all text-center ${activeMapLayer === 'hospitals' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Hospital
              </button>
              <button
                type="button"
                onClick={() => setActiveMapLayer('green')}
                className={`py-1.5 px-0.5 rounded-lg text-[9px] font-bold transition-all text-center ${activeMapLayer === 'green' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                Green
              </button>
            </div>

            {/* Selected Layer Heuristics Info */}
            <div className="bg-slate-950 border border-slate-900/60 p-3 rounded-xl text-[10px] text-slate-400 space-y-1">
              {activeMapLayer === 'roads' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-300">Active Road Works</span>
                    <span className="text-amber-400 font-bold">4 Projects</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">Sigra road widening scheduled for Q3. Lahartara bypass proposal approved.</p>
                </>
              )}
              {activeMapLayer === 'water' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-300">Tube-well Audit</span>
                    <span className="text-sky-400 font-bold">3 Mandated</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">Central water conservation audit running across Susuwahi blocks to resolve aquifer drop alerts.</p>
                </>
              )}
              {activeMapLayer === 'hospitals' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-300">Healthcare Gap</span>
                    <span className="text-rose-400 font-bold">Critical</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">AI recommends a Primary Health Centre in Harahua. Travel exclusion index currently at high risk.</p>
                </>
              )}
              {activeMapLayer === 'green' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-300">Park Afforestation</span>
                    <span className="text-emerald-400 font-bold">2 Greenways</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">Afforestation drives active near Cantonment boundary paths to increase canopy indexes.</p>
                </>
              )}
            </div>
          </div>

          <h2 className="text-lg font-bold text-white pt-2">Gamification Leaderboard</h2>
          <div className="bg-linear-to-b from-slate-900/60 to-slate-900 border border-slate-900 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-xl rounded-full" />
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Contribution Score</h3>
                <p className="text-[10px] text-slate-500">Earn points on high completeness submissions</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Current Points</span>
                  <span className="text-white font-bold">{user?.contribution_score} XP</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  {/* Progress bar to next levels */}
                  <div 
                    className="h-full bg-linear-to-r from-orange-500 to-amber-400 rounded-full" 
                    style={{ width: `${Math.min(100, ((user?.contribution_score || 0) / 250) * 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Level 1 (0 XP)</span>
                  <span>Level 2 (250 XP)</span>
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-950/60 p-4 rounded-2xl space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Earning Rules</span>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Post Idea: +20 XP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Upload Image: +20 XP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>AI Score &gt;80%: +30 XP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Status Completed: +50 XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
