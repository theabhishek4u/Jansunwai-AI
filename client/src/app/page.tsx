'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { 
  Vote, 
  Sparkles, 
  MapPin, 
  CalendarRange, 
  Mic, 
  ArrowRight, 
  Languages, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BarChart3,
  Database,
  Activity,
  Check,
  X
} from 'lucide-react';

const liveTickerActivities = [
  "VARANASI PC: Gemini verified a road pothole image at Sigra Block. Severity flagged: High.",
  "LUCKNOW PC: Census & geospatial datasets ingested for 14 rural zones.",
  "BANGALORE SOUTH: AI recommended a ₹1.2 Cr budget allocation for primary school capacity.",
  "VARANASI PC: Citizen Aarav Sharma earned the 'Water Quality Auditor' badge (+120 XP).",
  "LUCKNOW CENTRAL: Groundwater level drop triggered an automated aquifer recharge warning."
];

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Interactive Telemetry Preview State
  const [selectedPreviewPC, setSelectedPreviewPC] = useState<'varanasi' | 'lucknow' | 'bangalore'>('varanasi');
  
  // Real-time ticking activity feed
  const [liveTickerIndex, setLiveTickerIndex] = useState(0);

  // FAQ Interactive category filtering
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<'general' | 'ai' | 'mp'>('general');

  // Live stats count-up simulation
  const [stats, setStats] = useState({
    citizens: 14250,
    suggestions: 5120,
    aiGenerated: 4210,
    activeMps: 45,
    completedProjects: 890
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTickerIndex(prev => (prev + 1) % liveTickerActivities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        citizens: prev.citizens + Math.floor(Math.random() * 2),
        suggestions: prev.suggestions + (Math.random() > 0.7 ? 1 : 0),
        aiGenerated: prev.aiGenerated + (Math.random() > 0.85 ? 1 : 0),
        activeMps: prev.activeMps,
        completedProjects: prev.completedProjects + (Math.random() > 0.96 ? 1 : 0)
      }));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Mock Telemetry Data based on PC selection
  const telemetryData = {
    varanasi: {
      healthIndex: "74/100",
      urgencyAlert: "Sigra road traffic congestion (24% increase)",
      criticalGap: "Harahua Block lacks emergency hospital within 35 mins travel range",
      aiPrescription: "Construct Primary Health Centre (PHC) at Harahua Block",
      budgetOffset: "₹1.80 Crore recommended",
      impactEstimate: "+42% health accessibility index",
      activeProjects: 14,
      categoryDistribution: [
        { name: 'Roads', percentage: 40, color: 'bg-amber-500' },
        { name: 'Water', percentage: 25, color: 'bg-sky-400' },
        { name: 'Healthcare', percentage: 20, color: 'bg-rose-450' },
        { name: 'Education', percentage: 15, color: 'bg-emerald-500' }
      ]
    },
    lucknow: {
      healthIndex: "68/100",
      urgencyAlert: "Groundwater depletion in Susuwahi sector (-1.4m)",
      criticalGap: "Severe drinking water sanitation shortage in 4 outer villages",
      aiPrescription: "Deploy smart check-dam & rainwater recharge filters",
      budgetOffset: "₹95 Lakh recommended",
      impactEstimate: "+60% clean drinking water supply index",
      activeProjects: 9,
      categoryDistribution: [
        { name: 'Water', percentage: 50, color: 'bg-sky-400' },
        { name: 'Roads', percentage: 25, color: 'bg-amber-500' },
        { name: 'Education', percentage: 15, color: 'bg-emerald-500' },
        { name: 'Healthcare', percentage: 10, color: 'bg-rose-450' }
      ]
    },
    bangalore: {
      healthIndex: "86/100",
      urgencyAlert: "Electronic City secondary school capacity deficit (18% deficit)",
      criticalGap: "Primary student commute travel times exceed 50 mins in Block 4",
      aiPrescription: "Establish digital-grounded central secondary academy",
      budgetOffset: "₹3.40 Crore recommended",
      impactEstimate: "+88% education availability index",
      activeProjects: 22,
      categoryDistribution: [
        { name: 'Education', percentage: 45, color: 'bg-emerald-500' },
        { name: 'Roads', percentage: 30, color: 'bg-amber-500' },
        { name: 'Water', percentage: 15, color: 'bg-sky-400' },
        { name: 'Healthcare', percentage: 10, color: 'bg-rose-450' }
      ]
    }
  };

  const preview = telemetryData[selectedPreviewPC];

  const steps = [
    {
      num: "01",
      title: "Submit Suggestion",
      desc: "Citizen uploads image evidence, uses voice recorder, or inputs text describing local development needs (roads, water, colleges)."
    },
    {
      num: "02",
      title: "AI Analysis & Audit",
      desc: "Gemini checks for duplicate requests, analyzes image validity, computes completeness scores, and tags spatial coordinates."
    },
    {
      num: "03",
      title: "MP & Team Reviews",
      desc: "MP views clean constituency demand clusters rather than scattered complaints, seeing exact beneficiary volumes and urgencies."
    },
    {
      num: "04",
      title: "Development Planning",
      desc: "Proposals get accepted, budget is allocated under MP-LADS or central grants, and project milestones are updated on timelines."
    }
  ];

  const features = [
    {
      icon: <Mic className="w-5 h-5 text-amber-500" />,
      title: "Voice-Assisted Input",
      desc: "Speak naturally in Hindi, Bhojpuri, Hinglish, Urdu, or English. Gemini converts voice directly into structured, formal proposals."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
      title: "AI Writing Assistant",
      desc: "Get real-time feedback while writing. The AI asks clarifying questions to double completeness scores and improve formatting."
    },
    {
      icon: <MapPin className="w-5 h-5 text-sky-400" />,
      title: "Smart GIS Telemetry",
      desc: "Pinpoint development issues instantly using GPS coordinates or manual location inputs to map demands precisely."
    },
    {
      icon: <CalendarRange className="w-5 h-5 text-amber-500" />,
      title: "Development Tracking",
      desc: "Transparently track suggestions as they progress from AI assessment and MP review to budgeting and construction."
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-indigo-400" />,
      title: "Priority Analytics Index",
      desc: "Synthesizes thousands of citizen voices into clean priority clusters and hotspot dashboards for MP planning committees."
    },
    {
      icon: <Languages className="w-5 h-5 text-sky-400" />,
      title: "Multilingual Support",
      desc: "Fully accessible in native languages, ensuring rural communities, farmers, and students can raise suggestions comfortably."
    }
  ];

  const faqData = {
    general: [
      { q: "What is Jansunwai AI?", a: "Jansunwai AI is an AI-powered constituency development planning platform. It helps Members of Parliament (MPs) prioritize and make data-driven decisions on development proposals submitted by citizens." },
      { q: "Is this platform free for citizens?", a: "Yes, it is completely free for all citizens of India to raise development suggestions, upload photos, and track execution." }
    ],
    ai: [
      { q: "How does the AI process suggestions?", a: "When you submit a suggestion, the Gemini 2.5 Flash model scans it for duplicates, validates the attached images using vision models, calculates a completeness score, and tags the location using coordinates." },
      { q: "What is the AI Prescription?", a: "The AI Prescription is a recommended action generated by analyzing population data, GIS routing delays, and current infrastructure gaps to suggest the most cost-effective solution." }
    ],
    mp: [
      { q: "How do MPs use this data?", a: "MPs access a dashboard showing priority hotspots, aggregate community demands, and AI-recommended budget layouts, enabling them to allocate MP-LADS funds efficiently." },
      { q: "Can MPs simulate the impact of projects?", a: "Yes, the MP Portal includes a Simulator that shows how health, connectivity, and education index scores will change if a specific project is funded." }
    ]
  };

  const currentFaqs = faqData[selectedFaqCategory];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Decorative Top Lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-650/10 blur-[150px] rounded-full -z-10" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] rounded-full -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-indigo-400">Jansunwai AI</span>
              <p className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold">Constituency Decision Intelligence</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-wider font-bold text-slate-400">
            <a href="#live-preview" className="hover:text-white transition-colors">Interactive Engine</a>
            <a href="#comparison" className="hover:text-white transition-colors">Comparison</a>
            <a href="#features" className="hover:text-white transition-colors">Platform Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Delivery Cycle</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2.5">
                <Link 
                  href={user.role === 'admin' ? '/admin' : user.role === 'mp' ? '/mp' : '/dashboard'} 
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    user.role === 'admin' 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-600/30' 
                      : user.role === 'mp' 
                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-600/30' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  {user.role === 'admin' ? 'Command Center' : user.role === 'mp' ? 'MP Portal' : 'My Dashboard'}
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('jansunwai_user');
                    window.location.reload();
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all font-semibold"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/auth/citizen" 
                  className="px-4 py-2 rounded-xl border border-indigo-600/20 text-indigo-400 hover:bg-indigo-600/10 text-xs font-bold transition-all"
                >
                  Citizen Login
                </Link>
                <Link 
                  href="/auth/mp" 
                  className="px-4 py-2 rounded-xl border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 text-xs font-bold transition-all"
                >
                  MP Portal
                </Link>
                <Link 
                  href="/auth/admin" 
                  className="px-4 py-2 rounded-xl border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 text-xs font-bold transition-all"
                >
                  Super Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Live AI Operations Feed Ticker */}
      <div className="bg-slate-900/40 border-b border-slate-900/60 py-2.5 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex items-center space-x-3 text-xs font-semibold text-slate-400">
          <span className="flex items-center space-x-1.5 uppercase text-indigo-400 tracking-wider shrink-0 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Operations Feed</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="truncate transition-all duration-300">
            {liveTickerActivities[liveTickerIndex]}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side: Heading */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-550/10 border border-indigo-500/25 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Next-Gen Constituency Diagnostics Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white">
                Empowering MPs with <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-500 via-pink-500 to-indigo-500">AI-Driven Planning</span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                Jansunwai AI moves beyond passive complaint pages. We process speech and image submissions, verify local geospatial gaps, and present Member of Parliaments (MPs) with actionable budget blueprints.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Link 
                  href="/auth/citizen" 
                  className="bg-linear-to-r from-orange-500 to-indigo-650 hover:from-orange-400 hover:to-indigo-550 text-white font-bold text-sm px-8 py-4 rounded-xl text-center shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Launch Citizen Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a 
                  href="#live-preview" 
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 px-8 py-4 rounded-xl text-center font-bold transition-colors"
                >
                  Verify Live Heuristics
                </a>
              </div>

              {/* Sub features preview */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-900/60 pt-6">
                <div>
                  <h4 className="text-lg font-black text-white">100%</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Vision Audit</p>
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">Real-Time</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">GIS Hotspots</p>
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">&lt; 1.5s</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Duplicate Check</p>
                </div>
              </div>
            </div>

            {/* Right side: Interactive AI Telemetry preview */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full -z-10" />
              <div className="bg-slate-900/60 border border-slate-900 p-6 rounded-3xl backdrop-blur-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">AI Operations Core</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Select Telemetry Zone</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                      <button 
                        onClick={() => setSelectedPreviewPC('varanasi')}
                        className={`py-2 px-1 rounded-lg text-[9px] font-bold transition-all text-center ${selectedPreviewPC === 'varanasi' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Varanasi
                      </button>
                      <button 
                        onClick={() => setSelectedPreviewPC('lucknow')}
                        className={`py-2 px-1 rounded-lg text-[9px] font-bold transition-all text-center ${selectedPreviewPC === 'lucknow' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Lucknow
                      </button>
                      <button 
                        onClick={() => setSelectedPreviewPC('bangalore')}
                        className={`py-2 px-1 rounded-lg text-[9px] font-bold transition-all text-center ${selectedPreviewPC === 'bangalore' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Bangalore
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Constituency Health Index:</span>
                      <span className="font-extrabold text-indigo-400">{preview.healthIndex}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[8px] text-slate-500 uppercase tracking-wider font-bold">Category Distribution</span>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                        {preview.categoryDistribution.map((cat, i) => (
                          <div 
                            key={i} 
                            style={{ width: `${cat.percentage}%` }} 
                            className={`h-full ${cat.color}`} 
                            title={`${cat.name}: ${cat.percentage}%`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1.5">
                        {preview.categoryDistribution.map((cat, i) => (
                          <div key={i} className="flex items-center space-x-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                            <span className="text-[8px] text-slate-400 font-bold">{cat.name} ({cat.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-2xl space-y-2">
                    <span className="inline-flex items-center space-x-1.5 text-[8px] font-bold text-indigo-300 uppercase tracking-wider bg-indigo-500/20 px-2 py-0.5 rounded">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Gemini AI Prescription</span>
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 mt-1">{preview.aiPrescription}</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Resolves {preview.urgencyAlert} and addresses infrastructure gaps instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix Table */}
      <section id="comparison" className="py-20 border-t border-slate-900/60 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Traditional Portals vs. Jansunwai AI</h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-400">
              Why our AI-grounded planning architecture is light years ahead of static complaint boxes.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-900 bg-slate-900/20">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-5">Platform Attribute</th>
                  <th className="p-5">Traditional Complaint Portal</th>
                  <th className="p-5 text-indigo-400 bg-indigo-950/10">Jansunwai AI Decision Platform</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-900">
                <tr>
                  <td className="p-5 font-bold text-slate-350">Submission Input</td>
                  <td className="p-5 text-slate-400 flex items-center space-x-2">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Plain Text Forms Only</span>
                  </td>
                  <td className="p-5 text-slate-200 bg-indigo-950/5 font-semibold">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Voice Recording, Speech-to-Text & Vision Uploads</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-slate-350">Duplicate Management</td>
                  <td className="p-5 text-slate-400 flex items-center space-x-2">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Manual Sorting (Thousands of duplicates)</span>
                  </td>
                  <td className="p-5 text-slate-200 bg-indigo-950/5 font-semibold">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>AI Duplicate Cluster Grouping (&lt;1.5s Execution)</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-slate-350">Quality Assessment</td>
                  <td className="p-5 text-slate-400 flex items-center space-x-2">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Incomplete forms accepted blindly</span>
                  </td>
                  <td className="p-5 text-slate-200 bg-indigo-950/5 font-semibold">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>AI Writing Co-author asks clarifying details</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-slate-350">Decision Assistance</td>
                  <td className="p-5 text-slate-400 flex items-center space-x-2">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    <span>None (MPs read randomly or ignore)</span>
                  </td>
                  <td className="p-5 text-slate-200 bg-indigo-950/5 font-semibold">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>AI Prescriptions & Interactive Budgeting Simulator</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.06),transparent_50%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Smarter Local Development Planning</h2>
            <p className="mt-4 text-slate-400 text-sm">
              We process, analyze, and structure public development requests so planning officers and MPs can act with statistical certainty.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => (
              <div 
                key={index} 
                className="group relative bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-850 p-8 rounded-3xl transition-all duration-350 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feat.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 border-t border-slate-900 bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold text-white">Structured Delivery Cycle</h2>
            <p className="mt-4 text-slate-400 text-sm">
              An active four-stage lifecycle from voice recording inputs to finalized project completion.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-[32px] left-[15%] right-[15%] h-[1px] bg-slate-900 z-0" />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-indigo-400 font-black text-lg shadow-inner">
                  {step.num}
                </div>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 px-4 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section id="impact" className="py-24 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-tr from-slate-900/60 to-indigo-950/20 border border-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-white">Our Real-Time Impact</h2>
              <p className="mt-3 text-xs text-indigo-400 font-bold tracking-wider uppercase">Live Platform Diagnostic Indicators</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 text-center">
              <div>
                <span className="block text-3xl md:text-5xl font-black text-white">{stats.citizens.toLocaleString()}</span>
                <span className="block mt-2 text-xs md:text-sm text-slate-400 font-medium">Registered Citizens</span>
              </div>
              <div>
                <span className="block text-3xl md:text-5xl font-black text-white">{stats.suggestions.toLocaleString()}</span>
                <span className="block mt-2 text-xs md:text-sm text-slate-400 font-medium">Suggestions Submitted</span>
              </div>
              <div>
                <span className="block text-3xl md:text-5xl font-black text-white">{stats.aiGenerated.toLocaleString()}</span>
                <span className="block mt-2 text-xs md:text-sm text-slate-400 font-medium">AI Audited Submissions</span>
              </div>
              <div>
                <span className="block text-3xl md:text-5xl font-black text-white">{stats.activeMps}</span>
                <span className="block mt-2 text-xs md:text-sm text-slate-400 font-medium">Active MPs</span>
              </div>
              <div className="col-span-2 lg:col-span-1">
                <span className="block text-3xl md:text-5xl font-black text-emerald-400">{stats.completedProjects}</span>
                <span className="block mt-2 text-xs md:text-sm text-slate-400 font-medium">Projects Completed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with category filter */}
      <section id="faq" className="py-24 border-t border-slate-900 bg-slate-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="mt-3 text-xs text-slate-400">Find direct answers detailing platform security, AI model validation, and governance parameters.</p>
          </div>

          {/* FAQ Category Toggles */}
          <div className="flex justify-center space-x-2 mb-8 max-w-md mx-auto bg-slate-950/40 p-1 rounded-xl border border-slate-900">
            <button
              onClick={() => { setSelectedFaqCategory('general'); setActiveFaq(null); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${selectedFaqCategory === 'general' ? 'bg-indigo-600 text-white' : 'text-slate-450 hover:text-white'}`}
            >
              General
            </button>
            <button
              onClick={() => { setSelectedFaqCategory('ai'); setActiveFaq(null); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${selectedFaqCategory === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-455 hover:text-white'}`}
            >
              AI & Grounding
            </button>
            <button
              onClick={() => { setSelectedFaqCategory('mp'); setActiveFaq(null); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${selectedFaqCategory === 'mp' ? 'bg-indigo-600 text-white' : 'text-slate-455 hover:text-white'}`}
            >
              MP Portal
            </button>
          </div>

          <div className="space-y-4">
            {currentFaqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-white flex items-center space-x-3 text-xs sm:text-sm">
                    <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {activeFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-6 pt-1 text-xs text-slate-400 border-t border-slate-950/20 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white">Jansunwai AI</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 mb-6 md:mb-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          <p className="text-[10px] text-slate-500">
            © 2026 Jansunwai AI. Built for better local administration.
          </p>
        </div>
      </footer>
    </div>
  );
}
