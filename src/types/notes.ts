// ============================================================
// CLINICAL NOTES TYPES
// ============================================================

export type NoteType = 'note' | 'prescription';

export interface Prescription {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ClinicalNote {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name: string;
  note_type: NoteType;
  content: string;
  prescription: Prescription | null; // only when note_type === 'prescription'
  created_at: string;
}

export interface CreateNoteRequest {
  note_type: NoteType;
  content: string;
  prescription?: Prescription;
}

export interface CreateHospitalNoteRequest extends CreateNoteRequest {
  patient_id: string;
}

export interface NotesListResponse {
  notes: ClinicalNote[];
}
