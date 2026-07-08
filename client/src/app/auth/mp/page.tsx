'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Award, ArrowLeft, Mail, Lock, AlertCircle, ShieldCheck, Map, BarChart4 } from 'lucide-react';
import { motion } from 'framer-motion';

function MPAuthForm() {
  const router = useRouter();
  const { login, user } = useAuth();
  
  const [email, setEmail] = useState('mp@jansunwai.gov.in');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'mp') {
        router.push('/mp');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }
    
    try {
      await login(email, password);
      router.push('/mp');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check credentials or role.';
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden font-sans flex items-center justify-center p-4 sm:p-8">
      {/* Animated Background - Indigo/Purple */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e508_1px,transparent_1px),linear-gradient(to_bottom,#4f46e508_1px,transparent_1px)] bg-size-[4rem_4rem]" />
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/30 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/30 blur-[120px] rounded-full" 
        />
      </div>

      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Branding Panel (Desktop) */}
        <div className="hidden lg:flex flex-col justify-center pr-12">
          <Link href="/" className="inline-flex items-center text-xs font-semibold text-indigo-500/80 hover:text-indigo-400 transition-colors group mb-12 w-fit bg-indigo-950/30 px-3 py-1.5 rounded-full border border-indigo-900/50 backdrop-blur-md">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            <span>Return to Public Portal</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
              <Award className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Jansunwai AI <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                MP Decision Portal
              </span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-md">
              High-level constituency intelligence and public sentiment analytics for Members of Parliament and Nodal Officers.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                  <BarChart4 className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="font-medium">Real-time AI dashboards and grievance forecasting</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                  <Map className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="font-medium">Jurisdiction heatmaps and priority targeting</span>
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
            <Link href="/" className="inline-flex items-center text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors group bg-indigo-950/30 px-3 py-1.5 rounded-full border border-indigo-900/50">
              <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Landing Page</span>
            </Link>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 mb-4 lg:hidden">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight lg:text-3xl">MP Login</h2>
              <p className="text-xs text-indigo-400 mt-2 font-bold uppercase tracking-widest">Nodal Officer Access</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-red-200 text-xs shadow-inner">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-6 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/30">
              <p className="text-[10px] text-indigo-400 uppercase font-black text-center tracking-widest mb-2">MP Quick Access</p>
              <button
                type="button"
                onClick={() => {
                  setEmail('mp@jansunwai.gov.in');
                  setPassword('password');
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-400/50 text-xs font-semibold text-indigo-300 transition-all text-center focus:outline-none"
              >
                MP Demo: Dr. Vikram Singh
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Govt Email Address</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mp@jansunwai.gov.in"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security Password</label>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none active:scale-[0.98]"
              >
                {loading ? (
                  <span>Authorizing...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Log In</span>
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-slate-500 flex items-center justify-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Secured for Authorized Parliamentarians
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function MPAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 animate-spin flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-semibold">Loading MP Intelligence...</p>
        </div>
      </div>
    }>
      <MPAuthForm />
    </Suspense>
  );
}
