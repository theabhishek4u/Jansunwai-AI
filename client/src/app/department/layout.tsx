'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, LayoutDashboard, LogOut, Bell, User, 
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

  const getDeptBorderColor = (deptId: string) => {
    switch (deptId) {
      case 'pwd': return 'border-l-amber-500';
      case 'water': return 'border-l-sky-500';
      case 'health': return 'border-l-rose-500';
      case 'education': return 'border-l-emerald-500';
      case 'electricity': return 'border-l-violet-500';
      default: return 'border-l-blue-500';
    }
  };

  const getDeptColor = (deptId: string) => {
    switch (deptId) {
      case 'pwd': return 'from-amber-600 to-yellow-600 text-amber-400 border-amber-500/20';
      case 'water': return 'from-sky-600 to-blue-600 text-sky-400 border-sky-500/20';
      case 'health': return 'from-rose-600 to-pink-600 text-rose-400 border-rose-500/20';
      case 'education': return 'from-emerald-600 to-teal-600 text-emerald-400 border-emerald-500/20';
      case 'electricity': return 'from-violet-600 to-purple-600 text-violet-400 border-violet-500/20';
      default: return 'from-blue-600 to-indigo-600 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0b1329]/95 border-b md:border-b-0 md:border-r border-slate-850 flex flex-col md:h-screen sticky top-0 z-30">
        {/* Title / Logo block */}
        <div className="px-6 py-5 border-b border-slate-850 flex items-center space-x-3 bg-linear-to-b from-slate-900/30 to-transparent">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-blue-450/30 shadow-lg shadow-indigo-600/20 relative overflow-hidden">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-widest text-white">Jansunwai AI</h1>
            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest block mt-0.5">Execution Portal</span>
          </div>
        </div>

        {/* Officer/Dept details widget */}
        <div className={`p-4 mx-3 my-4 bg-slate-900/40 backdrop-blur-md border-l-2 ${getDeptBorderColor(session.id)} border border-slate-850 rounded-r-2xl space-y-2.5 shadow-md shadow-blue-950/20`}>
          <div className="flex items-start space-x-2">
            <div className={`w-2 h-2 rounded-full mt-1 shrink-0 bg-linear-to-r ${getDeptColor(session.id).split(' text-')[0]}`} />
            <span className="text-[9px] font-black text-slate-200 uppercase tracking-wider block leading-tight">
              {session.name}
            </span>
          </div>
          <div className="border-t border-slate-850 pt-2">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest block font-bold">Logged In Officer</span>
            <span className="text-[10px] text-slate-300 font-extrabold block leading-tight mt-0.5">{session.officer}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1">
          <Link
            href="/department"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
              pathname === '/department' 
                ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 border-blue-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="flex-1">Task Dashboard</span>
            {pathname === '/department' && <ChevronRight className="w-3.5 h-3.5" />}
          </Link>

          <Link
            href="/department/complaints"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
              pathname === '/department/complaints' 
                ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 border-blue-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">Citizen Grievances</span>
            {pathname === '/department/complaints' && <ChevronRight className="w-3.5 h-3.5" />}
          </Link>


        </nav>

        {/* Logout Footer */}
        <div className="px-4 py-4 border-t border-slate-850 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen overflow-y-auto">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-[#070d1e]/85 backdrop-blur-xl border-b border-slate-850/60 h-14 shrink-0 flex items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Office of</span>
            <span className="text-xs font-black text-blue-400 uppercase tracking-wider bg-blue-500/5 border border-blue-500/10 px-2 py-1 rounded-lg">
              {session.name.replace('Office', '').trim()}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification system alert */}
            <div className="relative cursor-pointer hover:text-white text-slate-400 transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>

            <div className="flex items-center space-x-2 border-l border-slate-850 pl-4">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-650 to-indigo-700 flex items-center justify-center font-bold text-white text-xs">
                {session.officer[0]}
              </div>
              <span className="text-xs font-bold text-slate-350 hidden sm:inline">{session.officer.split(' (')[0]}</span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
