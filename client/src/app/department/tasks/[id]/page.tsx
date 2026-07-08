'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Users, Calendar, Wrench, IndianRupee, 
  Sparkles, CheckCircle2, Clock, MessageSquare, Send, Upload,
  AlertTriangle, Play, ShieldAlert, Check, RefreshCw, XCircle, X,
  Activity, Zap, Target
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface DeptSession {
  id: string;
  name: string;
  email: string;
  officer: string;
  category: string;
  role: string;
}

interface Suggestion {
  id: string;
  complaint_number?: string;
  citizen_id: string;
  title: string;
  category: string;
  description: string;
  location_lat?: number;
  location_lng?: number;
  village?: string;
  block?: string;
  district: string;
  state: string;
  estimated_beneficiaries: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  ai_score_completeness?: number;
  ai_score_impact?: string;
  ai_score_confidence?: number;
  supporters?: number;
  support_count: number;
  consensus_score: number;
  estimated_cost_lakhs?: number;
  created_at: string;
  updated_at: string;
  timeline?: Array<{
    id: string;
    status: string;
    notes?: string;
    created_at: string;
  }>;
}

const TIMELINE_STEPS = [
  { id: 'planned', label: 'Assigned' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'site_inspection', label: 'Site Inspection' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'work_started', label: 'Work Started' },
  { id: '30_complete', label: '30% Done' },
  { id: '60_complete', label: '60% Done' },
  { id: '90_complete', label: '90% Done' },
  { id: 'completed', label: 'Completed' }
];

