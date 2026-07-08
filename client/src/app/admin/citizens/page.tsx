'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle, XCircle, Search, Filter, ShieldAlert,
  MapPin, Phone, Mail, FileCheck, RefreshCw, AlertCircle, Fingerprint,
  ShieldX, ShieldAlert as BanIcon, Check, Shield, Eye
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

interface Citizen {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  state?: string;
  district?: string;
  parliamentary_constituency?: string; 
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
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Defaults to 'all' to show everything
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Track banned citizens locally
  const [bannedIds, setBannedIds] = useState<string[]>([]);

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
        setCitizens(prev => prev.map(c => c.id === citizenId ? { ...c, verification_status: newStatus } : c));
      }
    } catch (err) {
      console.error('Verification update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleBan = (citizenId: string) => {
    setBannedIds(prev => 
      prev.includes(citizenId) 
        ? prev.filter(id => id !== citizenId) 
        : [...prev, citizenId]
    );
  };

  const filteredCitizens = citizens.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.phone?.includes(searchQuery) ||
                          c.aadhaar_number?.includes(searchQuery);
    
    const currentStatus = c.verification_status || 'incomplete';
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-black uppercase tracking-wider animate-pulse">
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase tracking-wider">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider">
            Incomplete
          </span>
        );
    }
  };

  // Click handler for stats cards to switch statusFilter
  const handleStatClick = (type: string) => {
    setStatusFilter(prev => prev === type ? 'all' : type);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans pb-12">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 animate-fadeIn">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Citizen Verification Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit Aadhaar credentials, grant verified status tags, and manage platform safety flags.</p>
        </div>
        <button
          onClick={fetchCitizens}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Clickable Interactive Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { type: 'all', label: 'All Accounts', count: citizens.length, color: 'text-slate-300', activeBorder: 'border-cyan-500/50 bg-cyan-500/5' },
          { type: 'pending', label: 'Pending Review', count: citizens.filter(c => c.verification_status === 'pending').length, color: 'text-sky-400', activeBorder: 'border-sky-500/50 bg-sky-500/5' },
          { type: 'verified', label: 'Verified Accounts', count: citizens.filter(c => c.verification_status === 'verified').length, color: 'text-emerald-400', activeBorder: 'border-emerald-500/50 bg-emerald-500/5' },
          { type: 'incomplete', label: 'Incomplete Profiles', count: citizens.filter(c => !c.verification_status || c.verification_status === 'incomplete').length, color: 'text-amber-400', activeBorder: 'border-amber-500/50 bg-amber-500/5' },
          { type: 'rejected', label: 'Rejected Verifications', count: citizens.filter(c => c.verification_status === 'rejected').length, color: 'text-rose-400', activeBorder: 'border-rose-500/50 bg-rose-500/5' }
        ].map(item => {
          const isActive = statusFilter === item.type;
          return (
            <button
              key={item.label}
              onClick={() => handleStatClick(item.type)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 hover:-translate-y-0.5 shadow-md flex flex-col justify-between ${
                isActive 
                  ? `${item.activeBorder} shadow-cyan-500/5` 
                  : 'bg-[#0b1329]/80 border-slate-850 hover:border-slate-700'
              }`}
            >
              <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">{item.label}</span>
              <div className="flex items-end justify-between mt-2">
                <span className={`text-2xl font-black ${item.color}`}>{item.count}</span>
                {isActive && <span className="text-[8px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">Active</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters & Search Row */}
      <div className="bg-[#070d1e] rounded-2xl p-4 border border-cyan-500/10 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone number, or Aadhaar..."
            className="w-full bg-slate-900 text-xs font-bold text-slate-200 pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:border-cyan-500/50 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
          <span>Active filter:</span>
          <span className="capitalize font-black text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/15">
            {statusFilter === 'all' ? 'All Citizens' : statusFilter === 'incomplete' ? 'Incomplete Profiles' : `${statusFilter} status`}
          </span>
        </div>
      </div>

      {/* COMPACT TABLE (Replaced big cards with compact row layout) */}
      <div className="bg-[#0b1329]/80 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            Fetching citizen verification dataset...
          </div>
        ) : filteredCitizens.length === 0 ? (
          <div className="bg-[#070d1e]/40 p-16 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Citizens Match Filters</h3>
            <p className="text-xs text-slate-500">Modify your search queries or filter choices above to load data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-900/40 text-[9px] uppercase tracking-wider font-black text-slate-500">
                  <th className="px-6 py-4">Citizen Profile</th>
                  <th className="px-6 py-4">Coordinates & Location</th>
                  <th className="px-6 py-4">Aadhaar UID</th>
                  <th className="px-6 py-4">Status & Safety</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredCitizens.map((c) => {
                    const isBanned = bannedIds.includes(c.id);
                    return (
                      <tr 
                        key={c.id} 
                        className={`border-b border-slate-900 hover:bg-slate-900/35 transition-colors ${isBanned ? 'bg-red-500/5 opacity-80' : ''}`}
                      >
                        {/* Name & Avatar */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center space-x-3.5">
                            {c.avatar_url ? (
                              <img src={c.avatar_url} alt={c.full_name} className="w-9 h-9 rounded-full object-cover border border-slate-800 shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-indigo-650 flex items-center justify-center font-black text-white uppercase text-sm shrink-0 border border-indigo-400">
                                {c.full_name[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-extrabold text-slate-200">{c.full_name}</p>
                              <p className="text-[8px] text-slate-500 font-bold tracking-wide mt-0.5 uppercase">UID: {c.id.substring(0,8)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Coordinates */}
                        <td className="px-6 py-3.5">
                          <div className="space-y-1 text-slate-350 leading-normal">
                            <p className="font-semibold text-slate-300">{c.village_ward ? `${c.village_ward}, ` : ''}{c.district || 'Lucknow'}</p>
                            <div className="flex flex-wrap gap-x-2 text-[10px] text-slate-550">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone || 'N/A'}</span>
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Aadhaar Audit */}
                        <td className="px-6 py-3.5">
                          {c.aadhaar_number ? (
                            <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-xl max-w-fit">
                              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="font-mono font-bold text-slate-300 tracking-wider">
                                {c.aadhaar_number.replace(/(\d{4})/g, '$1 ').trim()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-650 italic text-[10px]">No Aadhaar Linked</span>
                          )}
                        </td>

                        {/* Status badges */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(c.verification_status)}
                            {isBanned && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-wider animate-pulse">
                                Banned
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            
                            {/* Checkbox (Tick) verification button */}
                            <button
                              disabled={updatingId !== null}
                              onClick={() => handleVerification(c.id, c.verification_status === 'verified' ? 'rejected' : 'verified')}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                                c.verification_status === 'verified'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-slate-900 hover:text-slate-400 hover:border-slate-800'
                                  : 'bg-slate-900 border-slate-800 text-slate-450 hover:bg-emerald-600/10 hover:border-emerald-500/30 hover:text-emerald-450'
                              }`}
                              title={c.verification_status === 'verified' ? "Mark Unverified" : "Approve & Verify"}
                            >
                              <Check className="w-4 h-4" />
                            </button>

                            {/* Ban / Unban Toggle Button */}
                            <button
                              onClick={() => toggleBan(c.id)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                                isBanned
                                  ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-slate-900 hover:text-slate-400 hover:border-slate-800'
                                  : 'bg-slate-900 border-slate-800 text-slate-450 hover:bg-red-650/10 hover:border-red-500/30 hover:text-red-450'
                              }`}
                              title={isBanned ? "Unban Account" : "Ban Account"}
                            >
                              <ShieldX className="w-3.5 h-3.5" />
                            </button>

                            {/* Reject Trigger */}
                            {c.verification_status !== 'rejected' && (
                              <button
                                disabled={updatingId !== null}
                                onClick={() => handleVerification(c.id, 'rejected')}
                                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-450 hover:text-rose-400 flex items-center justify-center transition-all"
                                title="Reject Verification"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
