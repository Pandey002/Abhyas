"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Flashcard as FlashcardType, Rating } from '@/types';
import Flashcard from './Flashcard';
import AcademicBackground from './AcademicBackground';
import { calculateNextReview } from '@/lib/sm2';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, RotateCcw, Flame } from 'lucide-react';
import './ReviewSession.css';

interface ReviewSessionProps {
  deckTitle: string;
  cards: FlashcardType[];
  onComplete: (updatedCards: FlashcardType[]) => void;
}

const ReviewSession: React.FC<ReviewSessionProps> = ({ deckTitle, cards, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState<FlashcardType[]>(cards);
  const [isFinished, setIsFinished] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [streak, setStreak] = useState(1);
  const [streakUpdated, setStreakUpdated] = useState(false);

  // Stats for the completion screen
  const [masteredCount, setMasteredCount] = useState(0);

  const currentCard = sessionCards[currentIndex];
  // Progress bar spanning full width below navbar
  const progress = ((currentIndex) / sessionCards.length) * 100;

  useEffect(() => {
    // Component Mount: Fetch current streak
    supabase.from('global_settings').select('*').eq('id', 'default').single().then(({data}) => {
      if (data) setStreak(data.current_streak);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      // Space to flip
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
      
      // If flipped, allow rating
      if (isFlipped) {
        if (e.key === 'ArrowRight' || e.key === '1') handleRate(1);
        if (e.key === 'ArrowUp' || e.key === '2') handleRate(2);
        if (e.key === 'ArrowLeft' || e.key === '3') handleRate(4); // Good
        if (e.key === 'ArrowDown' || e.key === '4') handleRate(5); // Easy
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, isTransitioning]);

  const handleRate = async (rating: Rating) => {
    if (isTransitioning) return;
    
    // 1. Streak Update Logic (Only fires once per session if a day rolled over)
    if (!streakUpdated) {
      setStreakUpdated(true);
      const todayString = new Date().toISOString().slice(0, 10);
      try {
        const { data: settings } = await supabase.from('global_settings').select('*').eq('id', 'default').single();
        if (settings && settings.last_active_date !== todayString) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().slice(0, 10);
          
          const newStreak = settings.last_active_date === yesterdayString ? settings.current_streak + 1 : 1;
          
          await supabase.from('global_settings').update({
            current_streak: newStreak,
            last_active_date: todayString
          }).eq('id', 'default');
          
          setStreak(newStreak);
        }
      } catch(e) {}
    }

    // 2. Calculate next review
    const updatedCard = calculateNextReview(currentCard, rating);
    
    // 2. Debug Log per Specification
    console.log(`
      Card ID: ${updatedCard.id}
      New Status: ${updatedCard.status}
      New Repetitions: ${updatedCard.repetitions}
      New Total Reviews: ${updatedCard.totalReviews}
    `);

    // 3. Save to Supabase immediately (Persistence)
    supabase.from('flashcards').update({
      ease_factor: updatedCard.easeFactor,
      interval_days: updatedCard.intervalDays,
      repetitions: updatedCard.repetitions,
      status: updatedCard.status,
      total_reviews: updatedCard.totalReviews,
      last_review_date: updatedCard.lastReviewDate,
      next_review_date: updatedCard.nextReviewDate
    }).eq('id', updatedCard.id).then(({error}) => {
       if (error) console.error("Error saving card progress:", error);
    });

    // 4. Update stats
    if (updatedCard.status === 'mastered') setMasteredCount(prev => prev + 1);

    // 5. Update local state
    const newCards = [...sessionCards];
    newCards[currentIndex] = updatedCard;
    setSessionCards(newCards);

    // 6. Animation: Fly Up
    setAnimationClass('fly-up');
    setIsTransitioning(true);

    // 5. Confetti for all ratings
    const confettiColors = {
      1: ['#ef4444', '#fee2e2'], // Forgot: Red
      2: ['#f59e0b', '#fef3c7'], // Hard: Orange
      4: ['#3b82f6', '#dbeafe'], // Good: Blue
      5: ['#10b981', '#ffffff']  // Easy: Emerald
    };

    requestAnimationFrame(() => {
      confetti({
        particleCount: rating === 5 ? 100 : 40,
        spread: rating === 5 ? 70 : 50,
        origin: { y: 0.7 },
        colors: confettiColors[rating as keyof typeof confettiColors] || ['#888888']
      });
    });

    // 6. Transition to next card
    setTimeout(() => {
      if (currentIndex < sessionCards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
        setAnimationClass('slide-in-right');
        setIsTransitioning(false);
      } else {
        // Session Complete updates
        supabase.from('decks').update({
          last_studied_at: new Date().toISOString()
        }).eq('id', currentCard.deckId).then();

        setIsFinished(true);
        triggerFinalConfetti();
        onComplete(newCards);
      }
    }, 400);
  };

  const triggerFinalConfetti = () => {
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#e85d4a', '#1a1a2e']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#e85d4a', '#1a1a2e']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  if (isFinished) {
    return (
      <div className="review-session">
        <div className="completion-overlay">
          <h2 className="completion-title">Session Complete</h2>
          
          <div className="completion-stats">
            <div className="comp-stat-card">
              <span className="comp-stat-value">{sessionCards.length}</span>
              <span className="comp-stat-label">Reviewed</span>
            </div>
            <div className="comp-stat-card">
              <span className="comp-stat-value">{masteredCount}</span>
              <span className="comp-stat-label">Mastered</span>
            </div>
            <div className="comp-stat-card">
              <span className="comp-stat-value">{streak}</span>
              <span className="comp-stat-label">Day Streak</span>
            </div>
          </div>

          <div className="completion-actions">
            <Link href="/library" className="cta-button secondary">
              Back to Library
            </Link>
            <button className="cta-button" onClick={() => window.location.reload()}>
              <RotateCcw size={22} className="mr-2" /> Study Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-session">
      <AcademicBackground />
      {/* Top Bar */}
      <header className="study-header">
        <div className="header-left">
          <Link href="/library" className="back-link">
            <ArrowLeft size={28} />
          </Link>
          <h1 className="study-deck-title">{deckTitle}</h1>
        </div>
        
        <div className="header-right">
          <div className="session-stats">
            <span>{currentIndex + 1} / {sessionCards.length}</span>
            <div className="streak-pill">
              <Flame size={22} fill="currentColor" />
              <span>{streak}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Full width thin progress bar BELOW navbar */}
      <div className="progress-container-global">
        <div className="progress-bar-global" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Main Stage */}
      <main className="card-stage">
        <div className={`card-animation-wrapper ${animationClass}`}>
          <Flashcard 
            key={currentCard.id}
            front={currentCard.front} 
            back={currentCard.back} 
            type={currentCard.type}
            isFlipped={isFlipped}
            onFlip={() => !isTransitioning && setIsFlipped(!isFlipped)}
          />
        </div>
      </main>

      {/* Controls Container */}
      <div className="study-controls">
        {!isFlipped ? (
           <button className="reveal-btn" onClick={() => setIsFlipped(true)}>
             Reveal Answer
           </button>
        ) : (
          <div className="rating-row">
            <button className="rating-button btn-forgot" onClick={() => handleRate(1)}>Forgot</button>
            <button className="rating-button btn-hard" onClick={() => handleRate(2)}>Hard</button>
            <button className="rating-button btn-good" onClick={() => handleRate(4)}>Good</button>
            <button className="rating-button btn-easy" onClick={() => handleRate(5)}>Easy</button>
          </div>
        )}
        
        <div className="keyboard-hints">
           {isFlipped 
             ? "Press 1 (Forgot), 2 (Hard), 3 (Good), 4 (Easy) or use Arrows"
             : "Press Space to Reveal"
           }
        </div>
      </div>
    </div>
  );
};

export default ReviewSession;
