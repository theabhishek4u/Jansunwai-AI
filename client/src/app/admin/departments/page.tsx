'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, User, Key, Mail, Plus, Trash2, Edit2, 
  AlertCircle, CheckCircle2, Ban, ShieldAlert, Search, X, 
  Loader2, ShieldCheck, Grid, RefreshCw, Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

interface Department {
  id: string;
  name: string;
  email: string;
  password?: string;
  officer: string;
  category: string;
  status: 'active' | 'suspended';
  verification_status: 'verified' | 'unverified';
  created_at: string;
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    officer: '',
    category: 'Road'
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/departments`);
      if (res.ok) {
        const list = await res.json() as Department[];
        setDepartments(list);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto generate ID if editing name and it's a new entry
      ...(name === 'name' && !editModalOpen ? { id: value.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 15) } : {})
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/admin/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'active',
          verification_status: 'verified'
        })
      });
      if (res.ok) {
        setCreateModalOpen(false);
        setFormData({ id: '', name: '', email: '', password: '', officer: '', category: 'Road' });
        fetchDepartments();
      }
    } catch (err) {
      console.error('Error creating department:', err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    try {
      const res = await fetch(`${API}/api/admin/departments/${selectedDept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setEditModalOpen(false);
        setSelectedDept(null);
        setFormData({ id: '', name: '', email: '', password: '', officer: '', category: 'Road' });
        fetchDepartments();
      }
    } catch (err) {
      console.error('Error updating department:', err);
    }
  };

  const handleToggleStatus = async (dept: Department) => {
    const nextStatus = dept.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`${API}/api/admin/departments/${dept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchDepartments();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleToggleVerify = async (dept: Department) => {
    const nextVerify = dept.verification_status === 'verified' ? 'unverified' : 'verified';
    try {
      const res = await fetch(`${API}/api/admin/departments/${dept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_status: nextVerify })
      });
      if (res.ok) {
        fetchDepartments();
      }
    } catch (err) {
      console.error('Error toggling verify status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to remove this department portal? This will revoke all execution access.')) return;
    try {
      const res = await fetch(`${API}/api/admin/departments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchDepartments();
      }
    } catch (err) {
      console.error('Error deleting department:', err);
    }
  };

  const openEditModal = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({
      id: dept.id,
      name: dept.name,
      email: dept.email,
      password: dept.password || '',
      officer: dept.officer,
      category: dept.category
    });
    setEditModalOpen(true);
  };

  // Filter departments list
  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.officer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDeptColor = (deptId: string) => {
    switch (deptId) {
      case 'pwd': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'water': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'health': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'education': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'electricity': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      default: return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800/60 pb-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span>Government Departments Portals</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authorize executions, configure category-mapped pipelines, register department passwords, and audit active workloads.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ id: '', name: '', email: '', password: '', officer: '', category: 'Road' });
            setCreateModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-linear-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-cyan-600/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Portal</span>
        </button>
      </div>

      {/* Stats summary banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0b1329]/60 border border-slate-800/80 rounded-2xl shadow-lg">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Total Portals</span>
          <span className="text-2xl font-extrabold text-white block mt-1">{departments.length}</span>
        </div>
        <div className="p-4 bg-[#0b1329]/60 border border-slate-800/80 rounded-2xl shadow-lg">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Active Portals</span>
          <span className="text-2xl font-extrabold text-emerald-400 block mt-1">
            {departments.filter(d => d.status === 'active').length}
          </span>
        </div>
        <div className="p-4 bg-[#0b1329]/60 border border-slate-800/80 rounded-2xl shadow-lg">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Banned/Suspended</span>
          <span className="text-2xl font-extrabold text-red-400 block mt-1">
            {departments.filter(d => d.status === 'suspended').length}
          </span>
        </div>
        <div className="p-4 bg-[#0b1329]/60 border border-slate-800/80 rounded-2xl shadow-lg">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Unverified Accounts</span>
          <span className="text-2xl font-extrabold text-amber-400 block mt-1">
            {departments.filter(d => d.verification_status === 'unverified').length}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#0b1329]/40 border border-slate-800/60 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
        {/* Actions header bar */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/10 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, or officer..."
              className="w-full bg-[#070d1e] border border-slate-800 text-xs text-white pl-10 pr-4 py-2.2 rounded-xl outline-none focus:border-cyan-500/40 transition-colors font-semibold"
            />
          </div>
          <button 
            onClick={fetchDepartments}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Departments List Table */}
        {loading ? (
          <div className="text-center py-20 text-slate-550 text-xs font-black uppercase tracking-widest animate-pulse flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Fetching Registered Portals...</span>
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="p-20 text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">No Portals Registered</h3>
            <p className="text-xs text-slate-500">Add a government department execution portal to allocate constituency workloads.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-900/10">
                  <th className="px-6 py-4">Department Info</th>
                  <th className="px-6 py-4">Officer In Charge</th>
                  <th className="px-6 py-4">Domain Category</th>
                  <th className="px-6 py-4">Access Status</th>
                  <th className="px-6 py-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {filteredDepts.map(dept => (
                  <tr key={dept.id} className="hover:bg-slate-900/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold text-xs ${getDeptColor(dept.id)}`}>
                          {dept.id.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-extrabold text-white block group-hover:text-cyan-400 transition-colors">{dept.name}</span>
                          <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{dept.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-300 block">{dept.officer.split(' (')[0]}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {dept.officer.includes('(') ? dept.officer.substring(dept.officer.indexOf('(')) : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {dept.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {dept.status === 'active' ? (
                          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping mr-0.5" />
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-400 border border-red-500/25">
                            SUSPENDED
                          </span>
                        )}

                        {dept.verification_status === 'verified' ? (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 flex items-center">
                            <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                            <span>VERIFIED</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-800 text-slate-450 border border-slate-700">
                            UNVERIFIED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2.5">
                        <button
                          onClick={() => handleToggleVerify(dept)}
                          title={dept.verification_status === 'verified' ? 'De-verify' : 'Verify Account'}
                          className="p-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(dept)}
                          title={dept.status === 'active' ? 'Suspend Portal' : 'Activate Portal'}
                          className={`p-1.5 border rounded-lg transition-all cursor-pointer ${
                            dept.status === 'active' 
                              ? 'bg-red-500/5 hover:bg-red-500/10 border-red-500/15 text-red-400' 
                              : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/15 text-emerald-400'
                          }`}
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(dept)}
                          title="Edit Portal settings"
                          className="p-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(dept.id)}
                          title="Remove Portal account"
                          className="p-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 rounded-lg text-red-450 hover:text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE PORTAL MODAL */}
      <AnimatePresence>
        {createModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateModalOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#070d1e] border border-slate-850 rounded-3xl p-6 sm:p-8 z-50 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-cyan-500 via-indigo-500 to-cyan-500" />
              
              <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Building2 className="w-4.5 h-4.5 text-cyan-400" />
                  <span>Register Department Portal</span>
                </h3>
                <button 
                  onClick={() => setCreateModalOpen(false)}
                  className="w-7 h-7 bg-slate-905 border border-slate-800/80 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">Department Portal ID</label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="e.g. water, health, forest"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">Full Department Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Public Works Department (PWD)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">Government Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. pwd@jansunwai.gov.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">In-Charge Officer Name & Title</label>
                  <input
                    type="text"
                    name="officer"
                    value={formData.officer}
                    onChange={handleInputChange}
                    placeholder="e.g. Rakesh Kumar (Executive Engineer)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">Select Mapping Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 transition-colors"
                  >
                    {['Road', 'Drainage', 'PHC', 'School', 'Street Lights', 'Municipal', 'Others'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">Set Password credential</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/40 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-600/10 cursor-pointer"
                >
                  <Building2 className="w-4.5 h-4.5" />
                  <span>Register Portal account</span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EDIT PORTAL MODAL */}
      <AnimatePresence>
        {editModalOpen && selectedDept && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => { setEditModalOpen(false); setSelectedDept(null); }}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#070d1e] border border-slate-850 rounded-3xl p-6 sm:p-8 z-50 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-cyan-500 via-indigo-500 to-cyan-500" />
              
              <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Edit2 className="w-4.5 h-4.5 text-cyan-400" />
                  <span>Modify Portal: {selectedDept.id.toUpperCase()}</span>
                </h3>
                <button 
                  onClick={() => { setEditModalOpen(false); setSelectedDept(null); }}
                  className="w-7 h-7 bg-slate-905 border border-slate-800/80 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">Full Department Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Public Works Department (PWD)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">Government Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. pwd@jansunwai.gov.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">In-Charge Officer Name & Title</label>
                  <input
                    type="text"
                    name="officer"
                    value={formData.officer}
                    onChange={handleInputChange}
                    placeholder="e.g. Rakesh Kumar (Executive Engineer)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">Select Mapping Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 transition-colors"
                  >
                    {['Road', 'Drainage', 'PHC', 'School', 'Street Lights', 'Municipal', 'Others'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider block mb-1">Update Password (optional)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep same"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-600/10 cursor-pointer"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>Update Portal details</span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
