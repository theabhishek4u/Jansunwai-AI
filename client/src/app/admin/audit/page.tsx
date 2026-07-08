'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Terminal, Shield, ShieldCheck, Loader2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  timestamp: string;
  ipAddress: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API}/api/admin/audit-logs`)
      .then(r => r.json())
      .then(d => setLogs(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.adminName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <History className="w-5 h-5 text-cyan-400" />
          <span>System Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">View immutable logs of all administrative actions, dataset uploads, and AI prompt overrides</p>
      </div>

      <div className="bg-[#0b1329]/80 rounded-2xl p-4 border border-cyan-500/10 flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit logs by event query or administrator identifier..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Terminal log panel */}
      <div className="bg-[#070d1e] rounded-2xl border border-cyan-500/10 overflow-hidden font-mono shadow-2xl">
        <div className="px-6 py-3.5 border-b border-slate-850 flex items-center justify-between bg-slate-900/35">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider">NIC SECURITY LOGS STREAM</span>
          </div>
          <div className="flex items-center space-x-1 text-[9px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>ENCRYPTED</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="p-5 divide-y divide-slate-800/40 text-[11px] text-slate-300">
            {filtered.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/10 transition-colors">
                <div className="flex items-start space-x-2">
                  <span className="text-cyan-500 font-bold">&gt;</span>
                  <div>
                    <span className="text-slate-400 font-semibold">[{log.adminName}]</span>{' '}
                    <span className="text-slate-200">{log.action}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-[9px] text-slate-500 shrink-0">
                  <span>{log.ipAddress}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-slate-500 italic py-4 text-center">No audit logs matched search criteria</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
