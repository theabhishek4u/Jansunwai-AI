'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Wrench,
  Shield,
  FileText,
  Brain,
  Sun,
  ChevronDown,
  Phone,
  Mail,
  Code,
  X,
  Menu
} from 'lucide-react';

import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { DemoWorkflow } from '@/components/landing/DemoWorkflow';
import { Statistics } from '@/components/landing/Statistics';
import { Testimonials } from '@/components/landing/Testimonials';
import { AIPlayground } from '@/components/landing/AIPlayground';
import { DemoTour } from '@/components/landing/DemoTour';
import { CTA } from '@/components/landing/CTA';
import { ManualVsAI } from '@/components/landing/ManualVsAI';
import { SecurityBadges } from '@/components/landing/SecurityBadges';

export default function LandingPage() {
  const { user } = useAuth();
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'help' | null>(null);

  const loginPortals = [
    { href: '/auth/citizen', icon: <User className="w-4 h-4" />, label: 'Citizen Login', desc: 'Submit grievances & track progress', color: 'text-gov-blue', bg: 'bg-gov-blue/10 border-gov-blue/15' },
    { href: '/auth/mp', icon: <Building2 className="w-4 h-4" />, label: 'MP Login', desc: 'Constituency dashboard', color: 'text-ai-purple', bg: 'bg-ai-purple/10 border-ai-purple/15' },
    { href: '/department/login', icon: <Wrench className="w-4 h-4" />, label: 'Department Login', desc: 'Task execution & evidence upload', color: 'text-trust-green', bg: 'bg-trust-green/10 border-trust-green/15' },
    { href: '/auth/admin', icon: <Shield className="w-4 h-4" />, label: 'Admin Login', desc: 'Platform management', color: 'text-warning-amber', bg: 'bg-warning-amber/10 border-warning-amber/15' }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-primary/30 selection:text-white">
      {/* ─── NAVIGATION ─── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-gov-blue to-ai-purple flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-lg sm:text-xl tracking-tight text-foreground uppercase block leading-none">JANSUNWAI AI</span>
              <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-1">AI SMART GOVERNANCE</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/auth/citizen"
              className="px-6 py-2.5 rounded-full bg-linear-to-r from-gov-blue to-gov-blue-light hover:brightness-110 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center space-x-2 shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>FILE COMPLAINT</span>
            </Link>
            
            {user ? (
               <Link
                 href={user.role === 'admin' ? '/admin' : user.role === 'mp' ? '/mp' : '/dashboard'}
                 className="px-6 py-2.5 rounded-full border border-border hover:bg-muted/50 text-foreground text-xs font-bold transition-all flex items-center space-x-2 shrink-0"
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
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-gov-blue to-ai-purple" />
                      <div className="space-y-1 mt-1">
                        {loginPortals.map(portal => (
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

          {/* Mobile Menu Toggle (3-dots) */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 -mr-2 text-foreground hover:bg-muted/50 rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
            >
              <div className="px-4 py-6 flex flex-col space-y-6">
                <Link
                  href="/auth/citizen"
                  className="w-full py-3.5 rounded-2xl bg-linear-to-r from-gov-blue to-gov-blue-light text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center space-x-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="w-4 h-4" />
                  <span>FILE A COMPLAINT</span>
                </Link>

                {user ? (
                  <Link
                    href={user.role === 'admin' ? '/admin' : user.role === 'mp' ? '/mp' : '/dashboard'}
                    className="w-full py-3.5 rounded-2xl border border-border bg-muted/20 text-foreground text-sm font-bold transition-all flex items-center justify-center space-x-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>MY DASHBOARD</span>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Login Portals</p>
                    <div className="grid grid-cols-1 gap-2">
                      {loginPortals.map(portal => (
                        <Link
                          key={portal.href}
                          href={portal.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-4 p-3 rounded-xl hover:bg-muted/40 transition-all border border-transparent hover:border-border/50"
                        >
                          <div className={`w-10 h-10 rounded-xl ${portal.bg} border flex items-center justify-center ${portal.color} shrink-0`}>
                            {portal.icon}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground block">{portal.label}</span>
                            <span className="text-[10px] text-muted-foreground block">{portal.desc}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 w-full flex flex-col overflow-x-hidden">
        <Hero />
        <Features />
        <ManualVsAI />
        <DemoWorkflow />
        <AIPlayground />
        <Suspense fallback={<div>Loading Demo...</div>}>
          <DemoTour />
        </Suspense>
        <Statistics />
        <Testimonials />
        <SecurityBadges />
        <CTA />
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-card border-t border-border/40 py-16 relative overflow-hidden mt-auto">
        {/* Vignette blue glow effect */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-gov-blue/15 blur-[100px] pointer-events-none z-0" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 pb-12">
            {/* Branding Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gov-blue/10 border border-gov-blue/20 flex items-center justify-center text-gov-blue">
                  <Brain className="w-5 h-5" />
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
              <ul className="space-y-2.5 text-xs text-muted-foreground">
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
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li>
                  <button onClick={() => setActiveModal('privacy')} className="hover:text-foreground transition-colors text-left">Privacy Policy</button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('terms')} className="hover:text-foreground transition-colors text-left">Terms of Service</button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('help')} className="hover:text-foreground transition-colors text-left">Help Center</button>
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

      {/* ─── MODAL OVERLAYS ─── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-card border border-border/80 rounded-2xl w-full max-w-xl max-h-[80vh] overflow-y-auto p-6 md:p-8 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                <h3 className="text-lg font-bold text-foreground">
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms of Service'}
                  {activeModal === 'help' && 'Help Center'}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="text-xs text-muted-foreground leading-relaxed space-y-4 overflow-y-auto flex-1 pr-1 font-sans">
                {activeModal === 'privacy' && (
                  <>
                    <p className="font-semibold text-foreground text-sm">1. Data Collection & Privacy Safeguards</p>
                    <p>At Jansunwai AI, we prioritize citizen data protection. We collect GPS coordinates, voice recordings, and text descriptions solely for automated grievance routing. All data is encrypted in transit and at rest using AES-256 protocols.</p>
                    <p className="font-semibold text-foreground text-sm">2. NLP Translation & AI Analysis</p>
                    <p>Citizen voice inputs (in Hindi, Hinglish, etc.) are transcribed and summarized using our localized LLM. The processed text is routed only to authorized government execution portals and public representatives.</p>
                    <p className="font-semibold text-foreground text-sm">3. Third-Party Sharing</p>
                    <p>No citizen data is shared with commercial entities. Information is only dispatched to authenticated department officers (PWD, Jal Nigam, etc.) and district magistrates for administrative execution.</p>
                  </>
                )}
                {activeModal === 'terms' && (
                  <>
                    <p className="font-semibold text-foreground text-sm">1. Acceptable Use Policy</p>
                    <p>Citizens must submit honest, real-time civic issues. Filing fraudulent complaints, spamming the AI routing engine, or uploading unrelated media is strictly prohibited and can result in account suspension.</p>
                    <p className="font-semibold text-foreground text-sm">2. Automated Triage & SLA Timelines</p>
                    <p>By filing a grievance, you acknowledge that classification, priority tagging, and nodal allocation are performed automatically by the AI system. Actual resolution is carried out by municipal/district departments under strict SLA timelines.</p>
                    <p className="font-semibold text-foreground text-sm">3. Representative Supervision</p>
                    <p>Complaints marked critical are forwarded to the local MP/MLA dashboard. Representatives have visual review rights to allocate local budget funds for high-impact infrastructure grievances.</p>
                  </>
                )}
                {activeModal === 'help' && (
                  <>
                    <p className="font-semibold text-foreground text-sm">How do I report a grievance?</p>
                    <p>Simply click on "File a Complaint" from your dashboard, record a 15-second Hindi/English voice note or upload a photo of the issue. The AI will auto-detect your location and route the complaint instantly.</p>
                    <p className="font-semibold text-foreground text-sm">How does the SLA escalation work?</p>
                    <p>Each category has a predetermined resolution time (e.g., 24 hours for water leaks, 72 hours for school construction). If a department officer breaches this timeframe, the AI automatically escalates the ticket to the Chief Engineer or District Magistrate.</p>
                    <p className="font-semibold text-foreground text-sm">Can I track my status in real-time?</p>
                    <p>Yes. The platform displays an Amazon-style status pipeline. You will also receive real-time SMS and WhatsApp notifications once work starts and when evidence photos are submitted.</p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
