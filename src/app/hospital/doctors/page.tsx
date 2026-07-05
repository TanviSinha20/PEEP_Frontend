'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { HospitalDoctor, HospitalDoctorsResponse } from '@/types/hospital';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const MOCK_DOCTORS: HospitalDoctor[] = [
  { id: 'd1', full_name: 'Dr. Raghav Sharma', email: 'raghav@hospital.com', assigned_patient_count: 28 },
  { id: 'd2', full_name: 'Dr. Meera Reddy', email: 'meera@hospital.com', assigned_patient_count: 31 },
  { id: 'd3', full_name: 'Dr. Arjun Patel', email: 'arjun@hospital.com', assigned_patient_count: 19 },
  { id: 'd4', full_name: 'Dr. Kavya Nair', email: 'kavya@hospital.com', assigned_patient_count: 7 },
  { id: 'd5', full_name: 'Dr. Sameer Khan', email: 'sameer@hospital.com', assigned_patient_count: 42 },
];

export default function HospitalDoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<HospitalDoctorsResponse>('/hospital/doctors');
      setDoctors(res.data.doctors);
    } catch {
      setDoctors(MOCK_DOCTORS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const filtered = search ? doctors.filter(d => d.full_name.toLowerCase().includes(search.toLowerCase())) : doctors;
  const maxPatients = Math.max(...doctors.map(d => d.assigned_patient_count), 1);

  const getWorkloadColor = (count: number) => {
    const pct = count / maxPatients;
    if (pct > 0.75) return 'bg-danger';
    if (pct > 0.45) return 'bg-warning';
    return 'bg-success';
  };

  const totalPatients = doctors.reduce((acc, d) => acc + d.assigned_patient_count, 0);
  const avgPerDoctor = doctors.length > 0 ? Math.round(totalPatients / doctors.length) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-text-primary">Doctors</h1>
          <p className="text-text-secondary text-[14px] mt-1">{doctors.length} doctors on staff · avg {avgPerDoctor} patients each.</p>
        </div>
        <Button onClick={() => router.push('/hospital/patients/assign')}>
          <i className="fa-solid fa-user-plus"/> Assign Patient
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Doctors', value: doctors.length, icon: 'fa-user-doctor', color: 'bg-[rgba(108,99,255,0.12)] text-accent' },
          { label: 'Total Assigned Patients', value: totalPatients, icon: 'fa-hospital-user', color: 'bg-[rgba(16,185,129,0.12)] text-success' },
          { label: 'Avg Patients / Doctor', value: avgPerDoctor, icon: 'fa-chart-bar', color: 'bg-[rgba(245,158,11,0.12)] text-warning' },
        ].map(s => (
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

      {/* Doctors table */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <CardTitle icon={<i className="fa-solid fa-user-doctor"/>}>All Doctors</CardTitle>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search doctors..."
              className="bg-bg-input border border-border rounded-xl py-2 pl-4 pr-10 text-[13px] w-[200px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            <i className="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[13px]"/>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <i className="fa-solid fa-user-slash text-[40px] text-text-muted block mb-3"/>
            No doctors found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="pb-3 pr-4 font-medium">Doctor</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Assigned Patients</th>
                  <th className="pb-3 pr-4 font-medium w-48">Workload</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const pct = (d.assigned_patient_count / maxPatients) * 100;
                  return (
                    <tr key={d.id} className="border-b border-border last:border-0 hover:bg-bg-input/50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[14px] flex-shrink-0">
                            {d.full_name.split(' ').find(w => w !== 'Dr.')?.charAt(0) ?? 'D'}
                          </div>
                          <div className="font-semibold text-text-primary">{d.full_name}</div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-text-secondary">{d.email}</td>
                      <td className="py-4 pr-4 font-bold text-text-primary">{d.assigned_patient_count}</td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${getWorkloadColor(d.assigned_patient_count)}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-medium ${pct > 75 ? 'text-danger' : pct > 45 ? 'text-warning' : 'text-success'}`}>
                            {pct > 75 ? 'High' : pct > 45 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/hospital/patients/assign?doctor_id=${d.id}`)}
                        >
                          <i className="fa-solid fa-user-plus"/> Assign
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
