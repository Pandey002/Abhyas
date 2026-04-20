"use client";

import React from 'react';
import './MasteryDonut.css';

interface MasteryDonutProps {
  mastered: number;
  shaky: number;
  notStarted: number;
  total: number;
  size?: number;
  variant?: 'compact' | 'profile';
}

const MasteryDonut: React.FC<MasteryDonutProps> = ({ 
  mastered, 
  shaky, 
  notStarted, 
  total, 
  size = 140, 
  variant = 'compact' 
}) => {
  const radius = size / 2;
  const stroke = variant === 'profile' ? 16 : 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const calculateOffset = (count: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return circumference - (percentage / 100) * circumference;
  };

  const masteryPercentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <div className={`donut-wrapper ${variant}`}>
      <div className="donut-svg-container" style={{ width: size, height: size }}>
        <svg
          height={size}
          width={size}
          className="donut-svg"
        >
          {/* Base Circle */}
          <circle
            stroke="var(--color-border)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          
          {/* Not Started Segment */}
          <circle
            stroke="var(--color-navy)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset: calculateOffset(notStarted + shaky + mastered) }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="donut-segment"
          />

          {/* Shaky Segment */}
          <circle
            stroke="var(--color-coral)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset: calculateOffset(shaky + mastered) }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="donut-segment"
          />

          {/* Mastered Segment */}
          <circle
            stroke="var(--color-emerald)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset: calculateOffset(mastered) }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="donut-segment"
          />

          {/* Center Text */}
          <text
            x="50%"
            y="50%"
            dy=".3em"
            textAnchor="middle"
            className="donut-percentage"
          >
            {masteryPercentage}%
          </text>
        </svg>
      </div>
      
      <div className="donut-legend">
        <div className="legend-item">
          <span className="dot dot-mastered"></span>
          <span className="label">Mastered</span>
          <span className="value">{mastered}</span>
        </div>
        <div className="legend-item">
          <span className="dot dot-shaky"></span>
          <span className="label">Shaky</span>
          <span className="value">{shaky}</span>
        </div>
        <div className="legend-item">
          <span className="dot dot-notstarted"></span>
          <span className="label">Not Started</span>
          <span className="value">{notStarted}</span>
        </div>
      </div>
    </div>
  );
};

export default MasteryDonut;
