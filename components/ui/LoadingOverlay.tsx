"use client";

import React from 'react';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  subtext?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = "Abhyas is cooking your content",
  subtext = "Meticulously analyzing for conceptual essence..."
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="pulse-logo">A</div>
        <h2 className="brand loading-text">{message}</h2>
        <div className="loading-bar-container">
          <div className="loading-bar-logic"></div>
        </div>
        <p className="loading-subtext">{subtext}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
