'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Wrench, LayoutDashboard, LogOut, Bell, User, 
  RefreshCw, ClipboardCheck, ArrowLeftRight, ChevronRight, AlertCircle
} from 'lucide-react';

interface DeptSession {
  id: string;
  name: string;
  email: string;
  officer: string;
  category: string;
  role: string;
}

export default function DepartmentLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<DeptSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/department/login') {
      setLoading(false);
      return;
    }
    const raw = localStorage.getItem('dept-session');
    if (!raw) {
      router.replace('/department/login');
    } else {
      try {
        setSession(JSON.parse(raw) as DeptSession);
      } catch {
        router.replace('/department/login');
      }
      setLoading(false);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('dept-session');
    router.push('/department/login');
  };

  if (pathname === '/department/login') {
    return <>{children}</>;
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[#070d1e] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Establishing Department Session...</p>
        </div>
      </div>
    );
  }

  const getDeptColor = (deptId: string) => {
    switch (deptId) {
      case 'pwd': return 'from-amber-600 to-yellow-600 text-amber-400';
      case 'water': return 'from-sky-600 to-blue-600 text-sky-400';
      case 'health': return 'from-rose-600 to-pink-600 text-rose-400';
      case 'education': return 'from-emerald-600 to-teal-600 text-emerald-400';
      case 'electricity': return 'from-violet-600 to-purple-600 text-violet-400';
      default: return 'from-blue-600 to-indigo-600 text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[100px]" />
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-[280px] bg-slate-900/40 backdrop-blur-2xl flex flex-col md:h-screen sticky top-0 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
        {/* Title / Logo block */}
        <div className="px-7 py-6 flex items-center space-x-3 bg-linear-to-b from-slate-900/50 to-transparent">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Wrench className="w-5 h-5 text-white relative z-10" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-white">Jansunwai AI</h1>
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mt-0.5">Execution Portal</span>
          </div>
        </div>


        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2">
          <Link
            href="/department"
            className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all relative overflow-hidden group ${
              pathname === '/department' 
                ? 'bg-linear-to-r from-blue-600/20 to-indigo-600/20 text-blue-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {pathname === '/department' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            )}
            <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
            <span className="flex-1">Task Dashboard</span>
            {pathname === '/department' && <ChevronRight className="w-4 h-4 opacity-70" />}
          </Link>

          <Link
            href="/department/complaints"
            className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all relative overflow-hidden group ${
              pathname === '/department/complaints' 
                ? 'bg-linear-to-r from-blue-600/20 to-indigo-600/20 text-blue-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {pathname === '/department/complaints' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            )}
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span className="flex-1">Citizen Problem</span>
            {pathname === '/department/complaints' && <ChevronRight className="w-4 h-4 opacity-70" />}
          </Link>
        </nav>

        {/* Logout Footer */}
        <div className="px-5 py-6 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-xs font-black text-rose-400 hover:text-white hover:bg-rose-500/20 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] transition-all w-full"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen overflow-y-auto relative z-10">
        {/* Floating Header */}
        <header className="sticky top-0 z-20 bg-slate-950/60 backdrop-blur-xl h-16 shrink-0 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Office of</span>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/50 shadow-inner">
              <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                {session.name.replace('Office', '').trim()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Notification system alert */}
            <div className="relative cursor-pointer hover:text-white text-slate-400 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse" />
            </div>

            <div className="flex items-center space-x-3 pl-6 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 bg-slate-800" />
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-blue-900/30">
                {session.officer[0]}
              </div>
              <span className="text-xs font-black text-slate-300 hidden sm:inline tracking-wide">{session.officer.split(' (')[0]}</span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
