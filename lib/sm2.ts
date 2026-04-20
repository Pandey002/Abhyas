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
 * SM-2 Algorithm Implementation
 * Quality: 1 (Forgot), 2 (Hard), 4 (Good), 5 (Easy)
 */
export function calculateNextReview(card: Flashcard, rating: Rating): Flashcard {
  const today = new Date();
  const quality = rating;
  let { easeFactor, intervalDays, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else if (repetitions === 0) {
    repetitions = 1;
    intervalDays = 1;
  } else if (repetitions === 1) {
    repetitions = 2;
    intervalDays = 6;
  } else {
    repetitions += 1;
    intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
  }

  easeFactor = Math.max(
    MIN_EASE_FACTOR, 
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return {
    ...card,
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    repetitions,
    lastReviewDate: formatDate(today),
    nextReviewDate: formatDate(addDays(today, intervalDays))
  };
}

export function isDueToday(card: Flashcard) {
  const today = formatDate(new Date());
  return card.nextReviewDate <= today;
}
