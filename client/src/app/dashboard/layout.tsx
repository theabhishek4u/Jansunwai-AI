'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  Vote, 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  UserCircle, 
  LogOut, 
  Bell, 
  Award, 
  Menu, 
  X, 
  Sparkles,
  Trophy
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, refreshProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    'Your suggestion is currently under AI review.',
    'Varanasi road project completed successfully!'
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'mp') {
        router.push('/mp');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Periodically update user stats to refresh badges & points from server
    if (user) {
      refreshProfile();
    }
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-spin flex items-center justify-center">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-400 text-sm font-semibold">Verifying Session...</p>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/dashboard/submit', label: 'Submit Suggestion', icon: <PlusCircle className="w-5 h-5" /> },
    { href: '/dashboard/suggestions', label: 'Track Suggestions', icon: <ListTodo className="w-5 h-5" /> },
    { href: '/dashboard/profile', label: 'My Profile', icon: <UserCircle className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-900 p-6 shrink-0">
        {/* Brand */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Vote className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-md tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-indigo-400">Jansunwai AI</span>
            <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Citizen Portal</p>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-950/50 border border-slate-950 p-4 rounded-2xl mb-8 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0 border border-indigo-400">
            {user.full_name[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.full_name}</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px] text-slate-400 font-semibold">{user.contribution_score} Points</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <nav className="space-y-1.5 flex-1">
          {sidebarLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3.5 px-4 py-3 text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-900 bg-slate-900/40 px-6 flex items-center justify-between sticky top-0 backdrop-blur-md z-40">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page context / Welcome */}
          <div className="hidden sm:block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Constituency: <span className="text-slate-300 font-bold">{user.parliamentary_constituency}, {user.state}</span>
          </div>

          {/* Right items */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Gamification tag */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold">
              <Award className="w-4 h-4 text-orange-500" />
              <span className="text-slate-300">Level 1</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-4 z-50">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notifications</span>
                    <button 
                      onClick={() => setNotifications([])} 
                      className="text-[10px] text-indigo-400 font-semibold hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-4">No new notifications</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300 border-b border-slate-850 pb-2 last:border-0 last:pb-0">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <p>{notif}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Pages Output */}
        <main className="p-6 md:p-10 flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden flex justify-end">
          <div className="w-72 bg-slate-900 p-6 flex flex-col justify-between border-l border-slate-850 h-full">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Vote className="w-6 h-6 text-indigo-500" />
                  <span className="font-extrabold text-white text-lg">Jansunwai AI</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-950 p-4 rounded-2xl mb-8 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white uppercase border border-indigo-400 shrink-0">
                  {user.full_name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate">{user.full_name}</p>
                  <p className="text-xs text-slate-400">{user.contribution_score} Points</p>
                </div>
              </div>

              <nav className="space-y-1">
                {sidebarLinks.map(link => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3.5 px-4 py-3 text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
