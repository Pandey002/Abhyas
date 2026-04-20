"use client";

import React, { useState } from 'react';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import './IntentSelector.css';

interface IntentSelectorProps {
  onIntentSelect: (intent: 'quick' | 'deep') => void;
  onProceed: () => void;
  isDisabled?: boolean;
}

const IntentSelector: React.FC<IntentSelectorProps> = ({ onIntentSelect, onProceed, isDisabled }) => {
  const [activeIntent, setActiveIntent] = useState<'quick' | 'deep'>('quick');

  const handleSelect = (intent: 'quick' | 'deep') => {
    setActiveIntent(intent);
    onIntentSelect(intent);
  };

  return (
    <div className="intent-selector-container">
      <div className="intent-grid">
        <div 
          className={`intent-card card ${activeIntent === 'quick' ? 'selected' : ''}`}
          onClick={() => handleSelect('quick')}
        >
          <div className="intent-icon-header">
            <Zap size={24} className="text-coral" />
            <span className="label-caps" style={{ fontSize: '0.85rem' }}>Quick Review</span>
          </div>
          <p className="intent-desc">Focus on core definitions and the absolute essentials.</p>
          <div className="intent-metadata">
            <span>~3 mins</span>
            <span className="divider">•</span>
            <span>15-20 fragments</span>
          </div>
        </div>

        <div 
          className={`intent-card card ${activeIntent === 'deep' ? 'selected' : ''}`}
          onClick={() => handleSelect('deep')}
        >
          <div className="intent-icon-header">
            <Sparkles size={24} className="text-coral" />
            <span className="label-caps" style={{ fontSize: '0.85rem' }}>Deep Dive</span>
          </div>
          <p className="intent-desc">Exhaustive coverage including edge cases and worked examples from the source.</p>
          <div className="intent-metadata">
            <span>~10 mins</span>
            <span className="divider">•</span>
            <span>40-60 fragments</span>
          </div>
        </div>
      </div>

      <div className="button-container">
        <button 
          className={`cta-button ${isDisabled ? 'disabled' : ''}`}
          onClick={() => !isDisabled && onProceed()}
          disabled={isDisabled}
        >
          Begin Extraction <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default IntentSelector;
