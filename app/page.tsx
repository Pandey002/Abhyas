"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import './landing.css';

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      <div className="landing-content">
        <div className="manifesto-badge label-caps mb-8">The Scholar's Path</div>
        
        <h1 className="grand-title brand">Curate Your Archive</h1>
        
        <p className="grand-subtitle">
          Learn fast. Learn enough. <em>Skip the overwhelm.</em>
        </p>
        
        <div className="hero-actions">
          <Link href="/upload" className="cta-button grand">
            Get Started <ArrowRight size={22} />
          </Link>
        </div>
      </div>

      <div className="landing-visual">
         {/* Subtle background decoration */}
         <div className="glow-aura"></div>
      </div>
    </div>
  );
}
