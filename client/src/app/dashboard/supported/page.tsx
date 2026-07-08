'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { 
  Sparkles, 
  MessageSquare, 
  ArrowRight,
  Clock,
  CheckCircle,
  Calendar,
  Layers
} from 'lucide-react';

interface Suggestion {
  id: string;
  complaint_number?: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  consensus_score?: number;
  support_count?: number;
  supporters?: number;
  created_at: string;
}

export default function SupportedProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchSupportedProposals();
    }
  }, [user]);

  const fetchSupportedProposals = async () => {
    try {
      // Fetch public complaints from the user's local area (village_ward) so they can support them
      const localArea = user?.village_ward || 'Gomti Nagar'; // Default to Gomti Nagar for testing if none is set
      const res = await fetch(`http://localhost:5000/api/suggestions?village=${localArea}`);
      if (res.ok) {
        let data = await res.json();
        // Filter out the user's own complaints so they support others
        if (user?.id) {
          data = data.filter((s: any) => s.citizen_id !== user.id);
        }
        setProposals(data);
      }
    } catch (err) {
      console.error('Failed to load local suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'text-sky-400 border-sky-500/20 bg-sky-500/5';
      case 'under_review': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'planned': return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5';
      case 'completed': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'rejected': return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      default: return 'text-slate-400 border-slate-500/20 bg-slate-500/5';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="font-semibold text-slate-400">Loading supported complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <span>Support Complaints</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Support complaints submitted by others in your area. If a complaint is in your local area (pincode), you can view and support it. Complaints with high community support are prioritized by the AI and recommended to the MP and local officials.
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-900/60 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-950/60 border border-slate-850 flex items-center justify-center text-slate-600 mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">No supported complaints yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse submitted issues on the overview or try submitting a new complaint to trigger duplicate checking and support suggestions.
            </p>
          </div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-xs font-bold text-indigo-400 hover:text-indigo-300 gap-1 mt-2 hover:underline"
          >
            <span>Browse complaints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map((sugg) => (
            <Link
              key={sugg.id}
              href={`/dashboard/suggestions/${sugg.id}`}
              className="block bg-slate-900/40 hover:bg-slate-900/70 border border-slate-900 hover:border-slate-800 p-5 rounded-3xl transition-all hover:-translate-y-0.5 duration-300"
            >
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950/20 border border-indigo-900/15 px-2 py-0.5 rounded">
                      {sugg.category}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      #{sugg.complaint_number || sugg.id.substring(0, 8)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 line-clamp-2 leading-snug">
                    {sugg.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between border-t border-slate-950/20 pt-3">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Consensus</span>
                      <span className="text-xs font-black text-indigo-400">{sugg.consensus_score || 70}%</span>
                    </div>
                    <div className="text-center border-l border-slate-800 pl-4">
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Supported By</span>
                      <span className="text-xs font-black text-slate-300">{sugg.support_count || sugg.supporters || 0} Citizens</span>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-block border text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(sugg.status)}`}>
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
  );
}
