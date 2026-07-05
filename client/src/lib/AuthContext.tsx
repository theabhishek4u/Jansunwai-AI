'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { profileService, ProfileData } from '../services/profileService';

interface AuthContextType {
  user: ProfileData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (profile: Omit<ProfileData, 'contribution_score' | 'id'> & { password?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const loadProfile = async (userId: string, role: ProfileData['role']) => {
    try {
      const profile = await profileService.getProfile(userId, role);
      setUser(profile);
    } catch (err) {
      console.error('Failed to load profile from database:', err);
    }
  };

  useEffect(() => {
    let active = true;

    authService.getSession().then((session) => {
      if (!active) return;
      if (session) {
        const role = (session.user.user_metadata?.role as ProfileData['role']) || 'citizen';
        loadProfile(session.user.id, role).finally(() => {
          if (active) setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const subscription = authService.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (session) {
        const role = (session.user.user_metadata?.role as ProfileData['role']) || 'citizen';
        await loadProfile(session.user.id, role);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (profileData: Omit<ProfileData, 'contribution_score' | 'id'> & { password?: string }): Promise<void> => {
    setLoading(true);
    try {
      const { email, password, role, ...metadata } = profileData;
      if (!email || !password || !role) {
        throw new Error('Missing required fields for signup');
      }
      await authService.signUp(email, password, role, metadata);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const profile = await profileService.getProfile(user.id, user.role);
      setUser(profile);
    } catch (err) {
      console.warn('Failed to refresh user points from Supabase:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
