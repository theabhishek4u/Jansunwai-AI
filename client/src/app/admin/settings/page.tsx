'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle, Shield, Key, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [googleMapsKey, setGoogleMapsKey] = useState('AIzaSyD-mockMapsAPIKeyString');
  const [geminiKey, setGeminiKey] = useState('AIzaSyB-mockGeminiAPIKeyString');
  
  // Feature Flags
  const [flags, setFlags] = useState({
    voiceSuggestions: true,
    imageAnalysis: true,
    budgetPlanner: true,
    devSimulator: true,
    copilotChat: true,
    offlineSimulatorMode: false
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Global Platform Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Control active feature flags, API credentials, and administrative parameters</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Credentials */}
        <div className="lg:col-span-2 bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Third-Party API Credentials</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold mb-1 block uppercase tracking-wider">Gemini API Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-3 pr-10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600">
                  <EyeOff className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold mb-1 block uppercase tracking-wider">Google Maps API Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={googleMapsKey}
                  onChange={e => setGoogleMapsKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-3 pr-10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600">
                  <EyeOff className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Feature Flags (RBAC toggles)</span>
          </h2>

          <div className="space-y-3.5 pt-2">
            {[
              { key: 'voiceSuggestions' as const, label: 'Voice Suggestions Ingest', desc: 'Allows voice record suggestion formats.' },
              { key: 'imageAnalysis' as const, label: 'Image Vision Classification', desc: 'Scans uploaded photos with Gemini vision.' },
              { key: 'budgetPlanner' as const, label: 'Budget Planner Matrix', desc: 'Allows budget allocations optimization.' },
              { key: 'devSimulator' as const, label: 'Development Impact Simulator', desc: 'Compares two suggestions side-by-side.' },
              { key: 'copilotChat' as const, label: 'Gemini MP Copilot Chat', desc: 'Exposes MP natural-language assistant.' },
              { key: 'offlineSimulatorMode' as const, label: 'Force Mock API Fallback', desc: 'Forced offline mode bypassing Google API checks.' }
            ].map(flag => (
              <div key={flag.key} className="flex items-start justify-between">
                <div className="max-w-[75%]">
                  <p className="text-[11px] font-bold text-slate-200 leading-none">{flag.label}</p>
                  <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">{flag.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFlag(flag.key)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${flags[flag.key] ? 'bg-cyan-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${flags[flag.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-slate-850 pt-4">
            {saved ? (
              <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Config Applied</span>
              </div>
            ) : <div />}

            <button
              type="submit"
              className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
