'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Vote, ArrowLeft, Mail, Lock, User, Phone, MapPin, Globe, Sparkles, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState<string>('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }
      
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Login failed. Please check credentials.');
      }
    } else {
      if (!fullName || !email || !password || !selectedState || !selectedDistrict || !selectedParliamentary || !selectedAssembly || !pincode) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const success = await register({
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

      if (success) {
        router.push('/dashboard');
      } else {
        setError('Registration failed. Email might already be taken.');
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-950/10 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 blur-[150px] rounded-full -z-10" />

      <div className="max-w-md w-full mx-auto mb-6">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto bg-slate-900/60 border border-slate-900 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-indigo-600 flex items-center justify-center mx-auto shadow-md mb-4">
            <Vote className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">Jansunwai AI</h2>
          <p className="text-xs text-slate-400 mt-1">AI-Powered Citizen Grievance Planning</p>
        </div>

        <div className="flex border-b border-slate-800 mb-8 p-1 bg-slate-950 rounded-xl">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`w-1/2 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`w-1/2 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start space-x-3 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {isLogin && (
          <div className="mb-6 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <p className="text-[10px] text-slate-500 uppercase font-bold text-center tracking-wider">Demo Quick Access</p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setEmail('aarav@mail.com');
                  setPassword('password');
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-indigo-950/40 border border-indigo-900/30 hover:border-indigo-600 hover:bg-indigo-900/10 text-[10px] font-semibold text-indigo-300 transition-all text-center"
              >
                Citizen Demo: Aarav Sharma (Sigra)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isLogin ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs text-indigo-400 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-850">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/50 pb-1">Personal Details</p>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aarav Sharma"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav@mail.com"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/50 pb-1">Constituency & Location</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
                    <select
                      required
                      value={selectedState}
                      onChange={handleStateChange}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select State</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">District</label>
                    <select
                      required
                      disabled={!selectedState}
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 disabled:opacity-55 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Parliament Const.</label>
                    <select
                      required
                      disabled={!selectedDistrict}
                      value={selectedParliamentary}
                      onChange={(e) => setSelectedParliamentary(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 disabled:opacity-55 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select PC</option>
                      {parliamentaryConstituencies.map(pc => <option key={pc} value={pc}>{pc}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assembly Const.</label>
                    <select
                      required
                      disabled={!selectedDistrict}
                      value={selectedAssembly}
                      onChange={(e) => setSelectedAssembly(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 disabled:opacity-55 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select Assembly</option>
                      {assemblyConstituencies.map(ac => <option key={ac} value={ac}>{ac}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Village / Ward</label>
                    <input
                      type="text"
                      value={villageWard}
                      onChange={(e) => setVillageWard(e.target.value)}
                      placeholder="Ward 12"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="221002"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Language Preference</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Globe className="w-4 h-4" />
                    </span>
                    <select
                      value={languagePreference}
                      onChange={(e) => setLanguagePreference(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="bjp">भोजपुरी (Bhojpuri)</option>
                      <option value="urd">اردو (Urdu)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-orange-500 to-indigo-600 hover:from-orange-400 hover:to-indigo-500 disabled:opacity-55 text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <Vote className="w-4 h-4" />
                <span>{isLogin ? 'Log In to Portal' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {isLogin ? (
            <span>
              Don&apos;t have an account?{' '}
              <button onClick={() => setIsLogin(false)} className="text-indigo-400 font-bold hover:underline">
                Register now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button onClick={() => setIsLogin(true)} className="text-indigo-400 font-bold hover:underline">
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
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
