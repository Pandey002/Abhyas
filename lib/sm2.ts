import { Flashcard, Rating } from "@/types";

const MIN_EASE_FACTOR = 1.3;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Strict SM-2 Algorithm Implementation per user specification
 * Quality: 1 (Forgot), 2 (Hard), 4 (Good), 5 (Easy)
 */
export function calculateNextReview(card: Flashcard, rating: Rating): Flashcard {
  const today = new Date();
  
  let { easeFactor, intervalDays, repetitions, totalReviews } = card;
  let status = card.status;
  
  // Track this review
  totalReviews = (totalReviews || 0) + 1;

  if (rating === 1) { // Forgot
    repetitions = 0;
    intervalDays = 1;
    status = "shaky";
  } else if (rating === 2) { // Hard
    repetitions += 1;
    intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
    status = "shaky";
  } else if (rating === 4) { // Good
    repetitions += 1;
    intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.05); // -0.15 + 0.1
    status = repetitions >= 3 ? "mastered" : "shaky";
  } else if (rating === 5) { // Easy
    repetitions += 1;
    intervalDays = Math.max(1, Math.round(intervalDays * easeFactor * 1.3));
    easeFactor = Math.min(2.5, easeFactor + 0.15);
    status = "mastered";
  }

  // Fallback safety limits
  easeFactor = Number(easeFactor.toFixed(2));

  return {
    ...card,
    easeFactor,
    intervalDays,
    repetitions,
    status,
    totalReviews,
    lastReviewDate: formatDate(today),
    nextReviewDate: formatDate(addDays(today, intervalDays))
  };
}

export function isDueToday(card: Flashcard) {
  const today = formatDate(new Date());
  return card.nextReviewDate <= today;
}
