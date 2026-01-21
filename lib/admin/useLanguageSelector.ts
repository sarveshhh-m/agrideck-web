'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseLanguageSelectorOptions {
  defaultLanguage?: string;
}

export function useLanguageSelector({ defaultLanguage = 'en' }: UseLanguageSelectorOptions = {}) {
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLanguages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('code, name')
        .order('code');

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const selectedLang = languages.find(l => l.code === selectedLanguage);

  return {
    languages,
    selectedLanguage,
    selectedLang,
    setSelectedLanguage,
    loading,
    refetch: fetchLanguages,
  };
}
