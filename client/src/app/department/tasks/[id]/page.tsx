'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Users, Calendar, Wrench, IndianRupee, 
  Sparkles, CheckCircle2, Clock, MessageSquare, Send, Upload,
  AlertTriangle, Play, ShieldAlert, Check, RefreshCw, XCircle, X
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
  { id: 'procurement', label: 'Material Procurement' },
  { id: 'work_started', label: 'Work Started' },
  { id: '30_complete', label: '30% Complete' },
  { id: '60_complete', label: '60% Complete' },
  { id: '90_complete', label: '90% Complete' },
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

  // For evidence upload simulation
  const [beforeImg, setBeforeImg] = useState('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop');
  const [afterImg, setAfterImg] = useState('https://images.unsplash.com/photo-1594913785162-e67853b23c28?q=80&w=600&auto=format&fit=crop');
  const [uploadStatus, setUploadStatus] = useState('');

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
        
        // Extract chat logs from timeline if any
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

    // Append to local state
    const newChat = {
      sender: session.officer.split(' (')[0],
      text: messageText,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setChats(prev => [...prev, newChat]);

    // Send timeline message log
    await updateTaskStatus(
      task?.status || 'under_review',
      `[Chat] ${session.officer.split(' (')[0]}: ${messageText}`
    );
  };

  const handleUploadEvidence = (type: 'before' | 'after') => {
    setUploadStatus('Uploading evidence payload...');
    setTimeout(() => {
      if (type === 'before') {
        setBeforeImg('https://images.unsplash.com/photo-1584467541268-b040f83be3fd?q=80&w=600&auto=format&fit=crop');
      } else {
        setAfterImg('https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=600&auto=format&fit=crop');
      }
      setUploadStatus('Evidence payload uploaded with GPS & metadata!');
      setTimeout(() => setUploadStatus(''), 3000);
    }, 1550);
  };

  if (loading || !task || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 animate-pulse flex items-center justify-center">
          <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  // Find index of current status in steps
  const currentStepIndex = TIMELINE_STEPS.findIndex(s => s.id === task.status);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/department" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Task Dashboard</span>
      </Link>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Suggestion details & Timeline & Slider */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info */}
          <div className="bg-[#0b1329]/80 border border-slate-850 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Task Details • #{task.id.substring(0,8)}</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${task.urgency === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'}`}>{task.urgency}</span>
            </div>
            <h1 className="text-xl font-black text-white leading-snug">{task.title}</h1>
            <p className="text-xs text-slate-350 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-850/40">
              {task.description}
            </p>

            <div className="grid grid-cols-3 gap-4 text-[10px] text-slate-400 pt-2">
              <div>
                <span className="text-slate-500 block uppercase tracking-wider font-bold">Location</span>
                <p className="flex items-center space-x-1 mt-1 text-slate-200 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{task.village || 'Lucknow'}, {task.block || 'Central'}</span>
                </p>
              </div>
              <div>
                <span className="text-slate-500 block uppercase tracking-wider font-bold">Budget Sourced</span>
                <p className="flex items-center space-x-1 mt-1 text-amber-400 font-mono font-bold">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{task.estimated_cost_lakhs || 0} Lakhs</span>
                </p>
              </div>
              <div>
                <span className="text-slate-500 block uppercase tracking-wider font-bold">Constituency</span>
                <p className="flex items-center space-x-1 mt-1 text-slate-200 font-bold">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lucknow District</span>
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Progress Timeline */}
          <div className="bg-[#0b1329]/80 border border-slate-850 rounded-3xl p-6 space-y-4">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-850 pb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Interactive Progress Timeline</span>
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {TIMELINE_STEPS.map((step, idx) => {
                const isCurrent = task.status === step.id;
                const isPassed = currentStepIndex >= idx;
                return (
                  <button
                    key={step.id}
                    disabled={submitting}
                    onClick={() => updateTaskStatus(step.id, `${session.officer.split(' (')[0]} transitioned work state to: ${step.label}`)}
                    className={`p-2 rounded-xl text-center border text-[9px] font-black uppercase transition-all flex flex-col justify-between items-center h-16 ${
                      isCurrent
                        ? 'bg-blue-650 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : isPassed
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                        : 'bg-slate-900 border-slate-850 text-slate-500 hover:border-slate-800'
                    }`}
                  >
                    <span className="block">{step.label}</span>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center bg-slate-950 border border-slate-850 mt-1">
                      {isPassed && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence Upload & Image Comparison Slider */}
          <div className="bg-[#0b1329]/80 border border-slate-850 rounded-3xl p-6 space-y-4">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-indigo-400" />
                <span>Field Evidence Comparison</span>
              </span>
              {uploadStatus && <span className="text-[10px] text-emerald-400 font-extrabold animate-pulse">{uploadStatus}</span>}
            </h2>

            {/* Slider Comparison Display */}
            <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-slate-850 select-none shadow-2xl">
              {/* After image (background) */}
              <img 
                src={afterImg} 
                alt="After" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute bottom-3 right-3 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow z-10">After Resurfacing</span>

              {/* Before image (clipped overlay) */}
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderVal}% 0, ${sliderVal}% 100%, 0 100%)` }}
              >
                <img 
                  src={beforeImg} 
                  alt="Before" 
                  className="w-full h-full object-cover absolute inset-0"
                />
              </div>
              <span className="absolute bottom-3 left-3 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow z-10">Before Work</span>

              {/* Slider Controller line */}
              <div 
                className="absolute top-0 bottom-0 w-[2px] bg-white z-20 pointer-events-none"
                style={{ left: `${sliderVal}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-slate-900 border border-slate-200 flex items-center justify-center text-xs font-black shadow-lg">
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
            </div>

            {/* Action buttons for upload simulation */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleUploadEvidence('before')}
                className="flex items-center justify-center space-x-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold py-3 rounded-xl transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload BEFORE Image</span>
              </button>
              <button
                onClick={() => handleUploadEvidence('after')}
                className="flex items-center justify-center space-x-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold py-3 rounded-xl transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload AFTER Image</span>
              </button>
            </div>
            
            {/* GPS Metadata box */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-850/40 text-[10px] text-slate-500 font-mono space-y-1 leading-normal">
              <p>📍 GPS Coordinate Target: {task.location_lat || '26.8500'}, {task.location_lng || '80.9499'}</p>
              <p>🧑‍💼 Upload Auth: {session.officer}</p>
              <p>🖧 Device Checksum: TLSv1.3 SHA-256 Verified Signature</p>
            </div>
          </div>
        </div>

        {/* Right Side: Gemini AI & Actions & Chat */}
        <div className="space-y-6">
          
          {/* Action Hub */}
          <div className="bg-[#0b1329]/80 border border-slate-850 rounded-3xl p-6 space-y-4">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-850 pb-3">
              <Wrench className="w-4 h-4 text-amber-500" />
              <span>Actions Hub</span>
            </h2>

            <div className="space-y-2.5">
              {task.status === 'planned' && (
                <button
                  disabled={submitting}
                  onClick={() => updateTaskStatus('accepted', `${session.officer.split(' (')[0]} accepted the MP task assignment.`)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Task Assignment</span>
                </button>
              )}

              {task.status !== 'completed' && (
                <button
                  disabled={submitting}
                  onClick={() => updateTaskStatus('completed', `[Complete] ${session.officer.split(' (')[0]} marked task completed. Evidence uploaded.`)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Work Completed</span>
                </button>
              )}

              <button
                disabled={submitting}
                onClick={() => updateTaskStatus(task.status, `${session.officer.split(' (')[0]} requested budget reallocation of ₹12 Lakhs.`)}
                className="w-full py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
              >
                <IndianRupee className="w-4 h-4" />
                <span>Request Additional Budget</span>
              </button>

              <button
                disabled={submitting}
                onClick={() => updateTaskStatus('rejected', `${session.officer.split(' (')[0]} marked task as rejected/unfeasible.`)}
                className="w-full py-3 bg-red-650/10 hover:bg-red-600/10 border border-red-500/20 text-red-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject / Flag Unfeasible</span>
              </button>
            </div>
          </div>

          {/* AI Intelligence / Gemini Recommendation */}
          <div className="bg-[#0b1329]/80 border border-slate-850 rounded-3xl p-6 space-y-4">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-850 pb-3">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <span>Gemini AI Insights</span>
            </h2>

            <div className="space-y-3.5 text-[11px] text-slate-350 leading-relaxed">
              <div className="bg-violet-950/20 border border-violet-500/15 p-3.5 rounded-2xl">
                <span className="font-extrabold text-violet-300 block mb-1">AI Task Summary</span>
                <p>Resurfacing required over 1.2km stretch. Estimated beneficiary density is high. Recommends immediate completion to avoid monsoon delays.</p>
              </div>

              <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-2xl">
                <div className="flex justify-between items-center text-[10px]">
                  <span>AI Timelines Prediction</span>
                  <span className="text-emerald-400 font-bold">14 Days</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span>Delay Risk Probability</span>
                  <span className="text-emerald-400 font-bold">Low (12%)</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span>Optimized Budget Target</span>
                  <span className="text-amber-400 font-mono font-bold">₹22.5L</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messaging with MP */}
          <div className="bg-[#0b1329]/80 border border-slate-850 rounded-3xl p-6 space-y-4">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-850 pb-3">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Secure MP Chat Link</span>
            </h2>

            {/* Chat list */}
            <div className="h-44 overflow-y-auto space-y-2.5 pr-1 text-[11px]">
              {chats.map((c, i) => (
                <div key={i} className={`p-2.5 rounded-2xl max-w-[85%] ${c.sender.includes('MP') || c.sender.includes('Dashboard') ? 'bg-slate-900 border border-slate-850/60 text-slate-300 mr-auto' : 'bg-blue-650/80 text-white ml-auto'}`}>
                  <span className="block text-[8px] font-black text-slate-455 uppercase mb-0.5">{c.sender} • {c.time}</span>
                  <p className="leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-850 pt-3">
              <input
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Type directives message directly..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-660 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={submitting || !chatMessage.trim()}
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors shrink-0 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
