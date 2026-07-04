'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, UploadCloud, FileSpreadsheet,
  CheckCircle, Loader2, AlertCircle, Trash2,
  Cpu, HardDrive, ShieldCheck
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface DatasetRecord {
  id: string;
  name: string;
  category: string;
  fileSize: string;
  format: string;
  uploadedAt: string;
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<DatasetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // File upload simulation states
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = ['Census', 'Education Data', 'Hospital Data', 'School Data', 'Road Network', 'Government Schemes', 'Water Supply', 'Health Centers', 'Agriculture Data', 'Population Data', 'Poverty Data'];

  const [selectedCategory, setSelectedCategory] = useState('Census');

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = () => {
    fetch(`${API}/api/admin/datasets`)
      .then(r => r.json())
      .then(d => setDatasets(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const startUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadProgress(0);

    const steps = [
      { p: 15, label: 'Reading file headers & validating checksums...' },
      { p: 40, label: 'Verifying geospatial columns & records format...' },
      { p: 70, label: 'AI Chunking: splitting records for embedding vector spaces...' },
      { p: 90, label: 'Indexing: Syncing with Supabase PostgreSQL semantic store...' },
      { p: 100, label: 'Embedding verification complete. Ready.' }
    ];

    for (const step of steps) {
      setUploadStep(step.label);
      // Wait simulated duration
      await new Promise(r => setTimeout(r, 1200));
      setUploadProgress(step.p);
    }

    try {
      const res = await fetch(`${API}/api/admin/datasets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uploadFile.name.split('.')[0].replace(/_/g, ' '),
          category: selectedCategory,
          fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
          format: uploadFile.name.split('.').pop()?.toUpperCase() || 'CSV'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDatasets(prev => [data.dataset, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
      setUploadFile(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <span>Public Dataset Indexer</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Upload geospatial, census, or infrastructure registries to ground AI model assessments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Container */}
        <div className="bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingest New Dataset</h2>
          
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 font-semibold mb-1 block">Dataset Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Drag area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[180px]
              ${dragActive ? 'border-cyan-400 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/20'}`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".csv,.json,.geojson,.xlsx,.xls"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
              <UploadCloud className="w-8 h-8 text-cyan-500/60" />
              <p className="text-xs text-slate-300 font-medium">Drag file here or click to select</p>
              <p className="text-[9px] text-slate-500 uppercase font-semibold">CSV, JSON, GeoJSON, Excel up to 50MB</p>
            </label>
          </div>

          {/* File details & trigger */}
          {uploadFile && !uploading && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-200 truncate font-semibold">{uploadFile.name}</p>
                  <p className="text-[9px] text-slate-500">{(uploadFile.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button
                onClick={startUpload}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px]"
              >
                Index File
              </button>
            </motion.div>
          )}

          {/* Progress bar */}
          {uploading && (
            <div className="p-4 bg-slate-900/50 rounded-xl border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing AI Index</span>
                </span>
                <span className="text-xs text-slate-200 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-cyan-500" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 italic leading-relaxed">{uploadStep}</p>
            </div>
          )}
        </div>

        {/* List of Datasets */}
        <div className="lg:col-span-2 bg-[#0b1329]/80 rounded-2xl border border-cyan-500/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Grounding Datasets</h2>
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">Semantic Lock On</span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-slate-850">
              {datasets.map((dataset) => (
                <div key={dataset.id} className="p-4 flex items-center justify-between hover:bg-slate-900/20 transition-all">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                      <FileSpreadsheet className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-200 truncate">{dataset.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[9px] text-slate-500 uppercase">{dataset.category}</span>
                        <span className="text-[9px] text-slate-600">•</span>
                        <span className="text-[9px] text-slate-500 font-mono">{dataset.fileSize}</span>
                        <span className="text-[9px] text-slate-600">•</span>
                        <span className="px-1 py-0.2 bg-slate-900 rounded text-[7px] text-slate-400 font-black">{dataset.format}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-[9px] text-slate-500">{new Date(dataset.uploadedAt).toLocaleDateString('en-IN')}</span>
                    <button className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/5 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
