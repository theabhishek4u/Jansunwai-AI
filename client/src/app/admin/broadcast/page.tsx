'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Send, Shield, Users, MapPin,
  CheckCircle, Loader2, AlertTriangle
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function BroadcastPage() {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [targetGroup, setTargetGroup] = useState('all');
  const [targetConstituency, setTargetConstituency] = useState('all');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Past broadcast records
  const [broadcasts, setBroadcasts] = useState([
    { id: 'b-1', text: 'All servers will undergo brief scheduled maintenance on Sunday, July 12th from 2:00 AM to 4:00 AM IST.', severity: 'maintenance', target: 'All Platforms', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString() },
    { id: 'b-2', text: 'Gemini model parameters updated for priority evaluations. Prompt optimizations applied.', severity: 'info', target: 'Varanasi MPs', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString() },
    { id: 'b-3', text: 'Constituency Health Score index compiled for Q2. Data tables verified.', severity: 'info', target: 'National Admins', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString() }
  ]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setSending(true);
    setSentSuccess(false);

    try {
      const res = await fetch(`${API}/api/admin/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, targetGroup, targetConstituency })
      });
      if (res.ok) {
        setSentSuccess(true);
        setBroadcasts(prev => [
          {
            id: `b-${Date.now()}`,
            text: message,
            severity,
            target: `${targetGroup.toUpperCase()} - ${targetConstituency.toUpperCase()}`,
            date: new Date().toLocaleDateString()
          },
          ...prev
        ]);
        setMessage('');
        setTimeout(() => setSentSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const severityColors: Record<string, string> = {
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    maintenance: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emergency: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          <span>System Broadcast Center</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Send platform-wide alerts, maintenance downtimes, or regional announcements to citizens and MPs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Form */}
        <div className="lg:col-span-1 bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Queue System Announcement</h2>
          
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Severity Type</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="info">Information Alert</option>
                <option value="warning">System Warning</option>
                <option value="maintenance">Maintenance Alert</option>
                <option value="emergency">Emergency Alert</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Target Audience</label>
                <select
                  value={targetGroup}
                  onChange={e => setTargetGroup(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Users</option>
                  <option value="citizens">Citizens Only</option>
                  <option value="mps">MPs Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Region / Constituency</label>
                <select
                  value={targetConstituency}
                  onChange={e => setTargetConstituency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Regions</option>
                  <option value="Varanasi">Varanasi Constituency</option>
                  <option value="Lucknow">Lucknow Constituency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Message Content</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter alert copy here..."
                required
                className="w-full h-28 rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between">
              {sentSuccess ? (
                <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Broadcast Pushed</span>
                </div>
              ) : <div />}

              <button
                type="submit"
                disabled={sending}
                className="flex items-center space-x-1.5 px-4.5 py-2.5 rounded-xl bg-linear-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Push Broadcast</span>
              </button>
            </div>
          </form>
        </div>

        {/* Broadcast history log */}
        <div className="lg:col-span-2 bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Broadcast Audit Logs</h2>
          
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div key={b.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 flex items-start space-x-3 hover:border-slate-800 transition-all">
                <div className="shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase ${severityColors[b.severity]}`}>
                      {b.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">{b.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{b.text}</p>
                  <p className="text-[9px] text-slate-500 mt-2 font-semibold uppercase">Target: {b.target}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
