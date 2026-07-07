'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Key, Users, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DEPARTMENTS = [
  { id: 'pwd', name: 'Public Works Department (PWD)', email: 'pwd@jansunwai.gov.in', officer: 'Rakesh Kumar (Executive Engineer)', category: 'Road' },
  { id: 'water', name: 'District Water & Sanitation Board', email: 'water@jansunwai.gov.in', officer: 'Sanjay Mishra (Superintending Engineer)', category: 'Drainage' },
  { id: 'health', name: 'Health Department (CMO Office)', email: 'health@jansunwai.gov.in', officer: 'Dr. Alok Srivastava (Chief Medical Officer)', category: 'PHC' },
  { id: 'education', name: 'Education Department (BSA Office)', email: 'education@jansunwai.gov.in', officer: 'Sunita Rawat (Basic Shiksha Adhikari)', category: 'School' },
  { id: 'electricity', name: 'UP Power Corporation Ltd (UPPCL)', email: 'uppcl@jansunwai.gov.in', officer: 'V. K. Singh (Executive Engineer - Distribution)', category: 'Street Lights' },
  { id: 'municipal', name: 'Lucknow Nagar Nigam', email: 'nagarnigam@jansunwai.gov.in', officer: 'Indrajeet Singh (Municipal Commissioner)', category: 'Municipal' }
];

export default function DepartmentLoginPage() {
  const [departments, setDepartments] = useState<any[]>(DEPARTMENTS);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Clear previous session on load
  useEffect(() => {
    localStorage.removeItem('dept-session');
    
    // Fetch dynamic departments list from API
    fetch(`${API}/api/admin/departments`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('API failed');
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDepartments(data);
        }
      })
      .catch(err => console.log('Using static default departments fallback:', err));
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check credentials or demo selection
    let matchedDept = departments.find(d => d.email.toLowerCase() === email.toLowerCase());
    
    // If they used the quick select dropdown
    if (selectedDeptId) {
      matchedDept = departments.find(d => d.id === selectedDeptId);
    }

    if (matchedDept) {
      // Successful mock login
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
        setError('Invalid department credentials. Use Quick Demo Access for instant access.');
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
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/10 border border-blue-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-white uppercase">
          Jansunwai AI
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Department Execution & Task Monitoring Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#0b1329]/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Quick Demo Selector */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5 flex items-center justify-between">
                <span>Quick Demo Access</span>
                <span className="text-blue-400 text-[8px] font-black uppercase bg-blue-500/10 px-1.5 py-0.5 rounded">Fast Track</span>
              </label>
              <select
                value={selectedDeptId}
                onChange={e => selectQuickDept(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Select Government Department...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-slate-850"></div>
              <span className="shrink mx-4 text-[9px] text-slate-550 font-black uppercase tracking-wider">or employee login</span>
              <div className="grow border-t border-slate-850"></div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-550 tracking-wider block mb-1.5">Government Email / ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setSelectedDeptId(''); }}
                  placeholder="name@dept.gov.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-550 tracking-wider block mb-1.5">Secure Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setSelectedDeptId(''); }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Remember me & Forgot */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded border-slate-850 bg-slate-900 text-blue-500 focus:ring-0" />
                <span>Remember session</span>
              </label>
              <a href="#" className="hover:text-blue-400 transition-colors">Forgot passcode?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Establish Secure Connection'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Secure lock notice */}
          <div className="mt-6 border-t border-slate-850 pt-4 text-center">
            <p className="text-[9px] text-slate-550 flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>TLS 1.3 Encrypted Session • Gov-Cloud Certified</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
