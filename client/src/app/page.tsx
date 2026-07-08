'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Wrench,
  Shield,
  FileText,
  Bot,
  Sun,
  ChevronDown,
  Phone,
  Mail,
  Code
} from 'lucide-react';

import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { DemoWorkflow } from '@/components/landing/DemoWorkflow';
import { Statistics } from '@/components/landing/Statistics';
import { Testimonials } from '@/components/landing/Testimonials';
import { AIPlayground } from '@/components/landing/AIPlayground';
import { DemoTour } from '@/components/landing/DemoTour';
import { CTA } from '@/components/landing/CTA';

export default function LandingPage() {
  const { user } = useAuth();
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-primary/30 selection:text-white">
      {/* ─── NAVIGATION ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/85 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gov-blue to-ai-purple flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-foreground uppercase">JANSUNWAI AI</span>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">AI SMART GOVERNANCE</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="w-10 h-10 rounded-full hover:bg-muted/60 flex items-center justify-center text-muted-foreground transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <Link
              href="/auth/citizen"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-gov-blue to-gov-blue-light hover:brightness-110 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>FILE COMPLAINT</span>
            </Link>
            
            {user ? (
               <Link
                 href={user.role === 'admin' ? '/admin' : user.role === 'mp' ? '/mp' : '/dashboard'}
                 className="px-6 py-2.5 rounded-full border border-border hover:bg-muted/50 text-foreground text-xs font-bold transition-all flex items-center space-x-2"
               >
                 <User className="w-4 h-4" />
                 <span>MY DASHBOARD</span>
               </Link>
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setPortalDropdownOpen(true)}
                onMouseLeave={() => setPortalDropdownOpen(false)}
              >
                <button className="flex items-center space-x-2 px-6 py-2.5 rounded-full border border-border hover:bg-muted/50 text-foreground text-xs font-bold transition-all cursor-pointer">
                  <Shield className="w-4 h-4" />
                  <span>LOGIN PORTALS</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${portalDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {portalDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-72 rounded-2xl bg-card border border-border/80 shadow-2xl shadow-black/40 p-2 backdrop-blur-xl z-50 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gov-blue to-ai-purple" />
                      <div className="space-y-1 mt-1">
                        {[
                          { href: '/auth/citizen', icon: <User className="w-4 h-4" />, label: 'Citizen Login', desc: 'Submit grievances & track progress', color: 'text-gov-blue', bg: 'bg-gov-blue/10 border-gov-blue/15' },
                          { href: '/auth/mp', icon: <Building2 className="w-4 h-4" />, label: 'MP Login', desc: 'Constituency dashboard', color: 'text-ai-purple', bg: 'bg-ai-purple/10 border-ai-purple/15' },
                          { href: '/department/login', icon: <Wrench className="w-4 h-4" />, label: 'Department Login', desc: 'Task execution & evidence upload', color: 'text-trust-green', bg: 'bg-trust-green/10 border-trust-green/15' },
                          { href: '/auth/admin', icon: <Shield className="w-4 h-4" />, label: 'Admin Login', desc: 'Platform management', color: 'text-warning-amber', bg: 'bg-warning-amber/10 border-warning-amber/15' }
                        ].map(portal => (
                          <Link
                            key={portal.href}
                            href={portal.href}
                            className="flex items-start space-x-3 p-3 rounded-xl hover:bg-muted/40 transition-all group"
                          >
                            <div className={`w-9 h-9 rounded-xl ${portal.bg} border flex items-center justify-center ${portal.color} group-hover:scale-105 transition-transform shrink-0`}>
                              {portal.icon}
                            </div>
                            <div className="text-left">
                              <span className={`text-[12px] font-bold text-foreground block group-hover:${portal.color} transition-colors`}>{portal.label}</span>
                              <span className="text-[10px] text-muted-foreground block mt-0.5">{portal.desc}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col overflow-x-hidden">
        <Hero />
        <Features />
        <DemoWorkflow />
        <AIPlayground />
        <DemoTour />
        <Statistics />
        <Testimonials />
        <CTA />
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="mt-auto border-t border-border bg-background py-16 text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 pb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gov-blue/10 border border-gov-blue/20 flex items-center justify-center text-gov-blue">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-lg text-foreground block leading-tight">Jansunwai</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">AI GOVERNANCE</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                AI-Powered Smart Governance for faster citizen complaint resolution in Uttar Pradesh.
              </p>
            </div>

            {/* Platform Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/auth/citizen" className="hover:text-foreground transition-colors">Citizen Login</Link>
                </li>
                <li>
                  <Link href="/auth/mp" className="hover:text-foreground transition-colors">MP Login</Link>
                </li>
                <li>
                  <Link href="/department/login" className="hover:text-foreground transition-colors">Department Login</Link>
                </li>
                <li>
                  <Link href="/auth/admin" className="hover:text-foreground transition-colors">Admin Login</Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">Help Center</Link>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border/60 flex items-center justify-center text-gov-blue shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-foreground/80">1076 (CM Helpline)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border/60 flex items-center justify-center text-gov-blue shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-foreground/80">1800-180-5531 (Nagar Nigam)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border/60 flex items-center justify-center text-gov-blue shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <a href="mailto:support@jansunwai.gov.in" className="text-foreground/80 hover:text-foreground transition-colors">support@jansunwai.gov.in</a>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border/60 flex items-center justify-center text-gov-blue shrink-0">
                    <Code className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-foreground/80 hover:text-foreground cursor-pointer transition-colors">Developers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Credits */}
          <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-center">
            <p className="text-[10px] text-muted-foreground text-center">
              © 2026 Jansunwai AI — Government of Uttar Pradesh. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
