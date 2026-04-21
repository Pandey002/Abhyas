"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/home/HeroSection';
import UploadZone from '@/components/home/UploadZone';
import IntentSelector from '@/components/home/IntentSelector';
import CurriculumSelector from '@/components/home/CurriculumSelector';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [intent, setIntent] = useState<'quick' | 'deep'>('quick');
  const [curriculum, setCurriculum] = useState<string>('General');
  const [isCooking, setIsCooking] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Transition Entry: Brief "Loading Workspace" pulse
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBeginExtraction = async () => {
    if (!file) return;

    setIsCooking(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('intent', intent);
      formData.append('curriculum', curriculum);
      formData.append('topic', file.name.replace('.pdf', '')); 

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        router.push('/library');
      } else {
        alert("Extraction failed: " + (result.error || "Unknown error"));
        setIsCooking(false);
      }
    } catch (error) {
      console.error("Extraction error:", error);
      alert("An error occurred during extraction.");
      setIsCooking(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Workspace Initialization Loader */}
      <LoadingOverlay 
        isVisible={isInitializing} 
        message="Loading workspace" 
        subtext="Preparing the Archivum environment..."
      />

      {/* Main Extraction Logic Loader */}
      <LoadingOverlay 
        isVisible={isCooking} 
        message="Abhyas is cooking your content"
        subtext="Meticulously analyzing for conceptual essence..."
      />
      
      <HeroSection 
        title="Extract the Essence"
        subtitle="Transform static records into living wisdom. Upload to begin the extraction."
      />
      <UploadZone onFileSelect={setFile} />
      
      <div className="upload-config-container">
        <div className="config-section">
          <CurriculumSelector onCurriculumSelect={setCurriculum} />
        </div>
        
        <div className="config-section">
          <IntentSelector 
            onIntentSelect={setIntent} 
            onProceed={handleBeginExtraction} 
            isDisabled={!file}
          />
        </div>
      </div>
    </div>
  );
}
