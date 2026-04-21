"use client";

import React, { useState } from 'react';
import { Book, Target, Zap, Microscope, School } from 'lucide-react';
import './CurriculumSelector.css';

interface CurriculumSelectorProps {
  onCurriculumSelect: (curriculum: string) => void;
}

const curriculums = [
  {
    id: 'General',
    title: 'General',
    subtitle: 'Balanced conceptual extraction for any topic.',
    icon: <Book size={24} />
  },
  {
    id: 'JEE Mains',
    title: 'JEE Mains',
    subtitle: 'Focus on formulae, MCQ style & direct concepts.',
    icon: <Target size={24} />
  },
  {
    id: 'JEE Advanced',
    title: 'JEE Advanced',
    subtitle: 'Deep multi-concept analysis & multi-step logic.',
    icon: <Zap size={24} />
  },
  {
    id: 'NEET',
    title: 'NEET',
    subtitle: 'Term-heavy recall & NCERT aligned extraction.',
    icon: <Microscope size={24} />
  },
  {
    id: 'CBSE Class 12',
    title: 'CBSE Class 12',
    subtitle: 'Board exam patterns & definition focused.',
    icon: <School size={24} />
  }
];

const CurriculumSelector: React.FC<CurriculumSelectorProps> = ({ onCurriculumSelect }) => {
  const [selected, setSelected] = useState<string>('General');

  const handleSelect = (id: string) => {
    setSelected(id);
    onCurriculumSelect(id);
  };

  return (
    <div className="curriculum-selector-container">
      <div className="label-caps text-center mb-12" style={{ color: 'var(--color-grey-mid)', fontSize: '0.8rem', letterSpacing: '0.2em' }}>
        Select Curriculum Target
      </div>
      <div className="curriculum-grid">
        {curriculums.map((c) => (
          <div
            key={c.id}
            className={`curriculum-card card ${selected === c.id ? 'selected' : ''}`}
            onClick={() => handleSelect(c.id)}
          >
            <div className="curriculum-icon-wrapper">
              {c.icon}
            </div>
            <div className="curriculum-title">{c.title}</div>
            <div className="curriculum-subtitle">{c.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumSelector;
