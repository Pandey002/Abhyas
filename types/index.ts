export type Rating = 1 | 2 | 4 | 5;

export type CardType = 
  | "concept" 
  | "formula" 
  | "date" 
  | "process" 
  | "definition" 
  | "relationship" 
  | "edge-case";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: CardType;
  tags: string[];
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  status: "not_started" | "shaky" | "mastered";
  totalReviews: number;
  nextReviewDate: string;
  lastReviewDate: string | null;
  deckId: string;
  createdAt: string;
}

export interface Deck {
  id: string;
  title: string;
  subject: string;
  description?: string;
  cardCount: number;
  curriculum?: string;
  lastStudiedAt?: string | null;
  reviewedToday?: number;
  createdAt: string;
}

export interface ExtractionRequest {
  topic: string;
  intent: 'quick' | 'deep';
  curriculum: string;
  content: string;
}
