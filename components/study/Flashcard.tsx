"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import './Flashcard.css';

interface FlashcardProps {
  front: string;
  back: string;
  type?: string;
  isFlipped: boolean;
  onFlip: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ front, back, type, isFlipped, onFlip }) => {
  return (
    <div 
      className={`flashcard-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={onFlip}
    >
      <div className="flashcard-inner">
        {/* Front of Card */}
        <div className="flashcard-front">
          <div className="card-category-wrapper">
            <span className="card-category">{type || 'DEFINITION'}</span>
          </div>
          
          <div className="card-question">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {front}
            </ReactMarkdown>
          </div>
          
          {!isFlipped && (
            <div className="card-footer-hint">Click to reveal answer</div>
          )}
        </div>

        {/* Back of Card */}
        <div className="flashcard-back">
          <div className="card-category-wrapper">
            <span className="card-category">ANALYSIS</span>
          </div>
          
          <div className="card-answer">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {back}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
