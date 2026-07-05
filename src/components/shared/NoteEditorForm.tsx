'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NoteType, Prescription } from '@/types/notes';

interface NoteEditorFormProps {
  onSubmit: (noteType: NoteType, content: string, prescription?: Prescription) => Promise<void>;
  loading?: boolean;
}

export function NoteEditorForm({ onSubmit, loading = false }: NoteEditorFormProps) {
  const [noteType, setNoteType] = useState<NoteType>('note');
  const [content, setContent] = useState('');
  
  // Prescription fields
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (noteType === 'prescription') {
      if (!medication || !dosage || !frequency || !duration) return;
      
      await onSubmit(noteType, content, {
        medication_name: medication,
        dosage,
        frequency,
        duration,
        instructions
      });
    } else {
      await onSubmit(noteType, content);
    }

    // Reset form after submit
    setContent('');
    setMedication('');
    setDosage('');
    setFrequency('');
    setDuration('');
    setInstructions('');
  };

  const isFormValid = () => {
    if (!content.trim()) return false;
    if (noteType === 'prescription') {
      return medication && dosage && frequency && duration;
    }
    return true;
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 mb-4 p-1 bg-bg-input rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setNoteType('note')}
            className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
              noteType === 'note' ? 'bg-white shadow-sm text-accent' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Clinical Note
          </button>
          <button
            type="button"
            onClick={() => setNoteType('prescription')}
            className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all ${
              noteType === 'prescription' ? 'bg-white shadow-sm text-accent' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Prescription
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-text-secondary font-medium text-[13px] mb-2">Observations & Notes *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all min-h-[100px] resize-y"
            placeholder="Enter clinical observations..."
          />
        </div>

        {noteType === 'prescription' && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4 p-4 border border-border rounded-xl bg-bg-input/50">
            <div className="col-span-2 text-[14px] font-semibold text-text-primary mb-2">Prescription Details</div>
            
            <Input 
              label="Medication Name *" 
              placeholder="e.g. Paracetamol" 
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
            />
            <Input 
              label="Dosage *" 
              placeholder="e.g. 500mg" 
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
            <Input 
              label="Frequency *" 
              placeholder="e.g. Twice a day" 
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
            <Input 
              label="Duration *" 
              placeholder="e.g. 5 days" 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            
            <div className="col-span-2">
              <Input 
                label="Special Instructions" 
                placeholder="e.g. Take after meals" 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={!isFormValid() || loading}>
            {loading ? 'Saving...' : `Save ${noteType === 'prescription' ? 'Prescription' : 'Note'}`}
          </Button>
        </div>
      </form>
    </Card>
  );
}
