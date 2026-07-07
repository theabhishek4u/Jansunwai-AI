'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MapPin, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Suggestion {
  id: string;
  complaint_number?: string;
  title: string;
  category: string;
  district: string;
  village: string;
  status: string;
  urgency: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-500/20 text-blue-400' },
  ai_processing: { label: 'AI Review', color: 'bg-purple-500/20 text-purple-400' },
  under_review: { label: 'Under Review', color: 'bg-amber-500/20 text-amber-400' },
  planned: { label: 'Planned', color: 'bg-indigo-500/20 text-indigo-400' },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' }
};

export default function AdminComplaintsList() {
  const [complaints, setComplaints] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/suggestions')
      .then(res => res.json())
      .then(data => {
        setComplaints(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Complaints Registry</h1>
          <p className="text-slate-400">Overview of all complaints submitted across the nation.</p>
        </div>
        <div className="bg-slate-900 rounded-xl px-4 py-2 border border-slate-800 flex items-center gap-3 shadow-inner">
          <FileText className="w-5 h-5 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Complaints</span>
            <span className="text-lg font-black text-white leading-none">{complaints.length}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-bold">
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {complaints.map((complaint) => {
                  const sc = statusConfig[complaint.status] || statusConfig.submitted;
                  return (
                    <tr key={complaint.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-4 align-top">
                        <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
                          {complaint.complaint_number || complaint.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm font-bold text-slate-200 mb-1 line-clamp-2">{complaint.title}</p>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          {complaint.category} • {complaint.urgency} Urgency
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-slate-400">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
                          <div className="flex flex-col">
                            <span className="text-slate-300 font-medium">{complaint.village || 'City'}</span>
                            <span>{complaint.district}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        <Link href={`/mp/complaints/${complaint.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                          View 
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                      No complaints found in the registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
