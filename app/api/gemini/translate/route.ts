import { NextRequest, NextResponse } from 'next/server';
import { generateTranslation, generateMandiTranslation } from '@/lib/gemini/translate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    console.log(`[API] Received request: type=${type}`, data);

    if (type === 'commodity') {
      const { name, targetLanguage, languageName, context } = data;
      
      if (!name || !targetLanguage || !languageName) {
        console.error('[API] Missing required fields for commodity translation');
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      console.log(`[API] Calling generateTranslation for commodity: "${name}"`);
      const translation = await generateTranslation({
        name,
        targetLanguage,
        languageName,
        context,
      });

      console.log(`[API] Translation result: "${translation}"`);
      return NextResponse.json({ translation });
    }

    if (type === 'mandi') {
      const { name, district, targetLanguage, languageName } = data;
      
      if (!name || !targetLanguage || !languageName) {
        console.error('[API] Missing required fields for mandi translation');
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      console.log(`[API] Calling generateMandiTranslation for mandi: "${name}"`);
      const translation = await generateMandiTranslation(
        name,
        district || '',
        targetLanguage,
        languageName
      );

      console.log(`[API] Mandi translation result:`, translation);
      return NextResponse.json(translation);
    }

    console.error('[API] Invalid translation type:', type);
    return NextResponse.json(
      { error: 'Invalid translation type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] Translation API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate translation';
    console.error('[API] Error message:', errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Quota exceeded') ? 429 : 500 }
    );
  }
}
