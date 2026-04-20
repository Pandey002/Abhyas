"use client";

import React from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title = "Curate Your Archive", 
  subtitle = "Learn fast. Learn enough. Skip the overwhelm" 
}) => {
  return (
    <section className="hero-section">
      <div className="container hero-inner">
        <h1 className="hero-title brand">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
      </div>
    </section>
  );
};

export default HeroSection;
