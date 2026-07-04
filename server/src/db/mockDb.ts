import { v4 as uuidv4 } from 'uuid';

export interface Profile {
  id: string;
  full_name: string;
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
  created_at: string;
  updated_at: string;
}

export interface Suggestion {
  id: string;
  citizen_id: string;
  title: string;
  category: string;
  description: string;
  location_lat?: number;
  location_lng?: number;
  village?: string;
  block?: string;
  district: string;
  state: string;
  estimated_beneficiaries: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'ai_processing' | 'duplicate_checked' | 'infra_analyzed' | 'demand_analyzed' | 'under_review' | 'accepted' | 'rejected' | 'planned' | 'completed';
  
  // AI Scores
  ai_score_completeness?: number;
  ai_score_impact?: 'low' | 'medium' | 'high' | 'critical' | 'Low' | 'Medium' | 'High' | 'Critical';
  ai_score_location_verified: boolean;
  ai_score_photo_verified: boolean;
  ai_score_confidence?: number;
  
  duplicate_of_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaAttachment {
  id: string;
  suggestion_id: string;
  file_url: string;
  file_type: 'image' | 'video' | 'voice' | 'pdf';
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  suggestion_id: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: 'top_contributor' | 'community_leader' | 'verified_citizen' | 'problem_solver';
  earned_at: string;
}

// In-Memory Arrays
let profiles: Profile[] = [
  {
    id: 'citizen-123',
    full_name: 'Aarav Sharma',
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
    role: 'citizen',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let suggestions: Suggestion[] = [
  {
    id: 'sugg-1',
    citizen_id: 'citizen-123',
    title: 'Primary Health Center lacks clean drinking water facility',
    category: 'PHC',
    description: 'The Primary Health Center in our block has no clean drinking water. Patients and doctors have to walk 500m to get drinking water from a public handpump.',
    location_lat: 25.3176,
    location_lng: 82.9739,
    village: 'Sigra',
    block: 'Kashi Vidyapeeth',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    estimated_beneficiaries: 1200,
    urgency: 'high',
    status: 'under_review',
    ai_score_completeness: 88,
    ai_score_impact: 'High',
    ai_score_location_verified: true,
    ai_score_photo_verified: true,
    ai_score_confidence: 94,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sugg-2',
    citizen_id: 'citizen-123',
    title: 'Damaged main road connecting Varanasi to local village school',
    category: 'Road',
    description: 'The main connecting road has developed deep potholes. During rain, it overflows with mud, making it impossible for kids to cycle to the high school. Multiple minor accidents have happened.',
    location_lat: 25.3210,
    location_lng: 82.9800,
    village: 'Sigra',
    block: 'Kashi Vidyapeeth',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    estimated_beneficiaries: 3000,
    urgency: 'critical',
    status: 'completed',
    ai_score_completeness: 95,
    ai_score_impact: 'High',
    ai_score_location_verified: true,
    ai_score_photo_verified: true,
    ai_score_confidence: 98,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let mediaAttachments: MediaAttachment[] = [
  {
    id: 'media-1',
    suggestion_id: 'sugg-1',
    file_url: 'https://images.unsplash.com/photo-1590247813693-5541f1c609fd?q=80&w=600&auto=format&fit=crop',
    file_type: 'image',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'media-2',
    suggestion_id: 'sugg-2',
    file_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
    file_type: 'image',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let timelineEvents: TimelineEvent[] = [
  {
    id: 't-1',
    suggestion_id: 'sugg-1',
    status: 'submitted',
    notes: 'Suggestion successfully submitted by citizen.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-2',
    suggestion_id: 'sugg-1',
    status: 'ai_processing',
    notes: 'Gemini completed initial validation and scoring.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-3',
    suggestion_id: 'sugg-1',
    status: 'duplicate_checked',
    notes: 'Duplicate verification complete. No duplicate reports found.',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-4',
    suggestion_id: 'sugg-1',
    status: 'under_review',
    notes: 'Forwarded to Varanasi Constituency Planning team for review.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Timeline for suggestion 2
  {
    id: 't-5',
    suggestion_id: 'sugg-2',
    status: 'submitted',
    notes: 'Suggestion submitted.',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-6',
    suggestion_id: 'sugg-2',
    status: 'under_review',
    notes: 'Reviewed by MP. Sent to Public Works Department (PWD).',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-7',
    suggestion_id: 'sugg-2',
    status: 'planned',
    notes: 'Budget sanctioned for road repairs under Rural Connect Scheme.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-8',
    suggestion_id: 'sugg-2',
    status: 'completed',
    notes: 'Road construction completed. Repaired 1.2km stretch leading to Sigra Primary High School.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let userBadges: UserBadge[] = [
  {
    id: 'badge-1',
    user_id: 'citizen-123',
    badge_type: 'verified_citizen',
    earned_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'badge-2',
    user_id: 'citizen-123',
    badge_type: 'problem_solver',
    earned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// DB Operations implementation
export const mockDb = {
  getProfile: async (id: string) => {
    return profiles.find(p => p.id === id) || null;
  },
  upsertProfile: async (profile: Partial<Profile> & { id: string }) => {
    const existingIdx = profiles.findIndex(p => p.id === profile.id);
    const now = new Date().toISOString();
    if (existingIdx > -1) {
      profiles[existingIdx] = { ...profiles[existingIdx], ...profile, updated_at: now } as Profile;
      return profiles[existingIdx];
    } else {
      const newProfile: Profile = {
        id: profile.id,
        full_name: profile.full_name || 'Anonymous',
        phone: profile.phone,
        state: profile.state || '',
        district: profile.district || '',
        parliamentary_constituency: profile.parliamentary_constituency || '',
        assembly_constituency: profile.assembly_constituency || '',
        village_ward: profile.village_ward,
        pincode: profile.pincode || '',
        language_preference: profile.language_preference || 'en',
        contribution_score: profile.contribution_score || 0,
        avatar_url: profile.avatar_url,
        role: profile.role || 'citizen',
        created_at: now,
        updated_at: now
      };
      profiles.push(newProfile);
      return newProfile;
    }
  },
  getSuggestions: async (filters?: { citizen_id?: string; category?: string; district?: string }) => {
    let list = [...suggestions];
    if (filters?.citizen_id) {
      list = list.filter(s => s.citizen_id === filters.citizen_id);
    }
    if (filters?.category) {
      list = list.filter(s => s.category === filters.category);
    }
    if (filters?.district) {
      list = list.filter(s => s.district.toLowerCase() === filters.district?.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  getSuggestionById: async (id: string) => {
    return suggestions.find(s => s.id === id) || null;
  },
  createSuggestion: async (sugg: Omit<Suggestion, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    const now = new Date().toISOString();
    const id = sugg.id || `sugg-${uuidv4()}`;
    const newSuggestion: Suggestion = {
      ...sugg,
      id,
      created_at: now,
      updated_at: now
    };
    suggestions.push(newSuggestion);
    
    // Auto insert first timeline event
    timelineEvents.push({
      id: `t-${uuidv4()}`,
      suggestion_id: id,
      status: sugg.status || 'submitted',
      notes: 'Development suggestion successfully registered.',
      created_at: now
    });

    return newSuggestion;
  },
  addMediaAttachment: async (att: Omit<MediaAttachment, 'id' | 'created_at'>) => {
    const newAtt: MediaAttachment = {
      ...att,
      id: `media-${uuidv4()}`,
      created_at: new Date().toISOString()
    };
    mediaAttachments.push(newAtt);
    return newAtt;
  },
  getMediaAttachments: async (suggestionId: string) => {
    return mediaAttachments.filter(m => m.suggestion_id === suggestionId);
  },
  getTimelineEvents: async (suggestionId: string) => {
    return timelineEvents
      .filter(t => t.suggestion_id === suggestionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },
  addTimelineEvent: async (event: Omit<TimelineEvent, 'id' | 'created_at'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `t-${uuidv4()}`,
      created_at: new Date().toISOString()
    };
    timelineEvents.push(newEvent);
    
    // Update suggestion status too
    const suggIdx = suggestions.findIndex(s => s.id === event.suggestion_id);
    if (suggIdx > -1 && event.status) {
      suggestions[suggIdx].status = event.status as any;
      suggestions[suggIdx].updated_at = new Date().toISOString();
    }
    return newEvent;
  },
  getUserBadges: async (userId: string) => {
    return userBadges.filter(b => b.user_id === userId);
  },
  addBadge: async (userId: string, badgeType: UserBadge['badge_type']) => {
    const existing = userBadges.find(b => b.user_id === userId && b.badge_type === badgeType);
    if (existing) return existing;
    const newBadge: UserBadge = {
      id: `badge-${uuidv4()}`,
      user_id: userId,
      badge_type: badgeType,
      earned_at: new Date().toISOString()
    };
    userBadges.push(newBadge);
    
    // Add timeline notification/notes or increment points
    await mockDb.incrementScore(userId, 50);
    return newBadge;
  },
  incrementScore: async (userId: string, points: number) => {
    const profile = profiles.find(p => p.id === userId);
    if (profile) {
      profile.contribution_score += points;
      profile.updated_at = new Date().toISOString();
      return profile.contribution_score;
    }
    return 0;
  }
};
