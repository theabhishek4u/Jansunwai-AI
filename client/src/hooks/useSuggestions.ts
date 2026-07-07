import { useState, useEffect, useCallback } from 'react';
import { suggestionService, SuggestionInput } from '../services/suggestionService';

export interface Suggestion {
  id: string;
  complaint_number?: string;
  citizen_id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  category_id?: number;
  category?: { name: string } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_analysis?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_priority_scores?: any;
}

export function useSuggestions(filters?: { citizen_id?: string; category?: string; district?: string }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const citizenId = filters?.citizen_id;
  const categoryFilter = filters?.category;
  const districtFilter = filters?.district;

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await suggestionService.fetchSuggestions({
        citizen_id: citizenId,
        category: categoryFilter,
        district: districtFilter
      });
      setSuggestions(data as Suggestion[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch suggestions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [citizenId, categoryFilter, districtFilter]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const addSuggestionOptimistically = async (citizenIdVal: string, suggestion: SuggestionInput, file?: File) => {
    const tempId = `temp-${Date.now()}`;
    const tempSuggestion: Suggestion = {
      id: tempId,
      citizen_id: citizenIdVal,
      title: suggestion.title,
      description: suggestion.description,
      status: 'submitted',
      created_at: new Date().toISOString()
    };

    setSuggestions(prev => [tempSuggestion, ...prev]);

    try {
      const actualData = await suggestionService.submitSuggestion(citizenIdVal, suggestion, file);
      setSuggestions(prev => prev.map(s => s.id === tempId ? (actualData as Suggestion) : s));
      return actualData;
    } catch (err: unknown) {
      setSuggestions(prev => prev.filter(s => s.id !== tempId));
      throw err;
    }
  };

  return {
    suggestions,
    loading,
    error,
    refresh: fetchSuggestions,
    addSuggestionOptimistically
  };
}
