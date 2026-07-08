'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Users, AlertTriangle,
  Calendar, CheckCircle, XCircle, Clock,
  ThumbsUp, Sparkles, Building2, IndianRupee,
  Wrench, ClipboardList, CheckCircle2,
  ShieldCheck
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SuggestionDetail {
  id: string;
  citizen_id: string;
  complaint_number?: string;
  title: string;
  category: string;
  description: string;
  village?: string;
  block?: string;
  district: string;
  state: string;
  urgency: string;
  status: string;
  estimated_beneficiaries: number;
  supporters?: number;
  estimated_cost_lakhs?: number;
  ai_score_completeness?: number;
  ai_score_impact?: string;
  ai_score_confidence?: number;
  ai_score_location_verified: boolean;
  ai_score_photo_verified: boolean;
  created_at: string;
}

interface TimelineEvent {
  id: string;
  status: string;
  notes?: string;
  created_at: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  ai_processing: { label: 'AI Processing', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  duplicate_checked: { label: 'Duplicate Checked', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  under_review: { label: 'Under Review', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  planned: { label: 'Planned / Assigned', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  completed: { label: 'Dept Completed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  rejected: { label: 'Rejected', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  accepted: { label: 'Accepted', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  accepted_by_mp: { label: 'Task Closed & Verified', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
};

export default function MpSuggestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [suggestion, setSuggestion] = useState<SuggestionDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedDepartment, setAssignedDepartment] = useState('PWD (Roads)');
  const [taskInstructions, setTaskInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sliderVal, setSliderVal] = useState(50);

  const fetchSuggestionData = async () => {
    try {
      const res = await fetch(`${API}/api/suggestions/${id}`);
      if (res.ok) {
        const sData = await res.json();
        setSuggestion(sData);
        setTimeline(sData.timeline || []);
      }
    } catch (e) {
      console.error('Failed to load suggestion details for MP:', e);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSuggestionData().finally(() => setLoading(false));
  }, [id]);

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedDepartment || !taskInstructions.trim()) return;
    setSubmitting(true);

    const notes = `Task Assigned to ${assignedDepartment}. Action required: ${taskInstructions.trim()}`;
    
    try {
      const response = await fetch(`${API}/api/suggestions/${id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'planned', 
          notes 
        })
      });
      if (response.ok) {
        setTaskInstructions('');
        await fetchSuggestionData();
      }
    } catch (err) {
      console.error('Failed to assign task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCompletedTask = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/api/suggestions/${id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'accepted_by_mp', 
          notes: 'MP verified the field evidence and officially closed the task.' 
        })
      });
      if (response.ok) {
        await fetchSuggestionData();
      }
    } catch (err) {
      console.error('Failed to verify task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !suggestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 animate-pulse flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
      </div>
    );
  }

  const sc = statusLabels[suggestion.status] || statusLabels.submitted;
  const isCompletedByDept = suggestion.status === 'completed';
  const isClosed = suggestion.status === 'accepted_by_mp';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/mp/complaints" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Complaints</span>
      </Link>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sc.color}`}>{sc.label}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${suggestion.urgency === 'critical' ? 'bg-red-500/10 text-red-400' : suggestion.urgency === 'high' ? 'bg-orange-500/10 text-orange-400' : suggestion.urgency === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                {suggestion.urgency.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500">{suggestion.category}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono font-medium block mb-2">Complaint #{suggestion.complaint_number || suggestion.id.substring(0,8)}</span>
            <h1 className="text-2xl font-bold text-white leading-snug mb-3">
              {suggestion.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center space-x-1"><MapPin className="w-3.5 h-3.5" /><span>{suggestion.village}, {suggestion.block}</span></span>
              <span className="flex items-center space-x-1"><Users className="w-3.5 h-3.5" /><span>{suggestion.estimated_beneficiaries.toLocaleString()} beneficiaries</span></span>
              <span className="flex items-center space-x-1"><ThumbsUp className="w-3.5 h-3.5" /><span>{suggestion.supporters?.toLocaleString() || 0} supporters</span></span>
              <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /><span>{new Date(suggestion.created_at).toLocaleDateString('en-IN')}</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
            <h2 className="text-sm font-bold text-white mb-3">Description</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{suggestion.description}</p>
          </motion.div>

          {/* Department Field Evidence Review - Only shows when task is marked completed by Dept */}
          {(isCompletedByDept || isClosed) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#111827] rounded-2xl p-6 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="text-[11px] uppercase tracking-widest font-black text-amber-400 mb-5 flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Department Field Evidence Review</span>
                  </span>
                  {isClosed && (
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      VERIFIED & CLOSED
                    </span>
                  )}
                </h2>

                <p className="text-xs text-slate-400 mb-6 font-medium">The assigned department has marked this task as completed and submitted the following photographic evidence. Please verify the work.</p>

                {/* Interactive Slider */}
                <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-slate-700 select-none shadow-2xl bg-slate-900 mb-6">
                  {/* After image (background) */}
                  <img 
                    src="https://images.unsplash.com/photo-1594913785162-e67853b23c28?q=80&w=600&auto=format&fit=crop" 
                    alt="After" 
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                  <span className="absolute bottom-3 right-3 bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase px-2.5 py-1 rounded shadow-lg z-10">After Work (Resolved)</span>

                  {/* Before image (clipped overlay) */}
                  <div 
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    style={{ clipPath: `polygon(0 0, ${sliderVal}% 0, ${sliderVal}% 100%, 0 100%)` }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop" 
                      alt="Before" 
                      className="w-full h-full object-cover absolute inset-0 opacity-90"
                    />
                  </div>
                  <span className="absolute bottom-3 left-3 bg-red-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase px-2.5 py-1 rounded shadow-lg z-10">Before Work (Initial)</span>

                  {/* Slider line */}
                  <div 
                    className="absolute top-0 bottom-0 w-[2px] bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
                    style={{ left: `${sliderVal}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border-2 border-white text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                      ↔
                    </div>
                  </div>

                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderVal} 
                    onChange={e => setSliderVal(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  />
                </div>

                {!isClosed && (
                  <button
                    disabled={submitting}
                    onClick={handleVerifyCompletedTask}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>Verify Evidence & Officially Close Task</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
            <h2 className="text-sm font-bold text-white mb-5 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Progress Timeline</span>
            </h2>
            <div className="space-y-4">
              {timeline.map((event, i) => {
                const es = statusLabels[event.status] || statusLabels.submitted;
                return (
                  <div key={event.id} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${i === timeline.length - 1 ? 'bg-amber-400' : 'bg-slate-600'}`} />
                      {i < timeline.length - 1 && <div className="w-px h-8 bg-slate-700" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${es.color}`}>{es.label}</span>
                        <span className="text-[10px] text-slate-500">{new Date(event.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      {event.notes && <p className="text-xs text-slate-400 mt-1">{event.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right side widgets: AI Intelligence & MP Command Console */}
        <div className="space-y-6">
          {/* AI Intelligence Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50 text-xs">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>AI Intelligence</span>
            </h2>
            <div className="space-y-4 text-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Completeness Score</span>
                <span className="text-sm font-bold text-white">{suggestion.ai_score_completeness || 'N/A'}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500" style={{ width: `${suggestion.ai_score_completeness || 0}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">AI Confidence</span>
                <span className="text-sm font-bold text-white">{suggestion.ai_score_confidence || 'N/A'}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Impact Level</span>
                <span className={`text-xs font-bold ${suggestion.ai_score_impact === 'Critical' ? 'text-red-400' : suggestion.ai_score_impact === 'High' ? 'text-orange-400' : 'text-yellow-400'}`}>{suggestion.ai_score_impact}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Location Verified</span>
                <span className={`text-xs font-bold ${suggestion.ai_score_location_verified ? 'text-emerald-400' : 'text-red-400'}`}>{suggestion.ai_score_location_verified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Photo Verified</span>
                <span className={`text-xs font-bold ${suggestion.ai_score_photo_verified ? 'text-emerald-400' : 'text-red-400'}`}>{suggestion.ai_score_photo_verified ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 flex items-center space-x-1"><IndianRupee className="w-3 h-3" /><span>Est. Cost</span></span>
                <span className="text-sm font-bold text-amber-400">₹{suggestion.estimated_cost_lakhs || 0} Lakhs</span>
              </div>
            </div>
          </motion.div>

          {/* MP Command Console */}
          {suggestion.status !== 'completed' && suggestion.status !== 'accepted_by_mp' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.25 }}
              className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-amber-600 via-yellow-500 to-amber-600" />
              
              <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Assign New Directive</span>
              </h2>

              <form onSubmit={handleAssignTask} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Select Department / Officer</label>
                  <select
                    value={assignedDepartment}
                    onChange={e => setAssignedDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="PWD (Roads)">Public Works Department (PWD)</option>
                    <option value="District Water Board">District Water & Sanitation Board</option>
                    <option value="Health Department">Chief Medical Officer (CMO)</option>
                    <option value="Electricity Board">UP Power Corporation Ltd (UPPCL)</option>
                    <option value="Education Department">Basic Shiksha Adhikari (BSA)</option>
                    <option value="Municipal Corporation">Lucknow Nagar Nigam</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Task Instructions</label>
                  <textarea
                    value={taskInstructions}
                    onChange={e => setTaskInstructions(e.target.value)}
                    placeholder="e.g. Conduct physical site inspection and submit estimation..."
                    rows={4}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !taskInstructions.trim()}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/15 disabled:opacity-40"
                >
                  {submitting ? 'Assigning Task...' : 'Submit Task Assignment'}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
