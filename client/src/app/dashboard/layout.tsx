'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  Vote, 
  LayoutDashboard, 
  PlusCircle, 
  UserCircle, 
  LogOut, 
  Bell,
  Sparkles
} from 'lucide-react';

interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, refreshProfile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/citizen');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'mp') {
        router.push('/mp');
      } else {
        // Fetch real notifications for this citizen
        fetch(`/api/notifications?citizen_id=${user.id}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setNotifications(data);
          })
          .catch(console.error);
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
    { href: '/dashboard/submit', label: 'Submit Complaint', icon: <PlusCircle className="w-5 h-5" /> },
    { href: '/dashboard/profile', label: 'My Profile', icon: <UserCircle className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-900 p-6 shrink-0">
        {/* Brand */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Vote className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-md tracking-tight bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-indigo-400">Jansunwai AI</span>
            <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Citizen Portal</p>
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
          {/* Mobile Logo Brand */}
          <div className="flex items-center space-x-2 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Vote className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-indigo-400">Jansunwai AI</span>
          </div>

          <div className="hidden sm:block" />

          {/* Right items */}
          <div className="flex items-center space-x-4 ml-auto">

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
                        onClick={() => {
                          setNotifications([]);
                          notifications.forEach(n => fetch(`/api/notifications/${n.id}/read`, { method: 'POST' }).catch(console.error));
                        }} 
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
                          <div key={notif.id || idx} className="flex items-start space-x-2 text-xs text-slate-300 border-b border-slate-850 pb-2 last:border-0 last:pb-0">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-200">{notif.title}</span>
                              <p className="text-slate-400 mt-0.5">{notif.message}</p>
                            </div>
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
        <main className="p-6 md:p-10 flex-1 pb-24 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/60 z-50 flex items-center justify-around h-16 pb-safe">
        {sidebarLinks.map(link => {
          const isActive = pathname === link.href;
          const label = link.label === 'Submit Complaint' ? 'Submission' : link.label;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
                isActive 
                  ? 'text-indigo-400 font-bold scale-105' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-500/10' : ''}`}>
                {link.icon}
              </div>
              <span className="text-[9px] tracking-tight mt-0.5">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
