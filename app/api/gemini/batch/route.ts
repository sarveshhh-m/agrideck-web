import { NextRequest, NextResponse } from 'next/server';
import { generateBatchCommodityTranslations, generateBatchMandiTranslations } from '@/lib/gemini/batch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, items, targetLanguage, languageName } = body;

    console.log(`[API Batch] Received request: type=${type}, items=${items?.length}, language=${targetLanguage}`);

    if (!type || !items || !targetLanguage || !languageName) {
      console.error('[API Batch] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type === 'commodity') {
      console.log(`[API Batch] Processing ${items.length} commodity translations`);
      const translations = await generateBatchCommodityTranslations(
        items,
        targetLanguage,
        languageName
      );
      console.log(`[API Batch] Commodity translations complete:`, translations);
      return NextResponse.json({ translations });
    }

    if (type === 'mandi') {
      console.log(`[API Batch] Processing ${items.length} mandi translations`);
      const translations = await generateBatchMandiTranslations(
        items,
        targetLanguage,
        languageName
      );
      console.log(`[API Batch] Mandi translations complete:`, translations);
      return NextResponse.json({ translations });
    }

    console.error('[API Batch] Invalid type:', type);
    return NextResponse.json(
      { error: 'Invalid translation type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API Batch] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate translations';
    console.error('[API Batch] Error message:', errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('Quota exceeded') ? 429 : 500 }
    );
  }
}
