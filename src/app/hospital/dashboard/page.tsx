'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { HospitalAnalytics, HospitalPatient, HospitalPatientsResponse, HospitalDoctor, HospitalDoctorsResponse } from '@/types/hospital';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge, BadgeStatus } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

const MOCK_ANALYTICS: HospitalAnalytics = { total_patients: 142, active_reports: 8, high_risk_patients: 23 };

const MOCK_PATIENTS: HospitalPatient[] = [
  { id: 'p1', full_name: 'Priya Sharma', age: 29, sex: 'female', blood_group: 'B+', region: 'Maharashtra', phone: '+91 98765 43210', dob: '1996-03-12', allergies: 'None', chronic_conditions: 'PCOS', diet: 'vegetarian', latest_report_status: 'completed', latest_health_score: 72, assigned_doctor_id: 'd1', assigned_doctor_name: 'Dr. Raghav Sharma' },
  { id: 'p2', full_name: 'Ananya Iyer', age: 34, sex: 'female', blood_group: 'O+', region: 'Tamil Nadu', phone: null, dob: '1991-07-08', allergies: 'Penicillin', chronic_conditions: 'Type 2 Diabetes', diet: 'non_veg', latest_report_status: 'processing', latest_health_score: null, assigned_doctor_id: null, assigned_doctor_name: null },
  { id: 'p3', full_name: 'Rohan Gupta', age: 45, sex: 'male', blood_group: 'A-', region: 'Delhi', phone: '+91 87654 32109', dob: '1980-11-23', allergies: null, chronic_conditions: 'Hypertension', diet: 'non_veg', latest_report_status: 'completed', latest_health_score: 42, assigned_doctor_id: 'd2', assigned_doctor_name: 'Dr. Meera Reddy' },
  { id: 'p4', full_name: 'Meera Patel', age: 27, sex: 'female', blood_group: 'AB+', region: 'Gujarat', phone: null, dob: '1998-05-17', allergies: 'Sulfa drugs', chronic_conditions: null, diet: 'vegetarian', latest_report_status: 'failed', latest_health_score: null, assigned_doctor_id: null, assigned_doctor_name: null },
  { id: 'p5', full_name: 'Suresh Nair', age: 52, sex: 'male', blood_group: 'O-', region: 'Kerala', phone: '+91 76543 21098', dob: '1973-09-30', allergies: 'Aspirin', chronic_conditions: 'Diabetes, Cholesterol', diet: 'non_veg', latest_report_status: 'completed', latest_health_score: 38, assigned_doctor_id: 'd1', assigned_doctor_name: 'Dr. Raghav Sharma' },
];

const MOCK_DOCTORS: HospitalDoctor[] = [
  { id: 'd1', full_name: 'Dr. Raghav Sharma', email: 'raghav@hospital.com', assigned_patient_count: 28 },
  { id: 'd2', full_name: 'Dr. Meera Reddy', email: 'meera@hospital.com', assigned_patient_count: 31 },
  { id: 'd3', full_name: 'Dr. Arjun Patel', email: 'arjun@hospital.com', assigned_patient_count: 19 },
];

