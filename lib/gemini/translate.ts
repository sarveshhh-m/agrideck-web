import { geminiClient, isConfigured } from './client';

export interface TranslationOptions {
  name: string;
  targetLanguage: string;
  languageName: string;
  context?: string;
}

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

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateContentWithRetry(
  prompt: string,
  maxTokens: number = 50,
  retries: number = 3
): Promise<string> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`[Gemini] Attempt ${attempt + 1}/${retries}...`);
      console.log(`[Gemini] Prompt: ${prompt.substring(0, 100)}...`);
      
      const response = await geminiClient!.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: maxTokens,
        },
      });

      console.log(`[Gemini] Response received:`, response);
      console.log(`[Gemini] Response text:`, response.text);
      
      return response.text?.trim() || '';
    } catch (error) {
      lastError = error;
      console.error(`[Gemini] Attempt ${attempt + 1} failed:`, error);
      
      if (isApiError(error) && error.error?.code === 429) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`[Gemini] Rate limited, retrying in ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }
      
      throw error;
    }
  }
  
  console.error('[Gemini] All retries failed:', lastError);
  throw lastError;
}

export async function generateTranslation(
  options: TranslationOptions
): Promise<string> {
  if (!isConfigured() || !geminiClient) {
    const error = new Error('Gemini API is not configured. Please set GEMINI_API_KEY in .env.local');
    console.error('[Gemini]', error.message);
    throw error;
  }

  const { name, targetLanguage, languageName, context } = options;

  console.log(`[Gemini] Generating translation for "${name}" to ${languageName} (${targetLanguage})`);

   const prompt = `You are a translation expert for agricultural commodities in India.

Translate the commodity name from English to ${languageName} (${targetLanguage}).

Original: ${name}
${context ? `Context: ${context}` : ''}

IMPORTANT INSTRUCTIONS:
1. If the commodity can be properly translated to ${languageName}, provide the accurate translation.
2. If the commodity name is a proper noun, local variety name, or cannot be meaningfully translated (like specific crop varieties), write it phonetically using ONLY ${languageName} script characters - no English letters should appear in the result.
3. Always attempt to provide some form of the name in ${languageName} - never return empty unless the commodity name itself is completely unclear.

Return only the translation, no explanation.`;

  try {
    const translation = await generateContentWithRetry(prompt, 50, 3);
    console.log(`[Gemini] Translation result: "${translation}"`);
    return translation;
  } catch (error) {
    console.error('[Gemini] Translation failed:', error);
    
    if (isApiError(error)) {
      console.error('[Gemini] API Error details:', {
        code: error.error?.code,
        status: error.error?.status,
        message: error.error?.message
      });
    }
    
    if (isApiError(error) && error.error?.code === 429) {
      throw new Error('Quota exceeded. Please try again later or add billing to your Google Cloud project.');
    }
    
    throw error;
  }
}

export async function generateMandiTranslation(
  name: string,
  district: string,
  targetLanguage: string,
  languageName: string
): Promise<{ name: string; district: string }> {
  if (!isConfigured() || !geminiClient) {
    const error = new Error('Gemini API is not configured. Please set GEMINI_API_KEY in .env.local');
    console.error('[Gemini]', error.message);
    throw error;
  }

  console.log(`[Gemini] Generating mandi translation for "${name}" (${district}) to ${languageName} (${targetLanguage})`);

   const prompt = `You are a translation expert for agricultural market places (mandis) in India.

IMPORTANT: If the mandi name contains "APMC" (Agricultural Produce Market Committee), REMOVE it from the translation.
- Example: "Achampet APMC" → translate only "Achampet"
- Example: "Kolkata APMC" → translate only "Kolkata"

Translate the mandi name and district from English to ${languageName} (${targetLanguage}).

Mandi: ${name}
District: ${district}

ADDITIONAL INSTRUCTIONS:
4. If a place name is a proper noun or local name that cannot be meaningfully translated, write it phonetically using ONLY ${languageName} script characters - no English letters should appear in the result.
5. Always attempt to provide some form of the names in ${languageName} - never return empty unless the name itself is completely unclear.

Return the response in JSON format:
{"name": "translated or phonetic name (without APMC)", "district": "translated or phonetic district"}

Return only the JSON, no explanation.`;

  try {
    const text = await generateContentWithRetry(prompt, 100, 3);
    console.log(`[Gemini] Raw response:`, text);

    try {
      const cleanedText = text
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      console.log(`[Gemini] Cleaned response:`, cleanedText);
      
      const parsed = JSON.parse(cleanedText);
      console.log(`[Gemini] Parsed response:`, parsed);
      return {
        name: parsed.name?.trim() || '',
        district: parsed.district?.trim() || '',
      };
    } catch (parseError) {
      console.error('[Gemini] Failed to parse JSON response:', parseError);
      return { name: '', district: '' };
    }
  } catch (error) {
    console.error('[Gemini] Mandi translation failed:', error);

    if (isApiError(error)) {
      console.error('[Gemini] API Error details:', {
        code: error.error?.code,
        status: error.error?.status,
        message: error.error?.message
      });
    }

    if (isApiError(error) && error.error?.code === 429) {
      throw new Error('Quota exceeded. Please try again later or add billing to your Google Cloud project.');
    }

    throw error;
  }
}

export async function generateStateTranslation(
  name: string,
  targetLanguage: string,
  languageName: string
): Promise<string> {
  if (!isConfigured() || !geminiClient) {
    const error = new Error('Gemini API is not configured. Please set GEMINI_API_KEY in .env.local');
    console.error('[Gemini]', error.message);
    throw error;
  }

  console.log(`[Gemini] Generating state translation for "${name}" to ${languageName} (${targetLanguage})`);

  const prompt = `You are a translation expert for Indian state names.

Translate the state name from English to ${languageName} (${targetLanguage}).

Original: ${name}

IMPORTANT INSTRUCTIONS:
1. If the state name can be properly translated to ${languageName}, provide the accurate translation.
2. If the state name is a proper noun or local name that cannot be meaningfully translated, write it phonetically using ONLY ${languageName} script characters - no English letters should appear in the result.
3. Always attempt to provide some form of the name in ${languageName} - never return empty unless the state name itself is completely unclear.

Return only the translation, no explanation.`;

  try {
    const translation = await generateContentWithRetry(prompt, 50, 3);
    console.log(`[Gemini] State translation result: "${translation}"`);
    return translation;
  } catch (error) {
    console.error('[Gemini] State translation failed:', error);

    if (isApiError(error)) {
      console.error('[Gemini] API Error details:', {
        code: error.error?.code,
        status: error.error?.status,
        message: error.error?.message
      });
    }

    if (isApiError(error) && error.error?.code === 429) {
      throw new Error('Quota exceeded. Please try again later or add billing to your Google Cloud project.');
    }

    throw error;
  }
}
