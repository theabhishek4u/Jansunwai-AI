'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Vote, ArrowLeft, Mail, Lock, User, Phone, MapPin, Globe, AlertCircle, ArrowRight, Check } from 'lucide-react';

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative Gradients & Mesh Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.15),transparent_60%)] -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] -z-10" />
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-purple-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-md w-full mx-auto mb-6">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl relative shadow-indigo-500/5">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 mb-4 animate-pulse">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">Jansunwai AI</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium tracking-wide">AI-Powered Citizen Grievance Planning</p>
        </div>

        {/* Dynamic sliding pill navigation tabs */}
        <div className="flex border border-slate-800 bg-slate-950/80 mb-8 p-1.5 rounded-2xl relative">
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
            className={`w-1/2 py-2.5 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all duration-300 relative z-10 ${isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {isLogin && <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl -z-10 shadow-md shadow-indigo-600/30" />}
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); setRegisterStep(1); }}
            className={`w-1/2 py-2.5 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all duration-300 relative z-10 ${!isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {!isLogin && <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl -z-10 shadow-md shadow-indigo-600/30" />}
            Register
          </button>
        </div>

        {/* Errors & Success Logs */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-red-200 text-xs shadow-inner">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-emerald-200 text-xs shadow-inner">
            <div className="w-4 h-4 shrink-0 bg-emerald-500/20 rounded-full flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
            <span>{successMsg}</span>
          </div>
        )}

        {isLogin && (
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <p className="text-[10px] text-slate-500 uppercase font-black text-center tracking-widest">Demo Quick Access</p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setEmail('citizen@jansunwai.gov.in');
                  setPassword('password');
                }}
                className="w-full px-3 py-3 rounded-xl bg-indigo-950/20 border border-indigo-900/30 hover:border-indigo-500/80 hover:bg-indigo-900/10 text-xs font-semibold text-indigo-300 transition-all text-center focus:outline-none"
              >
                Citizen Demo: Aarav Sharma (Sigra PC)
              </button>
            </div>
          </div>
        )}

        {/* Registration Steps Indicator */}
        {!isLogin && (
          <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${registerStep >= 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-400'}`}>1</div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${registerStep >= 1 ? 'text-indigo-400' : 'text-slate-500'}`}>Personal</span>
            </div>
            <div className="flex-1 h-[2px] bg-slate-800 mx-3 relative">
              <div className={`absolute inset-y-0 left-0 bg-indigo-600 transition-all duration-300 ${registerStep === 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${registerStep === 2 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-400'}`}>2</div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${registerStep === 2 ? 'text-indigo-400' : 'text-slate-500'}`}>Location</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isLogin ? (
            /* ================= LOGIN FORM ================= */
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Email Address</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 transition-colors group-focus-within:text-indigo-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">Forgot password?</a>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 transition-colors group-focus-within:text-indigo-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ================= REGISTER FORM ================= */
            <div className="transition-all duration-300">
              {registerStep === 1 ? (
                /* STEP 1: Personal Details */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 transition-colors group-focus-within:text-indigo-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 transition-colors group-focus-within:text-indigo-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aarav@mail.com"
                        className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 transition-colors group-focus-within:text-indigo-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* STEP 2: Location & Constituency details */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">State</label>
                      <select
                        required
                        value={selectedState}
                        onChange={handleStateChange}
                        className="w-full bg-slate-950 border border-slate-850 rounded-2xl py-3.5 px-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="">Select State</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">District</label>
                      <select
                        required
                        disabled={!selectedState}
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        className="w-full bg-slate-950 border border-slate-850 rounded-2xl py-3.5 px-4 text-sm text-slate-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Parliament Const.</label>
                      <select
                        required
                        disabled={!selectedDistrict}
                        value={selectedParliamentary}
                        onChange={(e) => setSelectedParliamentary(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-2xl py-3.5 px-4 text-sm text-slate-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="">Select PC</option>
                        {parliamentaryConstituencies.map(pc => <option key={pc} value={pc}>{pc}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Assembly Const.</label>
                      <select
                        required
                        disabled={!selectedDistrict}
                        value={selectedAssembly}
                        onChange={(e) => setSelectedAssembly(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-2xl py-3.5 px-4 text-sm text-slate-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="">Select Assembly</option>
                        {assemblyConstituencies.map(ac => <option key={ac} value={ac}>{ac}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Village / Ward</label>
                      <input
                        type="text"
                        value={villageWard}
                        onChange={(e) => setVillageWard(e.target.value)}
                        placeholder="Sigra / Ward 12"
                        className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pincode</label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="221002"
                        className="w-full bg-slate-950/60 border border-slate-850 rounded-2xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Preferred Language</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 transition-colors group-focus-within:text-indigo-400">
                        <Globe className="w-4 h-4" />
                      </span>
                      <select
                        value={languagePreference}
                        onChange={(e) => setLanguagePreference(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="bjp">भोजपुरी (Bhojpuri)</option>
                        <option value="urd">اردو (Urdu)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Buttons Area */}
          <div className="flex space-x-3 pt-2">
            {!isLogin && registerStep === 2 && (
              <button
                type="button"
                onClick={() => setRegisterStep(1)}
                className="w-1/3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 py-3.5 px-4 rounded-2xl text-xs font-bold transition-all focus:outline-none active:scale-[0.97]"
              >
                Back
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[size:200%_auto] hover:bg-[right_center] disabled:opacity-55 text-white py-3.5 px-4 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all duration-500 flex items-center justify-center space-x-2 focus:outline-none active:scale-[0.98] ${
                !isLogin && registerStep === 2 ? 'w-2/3' : 'w-full'
              }`}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <Vote className="w-4 h-4" />
                  <span>
                    {isLogin 
                      ? 'Log In to Portal' 
                      : registerStep === 1 
                        ? 'Next Step' 
                        : 'Create Account'
                    }
                  </span>
                  {(!isLogin && registerStep === 1) && <ArrowRight className="w-4 h-4 ml-1" />}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {isLogin ? (
            <span>
              Don&apos;t have an account?{' '}
              <button onClick={() => { setIsLogin(false); setRegisterStep(1); }} className="text-indigo-400 font-extrabold hover:text-indigo-300 hover:underline focus:outline-none">
                Register now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button onClick={() => { setIsLogin(true); setRegisterStep(1); }} className="text-indigo-400 font-extrabold hover:text-indigo-300 hover:underline focus:outline-none">
                Log In here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CitizenAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-spin flex items-center justify-center">
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
