'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Calendar, BarChart3,
  HeartPulse, Users, Wallet, Trophy, Building2,
  Shield
} from 'lucide-react';

const reports = [
  {
    title: 'Monthly Development Report',
    description: 'AI-compiled summary of all development activities, new suggestions, completed projects, and constituency progress for the current month.',
    icon: <Calendar className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-700',
    stats: '18 suggestions · 2 completed · 7 in progress',
    date: 'July 2026',
  },
  {
    title: 'Budget Utilization Report',
    description: 'Detailed breakdown of budget allocation, expenditure, and remaining funds across all development categories with AI variance analysis.',
    icon: <Wallet className="w-6 h-6" />,
    color: 'from-emerald-500 to-emerald-700',
    stats: '₹5.75 Cr spent · ₹4.25 Cr remaining · 57.5% utilized',
    date: 'Q2 2026',
  },
  {
    title: 'AI Priority Analysis Report',
    description: 'Ranked list of all development projects with AI scoring breakdown, population impact, and recommended action plan.',
    icon: <Trophy className="w-6 h-6" />,
    color: 'from-amber-500 to-amber-700',
    stats: '18 projects ranked · Top 5 critical projects highlighted',
    date: 'Latest',
  },
  {
    title: 'Constituency Health Report',
    description: 'Overall health score with factor-wise analysis including roads, education, healthcare, water, electricity, and digital connectivity.',
    icon: <HeartPulse className="w-6 h-6" />,
    color: 'from-cyan-500 to-cyan-700',
    stats: 'Score: 72/100 · Grade: Good · 5 AI recommendations',
    date: 'Latest',
  },
  {
    title: 'Citizen Engagement Report',
    description: 'Statistics on citizen registrations, suggestion submissions, supporter growth, and demographic engagement breakdown.',
    icon: <Users className="w-6 h-6" />,
    color: 'from-violet-500 to-violet-700',
    stats: '6 registered citizens · 342 avg. supporters per suggestion',
    date: 'July 2026',
  },
  {
    title: 'Infrastructure Gap Analysis',
    description: 'Village-wise comparison of existing vs. required infrastructure for schools, PHCs, roads, and water supply with deficit calculations.',
    icon: <Building2 className="w-6 h-6" />,
    color: 'from-pink-500 to-pink-700',
    stats: '6 villages · 5 PHC gaps · 24 road-km deficit',
    date: 'Latest',
  },
  {
    title: 'Women Safety Assessment',
    description: 'Analysis of women safety-related suggestions, incident reports, infrastructure gaps (CCTV, lighting, helpdesks), and recommended interventions.',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-rose-500 to-rose-700',
    stats: '1 active request · Cholapur bus stop flagged critical',
    date: 'July 2026',
  },
  {
    title: 'Annual Development Plan',
    description: 'AI-generated comprehensive annual development strategy incorporating all citizen inputs, budget projections, and milestone planning.',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'from-indigo-500 to-indigo-700',
    stats: 'FY 2026-27 · ₹21.85 Cr total pipeline',
    date: 'FY 2026-27',
  }
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FileText className="w-6 h-6 text-amber-400" />
          <span>AI-Generated Reports</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Download constituency development reports powered by AI analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report, i) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#111827] rounded-2xl p-6 border border-slate-800/50 hover:border-slate-700/80 transition-all group"
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${report.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                {report.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">{report.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{report.description}</p>
                <p className="text-[10px] text-slate-500 mt-2">{report.stats}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">{report.date}</span>
                  <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-semibold hover:bg-amber-500/20 transition-colors border border-amber-500/20">
                    <Download className="w-3 h-3" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
