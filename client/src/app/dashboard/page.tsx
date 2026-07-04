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
  Sparkles
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
      <div className="bg-gradient-to-r from-indigo-900/40 via-indigo-950/20 to-slate-900 border border-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-3xl -z-10" />
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Jai Hind, {user?.full_name}! 🇮🇳</h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Welcome to your Jansunwai AI dashboard. Here you can submit development ideas, track live works, and earn badges for verified location audits.
          </p>
        </div>
        <Link 
          href="/dashboard/submit" 
          className="bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-400 hover:to-indigo-500 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-2 shrink-0 self-stretch md:self-auto text-center justify-center transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Suggestion</span>
        </Link>
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
          <h2 className="text-lg font-bold text-white">Gamification Leaderboard</h2>
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-900 border border-slate-900 rounded-3xl p-6 relative overflow-hidden">
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
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" 
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
