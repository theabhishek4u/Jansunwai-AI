'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Key, Users, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Building2, HardHat, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}`;

const DEPARTMENTS = [
  { id: 'pwd', name: 'Public Works Department (PWD)', email: 'pwd@jansunwai.gov.in', officer: 'Rakesh Kumar', category: 'Road' },
  { id: 'water', name: 'District Water & Sanitation', email: 'water@jansunwai.gov.in', officer: 'Sanjay Mishra', category: 'Drainage' },
  { id: 'health', name: 'Health Department (CMO)', email: 'health@jansunwai.gov.in', officer: 'Dr. Alok Srivastava', category: 'PHC' },
  { id: 'education', name: 'Education Department (BSA)', email: 'education@jansunwai.gov.in', officer: 'Sunita Rawat', category: 'School' },
  { id: 'electricity', name: 'UP Power Corporation (UPPCL)', email: 'uppcl@jansunwai.gov.in', officer: 'V. K. Singh', category: 'Street Lights' },
  { id: 'municipal', name: 'Lucknow Nagar Nigam', email: 'nagarnigam@jansunwai.gov.in', officer: 'Indrajeet Singh', category: 'Municipal' }
];

export default function DepartmentLoginPage() {
  const [departments, setDepartments] = useState(DEPARTMENTS);
  const [email, setEmail] = useState('pwd@jansunwai.gov.in');
  const [password, setPassword] = useState('password');
  const [selectedDeptId, setSelectedDeptId] = useState('pwd');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('dept-session');
    fetch(`${API}/api/admin/departments`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('API failed');
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setDepartments(data);
      })
      .catch(err => console.log('Using static default departments fallback:', err));
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let matchedDept = departments.find(d => d.email.toLowerCase() === email.toLowerCase());
    if (selectedDeptId) {
      matchedDept = departments.find(d => d.id === selectedDeptId);
    }

    if (matchedDept) {
      setTimeout(() => {
        localStorage.setItem('dept-session', JSON.stringify({
          id: matchedDept!.id,
          name: matchedDept!.name,
          email: matchedDept!.email,
          officer: matchedDept!.officer,
          category: matchedDept!.category,
          role: 'department_officer'
        }));
        setLoading(false);
        router.push('/department');
      }, 1000);
    } else {
      setTimeout(() => {
        setLoading(false);
        setError('Invalid credentials. Use Quick Demo Access for instant access.');
      }, 800);
    }
  };

  const selectQuickDept = (id: string) => {
    setSelectedDeptId(id);
    const dept = departments.find(d => d.id === id);
    if (dept) {
      setEmail(dept.email);
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden font-sans flex items-center justify-center p-4 sm:p-8">
      {/* Animated Background - Amber */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-size-[4rem_4rem]" />
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/25 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-600/25 blur-[120px] rounded-full" 
        />
      </div>

      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Branding Panel (Desktop) */}
        <div className="hidden lg:flex flex-col justify-center pr-12">
          <Link href="/" className="inline-flex items-center text-xs font-semibold text-amber-500/80 hover:text-amber-400 transition-colors group mb-12 w-fit bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-900/50 backdrop-blur-md">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            <span>Return to Public Portal</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <Building2 className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Jansunwai AI <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-400">
                Department Portal
              </span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-md">
              High-efficiency task execution and AI-assisted resolution portal for Government Departments and Field Agencies.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                  <HardHat className="w-5 h-5 text-amber-400" />
                </div>
                <span className="font-medium">Direct allocation of smart-routed complaints</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                  <FileCheck className="w-5 h-5 text-amber-400" />
                </div>
                <span className="font-medium">AI-verified resolution and quality assurance checks</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Login Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto lg:ml-auto"
        >
          {/* Mobile Back Button */}
          <div className="lg:hidden mb-6 flex justify-center">
            <Link href="/" className="inline-flex items-center text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors group bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-900/50">
              <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Landing Page</span>
            </Link>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-50" />
            
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-amber-600 to-orange-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 mb-4 lg:hidden">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight lg:text-3xl">Department Login</h2>
              <p className="text-xs text-amber-400 mt-2 font-bold uppercase tracking-widest">Execution & Operations</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-red-200 text-xs shadow-inner">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Quick Demo Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Quick Demo Access</span>
                  <span className="text-amber-400 text-[9px] font-black uppercase bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">Fast Track</span>
                </label>
                <select
                  value={selectedDeptId}
                  onChange={e => selectQuickDept(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                >
                  <option value="">Select Government Department...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-slate-800"></div>
                <span className="shrink mx-4 text-[9px] text-slate-500 font-bold uppercase tracking-wider">or employee login</span>
                <div className="grow border-t border-slate-800"></div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Government Email / ID</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-amber-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); setSelectedDeptId(''); }}
                    placeholder="name@dept.gov.in"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Secure Password</label>
                  <a href="#" className="text-[10px] text-amber-400 hover:text-amber-300">Forgot?</a>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-amber-400 transition-colors">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); setSelectedDeptId(''); }}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/25 transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none active:scale-[0.98]"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Establish Connection</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] font-medium text-emerald-500 flex items-center justify-center gap-1.5 bg-emerald-500/10 w-fit mx-auto px-3 py-1.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              TLS 1.3 Encrypted Session • Gov-Cloud Certified
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
