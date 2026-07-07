'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { 
  FileText, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  PlusCircle, 
  MessageSquare, 
  Sparkles,
  Trash2,
  MapPin,
  Users
} from 'lucide-react';

interface Suggestion {
  id: string;
  complaint_number?: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  ai_score_completeness: number;
  created_at: string;
  consensus_score?: number;
  supporters?: number;
  village?: string;
  block?: string;
  district?: string;
  estimated_beneficiaries?: number;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [supportedSuggestions, setSupportedSuggestions] = useState<Suggestion[]>([]);
  const [constituencyProjects, setConstituencyProjects] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSuggestions();
      fetchSupportedSuggestions();
    }
  }, [user]);

  const fetchSupportedSuggestions = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${user?.id}/supported`);
      if (res.ok) {
        const data = await res.json();
        setSupportedSuggestions(data);
      }
    } catch (err) {
      console.error('Failed to load supported suggestions:', err);
    }
  };

  const fetchAllSuggestions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/suggestions?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        // Filter active constituency projects managed by the MP (planned, under_review, completed)
        const activeProjects = data.filter((s: Suggestion) => 
          s.status === 'planned' || s.status === 'under_review' || s.status === 'completed'
        );
        setConstituencyProjects(activeProjects);
      }
    } catch (err) {
      console.error('Failed to load constituency projects:', err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/suggestions?citizen_id=${user?.id}&t=${Date.now()}`, { cache: 'no-store' });
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/suggestions/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSuggestions(suggestions.filter(s => s.id !== id));
      } else {
        alert('Failed to delete complaint. Please try again later.');
      }
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('An error occurred while deleting the complaint.');
    }
  };

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
      <div className="bg-gradient-to-br from-[#0e142c] to-[#0a0d1e] border border-[#1e293b]/30 rounded-3xl shadow-lg shadow-black/10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-3xl -z-10" />
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Jai Hind, {user?.full_name}! 🇮🇳</h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Welcome to your Jansunwai AI dashboard. Here you can submit complaints, track live works.
          </p>
        </div>
        <Link 
          href="/dashboard/submit" 
          className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-2 shrink-0 self-stretch md:self-auto text-center justify-center transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0f142c] border border-[#1e293b]/30 p-5 rounded-2xl shadow-sm hover:border-[#3b82f6]/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Submitted</span>
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{total}</span>
        </div>

        <div className="bg-[#0f142c] border border-[#1e293b]/30 p-5 rounded-2xl shadow-sm hover:border-[#3b82f6]/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tasks</span>
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{activeCount}</span>
        </div>

        <div className="bg-[#0f142c] border border-[#1e293b]/30 p-5 rounded-2xl shadow-sm hover:border-[#3b82f6]/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Under MP Review</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{underReview}</span>
        </div>

        <div className="bg-[#0f142c] border border-[#1e293b]/30 p-5 rounded-2xl shadow-sm hover:border-[#3b82f6]/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Implemented</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{completed}</span>
        </div>

        <div className="bg-[#0f142c] border border-[#1e293b]/30 p-5 rounded-2xl shadow-sm hover:border-[#3b82f6]/30 transition-all duration-300 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg AI Score</span>
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-indigo-400">{averageAiScore}%</span>
        </div>
      </div>

      {/* Recent Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Recent Complaints</h2>
        </div>

        {loading ? (
          <div className="bg-[#0b1329]/30 backdrop-blur-md border border-[#1e293b]/30 rounded-3xl p-10 text-center text-slate-500 text-sm">
            Loading recent requests...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="bg-[#0b1329]/30 backdrop-blur-md border border-[#1e293b]/30 rounded-3xl p-12 text-center space-y-4">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-white font-bold text-sm">No complaints yet</p>
              <p className="text-slate-500 text-xs">Your voice counts! Draft your first development idea today.</p>
            </div>
            <Link 
              href="/dashboard/submit" 
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl"
            >
              <span>Draft Complaint</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.slice(0, 4).map((sugg) => (
              <Link
                key={sugg.id}
                href={`/dashboard/suggestions/${sugg.id}`}
                className="block bg-[#0a0d1e] hover:bg-[#0f142c] border border-[#1e293b]/20 hover:border-[#3b82f6]/30 p-5 rounded-2xl transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {sugg.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-mono mb-1">{sugg.complaint_number || sugg.id.substring(0,8)}</span>
                        <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{sugg.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                        Submitted: {new Date(sugg.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right sm:text-center text-xs px-2.5 py-1.5 bg-slate-950 border border-[#1e293b]/30 rounded-xl">
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">AI Complete</span>
                      <span className="font-bold text-slate-300">{sugg.ai_score_completeness || 0}%</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">Status</span>
                      <span className={`inline-block border text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(sugg.status)}`}>
                        {sugg.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="border-l border-slate-800 pl-3 ml-1 flex items-center">
                      <button
                        onClick={(e) => handleDelete(e, sugg.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Complaint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── SUPPORTED PROPOSALS SECTION ── */}
      <div className="bg-[#0a0d1e]/90 border border-[#1e293b]/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Supported Proposals</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Community proposals you are backing to accelerate constituency funding</p>
          </div>
          <span className="text-[10px] text-slate-500 font-bold bg-slate-950 border border-[#1e293b]/30 px-2.5 py-1 rounded-full">
            {supportedSuggestions.length} Supported
          </span>
        </div>

        {supportedSuggestions.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800/80 rounded-2xl space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-650 mx-auto" />
            <p className="text-slate-500 text-xs font-semibold">You have not supported any community proposals yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {supportedSuggestions.map((sugg) => (
              <Link
                key={sugg.id}
                href={`/dashboard/suggestions/${sugg.id}`}
                className="block bg-[#0a0d1e] hover:bg-[#0f142c] border border-[#1e293b]/20 hover:border-[#3b82f6]/30 p-4 rounded-2xl transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                      {sugg.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{sugg.title}</h4>
                    <span className="block text-[10px] text-slate-500 font-bold">
                      Supported: {new Date(sugg.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right sm:text-center text-xs px-2.5 py-1 bg-slate-950 border border-[#1e293b]/30 rounded-xl">
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Consensus</span>
                      <span className="font-bold text-slate-300">{sugg.consensus_score || 70}/100</span>
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
    </div>
  );
}
