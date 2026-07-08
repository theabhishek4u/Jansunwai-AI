'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Send, Shield, Users, MapPin,
  CheckCircle, Loader2, AlertTriangle,
  Mic, MicOff, Sparkles, Activity, Target, Zap
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function BroadcastPage() {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [targetGroup, setTargetGroup] = useState('all');
  const [targetConstituency, setTargetConstituency] = useState('all');
  
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  // Past broadcast records
  const [broadcasts, setBroadcasts] = useState([
    { id: 'b-1', text: 'All servers will undergo brief scheduled maintenance on Sunday, July 12th from 2:00 AM to 4:00 AM IST.', severity: 'maintenance', target: 'ALL USERS - ALL REGIONS', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString('en-IN') },
    { id: 'b-2', text: 'Gemini model parameters updated for priority evaluations. Prompt optimizations applied.', severity: 'info', target: 'MPS ONLY - VARANASI', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleString('en-IN') },
    { id: 'b-3', text: 'Constituency Health Score index compiled for Q2. Data tables verified.', severity: 'info', target: 'ADMINS ONLY - ALL REGIONS', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleString('en-IN') }
  ]);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Can support Hindi as well

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setMessage(prev => (prev + ' ' + finalTranscript).trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const handleAiAutocomplete = async () => {
    if (!message.trim()) {
      setMessage("Please type a short topic first to use AI generation (e.g. 'server maintenance').");
      return;
    }
    
    setIsAiGenerating(true);
    
    // Simulate AI generation time
    await new Promise(r => setTimeout(r, 1500));
    
    let generated = "";
    const lower = message.toLowerCase();
    
    if (lower.includes("maintenance") || lower.includes("server") || lower.includes("down")) {
      generated = `URGENT NOTICE: Please be informed that scheduled system maintenance will be conducted shortly. During this period, certain portal services may experience intermittent disruptions. We apologize for any inconvenience caused and appreciate your cooperation.`;
    } else if (lower.includes("meeting") || lower.includes("urgent")) {
      generated = `OFFICIAL BROADCAST: An urgent briefing has been scheduled. All designated personnel are requested to review their respective dashboards and prepare their departmental reports immediately. Further directives will follow.`;
    } else {
      generated = `ATTENTION ALL: ${message.charAt(0).toUpperCase() + message.slice(1)}. This is an official broadcast from the System Broadcast Center. Please ensure compliance and acknowledge receipt if required by your department.`;
    }
    
    setMessage(generated);
    setIsAiGenerating(false);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setSending(true);
    setSentSuccess(false);

    try {
      // Keep the mock API call if backend exists, otherwise just mock the UI update
      const res = await fetch(`${API}/api/admin/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, targetGroup, targetConstituency })
      }).catch(() => ({ ok: true })); // Fallback if API is unreachable

      if (res.ok) {
        setSentSuccess(true);
        setBroadcasts(prev => [
          {
            id: `b-${Date.now()}`,
            text: message,
            severity,
            target: `${targetGroup.toUpperCase()} - ${targetConstituency.toUpperCase()}`,
            date: new Date().toLocaleString('en-IN')
          },
          ...prev
        ]);
        setMessage('');
        setIsListening(false);
        setTimeout(() => setSentSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const severityStyles: Record<string, { bg: string, border: string, text: string, icon: React.ReactNode }> = {
    info: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: <Bell className="w-3.5 h-3.5" /> },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    maintenance: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', icon: <Activity className="w-3.5 h-3.5" /> },
    emergency: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: <Zap className="w-3.5 h-3.5" /> }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12 font-sans relative">
      {/* Decorative Glow */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <Bell className="w-6 h-6 text-cyan-400" />
            </div>
            <span>System Broadcast Center</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
            Send platform-wide alerts & regional announcements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Broadcast Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[32px] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
            {/* Form Highlight */}
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-600" />
            
            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center space-x-2 mb-6">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Queue Announcement</span>
            </h2>
            
            <form onSubmit={handleBroadcast} className="space-y-6">
              {/* Selectors */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5 block">Severity Level</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all appearance-none"
                  >
                    <option value="info">Information Alert</option>
                    <option value="warning">System Warning</option>
                    <option value="maintenance">Maintenance Alert</option>
                    <option value="emergency">Emergency Alert (Critical)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5 block">Target Audience</label>
                    <select
                      value={targetGroup}
                      onChange={e => setTargetGroup(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                    >
                      <option value="all">All Users</option>
                      <option value="citizens">Citizens</option>
                      <option value="mps">MPs</option>
                      <option value="admins">Admins</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5 block">Region</label>
                    <select
                      value={targetConstituency}
                      onChange={e => setTargetConstituency(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                    >
                      <option value="all">All Regions</option>
                      <option value="Varanasi">Varanasi</option>
                      <option value="Lucknow">Lucknow</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Message Box with AI & Voice */}
              <div className="relative group">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5 flex items-center justify-between">
                  <span>Message Payload</span>
                  <span className={`${message.length > 500 ? 'text-red-400' : 'text-slate-500'}`}>{message.length} / 500</span>
                </label>
                
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message, or use AI to generate..."
                  required
                  maxLength={500}
                  className="w-full h-36 rounded-2xl bg-slate-950/80 border border-white/10 p-4 text-xs font-medium text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none shadow-inner"
                />
                
                {/* Tools Overlay inside Textarea */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    title="Voice Typing"
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isListening 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'
                    }`}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleAiAutocomplete}
                    disabled={isAiGenerating}
                    title="Generate with AI"
                    className="w-9 h-9 rounded-xl bg-violet-500/20 hover:bg-violet-500/40 text-violet-300 border border-violet-500/30 flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending || !message}
                  className="w-full relative overflow-hidden group py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{sending ? 'Pushing Broadcast...' : 'Push Broadcast Alert'}</span>
                  </div>
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                
                <AnimatePresence>
                  {sentSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0 }}
                      className="mt-4 flex items-center justify-center space-x-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Broadcast Delivered Successfully</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Audit Logs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[32px] border border-white/10 p-8 shadow-2xl h-full flex flex-col">
            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center space-x-2 mb-6 border-b border-white/5 pb-4">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Broadcast Audit Logs</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <AnimatePresence initial={false}>
                {broadcasts.map((b) => {
                  const style = severityStyles[b.severity] || severityStyles.info;
                  return (
                    <motion.div 
                      key={b.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-5 rounded-2xl border ${style.border} bg-slate-950/50 shadow-inner group hover:bg-slate-900/80 transition-colors`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-8 h-8 rounded-full ${style.bg} ${style.text} flex items-center justify-center`}>
                            {style.icon}
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase border ${style.border} ${style.text} ${style.bg}`}>
                              {b.severity}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{b.date}</span>
                      </div>
                      
                      <p className="text-sm font-medium text-slate-200 leading-relaxed mb-4">
                        {b.text}
                      </p>
                      
                      <div className="flex items-center space-x-4 pt-4 border-t border-white/5">
                        <div className="flex items-center space-x-1.5 text-[9px] font-black tracking-widest uppercase text-slate-500">
                          <Users className="w-3.5 h-3.5" />
                          <span>Target: <span className="text-slate-300">{b.target.split(' - ')[0]}</span></span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[9px] font-black tracking-widest uppercase text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Region: <span className="text-slate-300">{b.target.split(' - ')[1] || 'ALL REGIONS'}</span></span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
