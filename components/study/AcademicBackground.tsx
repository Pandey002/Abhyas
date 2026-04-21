"use client";

import React, { useMemo } from 'react';
import './AcademicBackground.css';

const SYMBOLS = [
  // Math
  '∑', '∫', 'π', '√', '∞', 'Δ', '∂', 'α', 'β', 'θ', 'λ', 'μ', 'σ', 'ω',
  'x²', 'f(x)', 'dy/dx', '≈', '≠', '≤', '≥',
  // Physics
  'F=ma', 'E=mc²', 'v=u+at', 'ℏ', 'Ω', '→', '⊕', '∇',
  // Chemistry
  '⚗', '⌬', '→', 'H₂O', 'CO₂', 'ATP'
];

const AcademicBackground: React.FC = () => {
  const symbolsToRender = useMemo(() => {
    const count = 50;
    const items = [];
    
    for (let i = 0; i < count; i++) {
      let x, y;
      let inCenter = true;
      
      // Avoid center 500x300. Assumed viewport is 100vw x 100vh.
      // We'll use percentages for simple layout.
      // Center 50% +/- 250px is tricky with purely % without knowing viewport size.
      // We'll approximate: avoid 30% to 70% horizontally and 30% to 70% vertically.
      while (inCenter) {
        x = Math.random() * 100;
        y = Math.random() * 100;
        
        const isHorizontalCenter = x > 25 && x < 75;
        const isVerticalCenter = y > 25 && y < 75;
        
        if (!(isHorizontalCenter && isVerticalCenter)) {
          inCenter = false;
        }
      }
      
      items.push({
        id: i,
        char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        top: `${y}%`,
        left: `${x}%`,
        size: `${Math.floor(Math.random() * (48 - 14 + 1) + 14)}px`,
        rotation: `${Math.floor(Math.random() * 60) - 30}deg`
      });
    }
    return items;
  }, []);

  return (
    <div className="academic-bg-container">
      {/* Noise Texture Overlay */}
      <svg className="noise-svg" width="0" height="0">
        <filter id="noise">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.65" 
            numOctaves="3" 
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div className="noise-overlay"></div>

      {/* Decorative Symbols */}
      {symbolsToRender.map((s) => (
        <span 
          key={s.id} 
          className="academic-symbol"
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.size,
            transform: `rotate(${s.rotation})`
          }}
        >
          {s.char}
        </span>
      ))}

      {/* Corner Ornaments */}
      <div className="corner-ornament top-left"></div>
      <div className="corner-ornament top-right"></div>
      <div className="corner-ornament bottom-left"></div>
      <div className="corner-ornament bottom-right"></div>
    </div>
  );
};

export default AcademicBackground;
