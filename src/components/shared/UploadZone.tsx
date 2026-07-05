'use client';

import React, { useRef, useState } from 'react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}

export function UploadZone({ onFileSelect, isUploading = false }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // reset input so same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  if (isUploading) {
    return (
      <div className="border-2 border-dashed border-accent rounded-2xl p-9 text-center bg-[rgba(108,99,255,0.05)] mb-6">
        <div className="text-accent text-[40px] mb-2.5">
          <i className="fa-solid fa-spinner fa-spin"></i>
        </div>
        <div className="text-[16px] font-bold text-accent mb-1">Uploading and Analyzing...</div>
        <div className="text-[13px] text-text-secondary">AI is extracting your biomarkers...</div>
      </div>
    );
  }

  return (
    <div 
      className={`border-2 border-dashed rounded-2xl p-9 text-center cursor-pointer transition-all mb-6 relative
        ${dragOver ? 'bg-[rgba(108,99,255,0.2)] border-accent/80' : 'bg-accent-light border-accent'}
      `}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input 
        ref={inputRef}
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        accept=".pdf,.jpg,.jpeg,.png,.dicom" 
        onChange={handleChange}
        aria-label="Upload report file"
      />
      <div className="text-accent text-[40px] mb-2.5">
        <i className="fa-solid fa-cloud-arrow-up"></i>
      </div>
      <div className="text-[16px] font-bold text-text-primary mb-1">Drop your pathology report here</div>
      <div className="text-[13px] text-text-secondary mb-4">Our AI engine extracts biomarkers, flags anomalies, and builds your care plan</div>
      <div className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl font-medium pointer-events-none">
        <i className="fa-solid fa-folder-open"></i> Select File to Analyse
      </div>
      <div className="text-[11px] text-text-muted mt-2.5">Supported: PDF, JPG, PNG, DICOM • Max 20MB</div>
    </div>
  );
}
