"use client";

import React, { useState, useEffect } from 'react';
import ReviewSession from '@/components/study/ReviewSession';
import { supabase } from '@/lib/supabaseClient';
import { Flashcard } from '@/types';

import { use } from 'react';

export default function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [deck, setDeck] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessionData();
  }, [id]);

  const fetchSessionData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Deck info
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .select('*')
        .eq('id', id)
        .single();

      if (deckError) throw deckError;
      setDeck(deckData);

      // 2. Fetch Cards for this deck
      const { data: cardData, error: cardError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', id)
        .order('created_at', { ascending: true });

      if (cardError) throw cardError;
      
      const mappedCards: Flashcard[] = (cardData || []).map(dbCard => ({
        id: dbCard.id,
        deckId: dbCard.deck_id,
        front: dbCard.front,
        back: dbCard.back,
        type: dbCard.type,
        tags: dbCard.tags,
        easeFactor: dbCard.ease_factor,
        intervalDays: dbCard.interval_days,
        repetitions: dbCard.repetitions,
        status: dbCard.status,
        totalReviews: dbCard.total_reviews,
        nextReviewDate: dbCard.next_review_date,
        lastReviewDate: dbCard.last_review_date,
        createdAt: dbCard.created_at
      }));

      setCards(mappedCards);
    } catch (error) {
      console.error("Error fetching study session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionComplete = async (updatedCards: Flashcard[]) => {
    // Implement persistence to Supabase for the entire deck
    try {
      const { error } = await supabase
        .from('flashcards')
        .upsert(updatedCards.map(card => ({
          id: card.id,
          deck_id: card.deckId,
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

      if (error) throw error;
      console.log("Progress saved to Supabase.");
    } catch (error) {
      console.error("Failed to save session progress:", error);
    }
  };

  if (isLoading) return <div className="container p-8">Initializing Session...</div>;
  
  if (!deck || cards.length === 0) {
    return (
      <div className="container p-8 text-center">
        <h2 className="brand mb-4">No Fragments Found</h2>
        <p className="color-grey-mid">This archive is currently empty or doesn't exist.</p>
      </div>
    );
  }

  return (
    <ReviewSession 
      deckTitle={deck.title} 
      cards={cards} 
      onComplete={handleSessionComplete}
    />
  );
}
