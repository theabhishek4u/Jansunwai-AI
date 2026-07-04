'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { 
  Award, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  CheckCircle2, 
  Trophy, 
  Calendar,
  Lock,
  Sparkles
} from 'lucide-react';

interface Badge {
  id: string;
  badge_type: 'top_contributor' | 'community_leader' | 'verified_citizen' | 'problem_solver';
  earned_at: string;
}

export default function CitizenProfile() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [suggestionsCount, setSuggestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges || []);
        setSuggestionsCount(data.suggestionsCount || 0);
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  const BADGE_DETAILS = [
    {
      type: 'verified_citizen',
      title: 'Verified Citizen',
      desc: 'Completed onboarding profile registration and verified constituency details.',
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" />,
      glowColor: 'shadow-emerald-500/10 border-emerald-500/20'
    },
    {
      type: 'top_contributor',
      title: 'Top Contributor',
      desc: 'Earned by submitting 3 or more detailed development suggestions to the MP.',
      icon: <Award className="w-8 h-8 text-indigo-400" />,
      glowColor: 'shadow-indigo-500/10 border-indigo-500/20'
    },
    {
      type: 'problem_solver',
      title: 'Problem Solver',
      desc: 'Earned when at least one of your submitted development projects is fully completed.',
      icon: <Sparkles className="w-8 h-8 text-violet-400" />,
      glowColor: 'shadow-violet-500/10 border-violet-500/20'
    },
    {
      type: 'community_leader',
      title: 'Community Leader',
      desc: 'Awarded when your overall contribution score reaches or exceeds 1,000 XP.',
      icon: <Trophy className="w-8 h-8 text-amber-500" />,
      glowColor: 'shadow-amber-500/10 border-amber-500/20'
    }
  ];

  const getLanguageLabel = (code: string) => {
    switch (code) {
      case 'hi': return 'हिन्दी (Hindi)';
      case 'bjp': return 'भोजपुरी (Bhojpuri)';
      case 'urd': return 'اردو (Urdu)';
      default: return 'English';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white">Citizen Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your local planning coordinates, track contribution rankings, and view achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card - Left Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-indigo-600" />
            <div className="w-20 h-20 rounded-full bg-indigo-600 mx-auto flex items-center justify-center font-bold text-white uppercase text-2xl border-2 border-indigo-400 mt-2">
              {user?.full_name[0]}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">{user?.full_name}</h2>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-full">
                Citizen Member
              </span>
            </div>

            <div className="border-t border-slate-950/40 pt-4 flex justify-around text-center">
              <div>
                <span className="block text-xl font-black text-white">{suggestionsCount}</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold">Suggestions</span>
              </div>
              <div className="border-l border-slate-950/40 h-8" />
              <div>
                <span className="block text-xl font-black text-indigo-400">{user?.contribution_score}</span>
                <span className="text-[10px] uppercase text-slate-500 font-bold">Points (XP)</span>
              </div>
            </div>
          </div>

          {/* Location Metadata list */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planning Coordinates</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Email</span>
                </span>
                <span className="font-semibold text-slate-200 truncate max-w-[150px]">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Phone</span>
                </span>
                <span className="font-semibold text-slate-200">{user?.phone || 'Not linked'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Constituency</span>
                </span>
                <span className="font-semibold text-slate-200">{user?.parliamentary_constituency}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Language</span>
                </span>
                <span className="font-semibold text-slate-200">{getLanguageLabel(user?.language_preference || 'en')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges and Achievements - Right 2 Columns */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-md font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <span>Earned Achievements & Badges</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Submit complete suggestions and upload image evidence to unlock higher badges.</p>
            </div>

            {loading ? (
              <div className="text-slate-500 text-sm py-12 text-center">Loading badges cabinet...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BADGE_DETAILS.map((badgeItem) => {
                  // Check if user has earned this badge
                  const earnedBadge = badges.find(b => b.badge_type === badgeItem.type);
                  const isEarned = !!earnedBadge;

                  return (
                    <div 
                      key={badgeItem.type} 
                      className={`relative bg-slate-950 border p-5 rounded-2xl flex items-start space-x-4 shadow-sm transition-all ${
                        isEarned 
                          ? `${badgeItem.glowColor} opacity-100` 
                          : 'border-slate-900 opacity-45'
                      }`}
                    >
                      <div className={`p-3 bg-slate-900/60 rounded-xl shrink-0 ${isEarned ? 'animate-pulse' : ''}`}>
                        {isEarned ? (
                          badgeItem.icon
                        ) : (
                          <Lock className="w-8 h-8 text-slate-700" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                          <span>{badgeItem.title}</span>
                          {isEarned && (
                            <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                              ✓ Earned
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {badgeItem.desc}
                        </p>
                        {isEarned && (
                          <span className="block text-[9px] text-slate-500 font-semibold mt-1">
                            Unlocked: {new Date(earnedBadge.earned_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
