'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Search, Filter, MessageSquare, ChevronRight, Sparkles, MapPin, AlertCircle } from 'lucide-react';

interface Suggestion {
  id: string;
  title: string;
  category: string;
  description?: string;
  urgency: string;
  status: string;
  ai_score_completeness: number;
  created_at: string;
  district: string;
  village?: string;
}

const CATEGORIES = [
  "Road", "Bridge", "School", "College", "Hospital", "PHC", 
  "Water Supply", "Drainage", "Street Lights", "Electricity", 
  "Library", "Park", "Sports Ground", "Skill Center", "Women's Safety", 
  "Public Transport", "Internet", "Waste Management", "Environment", 
  "Agriculture", "Others"
];

export default function TrackSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
        setFilteredSuggestions(data);
      }
    } catch (err) {
      console.error('Failed to load user suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...suggestions];

    // Search query match
    if (search) {
      result = result.filter(s => 
        s.title.toLowerCase().includes(search.toLowerCase()) || 
        s.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category match
    if (categoryFilter) {
      result = result.filter(s => s.category === categoryFilter);
    }

    // Status match
    if (statusFilter) {
      result = result.filter(s => s.status === statusFilter);
    }

    setFilteredSuggestions(result);
  }, [search, categoryFilter, statusFilter, suggestions]);

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

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'low': return 'bg-slate-900 text-slate-400 border-slate-800';
      case 'medium': return 'bg-sky-950/40 text-sky-400 border-sky-900/30';
      case 'high': return 'bg-orange-950/40 text-orange-400 border-orange-900/30';
      case 'critical': return 'bg-red-950/40 text-red-400 border-red-900/30 animate-pulse';
      default: return 'bg-slate-900 text-slate-400 border-slate-850';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white">Track Development Suggestions</h1>
        <p className="text-xs text-slate-400 mt-1">Track the full lifecycle of your suggestions, from AI auditing to MP budget sanctions.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/40 border border-slate-900 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proposals..."
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="ai_processing">AI Processing</option>
            <option value="duplicate_checked">Duplicate Checked</option>
            <option value="under_review">Under Review</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Suggestion List */}
      {loading ? (
        <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-16 text-center text-slate-500 text-sm">
          Fetching tracking database...
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-16 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-slate-400 font-bold text-sm">No suggestions match criteria</p>
          <p className="text-slate-500 text-xs">Try clearing filters or type a different keyword search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSuggestions.map((sugg) => (
            <Link
              key={sugg.id}
              href={`/dashboard/suggestions/${sugg.id}`}
              className="bg-slate-900/20 hover:bg-slate-900/50 border border-slate-900 hover:border-slate-850 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950/20 border border-indigo-900/10 px-2.5 py-1 rounded">
                    {sugg.category}
                  </span>
                  <span className={`border text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${getUrgencyBadge(sugg.urgency)}`}>
                    {sugg.urgency} Urgency
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{sugg.title}</h3>
                <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-600" />
                    <span>{sugg.village || 'Ward'}, {sugg.district}</span>
                  </span>
                  <span>•</span>
                  <span>Submitted: {new Date(sugg.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status and Score on Right */}
              <div className="flex items-center space-x-6 self-stretch md:self-auto justify-between md:justify-end border-t border-slate-900 md:border-0 pt-4 md:pt-0 shrink-0">
                <div className="flex items-center space-x-4">
                  <div className="text-center bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 min-w-[70px]">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">AI Complete</span>
                    <span className="font-extrabold text-xs text-indigo-400">{sugg.ai_score_completeness || 0}%</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">Timeline State</span>
                    <span className={`inline-block border text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusColor(sugg.status)}`}>
                      {sugg.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
