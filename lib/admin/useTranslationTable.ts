'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database';

interface UseTranslationTableOptions {
  table: string;
  translationsKey: string;
  selectFields?: string;
  orderBy?: string;
}

export function useTranslationTable({
  table,
  translationsKey,
  selectFields = '*',
  orderBy = 'name',
}: UseTranslationTableOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fetchError } = await supabase
        .from(table)
        .select(
          `
          ${selectFields},
          ${translationsKey} (*)
        `
        )
        .order(orderBy);

      if (fetchError) throw fetchError;
      setData(result || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error(`Error fetching ${table}:`, error);
    } finally {
      setLoading(false);
    }
  }, [table, translationsKey, selectFields, orderBy, supabase]);

  const updateLocalItem = useCallback((itemId: number, updates: Partial<any>) => {
    setData(prev =>
      prev.map(item => (item.id === itemId ? { ...item, ...updates } : item))
    );
  }, []);

  const updateLocalTranslation = useCallback((
    itemId: number,
    languageCode: string,
    updates: Partial<any>
  ) => {
    setData(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;

        const translations = item[translationsKey] || [];
        const existingTranslation = translations.find(
          (t: any) => t.language_code === languageCode
        );

        if (existingTranslation) {
          return {
            ...item,
            [translationsKey]: translations.map((t: any) =>
              t.language_code === languageCode ? { ...t, ...updates } : t
            ),
          };
        }

        return {
          ...item,
          [translationsKey]: [
            ...translations,
            { language_code: languageCode, ...updates, needs_review: true },
          ],
        };
      })
    );
  }, [translationsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    updateLocalItem,
    updateLocalTranslation,
  };
}
