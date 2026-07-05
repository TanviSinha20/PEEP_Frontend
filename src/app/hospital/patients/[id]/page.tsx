'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { HospitalPatientDetail, HospitalDoctor, HospitalDoctorsResponse } from '@/types/hospital';
import { ClinicalNote } from '@/types/notes';
import { NoteType, Prescription } from '@/types/notes';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge, BadgeStatus } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { HealthScoreGauge } from '@/components/shared/HealthScoreGauge';
import { ReportRow } from '@/components/shared/ReportRow';
import { ClinicalNoteCard } from '@/components/shared/ClinicalNoteCard';
import { NoteEditorForm } from '@/components/shared/NoteEditorForm';
import { RISK_TIER_COLOR } from '@/lib/constants';
import toast from 'react-hot-toast';

const MOCK_PATIENT: HospitalPatientDetail = {
  id: 'p3', full_name: 'Rohan Gupta', age: 45, sex: 'male', blood_group: 'A-',
  region: 'Delhi', phone: '+91 87654 32109', dob: '1980-11-23', allergies: null,
  chronic_conditions: 'Hypertension, High Cholesterol', diet: 'non_veg',
  latest_report_status: 'completed', latest_health_score: 42,
  assigned_doctor_id: 'd2', assigned_doctor_name: 'Dr. Meera Reddy',
  latitude: 28.6139, longitude: 77.209,
  reports: [
    {
      id: 'r3', user_id: 'p3', status: 'completed', source: 'web', file_url: null,
      health_score: 42,
      risks: {
        homa_ir: { value: 3.1, tier: 'insulin_resistant' },
        pcos: null,
        anemia: { risk_level: 'none' },
        lipid_profile: { tier: 'high_risk' },
      },
      biomarkers: [
        { slug: 'fasting_glucose', value: 128, unit: 'mg/dL', normal_range: '70-100', status: 'high' },
        { slug: 'ldl_cholesterol', value: 189, unit: 'mg/dL', normal_range: '<130', status: 'high' },
        { slug: 'triglycerides', value: 245, unit: 'mg/dL', normal_range: '<150', status: 'high' },
        { slug: 'hdl_cholesterol', value: 38, unit: 'mg/dL', normal_range: '>40', status: 'low' },
      ],
      dos_donts: { dos: ['DASH diet', 'Daily walking'], donts: ['No high-sodium food', 'Limit alcohol'] },
      care_plan: null,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    }
  ],
};

