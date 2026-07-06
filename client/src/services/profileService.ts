import { supabase } from '../lib/supabaseClient';

export interface ProfileData {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  role: 'citizen' | 'mp' | 'admin';
  pincode?: string;
  language_preference?: string;
  contribution_score?: number;
  state?: string;
  district?: string;
  parliamentary_constituency?: string;
  assembly_constituency?: string;
  village_ward?: string;
  state_id?: number;
  district_id?: number;
  parliamentary_constituency_id?: number;
  assembly_constituency_id?: number;
  village_id?: number;
}

export const profileService = {
  getProfile: async (userId: string, role: 'citizen' | 'mp' | 'admin'): Promise<ProfileData> => {
    let tableName = 'citizen_profiles';
    if (role === 'mp') tableName = 'mp_profiles';
    if (role === 'admin') tableName = 'admin_profiles';

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return {
        id: userId,
        full_name: 'New User',
        role
      };
    }
    
    return { ...data, role };
  },

  updateProfile: async (userId: string, role: 'citizen' | 'mp' | 'admin', profileData: Partial<ProfileData>): Promise<ProfileData> => {
    let tableName = 'citizen_profiles';
    if (role === 'mp') tableName = 'mp_profiles';
    if (role === 'admin') tableName = 'admin_profiles';

    const updateData: Record<string, unknown> = {};
    Object.entries(profileData).forEach(([key, val]) => {
      if (key !== 'id' && key !== 'role') {
        updateData[key] = val;
      }
    });

    const { data, error } = await supabase
      .from(tableName)
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { ...data, role };
  }
};