export default function HospitalDashboardPage() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  const [analytics, setAnalytics] = useState<HospitalAnalytics | null>(null);
  const [patients, setPatients] = useState<HospitalPatient[]>([]);
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assignModal, setAssignModal] = useState<{ patient: HospitalPatient } | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, patientsRes, doctorsRes] = await Promise.all([
        apiClient.get<HospitalAnalytics>('/hospital/analytics'),
        apiClient.get<HospitalPatientsResponse>('/hospital/patients?page=1&limit=50'),
        apiClient.get<HospitalDoctorsResponse>('/hospital/doctors'),
      ]);
      setAnalytics(analyticsRes.data);
      setPatients(patientsRes.data.patients);
      setDoctors(doctorsRes.data.doctors);
    } catch {
      setAnalytics(MOCK_ANALYTICS);
      setPatients(MOCK_PATIENTS);
      setDoctors(MOCK_DOCTORS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAssign = async () => {
    if (!assignModal || !selectedDoctor) return;
    setAssigning(true);
    try {
      await apiClient.post('/hospital/assign', { patient_id: assignModal.patient.id, doctor_id: selectedDoctor });
      const doc = doctors.find(d => d.id === selectedDoctor);
      setPatients(prev => prev.map(p => p.id === assignModal.patient.id
        ? { ...p, assigned_doctor_id: selectedDoctor, assigned_doctor_name: doc?.full_name ?? '' }
        : p
      ));
      toast.success(`Patient assigned to ${doc?.full_name}!`);
    } catch {
      const doc = doctors.find(d => d.id === selectedDoctor);
      setPatients(prev => prev.map(p => p.id === assignModal.patient.id
        ? { ...p, assigned_doctor_id: selectedDoctor, assigned_doctor_name: doc?.full_name ?? '' }
        : p
      ));
      toast.success(`Patient assigned! (Mock)`);
    } finally {
      setAssigning(false);
      setAssignModal(null);
      setSelectedDoctor('');
    }
  };

  const filteredPatients = search
    ? patients.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.region?.toLowerCase().includes(search.toLowerCase()))
    : patients;

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-text-muted';
    if (score >= 71) return 'text-success';
    if (score >= 41) return 'text-warning';
    return 'text-danger';
  };

  const statsCards = [
    { label: 'Total Patients', value: analytics?.total_patients ?? 0, icon: 'fa-hospital-user', color: 'bg-[rgba(108,99,255,0.12)] text-accent' },
    { label: 'Reports Processing', value: analytics?.active_reports ?? 0, icon: 'fa-spinner fa-spin', color: 'bg-[rgba(245,158,11,0.12)] text-warning' },
    { label: 'High Risk', value: analytics?.high_risk_patients ?? 0, icon: 'fa-triangle-exclamation', color: 'bg-[rgba(239,68,68,0.12)] text-danger' },
    { label: 'Doctors on Staff', value: doctors.length, icon: 'fa-user-doctor', color: 'bg-[rgba(16,185,129,0.12)] text-success' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-extrabold text-text-primary">Hospital Dashboard</h1>
        <p className="text-text-secondary text-[14px] mt-1">Overview for {user?.full_name ?? 'Hospital Partner'}.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map(s => (
          <Card key={s.label} className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0 ${s.color}`}>
              <i className={`fa-solid ${s.icon}`}/>
            </div>
            <div>
              <div className="text-[22px] font-extrabold text-text-primary">{loading ? '—' : s.value}</div>
              <div className="text-[12px] text-text-secondary">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Doctors Panel */}
      <Card>
        <CardTitle icon={<i className="fa-solid fa-user-doctor"/>}>Doctors on Staff</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl"/>)
            : doctors.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-4 bg-bg-input rounded-xl border border-border">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[14px] flex-shrink-0">
                  {doc.full_name.split(' ').find(w => w !== 'Dr.')?.charAt(0) ?? 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-text-primary truncate">{doc.full_name}</div>
                  <div className="text-[12px] text-text-secondary">{doc.assigned_patient_count} patients</div>
                </div>
              </div>
            ))
          }
        </div>
      </Card>

      {/* Patient Registry */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <CardTitle icon={<i className="fa-solid fa-users"/>}>Patient Registry</CardTitle>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patients..."
                className="bg-bg-input border border-border rounded-xl py-2 pl-4 pr-10 text-[13px] w-[200px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              <i className="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[13px]"/>
            </div>
            <Button size="sm" variant="outline" onClick={() => router.push('/hospital/map')}>
              <i className="fa-solid fa-map-location-dot"/> Analytics Map
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl"/>)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="pb-3 pr-4 font-medium">Patient</th>
                  <th className="pb-3 pr-4 font-medium">Age / Sex</th>
                  <th className="pb-3 pr-4 font-medium">Region</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Score</th>
                  <th className="pb-3 pr-4 font-medium">Doctor</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg-input/50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                          {p.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">{p.full_name}</div>
                          {p.chronic_conditions && <div className="text-[11px] text-text-muted truncate max-w-[110px]">{p.chronic_conditions}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-text-secondary">{p.age ?? '—'} / {p.sex?.charAt(0).toUpperCase() ?? '—'}</td>
                    <td className="py-4 pr-4 text-text-secondary">{p.region ?? '—'}</td>
                    <td className="py-4 pr-4">
                      {p.latest_report_status
                        ? <Badge status={p.latest_report_status as BadgeStatus}>{p.latest_report_status.charAt(0).toUpperCase() + p.latest_report_status.slice(1)}</Badge>
                        : <span className="text-text-muted">None</span>
                      }
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`font-bold text-[15px] ${getScoreColor(p.latest_health_score)}`}>
                        {p.latest_health_score ?? '—'}
                      </span>
                      {p.latest_health_score && <span className="text-text-muted text-[11px]">/100</span>}
                    </td>
                    <td className="py-4 pr-4 text-text-secondary text-[12px]">
                      {p.assigned_doctor_name ?? <span className="text-text-muted italic">Unassigned</span>}
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => router.push(`/hospital/patients/${p.id}`)}>View</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setAssignModal({ patient: p }); setSelectedDoctor(p.assigned_doctor_id ?? ''); }}>
                          <i className="fa-solid fa-user-tag"/>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Assign Doctor Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-card border border-border rounded-[20px] p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-[18px] font-bold text-text-primary mb-1">Assign Doctor</h3>
            <p className="text-[13px] text-text-secondary mb-4">Assigning to: <strong>{assignModal.patient.full_name}</strong></p>
            <select
              value={selectedDoctor}
              onChange={e => setSelectedDoctor(e.target.value)}
              className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent mb-4 appearance-none"
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.full_name} ({d.assigned_patient_count} patients)</option>
              ))}
            </select>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => { setAssignModal(null); setSelectedDoctor(''); }}>Cancel</Button>
              <Button fullWidth onClick={handleAssign} disabled={!selectedDoctor || assigning}>
                {assigning ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Assign'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
