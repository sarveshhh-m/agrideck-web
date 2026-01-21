'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type MutationType = 'insert' | 'update' | 'delete';

export function useDataMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const mutate = async <T extends Record<string, any>>(
    type: MutationType,
    table: string,
    data?: T,
    id?: string | number
  ) => {
    setLoading(true);
    setError(null);

    try {
      let result;

      if (type === 'insert') {
        result = await supabase.from(table).insert(data).select().single();
      } else if (type === 'update') {
        result = await supabase.from(table).update(data).eq('id', id).select().single();
      } else if (type === 'delete') {
        result = await supabase.from(table).delete().eq('id', id);
      }

      if (result?.error) throw result.error;
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
