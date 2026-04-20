"use client";

import React, { useCallback, useState } from 'react';
import { FileUp, FileCheck } from 'lucide-react';
import './UploadZone.css';

interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div 
      className={`upload-zone card ${dragActive ? 'drag-active' : ''} ${fileName ? 'has-file' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        id="file-upload" 
        className="file-input" 
        accept=".pdf"
        onChange={handleChange}
      />
      <label htmlFor="file-upload" className="upload-label">
        <div className="upload-icon-container">
          {fileName ? <FileCheck size={32} /> : <FileUp size={32} />}
        </div>
        <div className="upload-text">
          {fileName ? (
            <p className="file-name">{fileName}</p>
          ) : (
            <p className="main-text">Drop your study material here (PDF)</p>
          )}
          <p className="sub-text">{fileName ? 'Click to change file' : 'OR BROWSE YOUR LIBRARY'}</p>
        </div>
      </label>
    </div>
  );
};

export default UploadZone;
