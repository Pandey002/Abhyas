import { NextRequest, NextResponse } from 'next/server';
import { processPDF } from '@/lib/ingestion';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const topic = formData.get('topic') as string || 'Untitled Archive';
    const intent = (formData.get('intent') as 'quick' | 'deep') || 'quick';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('API: Received file:', file.name, 'topic:', topic, 'intent:', intent);
    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Process PDF and generate cards
    console.log('API: Starting PDF processing...');
    const cards = await processPDF(buffer, topic, intent);
    console.log('API: Processing complete. Generated', cards.length, 'cards.');

    // 2. Create Deck in Supabase
    console.log('API: Creating deck in Supabase...');
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .insert({
        title: topic,
        subject: 'General', 
        card_count: cards.length
      })
      .select()
      .single();

    if (deckError) {
      console.error('API: Supabase Deck Error:', deckError);
      throw deckError;
    }
    console.log('API: Deck created with ID:', deck.id);

    // 3. Save Cards to Supabase
    console.log('API: Saving cards to Supabase...');
    const { error: cardError } = await supabase
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

    if (cardError) {
      console.error('API: Supabase Card Error:', cardError);
      throw cardError;
    }
    console.log('API: All cards saved successfully.');

    return NextResponse.json({ 
      success: true, 
      deckId: deck.id, 
      cardCount: cards.length 
    });

  } catch (error: any) {
    console.error('Extraction Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