const MOCK_NOTES: ClinicalNote[] = [
  {
    id: 'n1', patient_id: 'p3', doctor_id: 'd2', doctor_name: 'Meera Reddy',
    note_type: 'prescription', content: 'High LDL and triglycerides. Starting statin therapy.',
    prescription: { medication_name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily', duration: '3 months', instructions: 'Take at bedtime. Avoid grapefruit juice.' },
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function HospitalPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;

  const [patient, setPatient] = useState<HospitalPatientDetail | null>(null);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'notes'>('overview');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [patRes, notesRes, docRes] = await Promise.all([
        apiClient.get<HospitalPatientDetail>(`/hospital/patients/${patientId}`),
        apiClient.get<{ notes: ClinicalNote[] }>(`/hospital/patients/${patientId}/notes`),
        apiClient.get<HospitalDoctorsResponse>('/hospital/doctors'),
      ]);
      setPatient(patRes.data);
      setNotes(notesRes.data.notes);
      setDoctors(docRes.data.doctors);
    } catch {
      setPatient(MOCK_PATIENT);
      setNotes(MOCK_NOTES);
      setDoctors([
        { id: 'd1', full_name: 'Dr. Raghav Sharma', email: 'raghav@h.com', assigned_patient_count: 28 },
        { id: 'd2', full_name: 'Dr. Meera Reddy', email: 'meera@h.com', assigned_patient_count: 31 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddNote = async (noteType: NoteType, content: string, prescription?: Prescription) => {
    setSavingNote(true);
    try {
      const res = await apiClient.post<ClinicalNote>(`/hospital/patients/${patientId}/notes`, {
        note_type: noteType, content, prescription,
      });
      setNotes(prev => [res.data, ...prev]);
      toast.success('Note saved!');
    } catch {
      const mockNote: ClinicalNote = {
        id: `mock-${Date.now()}`, patient_id: patientId, doctor_id: 'hospital',
        doctor_name: 'Hospital Staff', note_type: noteType, content, prescription: prescription ?? null,
        created_at: new Date().toISOString(),
      };
      setNotes(prev => [mockNote, ...prev]);
      toast.success('Note saved! (Mock)');
    } finally {
      setSavingNote(false);
    }
  };

  const latestReport = patient?.reports?.[0] ?? null;

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24"/>)}</div>
      <Skeleton className="h-64"/>
    </div>
  );

  if (!patient) return (
    <div className="text-center py-20">
      <div className="text-[40px] mb-4">❌</div>
      <div className="text-text-primary font-bold">Patient not found</div>
      <Button className="mt-6" onClick={() => router.push('/hospital/dashboard')}>Back</Button>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
    { id: 'reports', label: `Reports (${patient.reports?.length ?? 0})`, icon: 'fa-file-lines' },
    { id: 'notes', label: `Notes (${notes.length})`, icon: 'fa-note-sticky' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/hospital/dashboard')} className="w-9 h-9 rounded-xl bg-bg-card border border-border flex items-center justify-center text-text-secondary hover:text-accent transition-colors">
          <i className="fa-solid fa-arrow-left"/>
        </button>
        <div className="flex-1">
          <h1 className="text-[24px] font-extrabold text-text-primary">{patient.full_name}</h1>
          <p className="text-[13px] text-text-secondary">
            {patient.age && `${patient.age} yrs`}
            {patient.sex && ` · ${patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)}`}
            {patient.blood_group && ` · ${patient.blood_group}`}
            {patient.region && ` · ${patient.region}`}
            {patient.assigned_doctor_name && ` · Assigned to ${patient.assigned_doctor_name}`}
          </p>
        </div>
        {patient.latest_report_status && (
          <Badge status={patient.latest_report_status as BadgeStatus}>
            {patient.latest_report_status.charAt(0).toUpperCase() + patient.latest_report_status.slice(1)}
          </Badge>
        )}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Blood Group', value: patient.blood_group ?? '—', icon: 'fa-droplet', color: 'text-danger' },
          { label: 'Allergies', value: patient.allergies ?? 'None', icon: 'fa-shield-virus', color: 'text-warning' },
          { label: 'Chronic Conditions', value: patient.chronic_conditions ?? 'None', icon: 'fa-heart-pulse', color: 'text-accent' },
          { label: 'Diet', value: patient.diet ? patient.diet.charAt(0).toUpperCase() + patient.diet.slice(1).replace('_', '-') : '—', icon: 'fa-bowl-food', color: 'text-success' },
        ].map(item => (
          <Card key={item.label}>
            <div className="flex items-center gap-2 text-[11px] text-text-muted uppercase tracking-wide mb-2">
              <i className={`fa-solid ${item.icon} ${item.color}`}/> {item.label}
            </div>
            <div className="text-[14px] font-semibold text-text-primary">{item.value}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <i className={`fa-solid ${t.icon}`}/> {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {latestReport?.status === 'completed' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex flex-col items-center justify-center">
                <CardTitle icon={<i className="fa-solid fa-heart-pulse"/>}>Health Score</CardTitle>
                <HealthScoreGauge score={latestReport.health_score ?? 0} />
              </Card>
              <Card className="md:col-span-2">
                <CardTitle icon={<i className="fa-solid fa-triangle-exclamation"/>}>Risk Assessment</CardTitle>
                {latestReport.risks && (
                  <div className="grid grid-cols-2 gap-4">
                    {latestReport.risks.homa_ir && (
                      <div className="bg-bg-input rounded-xl p-3 border border-border">
                        <div className="text-[11px] text-text-muted mb-1">HOMA-IR</div>
                        <div className="text-[18px] font-bold" style={{ color: RISK_TIER_COLOR[latestReport.risks.homa_ir.tier] }}>{latestReport.risks.homa_ir.value.toFixed(2)}</div>
                        <div className="text-[11px] capitalize mt-0.5" style={{ color: RISK_TIER_COLOR[latestReport.risks.homa_ir.tier] }}>{latestReport.risks.homa_ir.tier.replace('_', ' ')}</div>
                      </div>
                    )}
                    {latestReport.risks.anemia && (
                      <div className="bg-bg-input rounded-xl p-3 border border-border">
                        <div className="text-[11px] text-text-muted mb-1">Anemia</div>
                        <div className="text-[18px] font-bold capitalize" style={{ color: RISK_TIER_COLOR[latestReport.risks.anemia.risk_level] }}>{latestReport.risks.anemia.risk_level}</div>
                      </div>
                    )}
                    {latestReport.risks.lipid_profile && (
                      <div className="bg-bg-input rounded-xl p-3 border border-border">
                        <div className="text-[11px] text-text-muted mb-1">Lipid Profile</div>
                        <div className="text-[18px] font-bold capitalize" style={{ color: RISK_TIER_COLOR[latestReport.risks.lipid_profile.tier] }}>{latestReport.risks.lipid_profile.tier.replace('_', ' ')}</div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="text-center py-8">
              <div className="text-[32px] text-text-muted mb-2"><i className="fa-regular fa-folder-open"/></div>
              <div className="font-semibold text-text-primary">No completed report available</div>
            </Card>
          )}
          {latestReport?.biomarkers && latestReport.biomarkers.length > 0 && (
            <Card>
              <CardTitle icon={<i className="fa-solid fa-vials"/>}>Latest Biomarkers</CardTitle>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="pb-2 pr-4 font-medium">Marker</th>
                    <th className="pb-2 pr-4 font-medium">Value</th>
                    <th className="pb-2 pr-4 font-medium">Reference</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {latestReport.biomarkers.map(b => (
                    <tr key={b.slug} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium text-text-primary capitalize">{b.slug.replace(/_/g, ' ')}</td>
                      <td className="py-3 pr-4 text-text-primary">{b.value} <span className="text-text-muted">{b.unit}</span></td>
                      <td className="py-3 pr-4 text-text-secondary">{b.normal_range}</td>
                      <td className="py-3"><Badge status={b.status === 'normal' ? 'success' : b.status === 'high' ? 'error' : 'warning'}>{b.status === 'normal' ? '✓ Normal' : b.status === 'high' ? '↑ High' : '↓ Low'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <Card>
          <CardTitle icon={<i className="fa-solid fa-file-lines"/>}>All Reports</CardTitle>
          {patient.reports?.length === 0
            ? <div className="text-center py-8 text-text-secondary">No reports uploaded yet.</div>
            : patient.reports?.map(r => (
              <ReportRow
                key={r.id} id={r.id}
                name={`Report — ${new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                date={new Date(r.created_at).toLocaleDateString('en-GB')}
                status={r.status}
              />
            ))
          }
        </Card>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <NoteEditorForm onSubmit={handleAddNote} loading={savingNote} />
          {notes.length > 0
            ? <div className="space-y-4">{notes.map(n => <ClinicalNoteCard key={n.id} note={n} />)}</div>
            : (
              <Card>
                <div className="text-center py-8 text-text-secondary">
                  <i className="fa-regular fa-note-sticky text-[30px] text-text-muted block mb-2"/>
                  No notes yet.
                </div>
              </Card>
            )
          }
        </div>
      )}
    </div>
  );
}
