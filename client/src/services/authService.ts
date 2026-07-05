import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { ProfileData } from './profileService';

export const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax; Secure";
};

export const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure';
};

export const authService = {
  signUp: async (email: string, password: string, role: 'citizen' | 'mp' | 'admin', additionalMeta: Partial<ProfileData>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: additionalMeta.full_name,
          phone: additionalMeta.phone,
          state: additionalMeta.state,
          district: additionalMeta.district,
          parliamentary_constituency: additionalMeta.parliamentary_constituency,
          assembly_constituency: additionalMeta.assembly_constituency,
          village_ward: additionalMeta.village_ward,
          state_id: additionalMeta.state_id,
          district_id: additionalMeta.district_id,
          parliamentary_constituency_id: additionalMeta.parliamentary_constituency_id,
          assembly_constituency_id: additionalMeta.assembly_constituency_id,
          village_id: additionalMeta.village_id,
          pincode: additionalMeta.pincode,
          language_preference: additionalMeta.language_preference || 'en',
          avatar_url: additionalMeta.avatar_url
        }
      }
    });

    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string): Promise<unknown> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (
          (error.message.includes('Invalid login credentials') || error.message.includes('User not found')) &&
          email.endsWith('@jansunwai.gov.in')
        ) {
          let role: 'citizen' | 'mp' | 'admin' = 'citizen';
          let additionalMeta: Partial<ProfileData> = {
            full_name: 'Demo Citizen'
          };

          if (email.startsWith('mp')) {
            role = 'mp';
            additionalMeta = {
              full_name: 'Dr. Vikram Singh',
              parliamentary_constituency: 'Varanasi',
              state: 'Uttar Pradesh'
            };
          } else if (email.startsWith('admin')) {
            role = 'admin';
            additionalMeta = {
              full_name: 'Super Administrator'
            };
          } else {
            role = 'citizen';
            additionalMeta = {
              full_name: 'Aarav Sharma',
              phone: '9876543210',
              state: 'Delhi',
              district: 'New Delhi',
              pincode: '110001'
            };
          }

          await authService.signUp(email, password, role, additionalMeta);

          const retryResult = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (retryResult.error) {
            if (retryResult.error.message.includes('Email not confirmed')) {
              throw new Error(
                'Demo registration successful! Please verify the confirmation email, or disable email confirmation in your Supabase Auth Settings (Auth -> Providers -> Email -> Confirm email) to enable instant login.'
              );
            }
            throw retryResult.error;
          }

          if (retryResult.data.session) {
            setCookie('sb-access-token', retryResult.data.session.access_token);
            setCookie('user-role', role);
          }
          return retryResult.data;
        }

        throw error;
      }

      if (data.session) {
        const role = data.user.user_metadata?.role || 'citizen';
        setCookie('sb-access-token', data.session.access_token);
        setCookie('user-role', role);
      }
      
      return data;
    } catch (err) {
      throw err;
    }
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    deleteCookie('sb-access-token');
    deleteCookie('user-role');
  },

  resetPasswordForEmail: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) throw error;
    return data;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setCookie('sb-access-token', session.access_token);
        setCookie('user-role', session.user.user_metadata?.role || 'citizen');
      } else {
        deleteCookie('sb-access-token');
        deleteCookie('user-role');
      }
      callback(event, session);
    });
    return subscription;
  }
};
