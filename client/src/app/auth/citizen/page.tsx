'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Vote, ArrowLeft, Mail, Lock, User, Phone, MapPin, Globe, AlertCircle, ArrowRight, Check, Sparkles, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const locationData: Record<string, {
  districts: Record<string, {
    parliamentary: string[];
    assembly: string[];
  }>
}> = {
  "Uttar Pradesh": {
    districts: {
      "Varanasi": {
        parliamentary: ["Varanasi"],
        assembly: ["Varanasi Cantonment", "Varanasi North", "Varanasi South", "Rohaniya", "Sevapuri"]
      },
      "Lucknow": {
        parliamentary: ["Lucknow"],
        assembly: ["Lucknow West", "Lucknow East", "Lucknow Central", "Lucknow Cantt.", "Sarojini Nagar"]
      },
      "Kanpur": {
        parliamentary: ["Kanpur"],
        assembly: ["Kanpur Cantt.", "Aryanagar", "Kalyanpur", "Govindnagar", "Sishamau"]
      }
    }
  },
  "Maharashtra": {
    districts: {
      "Mumbai": {
        parliamentary: ["Mumbai North", "Mumbai South", "Mumbai Northeast"],
        assembly: ["Colaba", "Malabar Hill", "Dharavi", "Bandra West", "Borivali"]
      },
      "Pune": {
        parliamentary: ["Pune", "Baramati"],
        assembly: ["Shivajinagar", "Kothrud", "Hadapsar", "Cantonment", "Kasba Peth"]
      }
    }
  },
  "Karnataka": {
    districts: {
      "Bangalore": {
        parliamentary: ["Bangalore North", "Bangalore South", "Bangalore Central"],
        assembly: ["Malleshwaram", "Jayanagar", "Indiranagar", "Rajajinagar", "Whitefield"]
      }
    }
  }
};

function CitizenAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, user } = useAuth();
  
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [registerStep, setRegisterStep] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

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

  const [email, setEmail] = useState('theabhishekyt@gmail.com');
  const [password, setPassword] = useState('112233');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedParliamentary, setSelectedParliamentary] = useState('');
  const [selectedAssembly, setSelectedAssembly] = useState('');
  const [villageWard, setVillageWard] = useState('');
  const [pincode, setPincode] = useState('');
  const [languagePreference, setLanguagePreference] = useState('en');

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    setSelectedDistrict('');
    setSelectedParliamentary('');
    setSelectedAssembly('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
    setSelectedParliamentary('');
    setSelectedAssembly('');
  };

  const validateStep1 = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all personal details.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }
      
      try {
        await login(email, password);
        router.push('/dashboard');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
        setError(msg);
      }
    } else {
      if (registerStep === 1) {
        if (validateStep1()) {
          setRegisterStep(2);
        }
        setLoading(false);
        return;
      }

      if (!selectedState || !selectedDistrict || !selectedParliamentary || !selectedAssembly || !pincode) {
        setError('Please select state, district, constituency, and pincode.');
        setLoading(false);
        return;
      }

      try {
        await register({
          full_name: fullName,
          email: email,
          password: password,
          phone: phone,
          state: selectedState,
          district: selectedDistrict,
          parliamentary_constituency: selectedParliamentary,
          assembly_constituency: selectedAssembly,
          village_ward: villageWard,
          pincode: pincode,
          language_preference: languagePreference,
          role: 'citizen',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'
        });
        setSuccessMsg('Success! Account created. Please verify your email if required, then log in.');
        setIsLogin(true);
        setRegisterStep(1);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed. Email might already be taken.';
        setError(msg);
      }
    }
    setLoading(false);
  };

  const states = Object.keys(locationData);
  const districts = selectedState ? Object.keys(locationData[selectedState]?.districts || {}) : [];
  const parliamentaryConstituencies = (selectedState && selectedDistrict) 
    ? locationData[selectedState]?.districts[selectedDistrict]?.parliamentary || [] 
    : [];
  const assemblyConstituencies = (selectedState && selectedDistrict) 
    ? locationData[selectedState]?.districts[selectedDistrict]?.assembly || [] 
    : [];

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden font-sans flex items-center justify-center p-4 sm:p-8">
      {/* Animated Background - Blue/Sky */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e908_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e908_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/25 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-400/25 blur-[120px] rounded-full" 
        />
      </div>

      <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Branding Panel (Desktop) */}
        <div className="hidden lg:flex flex-col justify-center pr-12">
          <Link href="/" className="inline-flex items-center text-xs font-semibold text-blue-500/80 hover:text-blue-400 transition-colors group mb-12 w-fit bg-blue-950/30 px-3 py-1.5 rounded-full border border-blue-900/50 backdrop-blur-md">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            <span>Return to Public Portal</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <Vote className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Jansunwai AI <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-sky-400">
                Citizen Portal
              </span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-md">
              AI-powered grievance redressal platform. File complaints in your native language with smart routing and real-time tracking.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-medium">AI identifies issue categories instantly</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                  <LayoutDashboard className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-medium">Track resolution progress on personal dashboard</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Auth Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto lg:ml-auto"
        >
          {/* Mobile Back Button */}
          <div className="lg:hidden mb-6 flex justify-center">
            <Link href="/" className="inline-flex items-center text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors group bg-blue-950/30 px-3 py-1.5 rounded-full border border-blue-900/50">
              <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Landing Page</span>
            </Link>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-sky-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-4 lg:hidden">
                <Vote className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight lg:text-3xl">Citizen Access</h2>
              <p className="text-xs text-blue-400 mt-2 font-bold uppercase tracking-widest">Public Redressal Portal</p>
            </div>

            {/* Dynamic sliding pill navigation tabs */}
            <div className="flex border border-slate-700/50 bg-slate-950/50 mb-6 p-1.5 rounded-2xl relative">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
                className={`w-1/2 py-2 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all duration-300 relative z-10 ${isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {isLogin && <span className="absolute inset-0 bg-linear-to-r from-blue-600 to-sky-500 rounded-xl -z-10 shadow-md shadow-blue-500/30" />}
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); setRegisterStep(1); }}
                className={`w-1/2 py-2 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all duration-300 relative z-10 ${!isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {!isLogin && <span className="absolute inset-0 bg-linear-to-r from-blue-600 to-sky-500 rounded-xl -z-10 shadow-md shadow-blue-500/30" />}
                Register
              </button>
            </div>

            {/* Errors & Success Logs */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-red-200 text-xs shadow-inner">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
              {successMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-emerald-200 text-xs shadow-inner">
                    <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="mb-6 p-3.5 rounded-2xl bg-blue-950/20 border border-blue-900/30 space-y-2">
                <p className="text-[10px] text-blue-400 uppercase font-black text-center tracking-widest">Demo Quick Access</p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('citizen@jansunwai.gov.in');
                      setPassword('password');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-500/20 text-xs font-semibold text-blue-300 transition-all text-center focus:outline-none"
                  >
                    Citizen Demo: Aarav Sharma
                  </button>
                </div>
              </div>
            )}

            {/* Registration Steps Indicator */}
            {!isLogin && (
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${registerStep >= 1 ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-slate-800 text-slate-400'}`}>1</div>
                  <span className={`text-[9px] uppercase font-bold tracking-wider ${registerStep >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>Personal</span>
                </div>
                <div className="flex-1 h-[2px] bg-slate-800/50 mx-2 relative rounded-full">
                  <div className={`absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-300 ${registerStep === 2 ? 'w-full' : 'w-0'}`} />
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${registerStep === 2 ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-slate-800 text-slate-400'}`}>2</div>
                  <span className={`text-[9px] uppercase font-bold tracking-wider ${registerStep === 2 ? 'text-blue-400' : 'text-slate-500'}`}>Location</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin ? (
                /* ================= LOGIN FORM ================= */
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-blue-400 transition-colors">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                      <a href="#" className="text-[10px] text-blue-400 hover:text-blue-300">Forgot?</a>
                    </div>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-blue-400 transition-colors">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* ================= REGISTER FORM ================= */
                <>
                  {registerStep === 1 ? (
                    /* STEP 1: Personal Details */
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-blue-400 transition-colors">
                            <User className="w-3.5 h-3.5" />
                          </span>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Aarav Sharma"
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                          <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-blue-400 transition-colors">
                              <Mail className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="aarav@mail.com"
                              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-8 pr-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                          <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-blue-400 transition-colors">
                              <Phone className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="9876543210"
                              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-8 pr-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm</label>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* STEP 2: Location & Constituency details */
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">State</label>
                          <select
                            required
                            value={selectedState}
                            onChange={handleStateChange}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          >
                            <option value="">Select State</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">District</label>
                          <select
                            required
                            disabled={!selectedState}
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-xs text-slate-100 disabled:opacity-40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          >
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Parliament Const.</label>
                          <select
                            required
                            disabled={!selectedDistrict}
                            value={selectedParliamentary}
                            onChange={(e) => setSelectedParliamentary(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-xs text-slate-100 disabled:opacity-40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          >
                            <option value="">Select PC</option>
                            {parliamentaryConstituencies.map(pc => <option key={pc} value={pc}>{pc}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assembly Const.</label>
                          <select
                            required
                            disabled={!selectedDistrict}
                            value={selectedAssembly}
                            onChange={(e) => setSelectedAssembly(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-xs text-slate-100 disabled:opacity-40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          >
                            <option value="">Select Assembly</option>
                            {assemblyConstituencies.map(ac => <option key={ac} value={ac}>{ac}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Village / Ward</label>
                          <input
                            type="text"
                            value={villageWard}
                            onChange={(e) => setVillageWard(e.target.value)}
                            placeholder="Sigra / Ward 12"
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pincode</label>
                          <input
                            type="text"
                            required
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="221002"
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Preferred Language</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 group-focus-within:text-blue-400 transition-colors">
                            <Globe className="w-3.5 h-3.5" />
                          </span>
                          <select
                            value={languagePreference}
                            onChange={(e) => setLanguagePreference(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          >
                            <option value="en">English</option>
                            <option value="hi">हिन्दी (Hindi)</option>
                            <option value="bjp">भोजपुरी (Bhojpuri)</option>
                            <option value="urd">اردو (Urdu)</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* Buttons Area */}
              <div className="flex space-x-3 pt-4">
                {!isLogin && registerStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setRegisterStep(1)}
                    className="w-1/3 bg-slate-800/50 border border-slate-700 hover:border-slate-600 text-slate-300 py-3 px-4 rounded-xl text-xs font-bold transition-all focus:outline-none active:scale-[0.97]"
                  >
                    Back
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-linear-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 disabled:opacity-50 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none active:scale-[0.98] ${
                    !isLogin && registerStep === 2 ? 'w-2/3' : 'w-full'
                  }`}
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>
                        {isLogin 
                          ? 'Log In to Portal' 
                          : registerStep === 1 
                            ? 'Continue to Location' 
                            : 'Complete Registration'
                        }
                      </span>
                      {(!isLogin && registerStep === 1) ? <ArrowRight className="w-4 h-4" /> : <Vote className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-slate-500">
              {isLogin ? "Don't have an account? " : "Already registered? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setRegisterStep(1);
                  setError('');
                }}
                className="text-blue-400 font-bold hover:text-blue-300 hover:underline transition-colors"
              >
                {isLogin ? "Create one now" : "Log in here"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CitizenAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 animate-spin flex items-center justify-center">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-semibold">Loading Citizen Portal...</p>
        </div>
      </div>
    }>
      <CitizenAuthForm />
    </Suspense>
  );
}
