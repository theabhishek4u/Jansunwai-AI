'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard,
  Bot,
  ListTodo,
  Map,
  Trophy,
  Wallet,
  FlaskConical,
  FileText,
  BarChart3,
  Users2,
  LogOut,
  Bell,
  Menu,
  X,
  Shield,
  ChevronRight
} from 'lucide-react';

export default function MpLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = [
    '3 new critical Complaints awaiting review.',
    'AI detected infrastructure gap in Harahua block.',
    'Budget utilization report for June ready.',
    'Constituency health score updated to 72.'
  ];

  useEffect(() => {
    if (!loading && (!user || user.role !== 'mp')) {
      router.push('/auth/mp');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500 to-amber-700 animate-pulse flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <p className="text-slate-400 text-sm font-semibold tracking-wide">Initializing MP Dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { href: '/mp', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { href: '/mp/copilot', label: 'AI Copilot', icon: <Bot className="w-5 h-5" />, badge: 'AI' },
    { href: '/mp/complaints', label: 'Complaints', icon: <ListTodo className="w-5 h-5" /> },
    { href: '/mp/map', label: 'Constituency Map', icon: <Map className="w-5 h-5" /> },
    { href: '/mp/priority', label: 'Priority Engine', icon: <Trophy className="w-5 h-5" /> },
    { href: '/mp/budget', label: 'Budget Planner', icon: <Wallet className="w-5 h-5" /> },
    { href: '/mp/simulator', label: 'Dev Simulator', icon: <FlaskConical className="w-5 h-5" /> },
    { href: '/mp/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { href: '/mp/demographics', label: 'Demographics', icon: <Users2 className="w-5 h-5" /> },
    { href: '/mp/reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
  ];

  const isActive = (link: typeof sidebarLinks[0]) => {
    if (link.exact) return pathname === link.href;
    return pathname.startsWith(link.href);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col md:flex-row" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#080b18] border-r border-[#1e293b]/30 shrink-0 sticky top-0 h-screen overflow-y-auto shadow-xl">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-slate-800/50">
          <Link href="/mp" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-amber-200">Jansunwai AI</span>
              <p className="text-[9px] text-amber-500/60 uppercase tracking-widest font-bold">MP Dashboard</p>
            </div>
          </Link>
        </div>



        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 hover:translate-x-1 border-l-2
                ${isActive(link)
                  ? 'bg-linear-to-r from-amber-500/10 to-transparent text-amber-200 border-amber-500 shadow-lg shadow-amber-500/5'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                }`}
            >
              <span className={isActive(link) ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}>{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {(link as { badge?: string }).badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-linear-to-r from-violet-500 to-fuchsia-500 text-white">
                  {(link as { badge?: string }).badge}
                </span>
              )}
              {isActive(link) && <ChevronRight className="w-3 h-3 text-amber-500/50" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-800/50 space-y-2">
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#080b18]/80 backdrop-blur-xl border-b border-[#1e293b]/25 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-8 h-14">
            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Page title removed */}
            <div className="hidden md:block" />

            {/* Right actions */}
            <div className="flex items-center space-x-3">

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Bell className="w-4.5 h-4.5" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#141a2e] border border-slate-700/50 shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-700/50">
                      <p className="text-xs font-semibold text-slate-200">Notifications</p>
                    </div>
                    {notifications.map((n, i) => (
                      <div key={i} className="px-4 py-3 border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                        <p className="text-xs text-slate-300">{n}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xs font-bold">
                {user.full_name?.charAt(0) || 'M'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#0d1220] border-r border-amber-900/10 flex flex-col animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-amber-400">MP Dashboard</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                    ${isActive(link) ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
