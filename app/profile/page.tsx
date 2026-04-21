"use client";

import React, { useState, useEffect } from 'react';
import { User, Flame, BookOpen, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import MasteryDonut from '@/components/dashboard/MasteryDonut';
import StatCards, { MetricCard } from '@/components/dashboard/StatCards';
import './profile.css';

export default function ProfilePage() {
  const [stats, setStats] = useState({
    totalDecks: 0,
    totalCards: 0,
    mastered: 0,
    shaky: 0,
    notStarted: 0,
    streak: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    setIsLoading(true);
    try {
      const { count: deckCount } = await supabase
        .from('decks')
        .select('*', { count: 'exact', head: true });

      const { data: cardData } = await supabase
        .from('flashcards')
        .select('status');

      const { data: settingsData } = await supabase
        .from('global_settings')
        .select('current_streak')
        .eq('id', 'default')
        .single();

      if (cardData) {
        let mastered = 0;
        let shaky = 0;
        let notStarted = 0;

        cardData.forEach(card => {
          if (card.status === 'mastered') mastered++;
          else if (card.status === 'shaky') shaky++;
          else notStarted++;
        });

        setStats({
          totalDecks: deckCount || 0,
          totalCards: cardData.length,
          mastered,
          shaky,
          notStarted,
          streak: settingsData?.current_streak || 1
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMasteryTitle = (mastered: number) => {
    if (mastered > 50) return "Grand Master";
    if (mastered > 20) return "Master Scholar";
    if (mastered > 5) return "Active Scholar";
    return "Aspiring Scholar";
  };

  if (isLoading) return <div className="page-wrapper color-grey-mid">Consulting your record...</div>;

  return (
    <div className="page-wrapper">
      <section className="profile-hero-section">
        <div className="profile-avatar">
          <User size={48} strokeWidth={1} />
        </div>
        <div className="hero-content">
          <h1 className="hero-name">
            Fellow Scholar
            <div className="hero-accent"></div>
          </h1>
          <p className="hero-subtitle label-caps">{getMasteryTitle(stats.mastered)}</p>
        </div>
      </section>

      <section className="section-container">
        <div className="card mastery-aggregate-card">
          <h3 className="section-label label-caps mb-8">Aggregate Mastery</h3>
          <MasteryDonut 
            mastered={stats.mastered} 
            shaky={stats.shaky} 
            notStarted={stats.notStarted} 
            total={stats.totalCards} 
            size={200}
            variant="profile"
          />
        </div>
      </section>

      <div className="motto-divider">
        <p>Learn fast. Learn enough. Skip the overwhelm</p>
      </div>

      <section className="section-container">
        <StatCards>
          <MetricCard 
            label="Current Streak" 
            value={`${stats.streak} Days`} 
            icon={<Flame size={20} />} 
            variant="accent"
          />
          <MetricCard 
            label="Fragments Curated" 
            value={stats.totalCards} 
            icon={<BookOpen size={20} />} 
          />
          <MetricCard 
            label="Archives Maintained" 
            value={stats.totalDecks} 
            icon={<Clock size={20} />} 
          />
        </StatCards>
      </section>
    </div>
  );
}
