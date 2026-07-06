import { supabase } from '../lib/supabaseClient';
import { storageService } from './storageService';

export interface SuggestionInput {
  title: string;
  category: string;
  description: string;
  urgency: string;
  state: string;
  district: string;
  block?: string;
  village?: string;
  estimated_beneficiaries?: number;
  location_lat?: number;
  location_lng?: number;
}

export const suggestionService = {
  fetchSuggestions: async (filters?: { citizen_id?: string; category?: string; district?: string }) => {
    let query = supabase
      .from('suggestions')
      .select(`
        *,
        ai_analysis(*),
        ai_priority_scores(*)
      `);

    if (filters?.citizen_id) {
      query = query.eq('citizen_id', filters.citizen_id);
    }
    if (filters?.category) {
      // Direct category string matching or matching resolved profiles
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  submitSuggestion: async (citizenId: string, suggestion: SuggestionInput, file?: File) => {
    // 1. Resolve Category ID (Insert if not exists)
    let categoryId = 1;
    try {
      const { data: catData } = await supabase
        .from('suggestion_categories')
        .select('id')
        .eq('name', suggestion.category)
        .maybeSingle();

      if (catData) {
        categoryId = catData.id;
      } else {
        const { data: newCat } = await supabase
          .from('suggestion_categories')
          .insert({ name: suggestion.category })
          .select('id')
          .single();
        if (newCat) categoryId = newCat.id;
      }
    } catch {
      // Default fallback id
    }

    // 2. Insert suggestion
    const { data: suggData, error: suggErr } = await supabase
      .from('suggestions')
      .insert({
        citizen_id: citizenId,
        title: suggestion.title,
        category_id: categoryId,
        description: suggestion.description,
        location_lat: suggestion.location_lat,
        location_lng: suggestion.location_lng,
        urgency: (suggestion.urgency || 'medium').toLowerCase(),
        estimated_beneficiaries: Number(suggestion.estimated_beneficiaries) || 0,
        status: 'submitted'
      })
      .select()
      .single();

    if (suggErr) throw suggErr;

    // 3. Handle File Upload
    if (file) {
      const path = `${suggData.id}/${Date.now()}_${file.name}`;
      const bucket = file.type.startsWith('video/') ? 'suggestion-videos' : 'suggestion-images';
      const fileUrl = await storageService.uploadFile(bucket, path, file);
      
      await supabase
        .from('attachments')
        .insert({
          suggestion_id: suggData.id,
          file_url: fileUrl,
          file_type: file.type.startsWith('video/') ? 'video' : 'image'
        });
    }

    return suggData;
  },

  deleteSuggestion: async (suggestionId: string) => {
    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', suggestionId);
      
    if (error) throw error;
  }
};
