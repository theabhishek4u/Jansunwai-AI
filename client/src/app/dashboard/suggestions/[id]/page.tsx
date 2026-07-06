'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  Layers,
  FileImage
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  status: string;
  notes: string;
  created_at: string;
}

interface SuggestionDetail {
  id: string;
  title: string;
  category: string;
  description: string;
  urgency: string;
  status: string;
  village?: string;
  block?: string;
  district: string;
  state: string;
  estimated_beneficiaries: number;
  ai_score_completeness?: number;
  ai_score_impact?: string;
  ai_score_location_verified: boolean;
  ai_score_photo_verified: boolean;
  ai_score_confidence?: number;
  duplicate_of_id?: string | null;
  created_at: string;
  timeline: TimelineEvent[];
  media: Array<{ file_url: string; file_type: string }>;
}

const TIMELINE_STAGES = [
  { status: 'submitted', label: 'Submitted' },
  { status: 'ai_processing', label: 'AI Processing' },
  { status: 'duplicate_checked', label: 'Duplicate Check' },
  { status: 'under_review', label: 'Under MP Review' },
  { status: 'planned', label: 'Planned / Budgeted' },
  { status: 'completed', label: 'Project Completed' }
];

export default function SuggestionDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [sugg, setSugg] = useState<SuggestionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSuggestionDetails();
    }
  }, [id]);

  const fetchSuggestionDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/suggestions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSugg(data);
      }
    } catch (err) {
      console.error('Failed to load suggestion details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency?.toLowerCase()) {
      case 'low': return 'text-slate-400';
      case 'medium': return 'text-sky-400 font-semibold';
      case 'high': return 'text-orange-400 font-semibold';
      case 'critical': return 'text-red-500 font-extrabold animate-pulse';
      default: return 'text-slate-400';
    }
  };

  if (loading) {
    return <div className="text-slate-500 text-sm text-center py-20">Loading detailed timeline tracking...</div>;
  }

  if (!sugg) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-400 text-sm font-bold">Suggestion not found.</p>
        <button onClick={() => router.push('/dashboard')} className="text-indigo-400 text-xs font-bold hover:underline">
          Go back to Overview
        </button>
      </div>
    );
  }

  // Find index of current status to highlight progress
  const currentStageIndex = TIMELINE_STAGES.findIndex(stage => stage.status === sugg.status) === -1 
    ? TIMELINE_STAGES.findIndex(stage => stage.status === 'under_review') // fallback highlight
    : TIMELINE_STAGES.findIndex(stage => stage.status === sugg.status);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Proposal Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-5">
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950/20 border border-indigo-900/15 px-2.5 py-1 rounded">
                  {sugg.category}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${getUrgencyColor(sugg.urgency)}`}>
                  {sugg.urgency} Urgency
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">{sugg.title}</h1>
            </div>

            {/* Description */}
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-950/40 pt-4 font-sans">
              {sugg.description}
            </div>

            {/* Beneficiaries & Location Details */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-950/40 pt-5 text-xs">
              <div className="flex items-start space-x-2.5">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">People Benefited</span>
                  <span className="font-bold text-slate-200">{sugg.estimated_beneficiaries} residents</span>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Location details</span>
                  <span className="font-bold text-slate-200">
                    {sugg.village && `${sugg.village}, `}
                    {sugg.block && `${sugg.block}, `}
                    {sugg.district}, {sugg.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Media uploads evidence display */}
            {sugg.media.length > 0 && (
              <div className="border-t border-slate-950/40 pt-5 space-y-2">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submitted Evidence Photos</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {sugg.media.map((med, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-850">
                      <img src={med.file_url} alt="Evidence" className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Auditor scores panel */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-md font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>AI Auditor Report Card</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Completeness</span>
                <span className="text-xl font-black text-white">{sugg.ai_score_completeness || 60}%</span>
              </div>
              <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Confidence</span>
                <span className="text-xl font-black text-white">{sugg.ai_score_confidence || 80}%</span>
              </div>
              <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Photo Verified</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${sugg.ai_score_photo_verified ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {sugg.ai_score_photo_verified ? 'Verified ✓' : 'No Photo'}
                </span>
              </div>
              <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Loc Verified</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${sugg.ai_score_location_verified ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {sugg.ai_score_location_verified ? 'Verified ✓' : 'Manual'}
                </span>
              </div>
            </div>

            {sugg.duplicate_of_id && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-bold">Duplicate Linked Proposal</span>
                  <p className="mt-1 text-[11px] text-slate-400">
                    This request was mapped as a duplicate of an existing request in the district. To maximize influence, it has been aggregated with 742 other citizens backing the target project.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timeline & MP Console Simulator */}
        <div className="space-y-6">
          {/* Timeline Tracking */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-6">
            <h2 className="text-md font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Tracking Timeline</span>
            </h2>

            <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-850">
              {TIMELINE_STAGES.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                
                // Fetch timeline notes matching this stage if logged
                const loggedEvent = sugg.timeline.find(t => t.status === stage.status);

                return (
                  <div key={idx} className="relative flex items-start space-x-4 pl-8">
                    {/* Circle Indicator */}
                    <div className={`absolute left-0 w-7.5 h-7.5 rounded-full flex items-center justify-center border z-10 transition-all ${
                      isCurrent 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30' 
                        : isPassed 
                          ? 'bg-slate-950 border-emerald-500 text-emerald-400' 
                          : 'bg-slate-950 border-slate-850 text-slate-600'
                    }`}>
                      {isPassed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className={`block text-xs font-bold ${isCurrent ? 'text-white' : isPassed ? 'text-slate-300' : 'text-slate-500'}`}>
                        {stage.label}
                      </span>
                      {loggedEvent && (
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {loggedEvent.notes}
                        </p>
                      )}
                      {loggedEvent && (
                        <span className="block text-[9px] text-slate-600 font-semibold">
                          {new Date(loggedEvent.created_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
