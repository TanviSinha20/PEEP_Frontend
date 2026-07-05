import React from 'react';
import { ClinicalNote } from '@/types/notes';
import { Card } from '@/components/ui/Card';

interface ClinicalNoteCardProps {
  note: ClinicalNote;
  onDelete?: (id: string) => void;
}

export function ClinicalNoteCard({ note, onDelete }: ClinicalNoteCardProps) {
  const isPrescription = note.note_type === 'prescription';
  
  return (
    <Card className="mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0 ${isPrescription ? 'bg-[rgba(108,99,255,0.12)] text-accent' : 'bg-[rgba(16,185,129,0.12)] text-success'}`}>
            <i className={`fa-solid ${isPrescription ? 'fa-prescription-bottle-medical' : 'fa-user-doctor'}`}></i>
          </div>
          <div>
            <div className="text-[14px] font-semibold text-text-primary">
              Dr. {note.doctor_name}
            </div>
            <div className="text-[12px] text-text-secondary mt-0.5">
              {new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
        
        {onDelete && (
          <button 
            onClick={() => onDelete(note.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-[rgba(239,68,68,0.12)] hover:text-danger transition-colors"
            title="Delete Note"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        )}
      </div>

      <div className="text-[14px] text-text-secondary leading-relaxed bg-bg-input p-4 rounded-xl">
        {note.content}
      </div>

      {isPrescription && note.prescription && (
        <div className="mt-4 border border-border rounded-xl overflow-hidden">
          <div className="bg-bg-input px-4 py-2 border-b border-border font-semibold text-[13px] text-text-primary flex items-center gap-2">
            <i className="fa-solid fa-pills text-accent"></i> Prescription Details
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 text-[13px]">
            <div>
              <div className="text-text-muted mb-1">Medication</div>
              <div className="font-semibold text-text-primary">{note.prescription.medication_name}</div>
            </div>
            <div>
              <div className="text-text-muted mb-1">Dosage</div>
              <div className="font-semibold text-text-primary">{note.prescription.dosage}</div>
            </div>
            <div>
              <div className="text-text-muted mb-1">Frequency</div>
              <div className="font-semibold text-text-primary">{note.prescription.frequency}</div>
            </div>
            <div>
              <div className="text-text-muted mb-1">Duration</div>
              <div className="font-semibold text-text-primary">{note.prescription.duration}</div>
            </div>
            {note.prescription.instructions && (
              <div className="col-span-2 mt-2">
                <div className="text-text-muted mb-1">Instructions</div>
                <div className="text-text-primary">{note.prescription.instructions}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
