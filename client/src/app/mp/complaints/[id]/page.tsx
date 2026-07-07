'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Users, AlertTriangle,
  Calendar, CheckCircle2, XCircle, Clock,
  ThumbsUp, Sparkles, Building2, IndianRupee,
  Wrench, ClipboardList
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
  planned: { label: 'Planned', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  completed: { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  rejected: { label: 'Rejected', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  accepted: { label: 'Accepted', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
};

export default function MpSuggestionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [suggestion, setSuggestion] = useState<SuggestionDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineNotes, setTimelineNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState('PWD (Roads)');
  const [taskInstructions, setTaskInstructions] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'assign'>('status');
  const [submitting, setSubmitting] = useState(false);

  const fetchSuggestionData = async () => {
    try {
      const res = await fetch(`${API}/api/suggestions/${id}`);
      if (res.ok) {
        const sData = await res.json();
        setSuggestion(sData);
        setTimeline(sData.timeline || []);
        if (!selectedStatus) {
          setSelectedStatus(sData.status);
        }
      }
    } catch (e) {
      console.error('Failed to load suggestion details for MP:', e);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSuggestionData().finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;
    setSubmitting(true);
    
    let notes = timelineNotes.trim();
    if (!notes) {
      const defaultNotes: Record<string, string> = {
        under_review: 'MP planning committee has opened the file for budget review.',
        accepted: 'MP has accepted the complaint for departmental planning.',
        planned: 'Funds sanctioned under Rural Development Block Grant.',
        completed: 'Contractor completed physical site build. Local inspection approved.',
        rejected: 'Proposal rejected as it does not meet feasibility guidelines.'
      };
      notes = defaultNotes[selectedStatus] || `Complaint transitioned to state: ${selectedStatus}`;
    }

    try {
      const response = await fetch(`${API}/api/suggestions/${id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, notes })
      });
      if (response.ok) {
        setTimelineNotes('');
        await fetchSuggestionData();
      }
    } catch (err) {
      console.error('Failed to update timeline status:', err);
    } finally {
      setSubmitting(false);
    }
  };

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
          status: suggestion?.status || 'under_review', 
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

          <div className="flex items-center space-x-2 shrink-0 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl text-slate-400 text-[11px] font-medium">
            <span>Manage status & tasks using the control panel below</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
          <h2 className="text-sm font-bold text-white mb-3">Description</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{suggestion.description}</p>
        </motion.div>

        {/* Right side widgets: AI Intelligence & MP Command Console */}
        <div className="space-y-6">
          {/* AI Intelligence Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>AI Intelligence</span>
            </h2>
            <div className="space-y-4">
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.25 }}
            className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50 shadow-2xl relative overflow-hidden"
          >
            {/* Elegant accent border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-amber-600 via-yellow-500 to-amber-600" />
            
            <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>MP Command Console</span>
            </h2>
            
            {/* Tabs */}
            <div className="flex bg-slate-900/60 rounded-xl p-1 mb-5 border border-slate-800/60">
              <button
                type="button"
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-2 px-3 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'status' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Update Status
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('assign')}
                className={`flex-1 py-2 px-3 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'assign' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Assign Task
              </button>
            </div>

            {activeTab === 'status' ? (
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Select Complaint Status</label>
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="under_review">Under MP Review</option>
                    <option value="accepted">Accept Proposal</option>
                    <option value="planned">Planned / Budgeted</option>
                    <option value="completed">Project Completed</option>
                    <option value="rejected">Reject Complaint</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Timeline Notes / Comments (Optional)</label>
                  <textarea
                    value={timelineNotes}
                    onChange={e => setTimelineNotes(e.target.value)}
                    placeholder="Leave blank to use default MP timeline update comment..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/15 disabled:opacity-40"
                >
                  {submitting ? 'Updating Status...' : 'Submit Status Transition'}
                </button>
              </form>
            ) : (
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
                    <option value="Municipal Corporation">Varanasi Nagar Nigam</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Task Instructions / Directives</label>
                  <textarea
                    value={taskInstructions}
                    onChange={e => setTaskInstructions(e.target.value)}
                    placeholder="e.g. Conduct physical site inspection and submit cost estimation DPR by next week."
                    rows={3}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !taskInstructions.trim()}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/15 disabled:opacity-40"
                >
                  {submitting ? 'Assigning Task...' : 'Assign Task & Log Event'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

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
  );
}
