import { useState, useCallback } from 'react';

interface UseGeminiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useGemini(options: UseGeminiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const translate = useCallback(async (
    type: 'commodity' | 'mandi',
    data: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const result = await response.json();
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const generateImage = useCallback(async (
    commodityName: string,
    style?: 'photorealistic' | 'illustration' | 'minimal'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commodityName, style }),
      });

      if (!response.ok) {
        throw new Error('Image generation failed');
      }

      const result = await response.json();
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    loading,
    error,
    translate,
    generateImage,
  };
}

export function useGeminiTranslation() {
  const { loading, error, translate } = useGemini();

  const translateCommodity = useCallback(
    async (
      name: string,
      targetLanguage: string,
      languageName: string,
      context?: string
    ) => {
      return translate('commodity', { name, targetLanguage, languageName, context });
    },
    [translate]
  );

  const translateMandi = useCallback(
    async (
      name: string,
      district: string,
      targetLanguage: string,
      languageName: string
    ) => {
      return translate('mandi', { name, district, targetLanguage, languageName });
    },
    [translate]
  );

  return {
    loading,
    error,
    translateCommodity,
    translateMandi,
  };
}

export function useGeminiImage() {
  const { loading, error, generateImage } = useGemini();

  return {
    loading,
    error,
    generateImage,
  };
}
