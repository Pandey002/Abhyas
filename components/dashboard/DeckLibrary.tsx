import React from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, Zap } from 'lucide-react';
import './DeckLibrary.css';

interface DeckData {
  id: string;
  title: string;
  subject: string;
  cardCount: number;
  masteryPercentage: number;
  isDue?: boolean;
}

interface DeckLibraryProps {
  decks: DeckData[];
  showTitle?: boolean;
  sectionTitle?: string;
  onDeleteRequest?: (id: string, title: string) => void;
  variant?: 'grid' | 'compact';
}

const DeckLibrary: React.FC<DeckLibraryProps> = ({ 
  decks, 
  showTitle = true, 
  sectionTitle,
  onDeleteRequest,
  variant = 'grid'
}) => {
  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteRequest?.(id, title);
  };

  return (
    <section className={`library-section ${variant}`}>
      {(showTitle || sectionTitle) && (
        <h2 className="section-title brand">{sectionTitle || "Your Archives"}</h2>
      )}
      
      <div className={`deck-grid ${variant}`}>
        {decks.map(deck => (
          <Link href={`/study/${deck.id}`} key={deck.id} className={`deck-card card card-hover ${variant} ${deck.isDue ? 'is-due' : ''}`}>
            {deck.isDue && (
              <div className="due-badge">
                <Zap size={10} fill="currentColor" /> Due Now
              </div>
            )}
            
            <div className="card-top">
              <span className="label-caps deck-subject">{deck.subject}</span>
              <h3 className="deck-title">{deck.title}</h3>
            </div>
            
            <div className="deck-progress-container">
              <div 
                className="deck-progress-bar" 
                style={{ width: `${deck.masteryPercentage}%` }}
              ></div>
            </div>

            <div className="deck-meta">
              <span>{deck.cardCount} Fragments</span>
              <span className="mastery-text">{deck.masteryPercentage}% Mastered</span>
            </div>

            <div className="deck-footer">
              <div className="footer-left">
                <span className="study-link">{deck.isDue ? "Resume Mastery" : "Study Now"}</span>
                <ChevronRight size={16} className="text-coral" />
              </div>
              
              {onDeleteRequest && variant === 'grid' && (
                <button 
                  className="delete-button" 
                  onClick={(e) => handleDelete(e, deck.id, deck.title)}
                  title="Delete Archive"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default DeckLibrary;
