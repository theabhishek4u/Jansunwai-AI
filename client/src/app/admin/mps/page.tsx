'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Plus, Shield, ShieldAlert,
  CheckCircle, XCircle, RotateCcw, Loader2,
  Mail, Phone, MapPin, Building
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface MpProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  state: string;
  district: string;
  parliamentary_constituency: string;
  assembly_constituency: string;
  village_ward?: string;
  pincode: string;
  role: string;
  avatar_url?: string;
  isSuspended?: boolean;
}

export default function MpManagementPage() {
  const [mps, setMps] = useState<MpProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [suspendingId, setSuspendingId] = useState<string | null>(null);

  // New MP Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newConstituency, setNewConstituency] = useState('Varanasi');
  const [newState, setNewState] = useState('Uttar Pradesh');

  useEffect(() => {
    fetchMps();
  }, []);

  const fetchMps = () => {
    setLoading(true);
    fetch(`${API}/api/admin/mps`)
      .then(r => r.json())
      .then(data => {
        // Ensure email handles exist
        const updated = data.map((mp: MpProfile) => ({
          ...mp,
          email: mp.email || `${mp.full_name.toLowerCase().replace(' ', '.')}@jansunwai.gov.in`,
          isSuspended: mp.isSuspended || false
        }));
        setMps(updated);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const toggleStatus = async (id: string, currentSuspended: boolean) => {
    setSuspendingId(id);
    const targetStatus = currentSuspended ? 'active' : 'suspended';
    try {
      const res = await fetch(`${API}/api/admin/mps/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: targetStatus })
      });
      if (res.ok) {
        setMps(prev => prev.map(m => m.id === id ? { ...m, isSuspended: !currentSuspended } : m));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSuspendingId(null);
    }
  };

  const addMp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newMp: MpProfile = {
      id: `mp-${Math.random().toString(36).substring(2, 9)}`,
      full_name: newName,
      email: newEmail,
      phone: newPhone || '+91 9999888877',
      state: newState,
      district: newConstituency,
      parliamentary_constituency: newConstituency,
      assembly_constituency: 'Cantonment',
      pincode: '221001',
      role: 'mp',
      isSuspended: false
    };

    try {
      // For mock operations, we append directly in frontend, syncing audit log
      await fetch(`${API}/api/admin/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Added new MP account: ${newName} for ${newConstituency}` })
      });
      setMps(prev => [newMp, ...prev]);
      setShowAddForm(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = mps.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.parliamentary_constituency.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>MP Management Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage Member of Parliament credentials, assign constituencies and manage account privileges</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add MP Profile</span>
        </button>
      </div>

      {/* Add MP Form Modal/Dropdown */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-6 max-w-xl">
          <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Register new Member of Parliament</h3>
          <form onSubmit={addMp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Dr. Harsh Vardhan"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Government Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="harsh.vardhan@sansad.nic.in"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="+91 99887 76655"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Constituency</label>
                <input
                  type="text"
                  value={newConstituency}
                  onChange={e => setNewConstituency(e.target.value)}
                  placeholder="Varanasi"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold mb-1 block">State</label>
                <input
                  type="text"
                  value={newState}
                  onChange={e => setNewState(e.target.value)}
                  placeholder="Uttar Pradesh"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg text-[10px] font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-semibold"
              >
                Register MP
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filter and search bars */}
      <div className="bg-[#0b1329]/80 rounded-2xl p-4 border border-cyan-500/10 flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search MP profiles by name or parliamentary constituency..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* MP Cards List */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((mp) => (
            <motion.div
              key={mp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0b1329]/80 rounded-2xl p-5 border border-cyan-500/10 hover:border-cyan-500/20 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-400 font-bold text-sm">
                  {mp.avatar_url ? (
                    <img src={mp.avatar_url} alt={mp.full_name} className="w-full h-full object-cover" />
                  ) : (
                    mp.full_name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white truncate">{mp.full_name}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${mp.isSuspended ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {mp.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /><span>{mp.parliamentary_constituency}</span></span>
                    <span className="flex items-center space-x-1.5"><Building className="w-3.5 h-3.5 text-slate-500" /><span>{mp.state}</span></span>
                    <span className="flex items-center space-x-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /><span className="truncate">{mp.email}</span></span>
                    <span className="flex items-center space-x-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" /><span>{mp.phone}</span></span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 border-t border-slate-850 pt-4 mt-4 justify-end">
                <button
                  onClick={() => toggleStatus(mp.id, mp.isSuspended || false)}
                  disabled={suspendingId === mp.id}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-colors ${mp.isSuspended
                    ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20'
                    : 'bg-red-600/10 border-red-500/20 text-red-400 hover:bg-red-600/20'
                  }`}
                >
                  {suspendingId === mp.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : mp.isSuspended ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      <span>Re-activate Account</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3 h-3" />
                      <span>Suspend Profile</span>
                    </>
                  )}
                </button>

                <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[9px] font-bold">
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Credentials</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
