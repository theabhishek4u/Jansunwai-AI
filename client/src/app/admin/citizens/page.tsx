'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle2, XCircle, Search, Filter, ShieldAlert,
  MapPin, Phone, Mail, FileCheck, RefreshCw, AlertCircle, Fingerprint
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Citizen {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  state?: string;
  district?: string;
  parliamentary_constituency?: string; // used for block name
  assembly_constituency?: string;
  village_ward?: string;
  pincode?: string;
  aadhaar_number?: string;
  verification_status?: 'incomplete' | 'pending' | 'verified' | 'rejected';
  avatar_url?: string;
}

export default function CitizenVerificationPage() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/citizens`);
      if (res.ok) {
        const data = await res.json();
        setCitizens(data);
      }
    } catch (err) {
      console.error('Failed to fetch citizens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (citizenId: string, newStatus: 'verified' | 'rejected') => {
    try {
      setUpdatingId(citizenId);
      const res = await fetch(`${API}/api/admin/citizens/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: citizenId, status: newStatus })
      });
      if (res.ok) {
        // update local list
        setCitizens(prev => prev.map(c => c.id === citizenId ? { ...c, verification_status: newStatus } : c));
      }
    } catch (err) {
      console.error('Verification update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCitizens = citizens.filter(c => {
    // Search filter
    const matchesSearch = c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.phone?.includes(searchQuery) ||
                          c.aadhaar_number?.includes(searchQuery);
    
    // Status filter
    const currentStatus = c.verification_status || 'incomplete';
    const matchesStatus = statusFilter === '' || currentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Account</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Pending Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>Verification Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Incomplete Profile</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Citizen Verification Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Audit Aadhaar identities, verify constituency demographics, and grant verified tags.</p>
        </div>
        <button
          onClick={fetchCitizens}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', count: citizens.filter(c => c.verification_status === 'pending').length, color: 'text-sky-400' },
          { label: 'Verified Accounts', count: citizens.filter(c => c.verification_status === 'verified').length, color: 'text-emerald-400' },
          { label: 'Incomplete Profiles', count: citizens.filter(c => !c.verification_status || c.verification_status === 'incomplete').length, color: 'text-amber-400' },
          { label: 'Rejected Verifications', count: citizens.filter(c => c.verification_status === 'rejected').length, color: 'text-rose-400' }
        ].map(item => (
          <div key={item.label} className="bg-[#0b1329]/80 border border-slate-850 p-4 rounded-2xl">
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</span>
            <span className={`text-2xl font-black ${item.color} block mt-1`}>{item.count}</span>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="bg-[#070d1e] rounded-2xl p-4 border border-cyan-500/10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone number, or Aadhaar..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Verification Statuses</option>
              <option value="pending">Pending Admin Review</option>
              <option value="verified">Verified Accounts</option>
              <option value="incomplete">Incomplete Profiles</option>
              <option value="rejected">Rejected Verifications</option>
            </select>
          </div>
        </div>
      </div>

      {/* Citizens Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">
          Fetching citizen accounts dataset...
        </div>
      ) : filteredCitizens.length === 0 ? (
        <div className="bg-[#070d1e]/40 border border-slate-900 rounded-3xl p-16 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Citizens Match Filters</h3>
          <p className="text-xs text-slate-500">Modify your search query or filter to locate citizen profiles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredCitizens.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#070d1e]/80 border border-slate-850 p-6 rounded-3xl space-y-5 relative overflow-hidden group hover:border-cyan-500/25 transition-all"
              >
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full" />
                
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt={c.full_name} className="w-12 h-12 rounded-full object-cover border border-slate-800 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white uppercase text-lg shrink-0 border border-indigo-400">
                        {c.full_name[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                        {c.full_name}
                      </h3>
                    </div>
                  </div>
                  {getStatusBadge(c.verification_status)}
                </div>

                {/* Info List */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl text-[11px] text-slate-400">
                  <div className="space-y-2">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Contact Coordinates</span>
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-600" />
                      <span className="truncate max-w-[120px]">{c.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>{c.phone || 'No phone'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-l border-slate-900 pl-4">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Constituency Location</span>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" />
                      <span className="truncate max-w-[120px]">
                        {c.village_ward ? `${c.village_ward}, ` : ''}{c.district || 'Varanasi'}
                      </span>
                    </div>
                    <div className="text-slate-500 pl-5">
                      Block: {c.parliamentary_constituency || 'N/A'} • {c.pincode || 'No Pincode'}
                    </div>
                  </div>
                </div>

                {/* Aadhaar card section */}
                {c.aadhaar_number && (
                  <div className="bg-[#0b1329]/80 border border-cyan-500/10 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Fingerprint className="w-5 h-5 text-cyan-400" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Aadhaar Audit Number</span>
                        <span className="text-xs font-mono font-bold text-white tracking-widest">
                          {c.aadhaar_number.replace(/(\d{4})/g, '$1 ').trim()}
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">Verified Format</span>
                  </div>
                )}

                {/* Action buttons */}
                {c.verification_status === 'pending' && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      disabled={updatingId !== null}
                      onClick={() => handleVerification(c.id, 'verified')}
                      className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs py-3 rounded-xl transition-all"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Approve & Verify Account</span>
                    </button>
                    <button
                      disabled={updatingId !== null}
                      onClick={() => handleVerification(c.id, 'rejected')}
                      className="px-4 flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 disabled:opacity-40 font-bold text-xs py-3 rounded-xl transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
