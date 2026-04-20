"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Flashcard as FlashcardType, Rating } from '@/types';
import Flashcard from './Flashcard';
import { calculateNextReview } from '@/lib/sm2';
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

  // Stats for the completion screen
  const [masteredCount, setMasteredCount] = useState(0);

  const currentCard = sessionCards[currentIndex];
  // Progress bar spanning full width below navbar
  const progress = ((currentIndex) / sessionCards.length) * 100;

  useEffect(() => {
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

  const handleRate = (rating: Rating) => {
    if (isTransitioning) return;
    
    // 1. Calculate next review
    const updatedCard = calculateNextReview(currentCard, rating);
    
    // 2. Update stats
    if (rating >= 4) setMasteredCount(prev => prev + 1);

    // 3. Update local state
    const newCards = [...sessionCards];
    newCards[currentIndex] = updatedCard;
    setSessionCards(newCards);

    // 4. Animation: Fly Up
    setAnimationClass('fly-up');
    setIsTransitioning(true);

    // 5. Confetti for "Easy"
    if (rating === 5) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#ffffff']
      });
    }

    // 6. Transition to next card
    setTimeout(() => {
      if (currentIndex < sessionCards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
        setAnimationClass('slide-in-right');
        setIsTransitioning(false);
      } else {
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
              <span className="comp-stat-value">5</span>
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
              <span>5</span>
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
