"use client";

import React, { useState, useEffect } from 'react';
import MasteryDonut from '@/components/dashboard/MasteryDonut';
import { MetricCard } from '@/components/dashboard/StatCards';
import DeckLibrary from '@/components/dashboard/DeckLibrary';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Toast from '@/components/ui/Toast';
import { Plus, ArchiveX, Flame } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import './library.css';

export default function LibraryPage() {
  const [decks, setDecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<{id: string, title: string} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error', visible: boolean}>({
    message: '',
    type: 'success',
    visible: false
  });
  const [stats, setStats] = useState({
    dueToday: 0,
    streak: 1,
    masteryBreakdown: {
      mastered: 0,
      shaky: 0,
      notStarted: 0,
      total: 0
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch All Decks
      const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false });

      // 1b. Fetch Streak Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('global_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (deckError) throw deckError;

      // 2. Fetch All Flashcards to calculate per-deck due status and overall mastery
      const { data: cardData, error: cardError } = await supabase
        .from('flashcards')
        .select('deck_id, repetitions, next_review_date, last_review_date, status, total_reviews');

      if (cardError) throw cardError;

      if (cardData && deckData) {
        const today = new Date().toISOString().slice(0, 10);
        
        // Track due status AND mastery per deck
        const dueDecksMap: Record<string, boolean> = {};
        const deckStatsMap: Record<string, {mastered: number, reviewed: number, total: number}> = {};
        
        let totalMastered = 0;
        let totalShaky = 0;
        let totalNotStarted = 0;
        let totalDue = 0;

        cardData.forEach(card => {
          // Initialize deck entry if missing
          if (!deckStatsMap[card.deck_id]) {
            deckStatsMap[card.deck_id] = { mastered: 0, reviewed: 0, total: 0 };
          }
          deckStatsMap[card.deck_id].total++;

          // Global and local stats based on strict string status
          if (card.status === 'mastered') {
            totalMastered++;
            deckStatsMap[card.deck_id].mastered++;
          } else if (card.status === 'shaky') {
            totalShaky++;
          } else {
            totalNotStarted++;
          }

          // Percent Reviewed check based on total_reviews > 0
          if (card.total_reviews && card.total_reviews > 0) {
            deckStatsMap[card.deck_id].reviewed++;
          }

          if (card.next_review_date <= today) {
            totalDue++;
            dueDecksMap[card.deck_id] = true;
          }
        });

        // Map enriched data to deck objects
        const enrichedDecks = deckData.map(d => {
          const deckStats = deckStatsMap[d.id] || { mastered: 0, reviewed: 0, total: 0 };
          return {
            ...d,
            isDue: dueDecksMap[d.id] || false,
            calculatedMastery: deckStats.total > 0 
              ? Math.round((deckStats.mastered / deckStats.total) * 100) 
              : 0,
            studyProgress: deckStats.total > 0
              ? Math.round((deckStats.reviewed / deckStats.total) * 100)
              : 0
          };
        });

        setDecks(enrichedDecks);
        setStats(prev => ({
          ...prev,
          dueToday: totalDue,
          streak: settingsData?.current_streak || 1,
          masteryBreakdown: {
            mastered: totalMastered,
            shaky: totalShaky,
            notStarted: totalNotStarted,
            total: cardData.length
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching library data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDeck = async (id: string) => {
    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDecks(prev => prev.filter(d => d.id !== id));
      fetchData(); 
      setToast({ message: "Archive vanished.", type: 'success', visible: true });
    } catch (error) {
      console.error("Error deleting deck:", error);
      setToast({ message: "Failed to delete.", type: 'error', visible: true });
    } finally {
      setShowConfirm(false);
      setSelectedDeck(null);
    }
  };

  const dueDecks = decks.filter(d => d.isDue);
  const allDecks = decks;

  if (isLoading) return <div className="page-wrapper color-grey-mid">Accessing the Archivum...</div>;

  return (
    <div className="page-wrapper">
      <header className="library-header-row mb-12">
        <div className="header-text">
          <h1 className="brand text-4xl">The Archivum</h1>
          <p className="color-grey-mid">Your centralized sanctuary of curated knowledge.</p>
        </div>
        <Link href="/upload" className="cta-button">
          <Plus size={18} /> New Archive
        </Link>
      </header>

      {decks.length > 0 ? (
        <>
          {/* Analytics Anchor */}
          <div className="stats-header-grid mb-16">
            <div className="card stat-donut-card">
              <MasteryDonut 
                mastered={stats.masteryBreakdown.mastered}
                shaky={stats.masteryBreakdown.shaky}
                notStarted={stats.masteryBreakdown.notStarted}
                total={stats.masteryBreakdown.total}
                variant="compact"
              />
            </div>
            <MetricCard 
              label="Fragments Due Today" 
              value={stats.dueToday} 
              variant="coral"
            />
            <MetricCard 
              label="Library Streak" 
              value={`${stats.streak} Days`} 
              icon={<Flame size={20} />} 
              variant="accent"
            />
          </div>

          {/* Action Zone: Only show if there are decks due */}
          {dueDecks.length > 0 && (
            <div className="mb-16">
              <DeckLibrary 
                sectionTitle="Due for Mastery"
                decks={dueDecks.map(d => ({
                  id: d.id,
                  title: d.title,
                  subject: d.subject,
                  cardCount: d.card_count,
                  masteryPercentage: d.calculatedMastery,
                  isDue: true
                }))} 
                variant="compact"
                showTitle={true}
              />
            </div>
          )}

          {/* Collection Zone */}
          <DeckLibrary 
            sectionTitle="Knowledge Collection"
            decks={allDecks.map(d => ({
              id: d.id,
              title: d.title,
              subject: d.subject,
              cardCount: d.card_count,
              masteryPercentage: d.calculatedMastery,
              studyProgress: d.studyProgress,
              isDue: d.isDue
            }))} 
            variant="grid"
            showTitle={true} 
            onDeleteRequest={(id, title) => {
                setSelectedDeck({ id, title });
                setShowConfirm(true);
            }}
          />
        </>
      ) : (
        <div className="empty-library card text-center py-20">
          <div className="empty-icon-wrapper mb-6">
            <ArchiveX size={48} strokeWidth={1} className="color-grey-mid" />
          </div>
          <h2 className="brand text-2xl mb-2">The Archive is Empty</h2>
          <p className="color-grey-mid mb-8 max-w-sm mx-auto">You haven't extracted any wisdom fragments yet. Start by uploading a PDF.</p>
          <Link href="/upload" className="cta-button">
            New Archive
          </Link>
        </div>
      )}

      <ConfirmDialog 
        isOpen={showConfirm}
        title="Vanish Archive?"
        message={`Are you sure you want to permanently delete "${selectedDeck?.title}"?`}
        confirmText="Vanish Forever"
        cancelText="Keep Archive"
        onConfirm={() => selectedDeck && handleDeleteDeck(selectedDeck.id)}
        onCancel={() => setShowConfirm(false)}
      />

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
