"use client";

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import './Toast.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast-container ${type}`}>
      <div className="toast-content">
        {type === 'success' ? (
          <CheckCircle size={18} className="toast-icon success" />
        ) : (
          <AlertCircle size={18} className="toast-icon error" />
        )}
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
