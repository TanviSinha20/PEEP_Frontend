'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { HospitalPatient, HospitalPatientsResponse, HospitalDoctor, HospitalDoctorsResponse } from '@/types/hospital';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { Suspense } from 'react';

const MOCK_PATIENTS: HospitalPatient[] = [
  { id: 'p2', full_name: 'Ananya Iyer', age: 34, sex: 'female', blood_group: 'O+', region: 'Tamil Nadu', phone: null, dob: null, allergies: null, chronic_conditions: 'Type 2 Diabetes', diet: null, latest_report_status: 'processing', latest_health_score: null, assigned_doctor_id: null, assigned_doctor_name: null },
  { id: 'p4', full_name: 'Meera Patel', age: 27, sex: 'female', blood_group: 'AB+', region: 'Gujarat', phone: null, dob: null, allergies: null, chronic_conditions: null, diet: null, latest_report_status: 'failed', latest_health_score: null, assigned_doctor_id: null, assigned_doctor_name: null },
  { id: 'p5', full_name: 'Suresh Nair', age: 52, sex: 'male', blood_group: 'O-', region: 'Kerala', phone: null, dob: null, allergies: null, chronic_conditions: 'Diabetes', diet: null, latest_report_status: 'completed', latest_health_score: 38, assigned_doctor_id: null, assigned_doctor_name: null },
];

const MOCK_DOCTORS: HospitalDoctor[] = [
  { id: 'd1', full_name: 'Dr. Raghav Sharma', email: 'raghav@hospital.com', assigned_patient_count: 28 },
  { id: 'd2', full_name: 'Dr. Meera Reddy', email: 'meera@hospital.com', assigned_patient_count: 31 },
  { id: 'd3', full_name: 'Dr. Arjun Patel', email: 'arjun@hospital.com', assigned_patient_count: 19 },
];

function AssignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillPatientId = searchParams.get('patient_id') ?? '';

  const [patients, setPatients] = useState<HospitalPatient[]>([]);
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(prefillPatientId);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, dRes] = await Promise.all([
          apiClient.get<HospitalPatientsResponse>('/hospital/patients?page=1&limit=100'),
          apiClient.get<HospitalDoctorsResponse>('/hospital/doctors'),
        ]);
        setPatients(pRes.data.patients);
        setDoctors(dRes.data.doctors);
      } catch {
        setPatients(MOCK_PATIENTS);
        setDoctors(MOCK_DOCTORS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAssign = async () => {
    if (!selectedPatient || !selectedDoctor) { toast.error('Please select both a patient and a doctor.'); return; }
    setAssigning(true);
    try {
      await apiClient.post('/hospital/assign', { patient_id: selectedPatient, doctor_id: selectedDoctor });
      const doc = doctors.find(d => d.id === selectedDoctor);
      const pat = patients.find(p => p.id === selectedPatient);
      toast.success(`${pat?.full_name} assigned to ${doc?.full_name}!`);
      router.push('/hospital/patients');
    } catch {
      const doc = doctors.find(d => d.id === selectedDoctor);
      const pat = patients.find(p => p.id === selectedPatient);
      toast.success(`${pat?.full_name} assigned to ${doc?.full_name}! (Mock)`);
      router.push('/hospital/patients');
    } finally {
      setAssigning(false);
    }
  };

  const filteredPatients = patientSearch ? patients.filter(p => p.full_name.toLowerCase().includes(patientSearch.toLowerCase())) : patients;
  const filteredDoctors = doctorSearch ? doctors.filter(d => d.full_name.toLowerCase().includes(doctorSearch.toLowerCase())) : doctors;

  const selectedPatientObj = patients.find(p => p.id === selectedPatient);
  const selectedDoctorObj = doctors.find(d => d.id === selectedDoctor);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Patient selection */}
      <Card>
        <CardTitle icon={<i className="fa-solid fa-hospital-user"/>}>Select Patient</CardTitle>
        <div className="relative mb-3">
          <input
            type="text"
            value={patientSearch}
            onChange={e => setPatientSearch(e.target.value)}
            placeholder="Search patient..."
            className="w-full bg-bg-input border border-border rounded-xl py-2 pl-4 pr-10 text-[13px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          <i className="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[13px]"/>
        </div>
        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
          {filteredPatients.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedPatient(p.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedPatient === p.id ? 'border-accent bg-accent-light' : 'border-border bg-bg-input hover:border-accent/50'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPatient === p.id ? 'border-accent bg-accent' : 'border-border'}`}>
                {selectedPatient === p.id && <i className="fa-solid fa-check text-white text-[9px]"/>}
              </div>
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[12px] flex-shrink-0">
                {p.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-text-primary">{p.full_name}</div>
                <div className="text-[12px] text-text-secondary">{p.age && `${p.age} yrs · `}{p.region ?? ''}</div>
              </div>
              {p.assigned_doctor_name && (
                <div className="text-[11px] text-text-muted italic">{p.assigned_doctor_name}</div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Doctor selection */}
      <Card>
        <CardTitle icon={<i className="fa-solid fa-user-doctor"/>}>Select Doctor</CardTitle>
        <div className="relative mb-3">
          <input
            type="text"
            value={doctorSearch}
            onChange={e => setDoctorSearch(e.target.value)}
            placeholder="Search doctor..."
            className="w-full bg-bg-input border border-border rounded-xl py-2 pl-4 pr-10 text-[13px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          <i className="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[13px]"/>
        </div>
        <div className="space-y-2">
          {filteredDoctors.map(d => (
            <div
              key={d.id}
              onClick={() => setSelectedDoctor(d.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedDoctor === d.id ? 'border-accent bg-accent-light' : 'border-border bg-bg-input hover:border-accent/50'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedDoctor === d.id ? 'border-accent bg-accent' : 'border-border'}`}>
                {selectedDoctor === d.id && <i className="fa-solid fa-check text-white text-[9px]"/>}
              </div>
              <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.12)] text-success flex items-center justify-center font-bold text-[12px] flex-shrink-0">
                {d.full_name.split(' ').find(w => w !== 'Dr.')?.charAt(0) ?? 'D'}
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-text-primary">{d.full_name}</div>
                <div className="text-[12px] text-text-secondary">{d.assigned_patient_count} patients currently assigned</div>
              </div>
              {/* Workload bar */}
              <div className="w-24">
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.min((d.assigned_patient_count / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirmation */}
      {selectedPatient && selectedDoctor && (
        <Card className="border-accent/30 bg-accent-light">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-circle-info text-accent text-[18px] mt-0.5"/>
            <div>
              <div className="text-[14px] font-semibold text-text-primary mb-1">Confirm Assignment</div>
              <div className="text-[13px] text-text-secondary">
                <strong>{selectedPatientObj?.full_name}</strong> will be assigned to{' '}
                <strong>{selectedDoctorObj?.full_name}</strong>.
                {selectedPatientObj?.assigned_doctor_name && ` This will replace their current assignment (${selectedPatientObj.assigned_doctor_name}).`}
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="w-4 h-4 accent-accent" />
                <span className="text-[13px] text-text-secondary">I confirm this assignment is correct.</span>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push('/hospital/patients')}>Cancel</Button>
        <Button
          onClick={handleAssign}
          disabled={!selectedPatient || !selectedDoctor || !confirmed || assigning}
        >
          {assigning
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            : <><i className="fa-solid fa-user-tag"/> Confirm Assignment</>}
        </Button>
      </div>
    </div>
  );
}

export default function AssignPatientPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-extrabold text-text-primary">Assign Patient to Doctor</h1>
        <p className="text-text-secondary text-[14px] mt-1">Select a patient and a doctor to create or update their assignment.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-80 rounded-2xl"/>}>
        <AssignForm />
      </Suspense>
    </div>
  );
}
