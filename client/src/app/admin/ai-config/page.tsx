'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Save, RefreshCw,
  Sparkles, CheckCircle, Shield, Loader2,
  AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  updatedAt: string;
}

export default function AiConfigPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [promptContent, setPromptContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Model parameters
  const [temperature, setTemperature] = useState(0.4);
  const [rateLimit, setRateLimit] = useState(60);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = () => {
    setLoading(true);
    fetch(`${API}/api/admin/prompts`)
      .then(r => r.json())
      .then(d => {
        setPrompts(d);
        if (d.length > 0) {
          setSelectedPrompt(d[0]);
          setPromptContent(d[0].content);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSelect = (p: PromptTemplate) => {
    setSelectedPrompt(p);
    setPromptContent(p.content);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedPrompt) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`${API}/api/admin/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPrompt.id, content: promptContent })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setPrompts(prev => prev.map(pr => pr.id === selectedPrompt.id ? { ...pr, content: promptContent, updatedAt: new Date().toISOString() } : pr));
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Performance simulation charts
  const performanceData = [
    { day: 'Mon', tokenCount: 420000, latency: 1.8, costUSD: 0.18 },
    { day: 'Tue', tokenCount: 510000, latency: 2.1, costUSD: 0.22 },
    { day: 'Wed', tokenCount: 480000, latency: 1.9, costUSD: 0.20 },
    { day: 'Thu', tokenCount: 650000, latency: 2.4, costUSD: 0.28 },
    { day: 'Fri', tokenCount: 890000, latency: 2.8, costUSD: 0.38 },
    { day: 'Sat', tokenCount: 320000, latency: 1.5, costUSD: 0.14 },
    { day: 'Sun', tokenCount: 290000, latency: 1.4, costUSD: 0.12 }
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <span>AI Configuration & Prompt Editor</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Control active Gemini models, system instruction prompt templates, and generation parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompts list + editor */}
        <div className="lg:col-span-2 bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-850">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Prompt Templates</span>
            </h2>
            {selectedPrompt && (
              <span className="text-[9px] text-slate-500">Updated: {new Date(selectedPrompt.updatedAt).toLocaleDateString('en-IN')}</span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Prompts Left Nav */}
              <div className="sm:col-span-1 space-y-2 border-r border-slate-850 pr-2">
                {prompts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className={`w-full text-left p-2.5 rounded-lg text-[10px] font-semibold transition-all block truncate
                      ${selectedPrompt?.id === p.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Prompts Text Editor */}
              <div className="sm:col-span-3 space-y-4">
                {selectedPrompt && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Instruction Template ({selectedPrompt.category})</p>
                    <textarea
                      value={promptContent}
                      onChange={e => setPromptContent(e.target.value)}
                      className="w-full h-[220px] rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                    />
                    <div className="flex justify-between items-center">
                      {saveSuccess ? (
                        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          <span>Saved successfully</span>
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-500 max-w-[60%]">
                          Note: Modifying prompt templates immediately updates system instructions for the next API iteration.
                        </div>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black transition-all disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Configurations sliders */}
        <div className="bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-5 space-y-5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>AI Hyperparameters</span>
          </h2>

          <div className="space-y-4">
            {/* Active Model */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Gemini Model</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Default)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Precision)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy)</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-semibold uppercase tracking-wider">AI Temperature</span>
                <span className="font-bold text-cyan-400">{temperature}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.0}
                step={0.1}
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-600">
                <span>Deterministic (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>

            {/* Rate Limit Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-semibold uppercase tracking-wider">API Rate Limit</span>
                <span className="font-bold text-cyan-400">{rateLimit} RPM</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={rateLimit}
                onChange={e => setRateLimit(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-600">
                <span>10 requests/min</span>
                <span>100 requests/min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Cost and token logs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Token Usage & Latency (7-day history)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162544" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#0b1329', border: '1px solid #1e3a8a', borderRadius: '12px', fontSize: '11px', color: '#e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line yAxisId="left" type="monotone" dataKey="tokenCount" stroke="#8b5cf6" strokeWidth={2.5} name="Token Consumption" dot={{ fill: '#8b5cf6', r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#22d3ee" strokeWidth={2.5} name="Latency (seconds)" dot={{ fill: '#22d3ee', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
