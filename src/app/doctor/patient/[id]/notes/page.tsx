'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ClinicalNote } from '@/types/notes';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ClinicalNoteCard } from '@/components/shared/ClinicalNoteCard';

const MOCK_NOTES: ClinicalNote[] = [
  {
    id: 'n1', patient_id: 'p1', doctor_id: 'd1', doctor_name: 'Raghav Sharma',
    note_type: 'prescription', content: 'Starting iron supplementation for mild anemia.',
    prescription: { medication_name: 'Ferrous Sulfate', dosage: '325mg', frequency: 'Once daily', duration: '6 weeks', instructions: 'Take with Vitamin C.' },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'n2', patient_id: 'p1', doctor_id: 'd1', doctor_name: 'Raghav Sharma',
    note_type: 'note', content: 'Patient reports improved energy levels. Continue current regimen. Schedule lipid panel in 4 weeks.',
    prescription: null,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export default function DoctorPatientNotesPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;

  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'note' | 'prescription'>('all');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ notes: ClinicalNote[] }>(`/doctor/patients/${patientId}/notes`);
      setNotes(res.data.notes);
    } catch {
      setNotes(MOCK_NOTES);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const filtered = filter === 'all' ? notes : notes.filter(n => n.note_type === filter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/doctor/patient/${patientId}`)}
          className="w-9 h-9 rounded-xl bg-bg-card border border-border flex items-center justify-center text-text-secondary hover:text-accent transition-colors"
        >
          <i className="fa-solid fa-arrow-left"/>
        </button>
        <div>
          <h1 className="text-[24px] font-extrabold text-text-primary">All Clinical Notes</h1>
          <p className="text-text-secondary text-[14px] mt-0.5">{notes.length} notes recorded for this patient.</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 bg-bg-input rounded-xl p-1 border border-border w-fit">
        {(['all', 'note', 'prescription'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all capitalize ${
              filter === f ? 'bg-bg-card shadow-sm text-accent border border-border' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {f === 'all' ? 'All' : f === 'note' ? 'Notes Only' : 'Prescriptions Only'}
          </button>
        ))}
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl"/>)}</div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-bg-input rounded-2xl flex items-center justify-center text-text-muted text-[28px] mx-auto mb-4">
              <i className="fa-regular fa-note-sticky"/>
            </div>
            <div className="text-[16px] font-semibold text-text-primary mb-1">No {filter !== 'all' ? filter + 's' : 'notes'} found</div>
            <div className="text-[14px] text-text-secondary mb-4">
              {filter === 'all' ? 'No clinical notes have been added for this patient yet.' : `No ${filter}s match your filter.`}
            </div>
            <Button onClick={() => router.push(`/doctor/patient/${patientId}`)}>
              <i className="fa-solid fa-plus"/> Add Note
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(n => <ClinicalNoteCard key={n.id} note={n} />)}
        </div>
      )}

      {/* Add more CTA */}
      {filtered.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => router.push(`/doctor/patient/${patientId}`)}>
            <i className="fa-solid fa-plus"/> Add Another Note
          </Button>
        </div>
      )}
    </div>
  );
}
