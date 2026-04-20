"use client";

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal card">
        <button className="confirm-close" onClick={onCancel}>
          <X size={20} />
        </button>
        
        <div className="confirm-content">
          <div className={`confirm-icon-wrapper ${variant}`}>
            <AlertTriangle size={24} />
          </div>
          
          <div className="confirm-text">
            <h3 className="brand text-2xl mb-2">{title}</h3>
            <p className="color-grey-mid">{message}</p>
          </div>
        </div>
        
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`cta-button ${variant === 'danger' ? 'danger-bg' : ''}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
