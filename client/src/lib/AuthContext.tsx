'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  state: string;
  district: string;
  parliamentary_constituency: string;
  assembly_constituency: string;
  village_ward?: string;
  pincode: string;
  language_preference: string;
  contribution_score: number;
  avatar_url?: string;
  role: 'citizen' | 'mp';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, role?: 'citizen' | 'mp') => Promise<boolean>;
  register: (profile: Omit<UserProfile, 'contribution_score' | 'id'>) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in (via localStorage)
    const storedUser = localStorage.getItem('jansunwai_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: 'citizen' | 'mp' = 'citizen'): Promise<boolean> => {
    setLoading(true);
    try {
      // Fetch or simulate profile sync
      let mockProfile: UserProfile;
      
      // If citizen-123 email, load the pre-seeded Varanasi profile
      if (email.includes('citizen') || email.includes('aarav')) {
        mockProfile = {
          id: 'citizen-123',
          full_name: 'Aarav Sharma',
          email: email,
          phone: '+91 9876543210',
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          parliamentary_constituency: 'Varanasi',
          assembly_constituency: 'Varanasi Cantonment',
          village_ward: 'Ward 12 - Sigra',
          pincode: '221002',
          language_preference: 'hi',
          contribution_score: 120,
          avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
          role: 'citizen'
        };
      } else {
        // Generate new random user
        mockProfile = {
          id: `usr-${Math.random().toString(36).substring(2, 9)}`,
          full_name: email.split('@')[0].toUpperCase(),
          email: email,
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          parliamentary_constituency: 'Varanasi',
          assembly_constituency: 'Varanasi North',
          pincode: '221001',
          language_preference: 'en',
          contribution_score: 20,
          role: role
        };
      }

      // Sync with backend API
      try {
        const response = await fetch('http://localhost:5000/api/profile/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockProfile)
        });
        const data = await response.json();
        if (data.profile) {
          mockProfile = data.profile;
        }
      } catch (err) {
        console.warn('Backend sync failed in auth, keeping local mock profile:', err);
      }

      setUser(mockProfile);
      localStorage.setItem('jansunwai_user', JSON.stringify(mockProfile));
      setLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setLoading(false);
      return false;
    }
  };

  const register = async (profileData: Omit<UserProfile, 'contribution_score' | 'id'>): Promise<boolean> => {
    setLoading(true);
    try {
      const generatedId = `usr-${Math.random().toString(36).substring(2, 9)}`;
      const newProfile: UserProfile = {
        ...profileData,
        id: generatedId,
        contribution_score: 0
      };

      // Sync with backend
      try {
        const response = await fetch('http://localhost:5000/api/profile/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProfile)
        });
        const data = await response.json();
        if (data.profile) {
          newProfile.contribution_score = data.profile.contribution_score || 0;
        }
      } catch (err) {
        console.warn('Backend profile creation sync failed, using mock data:', err);
      }

      setUser(newProfile);
      localStorage.setItem('jansunwai_user', JSON.stringify(newProfile));
      setLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jansunwai_user');
    router.push('/');
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          const updatedUser = {
            ...user,
            ...data.profile,
            contribution_score: data.profile.contribution_score
          };
          setUser(updatedUser);
          localStorage.setItem('jansunwai_user', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.warn('Failed to refresh user points from server:', err);
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
