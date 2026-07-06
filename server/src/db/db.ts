import { createClient } from '@supabase/supabase-js';
import { mockDb, Profile, Suggestion, MediaAttachment, TimelineEvent, UserBadge } from './mockDb';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let isServiceRole = false;
try {
  const payload = JSON.parse(Buffer.from(supabaseKey.split('.')[1], 'base64').toString());
  isServiceRole = payload.role === 'service_role';
} catch (e) {
  // Ignore
}

// We require a true service role key for the backend to bypass RLS.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && isServiceRole);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

if (isSupabaseConfigured) {
  console.log('Database connected: Supabase PostgreSQL is active.');
} else {
  console.log('Database connected: Supabase credentials not found. Falling back to in-memory database.');
}

export const db = {
  getProfile: async (id: string): Promise<Profile | null> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        // Fallback to mock profiles in case profile is just in memory during development
        return mockDb.getProfile(id);
      }
      return data;
    }
    return mockDb.getProfile(id);
  },

  upsertProfile: async (profile: Partial<Profile> & { id: string }): Promise<Profile> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) {
        console.error('Supabase profile upsert error, using mockDb fallback:', error.message);
        return mockDb.upsertProfile(profile);
      }
      return data;
    }
    return mockDb.upsertProfile(profile);
  },

  getSuggestions: async (filters?: { citizen_id?: string; category?: string; district?: string }): Promise<Suggestion[]> => {
    if (supabase) {
      let query = supabase.from('suggestions').select('*');
      if (filters?.citizen_id) {
        query = query.eq('citizen_id', filters.citizen_id);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.district) {
        query = query.ilike('district', filters.district);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase suggestions fetch error, using mockDb fallback:', error.message);
        return mockDb.getSuggestions(filters);
      }
      return data || [];
    }
    return mockDb.getSuggestions(filters);
  },

  getSuggestionById: async (id: string): Promise<Suggestion | null> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        return mockDb.getSuggestionById(id);
      }
      return data;
    }
    return mockDb.getSuggestionById(id);
  },

  createSuggestion: async (suggestion: Omit<Suggestion, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Suggestion> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('suggestions')
        .insert({
          ...suggestion,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase suggestion creation error, using mockDb fallback:', error.message);
        return mockDb.createSuggestion(suggestion);
      }

      // Add timeline event
      await supabase.from('timeline_events').insert({
        suggestion_id: data.id,
        status: data.status || 'submitted',
        notes: 'Development suggestion successfully registered.'
      });

      return data;
    }
    return mockDb.createSuggestion(suggestion);
  },

  addMediaAttachment: async (attachment: Omit<MediaAttachment, 'id' | 'created_at'>): Promise<MediaAttachment> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('media_attachments')
        .insert(attachment)
        .select()
        .single();
      if (error) {
        console.error('Supabase attachment insertion error, using mockDb fallback:', error.message);
        return mockDb.addMediaAttachment(attachment);
      }
      return data;
    }
    return mockDb.addMediaAttachment(attachment);
  },

  getMediaAttachments: async (suggestionId: string): Promise<MediaAttachment[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('media_attachments')
        .select('*')
        .eq('suggestion_id', suggestionId);
      if (error) {
        return mockDb.getMediaAttachments(suggestionId);
      }
      return data || [];
    }
    return mockDb.getMediaAttachments(suggestionId);
  },

  getTimelineEvents: async (suggestionId: string): Promise<TimelineEvent[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('suggestion_id', suggestionId)
        .order('created_at', { ascending: true });
      if (error) {
        return mockDb.getTimelineEvents(suggestionId);
      }
      return data || [];
    }
    return mockDb.getTimelineEvents(suggestionId);
  },

  addTimelineEvent: async (event: Omit<TimelineEvent, 'id' | 'created_at'>): Promise<TimelineEvent> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('timeline_events')
        .insert(event)
        .select()
        .single();
      if (error) {
        console.error('Supabase timeline insertion error, using mockDb fallback:', error.message);
        return mockDb.addTimelineEvent(event);
      }
      // Keep suggestion status in sync
      await supabase
        .from('suggestions')
        .update({ status: event.status, updated_at: new Date().toISOString() })
        .eq('id', event.suggestion_id);
        
      return data;
    }
    return mockDb.addTimelineEvent(event);
  },

  getUserBadges: async (userId: string): Promise<UserBadge[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);
      if (error) {
        return mockDb.getUserBadges(userId);
      }
      return data || [];
    }
    return mockDb.getUserBadges(userId);
  },

  addBadge: async (userId: string, badgeType: UserBadge['badge_type']): Promise<UserBadge> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({ user_id: userId, badge_type: badgeType })
        .select()
        .single();
      if (error) {
        console.error('Supabase badge addition error, using mockDb fallback:', error.message);
        return mockDb.addBadge(userId, badgeType);
      }
      await db.incrementScore(userId, 50);
      return data;
    }
    return mockDb.addBadge(userId, badgeType);
  },

  incrementScore: async (userId: string, points: number): Promise<number> => {
    if (supabase) {
      // First fetch
      const profile = await db.getProfile(userId);
      if (profile) {
        const newScore = (profile.contribution_score || 0) + points;
        const { error } = await supabase
          .from('profiles')
          .update({ contribution_score: newScore })
          .eq('id', userId);
        if (error) {
          console.error('Supabase score increment error, using mockDb fallback:', error.message);
          return mockDb.incrementScore(userId, points);
        }
        return newScore;
      }
      return 0;
    }
    return mockDb.incrementScore(userId, points);
  }
};
