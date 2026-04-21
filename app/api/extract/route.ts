import { NextRequest, NextResponse } from "next/server";
import { generateFlashcards } from "@/lib/aiService";
import { supabaseAdmin } from "@/lib/supabaseService";
import { ExtractionRequest } from "@/types";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storagePath, imageUrls, topic, curriculum, ...extractParams } = body;

    let finalImageUrls: string[] = imageUrls || [];

    // If a storage path was provided, download it to get the image/PDF
    if (storagePath) {
      console.log("API: Handling storage path flow...");
      const { data, error } = await supabaseAdmin.storage
        .from("source-materials")
        .download(storagePath);

      if (error) throw new Error(`Storage download failed: ${error.message}`);
      
      // Convert buffer to base64 for the vision model
      const buffer = Buffer.from(await data.arrayBuffer());
      const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      finalImageUrls.push(base64Image);
    }

    console.log(`API: Processing extraction for ${finalImageUrls.length} images...`);

    // 1. Generate Flashcards using AI
    const rawCards = await generateFlashcards({
      topic,
      curriculum,
      ...extractParams
    }, finalImageUrls);

    // Enrich cards
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

    // 2. Create Deck in Supabase
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
