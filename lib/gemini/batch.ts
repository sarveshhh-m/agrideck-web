import { geminiClient, isConfigured } from './client';

interface ApiError {
  error?: {
    code?: number;
    status?: string;
    message?: string;
  };
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'error' in error;
}

export interface CommodityTranslationItem {
  id: number;
  name: string;
}

export interface MandiTranslationItem {
  id: number;
  name: string;
  district: string;
}

export interface StateTranslationItem {
  id: number;
  name: string;
}

export async function generateBatchCommodityTranslations(
  items: CommodityTranslationItem[],
  targetLanguage: string,
  languageName: string
): Promise<{ id: number; translation: string }[]> {
  if (!isConfigured() || !geminiClient) {
    throw new Error('Gemini API is not configured');
  }

  if (items.length === 0) return [];

  console.log(`[Gemini] Batch translating ${items.length} commodities to ${languageName} (${targetLanguage})`);

  const itemsList = items.map((item, index) => `${index + 1}. ${item.name}`).join('\n');

   const prompt = `You are a translation expert for agricultural commodities in India.

Translate the following ${items.length} commodity names from English to ${languageName} (${targetLanguage}):

${itemsList}

IMPORTANT INSTRUCTIONS:
1. If the commodity can be properly translated to ${languageName}, provide the accurate translation.
2. If the commodity name is a proper noun, local variety name, or cannot be meaningfully translated (like specific crop varieties), write it phonetically using ONLY ${languageName} script characters - no English letters should appear in the result.
3. Always attempt to provide some form of the name in ${languageName} - never return empty unless the commodity name itself is completely unclear.

Return the response in JSON format:
[
  {"index": 1, "translation": "translated or phonetic name 1"},
  {"index": 2, "translation": "translated or phonetic name 2"},
  ...
]

Return only the JSON array, no explanation.`;

  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 1000,
      },
    });

    const text = response.text || '';
    console.log(`[Gemini] Raw response:`, text);

    const cleanedText = text
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    console.log(`[Gemini] Cleaned response:`, cleanedText);

    const parsed = JSON.parse(cleanedText);
    console.log(`[Gemini] Parsed response:`, parsed);

    return items.map((item, index) => ({
      id: item.id,
      translation: parsed[index]?.translation?.trim() || '',
    }));
  } catch (error) {
    console.error('[Gemini] Mandi batch translation failed:', error);
    throw error;
  }
}

export async function generateBatchStateTranslations(
  items: StateTranslationItem[],
  targetLanguage: string,
  languageName: string
): Promise<{ id: number; translation: string }[]> {
  if (!isConfigured() || !geminiClient) {
    throw new Error('Gemini API is not configured');
  }

  if (items.length === 0) return [];

  console.log(`[Gemini] Batch translating ${items.length} states to ${languageName} (${targetLanguage})`);

  const itemsList = items.map((item, index) => `${index + 1}. ${item.name}`).join('\n');

  const prompt = `You are a translation expert for Indian state names.

Translate the following ${items.length} state names from English to ${languageName} (${targetLanguage}):

${itemsList}

IMPORTANT INSTRUCTIONS:
1. If the state name can be properly translated to ${languageName}, provide the accurate translation.
2. If the state name is a proper noun or local name that cannot be meaningfully translated, write it phonetically using ONLY ${languageName} script characters - no English letters should appear in the result.
3. Always attempt to provide some form of the name in ${languageName} - never return empty unless the state name itself is completely unclear.

Return the response in JSON format:
[
  {"index": 1, "translation": "translated or phonetic name 1"},
  {"index": 2, "translation": "translated or phonetic name 2"},
  ...
]

Return only the JSON array, no explanation.`;

  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 1000,
      },
    });

    const text = response.text || '';
    console.log(`[Gemini] Raw response:`, text);

    const cleanedText = text
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    console.log(`[Gemini] Cleaned response:`, cleanedText);

    const parsed = JSON.parse(cleanedText);
    console.log(`[Gemini] Parsed response:`, parsed);

    return items.map((item, index) => ({
      id: item.id,
      translation: parsed[index]?.translation?.trim() || '',
    }));
  } catch (error) {
    console.error('[Gemini] Batch state translation failed:', error);
    throw error;
  }
}

export async function generateBatchMandiTranslations(
  items: MandiTranslationItem[],
  targetLanguage: string,
  languageName: string
): Promise<{ id: number; name: string; district: string }[]> {
  if (!isConfigured() || !geminiClient) {
    throw new Error('Gemini API is not configured');
  }

  if (items.length === 0) return [];

  console.log(`[Gemini] Batch translating ${items.length} mandis to ${languageName} (${targetLanguage})`);

  const itemsList = items.map((item, index) => 
    `${index + 1}. Mandi: ${item.name}, District: ${item.district}`
  ).join('\n');

   const prompt = `You are a translation expert for agricultural market places (mandis) in India.

Translate the following ${items.length} mandi names and districts from English to ${languageName} (${targetLanguage}):

IMPORTANT RULES:
1. If the mandi name contains "APMC" (Agricultural Produce Market Committee), REMOVE it from the translation.
   - Example: "Achampet APMC" → translate only "Achampet" not "Achampet APMC"
   - Example: "Kolkata APMC" → translate only "Kolkata"
2. Translate only the actual place/mandi name
3. Keep district names natural and accurate
4. If a place name is a proper noun or local name that cannot be meaningfully translated, write it phonetically using ONLY ${languageName} script characters - no English letters should appear in the result.
5. Always attempt to provide some form of the names in ${languageName} - never return empty unless the name itself is completely unclear.

${itemsList}

Return the response in JSON format:
[
  {"index": 1, "name": "translated or phonetic name (without APMC)", "district": "translated or phonetic district"},
  {"index": 2, "name": "translated or phonetic name (without APMC)", "district": "translated or phonetic district"},
  ...
]

Return only the JSON array, no explanation.`;

  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 1500,
      },
    });

    const text = response.text || '';
    console.log(`[Gemini] Raw response:`, text);

    const cleanedText = text
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    console.log(`[Gemini] Cleaned response:`, cleanedText);

    const parsed = JSON.parse(cleanedText);
    console.log(`[Gemini] Parsed response:`, parsed);

    return items.map((item, index) => ({
      id: item.id,
      name: parsed[index]?.name?.trim() || '',
      district: parsed[index]?.district?.trim() || '',
    }));
  } catch (error) {
    console.error('[Gemini] Batch mandi translation failed:', error);
    throw error;
  }
}
