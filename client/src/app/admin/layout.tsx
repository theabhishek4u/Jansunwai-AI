'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  Vote,
  LayoutDashboard,
  Shield,
  Bot,
  Database,
  Grid,
  FileText,
  Bell,
  History,
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
  Sparkles,
  Users,
  UserCheck,
  X,
  Building2
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    'Critical suggestion spikes detected in Harahua block.',
    'System backup completed successfully.',
    'Gemini API request rate limit warning: 82% threshold reached.',
    'Audit: MP Dr. Vikram Singh profile updated.'
  ];

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/admin');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-500 to-indigo-600 animate-spin flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase">System Operations Admin...</p>
        </div>
      </div>
    );
  }

  const sidebarLinks: Array<{ href: string; label: string; icon: React.ReactNode; badge?: string; exact?: boolean }> = [
    { href: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { href: '/admin/complaints', label: 'Complaints', icon: <FileText className="w-5 h-5" /> },
    { href: '/admin/departments', label: 'Departments', icon: <Building2 className="w-5 h-5" />, badge: 'PORTALS' },
    { href: '/admin/mps', label: 'MP Directory', icon: <UserCheck className="w-5 h-5" /> },
    { href: '/admin/citizens', label: 'Citizen Verification', icon: <Users className="w-5 h-5" />, badge: 'VERIFY' },
    { href: '/admin/datasets', label: 'Public Datasets', icon: <Database className="w-5 h-5" /> },
    { href: '/admin/ai-config', label: 'AI Configuration', icon: <Bot className="w-5 h-5" />, badge: 'CONFIG' },
    { href: '/admin/categories', label: 'Categories', icon: <Grid className="w-5 h-5" /> },
    { href: '/admin/broadcast', label: 'Broadcast Messages', icon: <Bell className="w-5 h-5" /> },
    { href: '/admin/audit', label: 'Audit Logs', icon: <History className="w-5 h-5" /> },
    { href: '/admin/settings', label: 'System Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const isActive = (link: typeof sidebarLinks[0]) => {
    if (link.exact) return pathname === link.href;
    return pathname.startsWith(link.href);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#070d1e] border-r border-cyan-500/10 shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-slate-800/60">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-indigo-400">Jansunwai AI</span>
              <p className="text-[9px] text-cyan-400/80 uppercase tracking-widest font-black">Super Admin</p>
            </div>
          </Link>
        </div>



        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                ${isActive(link)
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
            >
              <span className={isActive(link) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}>{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {link.badge && (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-linear-to-r from-cyan-500 to-indigo-500 text-white">
                  {link.badge}
                </span>
              )}
              {isActive(link) && <ChevronRight className="w-3 h-3 text-cyan-500/50" />}
            </Link>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="px-4 py-4 border-t border-slate-800/60 mt-auto">
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#070d1e]/80 backdrop-blur-xl border-b border-cyan-500/10">
          <div className="flex items-center justify-between px-4 md:px-8 h-14">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Shield className="w-5 h-5 text-cyan-400" />
            </button>

            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500">
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
                >
                  <Bell className="w-4.5 h-4.5" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cyan-500 rounded-full text-[8px] text-slate-950 flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-82 rounded-xl bg-[#0b1329] border border-cyan-500/20 shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-850 flex justify-between items-center bg-[#070d1e]">
                      <p className="text-xs font-bold text-cyan-400">Operations Feed</p>
                    </div>
                    {notifications.map((n, i) => (
                      <div key={i} className="px-4 py-3 border-b border-slate-900/30 hover:bg-slate-800/25 transition-colors">
                        <p className="text-xs text-slate-300 leading-relaxed">{n}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/85" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#070d1e] border-r border-cyan-500/15 flex flex-col animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-cyan-400">Super Admin</span>
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
                    ${isActive(link) ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
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
