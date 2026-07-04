'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, Plus, CheckCircle, Trash2, HelpCircle } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Road', description: 'Road potholes, widening, highways and paving repairs.', count: 4 },
    { id: '2', name: 'Hospital', description: 'Medical infrastructure, hospitals upgrades, new clinics.', count: 2 },
    { id: '3', name: 'School', description: 'Educational infrastructure, government primary schools.', count: 3 },
    { id: '4', name: 'Water Supply', description: 'Overhead tanks, piped lines and drinking water filters.', count: 2 },
    { id: '5', name: 'Women Safety', description: 'Solar street lights, bus stop helpdesks, CCTV security.', count: 1 },
    { id: '6', name: 'Electricity', description: 'Rural transformers, household electrification schemes.', count: 2 },
    { id: '7', name: 'Agriculture', description: 'Cold storages, farmer mandi accessibility, soil erosion.', count: 2 }
  ]);

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [success, setSuccess] = useState(false);

  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    const newCat = {
      id: String(Date.now()),
      name: newName,
      description: newDesc || 'Custom category description.',
      count: 0
    };

    setCategories(prev => [...prev, newCat]);
    setNewName('');
    setNewDesc('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Grid className="w-5 h-5 text-cyan-400" />
            <span>Development Categories</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage classification tags for citizen suggestions and AI pipeline filters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Create Custom Category</h2>
          
          <form onSubmit={addCategory} className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Category Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g., Parks & Sports"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Description</label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Define scope for semantic tagging..."
                className="w-full h-24 rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {success ? (
                <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Category Added</span>
                </div>
              ) : <div />}

              <button
                type="submit"
                className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-850">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Category Registries</h2>
          </div>
          
          <div className="divide-y divide-slate-850">
            {categories.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-900/20 transition-all">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <Grid className="w-4.5 h-4.5 text-cyan-400/80" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-200 truncate">{c.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{c.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 text-[9px] font-bold">
                    {c.count} suggestions
                  </span>
                  <button className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/5 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
