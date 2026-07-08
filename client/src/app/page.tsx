'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  Sparkles,
  MapPin,
  Mic,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  Wrench,
  Shield,
  Check,
  X,
  FileText,
  Eye,
  Users,
  CheckCircle,
  Quote,
  Search,
  Bot,
  Phone,
  Mail,
  Code,
  Sun,
  Activity,
  Bell
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Live stats count-up simulation
  const [stats, setStats] = useState({
    citizens: 14250,
    suggestions: 5120,
    aiAudited: 4210,
    completedProjects: 890
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        citizens: prev.citizens + Math.floor(Math.random() * 2),
        suggestions: prev.suggestions + (Math.random() > 0.7 ? 1 : 0),
        aiAudited: prev.aiAudited + (Math.random() > 0.85 ? 1 : 0),
        completedProjects: prev.completedProjects + (Math.random() > 0.96 ? 1 : 0)
      }));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Citizen Complaint Submission",
      desc: "Submit development grievances through text, voice recording, or photographic evidence. Accessible to all citizens regardless of language or literacy level.",
      color: "text-blue-500",
      bg: "bg-blue-500/8 border-blue-500/15"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI-Driven Analysis & Prioritization",
      desc: "Gemini AI validates submissions, detects duplicates in under 1.5 seconds, scores completeness, and assigns priority based on population impact.",
      color: "text-amber-500",
      bg: "bg-amber-500/8 border-amber-500/15"
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Real-Time Progress Tracking",
      desc: "Track your grievance from submission through AI analysis, MP review, budget allocation, and project completion — full transparency at every step.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/8 border-emerald-500/15"
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Department Accountability",
      desc: "Assigned departments must upload progress evidence with photo documentation. Automated escalation ensures timely resolution of every approved project.",
      color: "text-rose-500",
      bg: "bg-rose-500/8 border-rose-500/15"
    },
    {
      icon: <Mic className="w-5 h-5" />,
      title: "Voice & Multilingual Support",
      desc: "Speak naturally in Hindi, Bhojpuri, Urdu, or English. AI converts voice into structured formal proposals, ensuring rural communities are heard.",
      color: "text-violet-500",
      bg: "bg-violet-500/8 border-violet-500/15"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "GIS-Based Location Mapping",
      desc: "Precise geospatial tagging of every grievance. MPs see constituency hotspot maps to identify areas requiring urgent infrastructure intervention.",
      color: "text-cyan-500",
      bg: "bg-cyan-500/8 border-cyan-500/15"
    }
  ];

  const workflowSteps = [
    {
      num: "01",
      phase: "SUBMISSION",
      title: "Citizen Grievance Filing",
      desc: "Citizens submit suggestions or complaints using multilingual speech-to-text, photo upload, or written input. Native dialects like Bhojpuri/Hindi are parsed directly by custom NLP wrappers.",
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      color: "border-blue-500/30",
      accent: "text-blue-400"
    },
    {
      num: "02",
      phase: "AI ANALYSIS",
      title: "Gemini Telemetry & Verification",
      desc: "Gemini 2.5 Flash processes the request in under 1.5 seconds. It runs Vision Analysis on images, tags geospatial coords, filters duplicates, and estimates beneficiary weight parameters.",
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      color: "border-amber-500/30",
      accent: "text-amber-400"
    },
    {
      num: "03",
      phase: "MP DECISION",
      title: "MP Review & Budget Simulator",
      desc: "The Member of Parliament analyzes high-priority hotspots on a Leaflet telemetry map, evaluates constituency health metrics, and uses the MP-LADS budget simulator to route funds.",
      icon: <Building2 className="w-5 h-5 text-violet-400" />,
      color: "border-violet-500/30",
      accent: "text-violet-400"
    },
    {
      num: "04",
      phase: "DEPARTMENT ACTION",
      title: "Task Routing & Execution",
      desc: "Approved proposals route directly to PWD or Water departments. Assigned officers update progress timelines, upload before/after photos, and interact over direct channels.",
      icon: <Wrench className="w-5 h-5 text-emerald-400" />,
      color: "border-emerald-500/30",
      accent: "text-emerald-400"
    },
    {
      num: "05",
      phase: "RESOLUTION",
      title: "Evidence Validation & Audit",
      desc: "On task completion, before & after overlays are locked. The citizen receives automated alerts, checks the evidence, and provides audit signoff.",
      icon: <CheckCircle className="w-5 h-5 text-cyan-400" />,
      color: "border-cyan-500/30",
      accent: "text-cyan-400"
    }
  ];

  const testimonials = [
    {
      quote: "I submitted a road repair complaint with a photo, and within two weeks the PWD team was on-site. For the first time, I felt my voice actually mattered.",
      name: "Priya Sharma",
      role: "Citizen, Lucknow",
      avatar: "PS"
    },
    {
      quote: "The AI priority dashboard transformed how I allocate MP-LADS funds. Instead of guessing, I now see exactly which villages need urgent intervention backed by data.",
      name: "Hon. Rajesh Verma",
      role: "Member of Parliament",
      avatar: "RV"
    },
    {
      quote: "The automated task assignment and evidence upload system has drastically improved our department's response time and accountability to citizens.",
      name: "Sanjay Mishra",
      role: "Executive Engineer, PWD",
      avatar: "SM"
    }
  ];

  const faqs = [
    { q: "What is Jansunwai AI?", a: "Jansunwai AI is a government-focused platform that uses artificial intelligence to process, prioritize, and track citizen grievances. It connects citizens directly with their MP and local departments for faster, data-driven development decisions." },
    { q: "Is this platform free for citizens?", a: "Yes, Jansunwai AI is completely free for all Indian citizens. You can submit grievances, upload evidence, track progress, and receive notifications at no cost." },
    { q: "How does the AI process my complaint?", a: "When you submit a complaint, Gemini AI scans it for duplicates, validates attached images using vision models, calculates a completeness score, tags the location via GPS coordinates, and assigns a priority ranking based on population impact and urgency." },
    { q: "How do MPs use this platform?", a: "MPs access a dedicated dashboard showing constituency priority hotspots, aggregate community demands, AI-recommended budget allocations, and an interactive simulator to model the impact of proposed development projects." },
    { q: "Is my personal information secure?", a: "Yes. All data is encrypted in transit and at rest. Aadhaar verification is optional and used solely for identity confirmation. The platform follows Government of India data protection guidelines." },
    { q: "Can I track the progress of my complaint?", a: "Absolutely. Every complaint has a unique tracking ID. You can monitor its status in real-time — from AI analysis and MP review through department assignment and project completion." }
  ];

  const comparisonRows = [
    { attr: "Submission Input", old: "Plain Text Forms Only", new: "Voice, Image, Text & Multilingual" },
    { attr: "Duplicate Management", old: "Manual Sorting (Thousands of duplicates)", new: "AI Cluster Grouping (<1.5s execution)" },
    { attr: "Quality Assessment", old: "Incomplete forms accepted blindly", new: "AI Co-author asks clarifying details" },
    { attr: "Decision Intelligence", old: "None (MPs read randomly or ignore)", new: "AI Priority Scores & Budget Simulator" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#060a16] text-slate-100 font-sans selection:bg-fuchsia-500/30 selection:text-white">

      {/* ─── NAVIGATION ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#060a16]/85 border-b border-slate-800/40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white uppercase">JANMITRA</span>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">AI SMART GOVERNANCE</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="w-10 h-10 rounded-full hover:bg-slate-800/60 flex items-center justify-center text-slate-400 transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <Link
              href="/auth/citizen"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>FILE COMPLAINT</span>
            </Link>
            
            {user ? (
               <Link
                 href={user.role === 'admin' ? '/admin' : user.role === 'mp' ? '/mp' : '/dashboard'}
                 className="px-6 py-2.5 rounded-full border border-slate-700 hover:bg-slate-800/50 text-white text-xs font-bold transition-all flex items-center space-x-2"
               >
                 <User className="w-4 h-4" />
                 <span>MY DASHBOARD</span>
               </Link>
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setPortalDropdownOpen(true)}
                onMouseLeave={() => setPortalDropdownOpen(false)}
              >
                <button className="flex items-center space-x-2 px-6 py-2.5 rounded-full border border-slate-700 hover:bg-slate-800/50 text-white text-xs font-bold transition-all cursor-pointer">
                  <Shield className="w-4 h-4" />
                  <span>ADMIN PORTAL</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${portalDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {portalDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0c1225] border border-slate-800/80 shadow-2xl shadow-black/40 p-2 backdrop-blur-xl z-50 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                      <div className="space-y-1 mt-1">
                        {[
                          { href: '/auth/citizen', icon: <User className="w-4 h-4" />, label: 'Citizen Portal', desc: 'Submit grievances & track progress', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/15' },
                          { href: '/auth/mp', icon: <Building2 className="w-4 h-4" />, label: 'MP Portal', desc: 'Constituency dashboard', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/15' },
                          { href: '/department/login', icon: <Wrench className="w-4 h-4" />, label: 'Department Portal', desc: 'Task execution & evidence upload', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/15' },
                          { href: '/auth/admin', icon: <Shield className="w-4 h-4" />, label: 'Super Admin', desc: 'Platform management', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/15' }
                        ].map(portal => (
                          <Link
                            key={portal.href}
                            href={portal.href}
                            className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-800/40 transition-all group"
                          >
                            <div className={`w-9 h-9 rounded-xl ${portal.bg} border flex items-center justify-center ${portal.color} group-hover:scale-105 transition-transform shrink-0`}>
                              {portal.icon}
                            </div>
                            <div className="text-left">
                              <span className={`text-[12px] font-bold text-white block group-hover:${portal.color} transition-colors`}>{portal.label}</span>
                              <span className="text-[10px] text-slate-500 block mt-0.5">{portal.desc}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-36 bg-[#060a16]">
        {/* Deep dark animated mesh gradient background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/10 blur-[200px] rounded-full -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-600/5 blur-[150px] rounded-full -z-10 -translate-x-1/3 translate-y-1/3" />
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT COLUMN: Hero Copy */}
            <div className="space-y-8 relative z-10 text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] text-white"
              >
                Fixing Citizen <br /> Grievances
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">with Next-Gen AI <br /> Routing</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl"
              >
                Resolve municipal issues in seconds. JanMitra parses complaints in Hindi or Hinglish, detects severity levels, and smart-routes to nodal officers automatically.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4"
              >
                <Link
                  href="/auth/citizen"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center space-x-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>File a Complaint</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/auth/citizen"
                  className="w-full sm:w-auto px-8 py-4 rounded-full border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200 font-bold transition-all flex items-center justify-center space-x-2 text-sm backdrop-blur-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>My Complaints</span>
                </Link>
              </motion.div>

              {/* Stats Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-10"
              >
                {[
                  { icon: <FileText className="w-3.5 h-3.5 text-emerald-400" />, label: "Complaints Filed Today", val: "270" },
                  { icon: <CheckCircle className="w-3.5 h-3.5 text-blue-400" />, label: "Issues Resolved", val: "10,000+" },
                  { icon: <MapPin className="w-3.5 h-3.5 text-violet-400" />, label: "Districts (UP)", val: "75" },
                  { icon: <Activity className="w-3.5 h-3.5 text-fuchsia-400" />, label: "AI Engine Active", val: "24/7" }
                ].map(badge => (
                  <div key={badge.label} className="flex items-center space-x-2 px-4 py-2 rounded-full border border-slate-800/80 bg-[#0b1225]/50 backdrop-blur-sm text-[11px] text-slate-300 font-bold">
                    {badge.icon}
                    <span><span className={badge.icon.props.className}>{badge.val}</span> {badge.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Animated Mockup Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 hidden lg:block"
            >
              {/* Outer Glow / Decorator */}
              <div className="absolute -top-12 -right-12 bg-[#0c1225] border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-3 shadow-2xl z-20">
                <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Auto Escalation</div>
                  <div className="text-xs font-bold text-white">Active (District)</div>
                </div>
              </div>

              {/* Main App Window Mockup */}
              <div className="w-full bg-[#0b1225] border border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wide">Janmitra Live Router</h3>
                      <p className="text-[10px] text-slate-500">Real-Time Grievance Feed</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-bold text-emerald-500 tracking-widest uppercase">Live Run</span>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {/* Ticket Header */}
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500">TICKET ID: JM-2026-948</span>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">Assigned & Dispatched</span>
                  </div>

                  {/* Citizen Info Box */}
                  <div className="p-5 rounded-2xl bg-[#0d162d] border border-slate-800/60 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>Citizen & Location</span>
                    </div>
                    <div className="font-bold text-white text-sm">Rahul Sharma (Gomti Nagar)</div>
                    <p className="text-xs text-slate-400 italic">"Gomti Nagar main crossing ke pass drinking water pipeline leak ho gayi hai, subah se paani beh raha hai."</p>
                  </div>

                  {/* Routing Badges */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0d162d] border border-slate-800/60 hover:border-slate-700 transition-colors">
                      <div className="flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">
                        <Bot className="w-3 h-3 text-fuchsia-500" />
                        <span>AI Category Match</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">Water Supply & Sewage...</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0d162d] border border-slate-800/60 hover:border-slate-700 transition-colors">
                      <div className="flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">
                        <Shield className="w-3 h-3 text-amber-500" />
                        <span>Smart Routing</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">Lucknow Jal Nigam (Er....</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">AI Lifecycle Processing</span>
                      <span className="text-[10px] font-bold text-white">75% Complete</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#0d162d] rounded-full overflow-hidden flex border border-slate-800">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "33%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-blue-500 border-r border-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      />
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "33%" }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="h-full bg-violet-500 border-r border-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                      />
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "9%" }}
                        transition={{ duration: 1, delay: 2.5 }}
                        className="h-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                      />
                    </div>
                  </div>
                  
                  {/* Bottom Footer Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-[10px] font-bold text-slate-400">Model V2</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-500">
                      <Check className="w-3 h-3" />
                      <span>0.8s Classification</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom overlapping widget */}
              <div className="absolute -bottom-6 left-12 bg-[#0c1225] border border-slate-800/80 rounded-2xl p-4 pr-8 flex items-center space-x-4 shadow-2xl z-20">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Resolution Rate</div>
                  <div className="text-sm font-bold text-white">94.8% (Fast Path)</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-24 border-t border-slate-800/30 bg-[#060a16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Transparent, Accountable Governance</h2>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
              A complete ecosystem connecting citizens, MPs, and government departments through AI-powered intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group relative bg-[#0b1225]/60 hover:bg-[#0e1530] border border-slate-800/40 hover:border-slate-700/60 p-7 rounded-2xl transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl ${feat.bg} border flex items-center justify-center mb-5 ${feat.color} group-hover:scale-110 transition-transform duration-300`}>
                  {feat.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2.5 group-hover:text-blue-400 transition-colors">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS: PLATFORM WORKFLOW ─── */}
      <section id="how-it-works" className="py-24 border-t border-slate-800/30 bg-[#070b18]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3">Interactive Delivery Cycle</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How Jansunwai AI Works</h2>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
              Follow a single complaint trajectory from initial citizen submission to automated AI verification, MP routing, and department execution.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Side: Step Selectors (5 columns on desktop) */}
            <div className="lg:col-span-5 space-y-3">
              {workflowSteps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start space-x-4 cursor-pointer ${
                      isActive
                        ? `bg-[#0e1630] ${step.color} border-l-4 border-l-blue-500`
                        : "bg-[#0b1225]/40 border-slate-850 hover:bg-[#0b1225]/75 border-transparent"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? "bg-blue-600/10 text-blue-400" : "bg-slate-900 text-slate-500"
                    }`}>
                      {step.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8px] font-bold tracking-widest ${isActive ? step.accent : "text-slate-500"}`}>
                          PHASE {step.num}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-0.5">{step.title}</h4>
                      <p className="text-[11px] text-slate-450 mt-1 leading-normal">{step.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Side: Interactive Simulation Console (7 columns on desktop) */}
            <div className="lg:col-span-7 bg-[#0b1225]/60 border border-slate-800/40 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden min-h-[380px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04),transparent_50%)] pointer-events-none" />
              
              {/* Header of the Emulator */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5 shrink-0">
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-450 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Interactive Diagnostics Center</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">
                  {workflowSteps[activeStep].phase}
                </span>
              </div>

              {/* Dynamic Content Body */}
              <div className="grow flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Step 1: Citizen Submission */}
                    {activeStep === 0 && (
                      <div className="space-y-3.5">
                        <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-2">
                          <span className="text-[8px] font-bold text-blue-400 uppercase tracking-wider block">Speech Processing Dialect Feed</span>
                          <div className="flex items-center space-x-3">
                            {/* Audio waveform mock */}
                            <div className="flex items-center space-x-0.5 h-6 shrink-0">
                              <span className="w-0.5 h-3 bg-blue-500 rounded animate-pulse" />
                              <span className="w-0.5 h-5 bg-blue-500 rounded animate-pulse delay-75" />
                              <span className="w-0.5 h-2 bg-blue-500 rounded animate-pulse delay-100" />
                              <span className="w-0.5 h-4 bg-blue-500 rounded animate-pulse delay-150" />
                              <span className="w-0.5 h-6 bg-blue-500 rounded animate-pulse delay-200" />
                              <span className="w-0.5 h-1.5 bg-blue-500 rounded animate-pulse delay-75" />
                            </div>
                            <span className="text-[11px] text-slate-300 font-mono italic">&ldquo;Sigra block me pani ki samasya hai...&rdquo;</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Speech Dialect</span>
                            <span className="text-white block font-bold">Hindi/Bhojpuri Hybrid</span>
                          </div>
                          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Device Source</span>
                            <span className="text-white block font-bold">Mobile Browser Voice Relay</span>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl text-xs text-slate-350 space-y-1">
                          <span className="text-[8px] font-bold text-blue-400 uppercase block tracking-wider">Formal Translation Target</span>
                          <p className="font-semibold leading-relaxed text-slate-200">
                            &ldquo;Inadequate drinking water infrastructure &amp; sanitization relays reported at Sigra, Varanasi.&rdquo;
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 2: AI Analysis */}
                    {activeStep === 1 && (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-2">
                          <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider block">Vision Model Match Report</span>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-300 font-bold">
                            <span className="text-emerald-400">✔ Match Confirmed</span>
                            <span className="text-slate-500">|</span>
                            <span>Water Pipeline Leakage (98.2% Confidence)</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Duplicates Check</span>
                            <span className="text-emerald-400 block font-bold">Cleared (0 Matches in 24h)</span>
                          </div>
                          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Coordinates Lock</span>
                            <span className="text-white block font-bold">25.3176° N, 82.9739° E</span>
                          </div>
                        </div>

                        <div className="p-3 bg-amber-950/20 border border-amber-500/10 rounded-xl text-xs text-slate-350 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[8px] font-bold text-amber-400 block tracking-wider uppercase">Beneficiaries</span>
                            <span className="text-slate-200 font-bold text-sm">18,400 residents</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-amber-400 block tracking-wider uppercase">AI Priority score</span>
                            <span className="text-red-400 font-bold text-sm">88 / 100 (High)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: MP Decision */}
                    {activeStep === 2 && (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                          <span className="text-[8px] font-bold text-violet-400 uppercase tracking-wider block">MP-LADS Allocation Node</span>
                          <span className="text-[11px] text-white block font-bold">Sanction approved for Varanasi Constituency</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Allocated Capital</span>
                            <span className="text-white block font-bold">₹14.50 Lakhs</span>
                          </div>
                          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Assigned Department</span>
                            <span className="text-white block font-bold">Water Sanitation Board</span>
                          </div>
                        </div>

                        <div className="p-3 bg-violet-950/20 border border-violet-500/10 rounded-xl text-xs text-slate-350 space-y-1">
                          <span className="text-[8px] font-bold text-violet-400 block tracking-wider uppercase">Impact Projection Relay</span>
                          <p className="font-semibold text-slate-200">
                            Improves local Clean Drinking Water supply accessibility rating by <span className="text-emerald-400 font-extrabold">+60%</span>.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Department Action */}
                    {activeStep === 3 && (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                          <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider block">Department Workflow Tracker</span>
                          <span className="text-[11px] text-white block font-bold">Task ID #WSB-VNS-2026-48 — Under Execution</span>
                        </div>

                        <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-2 text-[10px]">
                          <span className="text-slate-500 block uppercase font-bold text-[8px]">MP-Officer Coordination Channel</span>
                          <div className="space-y-1.5">
                            <p className="text-slate-350"><strong className="text-violet-400">MP Office:</strong> &ldquo;Is the pipeline work at Sigra block on track?&rdquo;</p>
                            <p className="text-slate-300"><strong className="text-emerald-400">WSB Officer:</strong> &ldquo;Yes, new pipes have been routed. Progress is at 75%.&rdquo;</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Resolution */}
                    {activeStep === 4 && (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                          <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-wider block">Physical Resolution Verification</span>
                          <span className="text-[11px] text-emerald-400 block font-bold">✔ Project Completed & Audited</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Grievance Status</span>
                            <span className="text-white block font-bold">Resolved (Timeline Locked)</span>
                          </div>
                          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-1">
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Citizen XP Reward</span>
                            <span className="text-emerald-400 block font-bold">+120 XP (Citizen Level 3)</span>
                          </div>
                        </div>

                        <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl text-xs text-slate-350 space-y-1">
                          <span className="text-[8px] font-bold text-cyan-400 block tracking-wider uppercase">Closing Audit Evidence</span>
                          <p className="font-semibold text-slate-200">
                            Geospatial coordinates re-verified. Post-repair vision logs uploaded successfully.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Instructions / Guide */}
              <div className="border-t border-slate-850 pt-3 mt-5 text-[10px] text-slate-500 shrink-0">
                Select a step on the left to see the AI and Representative system diagnostics.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE IMPACT STATISTICS ─── */}
      <section id="impact" className="py-24 border-t border-slate-800/30 bg-[#060a16]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Live Platform Data</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Real-Time Impact</h2>
            <p className="mt-4 text-sm text-slate-400">Numbers that reflect the growing trust of citizens across India.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: stats.citizens.toLocaleString(), label: "Registered Citizens", icon: <Users className="w-5 h-5 text-blue-400" />, border: "border-blue-500/15" },
              { value: stats.suggestions.toLocaleString(), label: "Grievances Filed", icon: <FileText className="w-5 h-5 text-amber-400" />, border: "border-amber-500/15" },
              { value: stats.aiAudited.toLocaleString(), label: "AI Audited", icon: <Sparkles className="w-5 h-5 text-violet-400" />, border: "border-violet-500/15" },
              { value: stats.completedProjects.toLocaleString(), label: "Projects Completed", icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, border: "border-emerald-500/15" }
            ].map(stat => (
              <div key={stat.label} className={`bg-[#0b1225]/60 border border-slate-800/40 ${stat.border} rounded-2xl p-6 text-center space-y-3`}>
                <div className="flex justify-center">{stat.icon}</div>
                <span className="block text-2xl md:text-3xl font-black text-white tracking-tight">{stat.value}</span>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section id="comparison" className="py-24 border-t border-slate-800/30 bg-[#070b18]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-3">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Traditional Portals vs. Jansunwai AI</h2>
            <p className="mt-4 text-sm text-slate-400">See why our AI-powered approach delivers faster, more accountable results.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800/40 bg-[#0b1225]/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-5">Capability</th>
                  <th className="p-5">Traditional Portal</th>
                  <th className="p-5 text-blue-400 bg-blue-600/5">Jansunwai AI</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/30">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-800/10 transition-colors">
                    <td className="p-5 font-bold text-slate-300">{row.attr}</td>
                    <td className="p-5 text-slate-500">
                      <div className="flex items-center space-x-2">
                        <X className="w-4 h-4 text-red-500/70 shrink-0" />
                        <span>{row.old}</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-200 bg-blue-600/3 font-semibold">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{row.new}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 border-t border-slate-800/30 bg-[#060a16]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3">Trusted by Thousands</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What People Are Saying</h2>
            <p className="mt-4 text-sm text-slate-400">Hear from citizens, MPs, and government officers who use the platform daily.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-[#0b1225]/60 border border-slate-800/40 rounded-2xl p-7 flex flex-col justify-between"
              >
                <div>
                  <Quote className="w-6 h-6 text-blue-500/30 mb-4" />
                  <p className="text-xs text-slate-300 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="flex items-center space-x-3 mt-6 pt-5 border-t border-slate-800/30">
                  <div className="w-10 h-10 rounded-full bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-400">
                    {t.avatar}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{t.name}</span>
                    <span className="text-[10px] text-slate-500">{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 border-t border-slate-800/30 bg-[#070b18]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3">Support</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="mt-4 text-sm text-slate-400">Find answers about the platform, AI processing, and your data security.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`bg-[#0b1225]/60 border rounded-xl overflow-hidden transition-all duration-200 ${
                  activeFaq === index ? 'border-blue-500/20' : 'border-slate-800/40'
                }`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                >
                  <span className="font-bold text-white flex items-center space-x-3 text-xs sm:text-sm">
                    <HelpCircle className={`w-4 h-4 shrink-0 transition-colors ${activeFaq === index ? 'text-blue-400' : 'text-slate-600'}`} />
                    <span>{faq.q}</span>
                  </span>
                  {activeFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-xs text-slate-400 leading-relaxed pl-[42px]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      {/* ─── CTA BANNER ─── */}
      <section className="py-24 relative overflow-hidden bg-linear-to-r from-[#0d1b3e] via-[#16143c] to-[#2c0e3e] border-t border-slate-800/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Join the Governance Revolution</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to Transform <br />
            <span className="text-emerald-400">Citizen Grievance Resolution?</span>
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
            Experience AI-powered governance that actually works. File complaints in Hindi,
            get updates automatically, and see real resolution — not just promises.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/auth/citizen"
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#070b18] font-bold text-xs px-8 py-3.5 rounded-xl text-center shadow-lg shadow-black/20 transition-all flex items-center justify-center space-x-2 border border-transparent"
            >
              <span>File a Complaint Now</span>
              <ArrowRight className="w-4 h-4 text-[#070b18]" />
            </Link>
            <Link
              href="/auth/citizen"
              className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-slate-700 text-white font-bold text-xs px-8 py-3.5 rounded-xl text-center transition-all"
            >
              View Analytics
            </Link>
          </div>

          {/* Bullet indicators */}
          <div className="flex items-center justify-center space-x-6 pt-4 text-[10px] text-slate-400 font-semibold">
            <span className="flex items-center space-x-1.5">
              <span className="text-emerald-400 font-bold text-xs">✓</span>
              <span>Free for Citizens</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="text-emerald-400 font-bold text-xs">✓</span>
              <span>24/7 AI Active</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="text-emerald-400 font-bold text-xs">✓</span>
              <span>Multilingual</span>
            </span>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="mt-auto border-t border-slate-900 bg-[#03050c] py-16 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 pb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-lg text-white block leading-tight">Jansunwai</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">AI GOVERNANCE</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                AI-Powered Smart Governance for faster citizen complaint resolution in Uttar Pradesh.
              </p>
            </div>

            {/* Platform Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/auth/citizen" className="hover:text-white transition-colors">Citizen Portal</Link>
                </li>
                <li>
                  <Link href="/auth/mp" className="hover:text-white transition-colors">MP Portal</Link>
                </li>
                <li>
                  <Link href="/department/login" className="hover:text-white transition-colors">Department Portal</Link>
                </li>
                <li>
                  <Link href="/auth/admin" className="hover:text-white transition-colors">Admin Portal</Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/60 flex items-center justify-center text-blue-400 shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-300">1076 (CM Helpline)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/60 flex items-center justify-center text-blue-400 shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-300">1800-180-5531 (Nagar Nigam)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/60 flex items-center justify-center text-blue-400 shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <a href="mailto:support@jansunwai.gov.in" className="text-slate-300 hover:text-white transition-colors">support@jansunwai.gov.in</a>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/60 flex items-center justify-center text-blue-400 shrink-0">
                    <Code className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">Developers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Credits */}
          <div className="pt-8 border-t border-slate-800/20 flex flex-col md:flex-row items-center justify-center">
            <p className="text-[10px] text-slate-500 text-center">
              © 2026 Jansunwai AI — Government of Uttar Pradesh. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
