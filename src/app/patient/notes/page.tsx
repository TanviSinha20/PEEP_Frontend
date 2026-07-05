'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { ClinicalNote } from '@/types/notes';
import { Card, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ClinicalNoteCard } from '@/components/shared/ClinicalNoteCard';

const MOCK_NOTES: ClinicalNote[] = [
  {
    id: 'n1', patient_id: 'u1', doctor_id: 'd1', doctor_name: 'Raghav Sharma',
    note_type: 'prescription', content: 'Patient shows signs of Vitamin D deficiency. Prescribed supplements and dietary changes.',
    prescription: { medication_name: 'Vitamin D3', dosage: '60,000 IU', frequency: 'Once weekly', duration: '8 weeks', instructions: 'Take after a meal with milk or any fat-containing food.' },
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'n2', patient_id: 'u1', doctor_id: 'd1', doctor_name: 'Raghav Sharma',
    note_type: 'note', content: 'Patient is responding well to the current regimen. Cholesterol levels are slightly elevated — recommend dietary modification focusing on reducing saturated fats. Schedule a follow-up in 6 weeks.',
    prescription: null,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

export default function PatientNotesPage() {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ notes: ClinicalNote[] }>('/notes/my');
      setNotes(res.data.notes);
    } catch {
      setNotes(MOCK_NOTES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-extrabold text-text-primary">Clinical Notes</h1>
        <p className="text-text-secondary text-[14px] mt-1">Notes and prescriptions added by your doctor.</p>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : notes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-bg-input rounded-2xl flex items-center justify-center text-text-muted text-[30px] mx-auto mb-4">
              <i className="fa-regular fa-note-sticky"/>
            </div>
            <div className="text-[16px] font-semibold text-text-primary mb-1">No Notes Yet</div>
            <div className="text-[14px] text-text-secondary">Your doctor hasn't added any clinical notes or prescriptions yet.</div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <ClinicalNoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
