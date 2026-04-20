import React from 'react';
import './StatCards.css';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'coral';
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  icon, 
  variant = 'default',
  description 
}) => {
  return (
    <div className={`metric-card card ${variant}`}>
      {icon && <div className="metric-icon">{icon}</div>}
      <div className="metric-content">
        <span className="metric-value">{value}</span>
        <span className="label-caps metric-label">{label}</span>
        {description && <span className="metric-desc">{description}</span>}
      </div>
    </div>
  );
};

interface StatCardsProps {
  children: React.ReactNode;
}

const StatCards: React.FC<StatCardsProps> = ({ children }) => {
  return (
    <div className="stats-row-grid">
      {children}
    </div>
  );
};

export default StatCards;
