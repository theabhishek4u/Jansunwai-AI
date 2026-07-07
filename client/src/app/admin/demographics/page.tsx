'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Search,
  X,
  CheckCircle,
  AlertTriangle,
  Building
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AreaPopulation {
  id: string;
  district: string;
  area: string;
  total_population: number;
  male_percentage: number;
  female_percentage: number;
  age_0_18_percentage: number;
  age_18_60_percentage: number;
  age_60_plus_percentage: number;
}

export default function AdminDemographicsPage() {
  const [populations, setPopulations] = useState<AreaPopulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [district, setDistrict] = useState('Lucknow');
  const [area, setArea] = useState('');
  const [totalPop, setTotalPop] = useState('');
  const [malePct, setMalePct] = useState('50');
  const [femalePct, setFemalePct] = useState('50');
  const [age018, setAge018] = useState('25');
  const [age1860, setAge1860] = useState('60');
  const [age60Plus, setAge60Plus] = useState('15');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchPopulations = () => {
    fetch(`${API}/api/mp/populations`)
      .then(r => r.json())
      .then(data => setPopulations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPopulations();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!area || !totalPop) {
      alert('Please fill out all required fields.');
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch(`${API}/api/admin/populations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district,
          area,
          total_population: Number(totalPop),
          male_percentage: Number(malePct),
          female_percentage: Number(femalePct),
          age_0_18_percentage: Number(age018),
          age_18_60_percentage: Number(age1860),
          age_60_plus_percentage: Number(age60Plus)
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        // reset form
        setArea('');
        setTotalPop('');
        setMalePct('50');
        setFemalePct('50');
        setAge018('25');
        setAge1860('60');
        setAge60Plus('15');
        fetchPopulations();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create population record.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error while saving population record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this area demographics record? This will affect priority calculations.')) return;
    try {
      const res = await fetch(`${API}/api/admin/populations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchPopulations();
      } else {
        alert('Failed to delete population record.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error while deleting population record.');
    }
  };

  const filtered = populations.filter(p => 
    p.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Census Demographics Registry</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and sync population numbers for AI constituency planning</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs font-bold text-white rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all self-start sm:self-center border border-blue-400/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Area Demographics</span>
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0f142c] border border-[#1e293b]/30 p-5 rounded-2xl">
          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-black mb-1">Total Tracked Areas</span>
          <span className="text-2xl font-mono font-black text-white">{populations.length} Areas</span>
        </div>
        <div className="bg-[#0f142c] border border-[#1e293b]/30 p-5 rounded-2xl">
          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-black mb-1">Accumulated Population</span>
          <span className="text-2xl font-mono font-black text-blue-400">
            {populations.reduce((sum, p) => sum + p.total_population, 0).toLocaleString()}
          </span>
        </div>
        <div className="bg-[#0f142c] border border-[#1e293b]/30 p-5 rounded-2xl">
          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-black mb-1">Average Male Ratio</span>
          <span className="text-2xl font-mono font-black text-pink-400">
            {populations.length ? (populations.reduce((sum, p) => sum + p.male_percentage, 0) / populations.length).toFixed(1) : 0}%
          </span>
        </div>
        <div className="bg-[#0f142c] border border-[#1e293b]/30 p-5 rounded-2xl">
          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-black mb-1">Average Youth Ratio</span>
          <span className="text-2xl font-mono font-black text-amber-500">
            {populations.length ? (populations.reduce((sum, p) => sum + p.age_0_18_percentage, 0) / populations.length).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      {/* Census List Grid table */}
      <div className="bg-[#0f142c] border border-[#1e293b]/30 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">District Population Records</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-550" />
            <input
              type="text"
              placeholder="Search area..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-[#1e293b]/30 rounded-lg text-xs text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-xs text-slate-400 py-10 animate-pulse">Retrieving census records...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-xs text-slate-450 py-10 font-bold">No demographics records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b]/30 text-slate-500 uppercase font-black tracking-wider text-[9px]">
                  <th className="pb-3 pl-2">District</th>
                  <th className="pb-3">Area Name</th>
                  <th className="pb-3 text-right">Population</th>
                  <th className="pb-3 text-right">Male %</th>
                  <th className="pb-3 text-right">Female %</th>
                  <th className="pb-3 text-right">Age 0-18</th>
                  <th className="pb-3 text-right">Age 18-60</th>
                  <th className="pb-3 text-right">Age 60+</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[#1e293b]/10 hover:bg-slate-950/20 text-slate-350 font-bold transition-colors">
                    <td className="py-3 pl-2 font-mono text-[10px] text-slate-500">{p.district}</td>
                    <td className="py-3 text-slate-100">{p.area}</td>
                    <td className="py-3 text-right font-mono text-slate-200">{p.total_population.toLocaleString()}</td>
                    <td className="py-3 text-right">{p.male_percentage}%</td>
                    <td className="py-3 text-right">{p.female_percentage}%</td>
                    <td className="py-3 text-right text-amber-500/90">{p.age_0_18_percentage}%</td>
                    <td className="py-3 text-right text-emerald-450">{p.age_18_60_percentage}%</td>
                    <td className="py-3 text-right text-violet-450">{p.age_60_plus_percentage}%</td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════ ADD AREA MODAL ═══════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          
          <div className="relative w-full max-w-lg bg-[#0b0f19] border border-[#1e293b]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1e293b]/20 pb-4">
              <h3 className="text-md font-black text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                <span>Add Census Area Demographics</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">District Name</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-[#1e293b]/30 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Area / Ward / Village</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hazratganj"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-[#1e293b]/30 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Total Population</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={totalPop}
                  onChange={e => setTotalPop(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-[#1e293b]/30 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#1e293b]/10 pt-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Male Percentage (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={malePct}
                    onChange={e => setMalePct(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-[#1e293b]/30 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Female Percentage (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={femalePct}
                    onChange={e => setFemalePct(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-[#1e293b]/30 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-[#1e293b]/10 pt-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Age 0-18 (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={age018}
                    onChange={e => setAge018(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-[#1e293b]/30 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Age 18-60 (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={age1860}
                    onChange={e => setAge1860(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-[#1e293b]/30 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Age 60+ (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={age60Plus}
                    onChange={e => setAge60Plus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-[#1e293b]/30 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-[#1e293b]/20 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-[#1e293b]/30 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  {formSubmitting ? 'Saving Area...' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
