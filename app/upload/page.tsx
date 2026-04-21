"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/home/HeroSection';
import UploadZone from '@/components/home/UploadZone';
import { supabase } from '@/lib/supabaseClient';
import IntentSelector from '@/components/home/IntentSelector';
import CurriculumSelector from '@/components/home/CurriculumSelector';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { convertPdfToImages } from '@/lib/pdf-to-image';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [intent, setIntent] = useState<'quick' | 'deep'>('quick');
  const [curriculum, setCurriculum] = useState<string>('General');
  const [isCooking, setIsCooking] = useState(false);
  const [cookingMessage, setCookingMessage] = useState("Preparing your material...");
  const [isInitializing, setIsInitializing] = useState(true);

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
      // 1. Convert PDF to optimized images in the browser
      setCookingMessage("Converting PDF to visual data...");
      const base64Images = await convertPdfToImages(file);
      const totalPages = base64Images.length;
      
      const imageUrls: string[] = [];

      // 2. Upload images one-by-one to Supabase to bypass payload limits
      for (let i = 0; i < base64Images.length; i++) {
        setCookingMessage(`Uploading Page ${i + 1} of ${totalPages}...`);
        
        const fileName = `${Date.now()}-page-${i}.jpg`;
        const filePath = `temp-images/${fileName}`;

        // Convert base64 to binary for upload
        const res = await fetch(base64Images[i]);
        const blob = await res.blob();

        const { error: uploadError } = await supabase.storage
          .from('source-materials')
          .upload(filePath, blob);

        if (uploadError) throw new Error(`PAGE_UPLOAD_ERROR: ${uploadError.message}`);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('source-materials')
          .getPublicUrl(filePath);
        
        imageUrls.push(publicUrl);
      }

      // 3. Initiate AI Extraction
      setCookingMessage("Analyzing material with Vision AI...");
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrls,
          intent,
          curriculum,
          topic: file.name.replace('.pdf', '')
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCookingMessage("Extraction complete!");
        router.push('/library');
      } else {
        alert("Extraction failed: " + (result.error || "Unknown error"));
        setIsCooking(false);
      }
    } catch (error: any) {
      console.error("Extraction error:", error);
      alert(`CRITICAL_ERROR: ${error.message || "Unknown error"}`);
      setIsCooking(false);
    }
  };

  return (
    <div className="page-wrapper">
      <LoadingOverlay 
        isVisible={isInitializing} 
        message="Loading workspace" 
        subtext="Preparing the Archivum environment..."
      />

      <LoadingOverlay 
        isVisible={isCooking} 
        message={cookingMessage}
        subtext="This may take a moment for larger documents."
      />
      
      <HeroSection 
        title="Extract the Essence"
        subtitle="Transform static records into living wisdom. New Vision pipeline enabled."
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
