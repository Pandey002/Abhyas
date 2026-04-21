import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseService';
import { generateFlashcards } from '@/lib/aiService';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { storagePath, topic, intent, curriculum } = await req.json();

    if (!storagePath) {
      return NextResponse.json({ error: 'No storage path provided' }, { status: 400 });
    }

    console.log('API: Processing large PDF from storage:', storagePath);

    // 1. Download file from Supabase Storage using Admin Client
    const { data: fileBuffer, error: downloadError } = await supabaseAdmin
      .storage
      .from('source-materials')
      .download(storagePath);

    if (downloadError) {
      console.error('API: Storage Download Error:', downloadError);
      throw new Error(`STORAGE_DOWNLOAD_ERROR: ${downloadError.message}`);
    }

    const buffer = Buffer.from(await fileBuffer.arrayBuffer());

    // 2. Process PDF and generate cards using native Gemini PDF support
    console.log('API: Starting Native Gemini PDF processing...');
    const rawCards = await generateFlashcards({
      topic,
      intent,
      content: "", // We pass buffer instead
      curriculum
    }, buffer);
    
    console.log('API: AI Processing complete. Generated', rawCards.length, 'cards.');

    // Enrich cards with defaults (Since we bypassed ingestion.ts)
    const cards = rawCards.map(card => ({
      id: uuidv4(),
      front: card.front || "Empty Question",
      back: card.back || "Empty Answer",
      type: (card.type as any) || "concept",
      tags: card.tags || [],
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      status: "not_started",
      totalReviews: 0,
      nextReviewDate: new Date().toISOString().slice(0, 10),
      lastReviewDate: null,
      deckId: "",
      createdAt: new Date().toISOString()
    }));

    // 3. Create Deck in Supabase
    console.log('API: Creating deck in Supabase...');
    const { data: deck, error: deckError } = await supabaseAdmin
      .from('decks')
      .insert({
        title: topic,
        subject: 'General', 
        card_count: cards.length,
        curriculum: curriculum
      })
      .select()
      .single();

    if (deckError) {
      console.error('API: Supabase Deck Error:', deckError);
      throw deckError;
    }

    // 4. Save Cards to Supabase
    console.log('API: Saving cards to Supabase...');
    const { error: cardError } = await supabaseAdmin
      .from('flashcards')
      .insert(cards.map(card => ({
        id: card.id,
        deck_id: deck.id,
        front: card.front,
        back: card.back,
        type: card.type,
        tags: card.tags,
        ease_factor: card.easeFactor,
        interval_days: card.intervalDays,
        repetitions: card.repetitions,
        status: card.status,
        total_reviews: card.totalReviews,
        next_review_date: card.nextReviewDate,
        last_review_date: card.lastReviewDate,
        created_at: card.createdAt
      })));

    if (cardError) throw cardError;

    // 5. Cleanup: Delete the source file from storage after processing
    console.log('API: Cleaning up storage file...');
    await supabaseAdmin.storage.from('source-materials').remove([storagePath]);

    return NextResponse.json({ 
      success: true, 
      deckId: deck.id, 
      cardCount: cards.length 
    });

  } catch (error: any) {
    console.error('Extraction Error:', error);
    // Determine the source of the error for better debugging
    let errorSource = 'INTERNAL_ERROR';
    if (error.message?.includes('PDF')) errorSource = 'PDF_PROCESSING_ERROR';
    if (error.message?.includes('Gemini') || error.message?.includes('AI')) errorSource = 'AI_SERVICE_ERROR';
    if (error.code) errorSource = `SUPABASE_ERROR_${error.code}`;

    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      source: errorSource
    }, { status: 500 });
  }
}
