'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Award, ArrowLeft, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';

function MPAuthForm() {
  const router = useRouter();
  const { login, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Premium Amber/Gold Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(245,158,11,0.08),transparent_60%)] -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] -z-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-md w-full mx-auto mb-6">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl relative shadow-amber-500/5">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 mb-4 animate-pulse">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent">Jansunwai AI</h2>
          <p className="text-xs text-amber-500 mt-1.5 font-bold uppercase tracking-widest">MP Decision Intelligence Portal</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-red-200 text-xs shadow-inner">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <p className="text-[10px] text-slate-500 uppercase font-black text-center tracking-widest">MP Quick Access</p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setEmail('mp@jansunwai.gov.in');
                setPassword('password');
              }}
              className="w-full px-3 py-3 rounded-xl bg-amber-950/20 border border-amber-900/30 hover:border-amber-500/80 hover:bg-amber-900/10 text-xs font-semibold text-amber-300 transition-all text-center focus:outline-none"
            >
              MP Demo: Dr. Vikram Singh (Varanasi PC)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Government Email Address</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 transition-colors group-focus-within:text-amber-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mp@jansunwai.gov.in"
                className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Security Password</label>
              <a href="#" className="text-xs text-amber-400 hover:text-amber-300 hover:underline">Forgot password?</a>
            </div>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 transition-colors group-focus-within:text-amber-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-55 text-white py-3.5 px-4 rounded-2xl text-sm font-bold shadow-lg shadow-amber-600/25 transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none active:scale-[0.98]"
          >
            {loading ? (
              <span>Authorizing Portal...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Log In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-850 pt-5">
          <span>Authorized Parliamentarians Only</span>
        </div>
      </div>
    </div>
  );
}

export default function MPAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 animate-spin flex items-center justify-center">
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