export default function TaskDetailConsole() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [session, setSession] = useState<DeptSession | null>(null);
  const [task, setTask] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sliderVal, setSliderVal] = useState(50);
  const [chatMessage, setChatMessage] = useState('');
  const [chats, setChats] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'MP Dashboard', text: 'Please fast-track this task as it has high citizen demand.', time: 'Yesterday' }
  ]);

  // Real Image Upload State
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const [beforeImg, setBeforeImg] = useState('');
  const [afterImg, setAfterImg] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isEvidenceSubmitted, setIsEvidenceSubmitted] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('dept-session');
    if (raw) {
      setSession(JSON.parse(raw) as DeptSession);
    }
  }, []);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/suggestions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data);
        
        // If task is already completed, show mock images for the preview
        if (data.status === 'completed' || data.status === 'accepted_by_mp') {
          setIsEvidenceSubmitted(true);
          if (!beforeImg) setBeforeImg('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop');
          if (!afterImg) setAfterImg('https://images.unsplash.com/photo-1594913785162-e67853b23c28?q=80&w=600&auto=format&fit=crop');
        }

        if (data.timeline) {
          const extractedChats: typeof chats = [];
          data.timeline.forEach((event: any) => {
            if (event.notes && event.notes.includes('[Chat]')) {
              const cleaned = event.notes.replace('[Chat]', '');
              const parts = cleaned.split(': ');
              extractedChats.push({
                sender: parts[0] || 'System',
                text: parts.slice(1).join(': ') || cleaned,
                time: new Date(event.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              });
            }
          });
          if (extractedChats.length > 0) {
            setChats(extractedChats);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load task details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const updateTaskStatus = async (status: string, notes: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/suggestions/${id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        await fetchTaskDetails();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !session) return;

    const messageText = chatMessage.trim();
    setChatMessage('');

    const newChat = {
      sender: session.officer.split(' (')[0],
      text: messageText,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setChats(prev => [...prev, newChat]);

    await updateTaskStatus(
      task?.status || 'under_review',
      `[Chat] ${session.officer.split(' (')[0]}: ${messageText}`
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'before') {
          setBeforeImg(event.target?.result as string);
        } else {
          setAfterImg(event.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitEvidence = async () => {
    setUploadStatus('Verifying & Submitting Evidence...');
    setIsEvidenceSubmitted(true);
    // Move task to completed once evidence is submitted
    await updateTaskStatus('completed', `[Complete] ${session?.officer.split(' (')[0]} marked task completed. Evidence submitted.`);
    setUploadStatus('Evidence successfully submitted!');
    setTimeout(() => setUploadStatus(''), 3000);
  };

  if (loading || !task || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
        </div>
      </div>
    );
  }

  const currentStepIndex = TIMELINE_STEPS.findIndex(s => s.id === task.status);

  return (
    <div className="space-y-6 pb-10 font-sans relative">
      {/* Back button */}
      <Link href="/department" className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors bg-slate-900/50 px-4 py-2 rounded-xl border border-white/5">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Dashboard</span>
      </Link>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Suggestion details & Timeline & Slider */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Info Box */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-[32px] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500" />
            
            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                  Workload #{task.id.substring(0,8)}
                </span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border shadow-lg ${
                  task.urgency === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/20' : 
                  task.urgency === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-orange-500/20' :
                  'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-sky-500/20'
                }`}>
                  {task.urgency} Priority
                </span>
              </div>

              <h1 className="text-2xl font-black text-white leading-tight tracking-tight">{task.title}</h1>
              
              <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 shadow-inner">
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {task.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-[10px] text-slate-400 pt-3">
                <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-slate-500 block uppercase tracking-widest font-black mb-1.5">Target Area</span>
                  <p className="flex items-center space-x-1.5 text-slate-200 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span className="truncate">{task.village || 'City Sector'}, {task.block || 'Central'}</span>
                  </p>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-slate-500 block uppercase tracking-widest font-black mb-1.5">Fund Sourced</span>
                  <p className="flex items-center space-x-1.5 text-amber-400 font-black text-[13px]">
                    <IndianRupee className="w-4 h-4" />
                    <span>{task.estimated_cost_lakhs || 0} L</span>
                  </p>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-slate-500 block uppercase tracking-widest font-black mb-1.5">Jurisdiction</span>
                  <p className="flex items-center space-x-1.5 text-slate-200 font-bold">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">Lucknow Region</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sleek Interactive Progress Timeline */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-[32px] p-8">
            <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center space-x-2 border-b border-white/5 pb-4 mb-8">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Operation Timeline</span>
            </h2>

            <div className="relative flex justify-between items-center w-full px-2">
              {/* Background Line */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0" />
              {/* Progress Line */}
              <div 
                className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full z-0 transition-all duration-700 ease-in-out" 
                style={{ width: `calc(${currentStepIndex === -1 ? 0 : (currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}% - 3rem)` }}
              />

              {TIMELINE_STEPS.map((step, idx) => {
                const isCurrent = task.status === step.id;
                const isPassed = currentStepIndex >= idx;
                const isNext = currentStepIndex + 1 === idx;
                const isDisabled = submitting || (!isPassed && !isNext);

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center group">
                    <button
                      disabled={isDisabled}
                      onClick={() => updateTaskStatus(step.id, `${session.officer.split(' (')[0]} updated state: ${step.label}`)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-4 border-slate-900 ${
                        isCurrent 
                          ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-125 cursor-default' 
                          : isPassed 
                          ? 'bg-emerald-400 hover:bg-emerald-300 cursor-pointer' 
                          : isNext
                          ? 'bg-slate-600 hover:bg-blue-500 hover:scale-110 shadow-[0_0_15px_rgba(59,130,246,0)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer'
                          : 'bg-slate-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isPassed && !isCurrent ? <Check className="w-4 h-4 text-slate-900 font-black" /> : null}
                      {isCurrent ? <Activity className="w-4 h-4 text-white animate-pulse" /> : null}
                    </button>
                    <span className={`absolute top-12 whitespace-nowrap text-[8px] font-black uppercase tracking-widest transition-colors ${
                      isCurrent ? 'text-blue-400' : isPassed ? 'text-emerald-400' : isNext ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Functional Field Evidence Upload Slider */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-[32px] p-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-indigo-400" />
                <span>Field Evidence Verifier</span>
              </h2>
              {uploadStatus && (
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse border border-emerald-500/20">
                  {uploadStatus}
                </span>
              )}
            </div>

            {/* Hidden File Inputs */}
            <input type="file" accept="image/*" ref={beforeInputRef} onChange={(e) => handleFileChange(e, 'before')} className="hidden" />
            <input type="file" accept="image/*" ref={afterInputRef} onChange={(e) => handleFileChange(e, 'after')} className="hidden" />

            {!isEvidenceSubmitted && (
              <>
                {/* Upload Action Buttons */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <button
                    onClick={() => beforeInputRef.current?.click()}
                    className={`group flex flex-col items-center justify-center space-y-2 hover:bg-slate-900 border border-dashed py-6 rounded-2xl transition-all ${
                      beforeImg ? 'bg-emerald-500/5 border-emerald-500/50 text-emerald-400' : 'bg-slate-950/50 border-white/10 hover:border-blue-500/50 text-slate-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      beforeImg ? 'bg-emerald-500/20' : 'bg-slate-900 group-hover:bg-blue-500/10'
                    }`}>
                      {beforeImg ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" /> : <Upload className="w-4.5 h-4.5" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {beforeImg ? 'Before Image Selected' : 'Upload Before Image'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => afterInputRef.current?.click()}
                    className={`group flex flex-col items-center justify-center space-y-2 hover:bg-slate-900 border border-dashed py-6 rounded-2xl transition-all ${
                      afterImg ? 'bg-emerald-500/5 border-emerald-500/50 text-emerald-400' : 'bg-slate-950/50 border-white/10 hover:border-blue-500/50 text-slate-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      afterImg ? 'bg-emerald-500/20' : 'bg-slate-900 group-hover:bg-blue-500/10'
                    }`}>
                      {afterImg ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" /> : <Upload className="w-4.5 h-4.5" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {afterImg ? 'After Image Selected' : 'Upload After Image'}
                    </span>
                  </button>
                </div>

                {/* Submit Evidence Button appears only when both images are uploaded */}
                <AnimatePresence>
                  {beforeImg && afterImg && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <button
                        onClick={handleSubmitEvidence}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Submit Evidence & Complete Task</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Slider Comparison Display - Only visible after submission */}
            {isEvidenceSubmitted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-[350px] rounded-[24px] overflow-hidden border border-emerald-500/30 select-none shadow-[0_20px_50px_rgba(16,185,129,0.15)] bg-slate-950"
              >
                {/* After image (background) */}
                <img 
                  src={afterImg} 
                  alt="After" 
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
                <span className="absolute bottom-4 right-4 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg z-10 tracking-wider">After Resolution</span>

                {/* Before image (clipped overlay) */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ clipPath: `polygon(0 0, ${sliderVal}% 0, ${sliderVal}% 100%, 0 100%)` }}
                >
                  <img 
                    src={beforeImg} 
                    alt="Before" 
                    className="w-full h-full object-cover absolute inset-0 opacity-90"
                  />
                </div>
                <span className="absolute bottom-4 left-4 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg z-10 tracking-wider">Initial State</span>

                {/* Slider Controller line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
                  style={{ left: `${sliderVal}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border-2 border-white text-white flex items-center justify-center text-xs font-black shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                    ↔
                  </div>
                </div>

                {/* Transparent drag handler */}
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sliderVal} 
                  onChange={e => setSliderVal(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </motion.div>
            )}
            
            {/* GPS Metadata box */}
            <div className="mt-6 flex items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-white/5 text-[9px] text-slate-500 font-mono tracking-wider shadow-inner">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-blue-500" />
                <span>TLSv1.3 AES-256 Auth</span>
              </div>
              <div className="text-right">
                <span className="block text-slate-400">GPS: {task.location_lat || '26.8500'}, {task.location_lng || '80.9499'}</span>
                <span className="block mt-1 text-slate-600">ID: {session.officer}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Gemini AI & Actions & Chat */}
        <div className="space-y-6">
          
          {/* Action Hub */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-[32px] p-6 space-y-4">
            <h2 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center space-x-2 border-b border-white/5 pb-4 mb-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              <span>Actions Hub</span>
            </h2>

            <div className="space-y-3">
              {task.status === 'planned' && (
                <button
                  disabled={submitting}
                  onClick={() => updateTaskStatus('accepted', `${session.officer.split(' (')[0]} accepted the MP task assignment.`)}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>Accept Assignment</span>
                </button>
              )}

              {task.status !== 'completed' && task.status !== 'accepted_by_mp' && (
                <button
                  disabled={submitting}
                  onClick={() => updateTaskStatus('completed', `[Complete] ${session.officer.split(' (')[0]} marked task completed. Awaiting MP approval.`)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-40"
                >
                  <Check className="w-4.5 h-4.5" />
                  <span>Mark Completed</span>
                </button>
              )}

              <button
                disabled={submitting}
                onClick={() => updateTaskStatus(task.status, `${session.officer.split(' (')[0]} requested budget reallocation.`)}
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-300 hover:text-amber-400 text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
              >
                <IndianRupee className="w-4 h-4" />
                <span>Request Budget</span>
              </button>

              <button
                disabled={submitting}
                onClick={() => updateTaskStatus('rejected', `${session.officer.split(' (')[0]} flagged task as unfeasible.`)}
                className="w-full py-3.5 bg-slate-950 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
              >
                <XCircle className="w-4 h-4" />
                <span>Flag Unfeasible</span>
              </button>
            </div>
          </div>

          {/* AI Intelligence / Gemini Recommendation */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)] rounded-[32px] p-6 space-y-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
            
            <div className="relative z-10">
              <h2 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center space-x-2 border-b border-white/5 pb-4 mb-4">
                <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                <span>Gemini Analytics</span>
              </h2>

              <div className="space-y-4 text-[11px] text-slate-350 leading-relaxed">
                <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-2xl shadow-inner">
                  <span className="font-black text-[9px] uppercase tracking-widest text-indigo-300 block mb-2 flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Execution Summary
                  </span>
                  <p className="text-white/80 font-medium">{task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description} High beneficiary density found. Gemini recommends immediate resolution.</p>
                </div>

                <div className="space-y-2 bg-slate-950/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                    <span className="text-slate-500">Timeline Predict</span>
                    <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">14 Days</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase pt-2 border-t border-white/5">
                    <span className="text-slate-500">Risk Factor</span>
                    <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">Low (12%)</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase pt-2 border-t border-white/5">
                    <span className="text-slate-500">Optimal Cost</span>
                    <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">₹{task.estimated_cost_lakhs || 0}L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Messaging */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-[32px] p-6 space-y-4">
            <h2 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center space-x-2 border-b border-white/5 pb-4">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Direct Link Chat</span>
            </h2>

            {/* Chat list */}
            <div className="h-44 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {chats.map((c, i) => (
                <div key={i} className={`p-3 rounded-2xl max-w-[85%] shadow-md ${c.sender.includes('MP') || c.sender.includes('Dashboard') ? 'bg-slate-950/80 border border-white/5 text-slate-300 mr-auto rounded-tl-sm' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ml-auto rounded-tr-sm'}`}>
                  <span className="block text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{c.sender} • {c.time}</span>
                  <p className="leading-relaxed text-[11px] font-medium">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-4">
              <input
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Message MP..."
                className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={submitting || !chatMessage.trim()}
                className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 text-white flex items-center justify-center transition-all shrink-0 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
