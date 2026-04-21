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
  studyProgress?: number;
  isDue?: boolean;
  curriculum?: string;
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
            {deck.curriculum && (
              <div className={`curriculum-badge ${deck.curriculum.toLowerCase().replace(/\s+/g, '-')}`}>
                {deck.curriculum}
              </div>
            )}
            
            {deck.studyProgress === 100 && (
              <div className="due-badge" style={{ background: '#2ecc71', color: 'white', border: 'none' }}>
                Review Complete
              </div>
            )}
            {deck.isDue && deck.studyProgress !== 100 && (
              <div className="due-badge">
                <Zap size={10} fill="currentColor" /> Due Now
              </div>
            )}
            
            <div className="card-top" style={{ marginTop: deck.curriculum ? '24px' : '0' }}>
              <div className="deck-subject label-caps font-bold tracking-widest text-xs uppercase mb-2 text-coral">{deck.subject}</div>
              <h3 className="deck-title mb-1">{deck.title}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-grey-mid)', marginTop: '8px' }}>{deck.cardCount} Fragments</p>
            </div>
            
            <div className="deck-progress-container" title={`Study Progress: ${deck.studyProgress}%`}>
              <div 
                className="deck-progress-bar study" 
                style={{ width: `${deck.studyProgress || 0}%`, zIndex: 1, position: 'absolute', height: '100%' }}
              ></div>
              <div 
                className="deck-progress-bar mastery" 
                style={{ width: `${deck.masteryPercentage}%`, zIndex: 2, position: 'absolute', height: '100%' }}
              ></div>
            </div>

            <div className="deck-meta w-full flex justify-between mt-4">
              <span className="reviewed-text" style={{ color: 'var(--color-grey-mid)' }}>{deck.studyProgress}% Reviewed</span>
              <span className="mastery-text font-bold" style={{ color: 'var(--color-navy)' }}>{deck.masteryPercentage}% Mastered</span>
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
