'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  Vote, 
  Sparkles, 
  MapPin, 
  CalendarRange, 
  ShieldAlert, 
  Mic, 
  ArrowRight, 
  Layers, 
  Languages, 
  TrendingUp, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  BarChart3 
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Live stats simulation/loading
  const [stats, setStats] = useState({
    citizens: 12450,
    suggestions: 4892,
    aiGenerated: 3950,
    activeMps: 45,
    completedProjects: 820
  });

  useEffect(() => {
    // Subtle count up effect on mount
    const timer = setInterval(() => {
      setStats(prev => ({
        citizens: prev.citizens + Math.floor(Math.random() * 2),
        suggestions: prev.suggestions + (Math.random() > 0.7 ? 1 : 0),
        aiGenerated: prev.aiGenerated + (Math.random() > 0.8 ? 1 : 0),
        activeMps: prev.activeMps,
        completedProjects: prev.completedProjects + (Math.random() > 0.95 ? 1 : 0)
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Mic className="w-6 h-6 text-emerald-400" />,
      title: "Voice Suggestions",
      desc: "Speak naturally in Hindi, Bhojpuri, Hinglish, Urdu, or English. Gemini converts voice directly into structured, formal proposals."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-violet-400" />,
      title: "AI Writing Assistant",
      desc: "Get real-time feedback while writing. The AI asks clarifying questions to double completeness scores and improve formatting."
    },
    {
      icon: <MapPin className="w-6 h-6 text-sky-400" />,
      title: "Smart Maps Integration",
      desc: "Pinpoint development issues instantly using GPS coordinates or manual location inputs to map demands precisely."
    },
    {
      icon: <CalendarRange className="w-6 h-6 text-amber-400" />,
      title: "Development Tracking",
      desc: "Transparently track suggestions as they progress from AI assessment and MP review to budgeting and construction."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-rose-400" />,
      title: "AI Report Generation",
      desc: "Synthesizes thousands of citizen voices into clean priority clusters and hotspot dashboards for MP planning committees."
    },
    {
      icon: <Languages className="w-6 h-6 text-indigo-400" />,
      title: "Multilingual Support",
      desc: "Fully accessible in native languages, ensuring rural communities, farmers, and students can raise suggestions comfortably."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Submit Suggestion",
      desc: "Citizen uploads image evidence, uses voice recorder, or inputs text describing local development needs (roads, water, colleges)."
    },
    {
      num: "02",
      title: "AI Analysis & Audit",
      desc: "Gemini checks for duplicate requests, analyzes image validity, computes completeness scores, and tags spatial coordinates."
    },
    {
      num: "03",
      title: "MP & Team Reviews",
      desc: "MP views clean constituency demand clusters rather than scattered complaints, seeing exact beneficiary volumes and urgencies."
    },
    {
      num: "04",
      title: "Development Planning",
      desc: "Proposals get accepted, budget is allocated under MP-LADS or central grants, and project milestones are updated on timelines."
    }
  ];

  const faqs = [
    {
      q: "How does Jansunwai AI work?",
      a: "Citizens submit suggestions for developmental projects (like schools, bridges, hospitals) in their constituency. The system uses Gemini AI to evaluate completeness, check for similar requests (duplicate detection), and map hotspots. MPs use this structured data to prioritize where funds should be spent first."
    },
    {
      q: "Is it free to use?",
      a: "Yes, Jansunwai AI is completely free for all citizens of India to raise developmental suggestions for their constituencies."
    },
    {
      q: "Can I upload photos or videos as evidence?",
      a: "Absolutely. You can upload photos, video clips, or PDF documents. The AI analyzes image uploads using Gemini Vision to verify if the photo matches the category and describes actual damage/needs."
    },
    {
      q: "Can I submit my suggestion in Hindi or Bhojpuri?",
      a: "Yes, our voice recorder and writing assistant support Hindi, Bhojpuri, Hinglish, Urdu, and English. The AI automatically transcribes, translates, and structures the suggestions accordingly."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-indigo-400">Jansunwai AI</span>
              <p className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold">Constituency Planning</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            {user?.role === 'mp' ? (
              <Link href="/mp" className="text-slate-300 hover:text-white transition-colors">MP Portal</Link>
            ) : (
              <Link href="/auth" className="text-slate-300 hover:text-white transition-colors">MP Portal</Link>
            )}
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link 
                href={user.role === 'mp' ? '/mp' : '/dashboard'} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/30"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                  Log In
                </Link>
                <Link 
                  href="/auth?tab=register" 
                  className="bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-400 hover:to-indigo-500 text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-400 mb-6 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Public Demand Aggregator</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white max-w-4xl mx-auto">
            Building Better Constituencies <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500">With Artificial Intelligence</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Submit development suggestions directly to your Member of Parliament using Artificial Intelligence. Shape roads, schools, and hospitals with verified data.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/auth?tab=register" 
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-indigo-600 hover:scale-[1.02] transition-transform text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Explore Platform</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Smarter Local Development Planning
            </h2>
            <p className="mt-4 text-slate-400">
              Unlike grievance pages, Jansunwai AI gathers, structures, and categorizes development desires, helping local governments act on collective data.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => (
              <div 
                key={index} 
                className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-850 p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 border-t border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How It Works</h2>
            <p className="mt-4 text-slate-400">
              A transparent four-step cycle from a citizen&apos;s idea to project execution.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-slate-900 z-0" />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 font-black text-xl mb-6 shadow-inner">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 px-4 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section id="impact" className="py-24 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950/40 border border-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-white">Our Real-time Impact</h2>
              <p className="mt-3 text-sm text-indigo-400 font-semibold tracking-wider uppercase">Live Platform Indicators</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 text-center">
              <div>
                <span className="block text-3xl md:text-5xl font-black text-white">{stats.citizens.toLocaleString()}</span>
                <span className="block mt-2 text-xs md:text-sm text-slate-400 font-medium">Registered Citizens</span>
              </div>
              <div>
                <span className="block text-3xl md:text-5xl font-black text-white">{stats.suggestions.toLocaleString()}</span>
                <span className="block mt-2 text-xs md:text-sm text-slate-400 font-medium">Suggestions Submitted</span>
              </div>
              <div>
                <span className="block text-3xl md:text-5xl font-black text-white">{stats.aiGenerated.toLocaleString()}</span>
                <span className="block mt-2 text-xs md:text-sm text-slate-400 font-medium">AI Audited Submissions</span>
              </div>
              <div>
                <span className="block text-3xl md:text-5xl font-black text-white">{stats.activeMps}</span>
                <span className="block mt-2 text-xs md:text-sm text-slate-400 font-medium">Active MPs</span>
              </div>
              <div className="col-span-2 lg:col-span-1">
                <span className="block text-3xl md:text-5xl font-black text-emerald-400">{stats.completedProjects}</span>
                <span className="block mt-2 text-xs md:text-sm text-slate-400 font-medium">Projects Completed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-slate-900 bg-slate-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="mt-3 text-slate-400">Everything you need to know about raising development suggestions.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-slate-900/50 border border-slate-900 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-white flex items-center space-x-3">
                    <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {activeFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-400 border-t border-slate-950/20 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white">Jansunwai AI</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 mb-6 md:mb-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 Jansunwai AI. Built for better local administration.
          </p>
        </div>
      </footer>
    </div>
  );
}
