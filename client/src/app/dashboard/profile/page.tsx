'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Fingerprint, 
  Edit2, 
  Save, 
  Check
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop'
];

export default function CitizenProfile() {
  const { user, refreshProfile } = useAuth();
  const [suggestionsCount, setSuggestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');
  const [village, setVillage] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfileData();
      // Initialize form values
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setPincode(user.pincode || '');
      setState(user.state || '');
      setDistrict(user.district || '');
      setBlock(user.parliamentary_constituency || '');
      setVillage(user.village_ward || '');
      setAadhaar(user.aadhaar_number || '');
      setSelectedAvatar(user.avatar_url || '');
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestionsCount(data.suggestionsCount || 0);
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      // Basic validation
      if (!phone || !pincode || !state || !district || !block || !village || !aadhaar) {
        alert('Please fill out all address, phone, and Aadhaar fields to complete verification.');
        setSubmitting(false);
        return;
      }

      // Sync with backend API
      const response = await fetch('http://localhost:5000/api/profile/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          full_name: fullName,
          phone,
          state,
          district,
          parliamentary_constituency: block,
          village_ward: village,
          pincode,
          aadhaar_number: aadhaar,
          verification_status: 'pending', // request admin verification
          avatar_url: selectedAvatar,
          role: 'citizen'
        })
      });

      if (response.ok) {
        await refreshProfile(); // Refresh global user context
        setIsEditing(false);
      } else {
        alert('Failed to update profile info.');
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Network error updating profile.');
    } finally {
      setSubmitting(false);
    }
  };


  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'hi': return 'हिन्दी (Hindi)';
      case 'bjp': return 'भोजपुरी (Bhojpuri)';
      case 'urd': return 'اردو (Urdu)';
      default: return 'English';
    }
  };

  const getVerificationStatusHeader = () => {
    const status = user?.verification_status || 'incomplete';
    
    switch (status) {
      case 'verified':
        return (
          <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-3xl flex items-start space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
              <CheckCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Verified Citizen Account
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black uppercase">👑 Trusted</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Your credentials and constituency mapping have been fully verified by Super Admin. Complaints posted by you will receive boosted priority in the MP planning queue.
              </p>
            </div>
          </div>
        );
      case 'pending':
        return (
          <div className="bg-sky-950/20 border border-sky-500/20 p-5 rounded-3xl flex items-start space-x-4 animate-pulse">
            <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Verification Review Pending
                <span className="text-[9px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-black uppercase">Under Review</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Your profile address and Aadhaar dataset have been submitted to the Admin for approval. The verification tag is currently in pipeline.
              </p>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-rose-950/20 border border-rose-500/20 p-5 rounded-3xl flex items-start space-x-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Verification Rejected
                <span className="text-[9px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-black uppercase">Rejected</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                NIC Admin rejected the submitted audit details. Please click &quot;Complete Profile&quot; to review your address parameters and Aadhaar number, then submit again.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-amber-950/20 border border-amber-500/20 p-5 rounded-3xl flex items-start space-x-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Action Required: Incomplete Profile
                <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-black uppercase">Audit Warning</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Please link your phone, complete your local coordinates, and submit your Aadhaar. Verified citizens receive significantly higher priority for their grievances.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Citizen Profile</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your local planning coordinates, track contribution rankings, and view achievements.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{user?.verification_status === 'verified' || user?.verification_status === 'pending' ? 'Edit Profile details' : 'Complete Profile'}</span>
          </button>
        )}
      </div>

      {/* Verification Warning banner */}
      {getVerificationStatusHeader()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card & Info - Left Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-orange-500 to-indigo-600" />
            
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-indigo-400 mt-2" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-600 mx-auto flex items-center justify-center font-bold text-white uppercase text-2xl border-2 border-indigo-400 mt-2">
                {user?.full_name[0]}
              </div>
            )}
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">{user?.full_name}</h2>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-full">
                {user?.verification_status === 'verified' ? '✓ Verified Citizen' : 'Citizen Member'}
              </span>
            </div>

            <div className="border-t border-slate-950/40 pt-4 flex justify-around text-center">
              <div>
                <span className="block text-xl font-black text-white">{suggestionsCount}</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold">Complaints</span>
              </div>
            </div>
          </div>

          {/* Simple Coordinates summary shown in sidebar during Edit mode */}
          {isEditing && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Details</h3>
              <div className="space-y-3.5 text-xs text-slate-400">
                <div className="flex justify-between"><span>Email</span><span className="font-semibold text-slate-200">{user?.email}</span></div>
                <div className="flex justify-between"><span>Phone</span><span className="font-semibold text-slate-200">{user?.phone || 'Not linked'}</span></div>
                <div className="flex justify-between"><span>Constituency</span><span className="font-semibold text-slate-200">{user?.parliamentary_constituency || 'Varanasi'}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Columns - Edits Form OR Premium Coordinates Panel */}
        <div className="md:col-span-2">
          {isEditing ? (
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-md font-bold text-white flex items-center space-x-2">
                  <Fingerprint className="w-5 h-5 text-indigo-400" />
                  <span>Audited Demographic details</span>
                </h3>
                {(user?.verification_status === 'verified' || user?.verification_status === 'pending') && (
                  <p className="text-[11px] text-amber-500 mt-2 flex items-center gap-1 leading-relaxed bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Warning: Editing profile fields will invalidate verification status. Admin will re-verify.</span>
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Preset Avatar Selection */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-400">Select Portrait Avatar</span>
                  <div className="flex items-center space-x-3">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 relative transition-all ${
                          selectedAvatar === av 
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-105' 
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                        {selectedAvatar === av && (
                          <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white font-bold" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Phone number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 9988776655"
                      className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Aadhaar Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Aadhaar audit number (12-Digits)</label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={aadhaar}
                      onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456789012"
                      className="w-full bg-slate-900 border border-slate-800 font-mono text-xs px-3 py-2.5 rounded-xl text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="Uttar Pradesh"
                      className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">District</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="Varanasi"
                      className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Block Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Block Name</label>
                    <input
                      type="text"
                      required
                      value={block}
                      onChange={e => setBlock(e.target.value)}
                      placeholder="Harahua / Pindra"
                      className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Village / Ward */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Village / Ward</label>
                    <input
                      type="text"
                      required
                      value={village}
                      onChange={e => setVillage(e.target.value)}
                      placeholder="Ward 12 - Sigra / Harahua Village"
                      className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="221002"
                      className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{submitting ? 'Syncing...' : 'Request verification approval'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 h-full">
              <div>
                <h3 className="text-md font-bold text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  <span>Planning Coordinates & Local details</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Verified demographics connected with public demand systems.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-xs text-slate-400">
                <div className="flex flex-col space-y-1 border-b border-slate-900/60 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Email Address</span>
                  <span className="font-semibold text-slate-200 truncate">{user?.email}</span>
                </div>

                <div className="flex flex-col space-y-1 border-b border-slate-900/60 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Phone Number</span>
                  <span className="font-semibold text-slate-200">{user?.phone || 'Not linked'}</span>
                </div>

                <div className="flex flex-col space-y-1 border-b border-slate-900/60 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">State</span>
                  <span className="font-semibold text-slate-200">{user?.state || 'Not specified'}</span>
                </div>

                <div className="flex flex-col space-y-1 border-b border-slate-900/60 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">District</span>
                  <span className="font-semibold text-slate-200">{user?.district || 'Not specified'}</span>
                </div>

                <div className="flex flex-col space-y-1 border-b border-slate-900/60 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Block Name</span>
                  <span className="font-semibold text-slate-200">{user?.parliamentary_constituency || 'Not specified'}</span>
                </div>

                <div className="flex flex-col space-y-1 border-b border-slate-900/60 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Village / Ward</span>
                  <span className="font-semibold text-slate-200">{user?.village_ward || 'Not specified'}</span>
                </div>

                <div className="flex flex-col space-y-1 border-b border-slate-900/60 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Pincode</span>
                  <span className="font-semibold text-slate-200">{user?.pincode || 'Not specified'}</span>
                </div>

                <div className="flex flex-col space-y-1 border-b border-slate-900/60 pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Language Preference</span>
                  <span className="font-semibold text-slate-200">{getLanguageLabel(user?.language_preference || 'en')}</span>
                </div>

                {user?.aadhaar_number && (
                  <div className="flex flex-col space-y-1 border-b border-slate-900/60 pb-2 col-span-1 sm:col-span-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1">
                      <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                      Aadhaar Verification ID
                    </span>
                    <span className="font-mono font-bold text-slate-200 tracking-wider">
                      {`XXXX XXXX ${user.aadhaar_number.substring(8)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
