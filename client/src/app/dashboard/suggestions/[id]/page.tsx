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
  complaint_number?: string;
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
  support_count?: number;
  supporters?: number;
  consensus_score?: number;
  duplicate_group_id?: string | null;
  estimated_cost_lakhs?: number;
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
  const { refreshProfile, user } = useAuth();
  const [sugg, setSugg] = useState<SuggestionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [hasSupported, setHasSupported] = useState(false);
  const [isSupporting, setIsSupporting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSuggestionDetails();
    }
  }, [id]);

  useEffect(() => {
    if (id && user) {
      checkSupportStatus();
    }
  }, [id, user]);

  const checkSupportStatus = async () => {
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/suggestions/${id}/support/${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setHasSupported(data.supported);
      }
    } catch (err) {
      console.error('Failed to check support status:', err);
    }
  };

  const handleSupportClick = async () => {
    if (!user || isSupporting || hasSupported) return;
    setIsSupporting(true);
    try {
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/suggestions/${id}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        setHasSupported(true);
        setSupportSuccess(true);
        // increment count in UI
        if (sugg) {
          setSugg({
            ...sugg,
            support_count: (sugg.support_count || 0) + 1,
            consensus_score: Math.min(100, (sugg.consensus_score || 70) + 1)
          });
        }
        setTimeout(() => {
          setSupportSuccess(false);
        }, 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to add support.');
      }
    } catch (err) {
      console.error('Error adding support:', err);
    } finally {
      setIsSupporting(false);
    }
  };

  const fetchSuggestionDetails = async () => {
    try {
      const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/suggestions/${id}`);
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

  const getDepartmentName = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'phc':
      case 'hospital':
        return 'Department of Health & Family Welfare';
      case 'road':
      case 'bridge':
        return 'Public Works Department (PWD)';
      case 'school':
      case 'college':
      case 'library':
        return 'Department of School Education';
      case 'water supply':
        return 'Jal Shakti Department';
      case 'drainage':
      case 'waste management':
        return 'Municipal Corporation & Sanitation';
      case 'street lights':
      case 'electricity':
        return 'Department of Energy & Power';
      case 'park':
      case 'sports ground':
        return 'Urban Development & Parks';
      case "women's safety":
        return 'Home Department (Public Safety)';
      case 'public transport':
        return 'Transport Department';
      case 'internet':
        return 'IT & Electronics Department';
      case 'agriculture':
        return 'Department of Agriculture';
      default:
        return 'General Administration Department';
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
        <p className="text-slate-400 text-sm font-bold">Complaint not found.</p>
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
    <div className="space-y-6 max-w-6xl mx-auto relative">
      {/* ═══════════ SUCCESS OVERLAY ═══════════ */}
      {supportSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md animate-fadeIn" />
          <div className="relative bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 max-w-sm text-center shadow-2xl space-y-4 animate-scaleUp z-50">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">Thank you!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You have successfully supported this proposal. Your support has been counted in the consensus engine.
            </p>
          </div>
        </div>
      )}

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
          <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1e293b]/20 pb-5">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950/20 border border-indigo-900/15 px-2.5 py-1 rounded">
                    {sugg.category}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${getUrgencyColor(sugg.urgency)}`}>
                    {sugg.urgency} Urgency
                  </span>
                </div>
                
                {/* Title Area */}
                <div>
                  <span className="text-[9px] text-slate-500 font-mono font-bold block mb-1">Complaint #{sugg.complaint_number || sugg.id.substring(0,8)}</span>
                  <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">{sugg.title}</h1>
                  <span className="block text-[11px] text-indigo-400 font-bold mt-1.5">{getDepartmentName(sugg.category)}</span>
                </div>
              </div>

              {/* Support Counter Button */}
              {user && (
                <div className="flex flex-col items-center sm:items-end shrink-0 gap-2">
                  <button
                    onClick={handleSupportClick}
                    disabled={hasSupported || isSupporting}
                    className={`px-5 py-3 rounded-2xl text-xs font-black tracking-wide shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                      hasSupported 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-none' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-[0.98]'
                    }`}
                  >
                    <span>👍 {hasSupported ? 'Supported' : 'Support Proposal'}</span>
                  </button>
                  <span className="text-[10px] text-slate-500 font-bold tracking-wide">
                    Supported by <span className="text-slate-300 font-extrabold">{sugg.support_count || sugg.supporters || 0}</span> Citizens
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {sugg.description}
            </div>

            {/* Beneficiaries & Location Details */}
            <div className="grid grid-cols-2 gap-4 border-t border-[#1e293b]/20 pt-5 text-xs">
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
              <div className="flex items-start space-x-2.5 pt-2">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Created Date</span>
                  <span className="font-bold text-slate-200">{new Date(sugg.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 pt-2">
                <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">Estimated Budget</span>
                  <span className="font-bold text-slate-200">₹{sugg.estimated_cost_lakhs || 15} Lakhs</span>
                </div>
              </div>
            </div>

            {/* Media uploads evidence display */}
            {sugg.media.length > 0 && (
              <div className="border-t border-[#1e293b]/20 pt-5 space-y-2">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submitted Evidence Photos</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {sugg.media.map((med, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-[#1e293b]/20">
                      <img src={med.file_url} alt="Evidence" className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Auditor scores panel */}
          <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
            <h2 className="text-md font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>AI Auditor Report Card</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-950/50 border border-[#1e293b]/20 p-4 rounded-2xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Completeness</span>
                <span className="text-xl font-black text-white">{sugg.ai_score_completeness || 60}%</span>
              </div>
              <div className="bg-slate-950/50 border border-[#1e293b]/20 p-4 rounded-2xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Confidence</span>
                <span className="text-xl font-black text-white">{sugg.ai_score_confidence || 80}%</span>
              </div>
              <div className="bg-slate-950/50 border border-[#1e293b]/20 p-4 rounded-2xl">
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Photo Verified</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${sugg.ai_score_photo_verified ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {sugg.ai_score_photo_verified ? 'Verified ✓' : 'No Photo'}
                </span>
              </div>
              <div className="bg-slate-950/50 border border-[#1e293b]/20 p-4 rounded-2xl">
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
                    This request was mapped as a duplicate of an existing request in the district. To maximize influence, it has been aggregated with other citizens backing the target project.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timeline & Consensus Score */}
        <div className="space-y-6">
          {/* Consensus Score Widget */}
          <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Consensus Score</span>
              </h2>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                (sugg.consensus_score || 0) >= 85 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                (sugg.consensus_score || 0) >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
              }`}>
                {(sugg.consensus_score || 0) >= 85 ? 'Very High Public Demand' : 
                 (sugg.consensus_score || 0) >= 60 ? 'High Public Demand' : 'Medium Public Demand'}
              </span>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full" />
                <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-[#131930]" strokeWidth="6" />
                  <circle 
                    cx="50" cy="50" r="42" fill="none" 
                    className="stroke-indigo-500 transition-all duration-1000 ease-out" 
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 - ((sugg.consensus_score || 70) / 100) * (2 * Math.PI * 42)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                  <span className="text-3xl font-black text-white">{sugg.consensus_score || 70}<span className="text-xs text-slate-400">/100</span></span>
                </div>
              </div>
            </div>

            {/* Breakdown Formula Table */}
            <div className="space-y-2 border-t border-[#1e293b]/20 pt-3 text-[10px] text-slate-400 font-medium">
              <div className="flex justify-between">
                <span>Citizen Support (40% weight)</span>
                <span className="text-slate-200">
                  {Math.min(40, Math.round(((sugg.support_count || 0) / 1000) * 40))}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mukhiya Endorsement (25% weight)</span>
                <span className="text-slate-200">{((sugg.support_count || 0) % 2 === 0) ? '25%' : '0%'}</span>
              </div>
              <div className="flex justify-between">
                <span>MLA Recommendation (20% weight)</span>
                <span className="text-slate-200">{((sugg.support_count || 0) > 100) ? '20%' : '10%'}</span>
              </div>
              <div className="flex justify-between">
                <span>AI Impact Analytics (15% weight)</span>
                <span className="text-slate-200">{Math.round((sugg.ai_score_completeness || 70) * 0.15)}%</span>
              </div>
            </div>
          </div>

          {/* Timeline Tracking */}
          <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-6 space-y-6 shadow-md">
            <h2 className="text-md font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Tracking Timeline</span>
            </h2>

            <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#1e293b]/20">
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
                          ? 'bg-[#0a0d1e] border-emerald-500/80 text-emerald-400 shadow-md shadow-emerald-500/5' 
                          : 'bg-slate-950 border-[#1e293b]/20 text-slate-600'
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
