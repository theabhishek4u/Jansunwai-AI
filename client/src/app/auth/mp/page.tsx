'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Award, ArrowLeft, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';

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
    
    const success = await login(email, 'mp');
    if (success) {
      router.push('/mp');
    } else {
      setError('Login failed. Please check credentials or role.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow specific to MP (Amber/Orange theme) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 blur-[150px] rounded-full -z-10" />

      <div className="max-w-md w-full mx-auto mb-6">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto bg-slate-900/60 border border-slate-900 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-md mb-4">
            <Award className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">Jansunwai AI</h2>
          <p className="text-xs text-amber-500 mt-1 font-semibold uppercase tracking-wider">MP Decision Intelligence Portal</p>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start space-x-3 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold text-center tracking-wider">MP Quick Access</p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setEmail('mp@jansunwai.gov.in');
                setPassword('password');
              }}
              className="w-full px-3 py-2.5 rounded-lg bg-amber-950/40 border border-amber-900/30 hover:border-amber-600 hover:bg-amber-900/10 text-[10px] font-semibold text-amber-300 transition-all text-center"
            >
              MP Demo: Dr. Vikram Singh (Varanasi PC)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Government Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mp@jansunwai.gov.in"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Security Password</label>
              <a href="#" className="text-xs text-amber-400 hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-55 text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-md shadow-amber-600/20 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Authorizing...</span>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Verify & Log In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <span>
            Authorized Personnel Only. Back to{' '}
            <Link href="/auth/citizen" className="text-amber-400 font-bold hover:underline">
              Citizen Portal
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MPAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 animate-spin flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-semibold">Loading MP Dashboard Portal...</p>
        </div>
      </div>
    }>
      <MPAuthForm />
    </Suspense>
  );
}
