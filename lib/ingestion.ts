import pdf from 'pdf-parse/lib/pdf-parse.js';
import { cleanExtractedText } from './textCleaner';
import { generateFlashcards } from './aiService';
import { ExtractionRequest, Flashcard } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function processPDF(
  fileBuffer: Buffer, 
  topic: string, 
  intent: 'quick' | 'deep'
): Promise<Flashcard[]> {
  try {
    // 1. Extract raw text
    const data = await pdf(fileBuffer);
    const rawText = data.text;

    // 2. Clean text
    const cleanedText = cleanExtractedText(rawText);

    // 3. Generate cards via AI
    const rawCards = await generateFlashcards({
      topic,
      intent,
      content: cleanedText
    });

    // 4. Enrich cards with SM-2 defaults and IDs
    const enrichCards: Flashcard[] = rawCards.map(card => ({
      id: uuidv4(),
      front: card.front || "Empty Question",
      back: card.back || "Empty Answer",
      type: (card.type as any) || "concept",
      tags: card.tags || [],
      easeFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
      nextReviewDate: new Date().toISOString().slice(0, 10),
      lastReviewDate: null,
      deckId: "", // To be assigned by caller
      createdAt: new Date().toISOString()
    }));

    return enrichCards;
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw error;
  }
}
