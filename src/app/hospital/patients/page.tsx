'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { HospitalPatient, HospitalPatientsResponse } from '@/types/hospital';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge, BadgeStatus } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

const MOCK_PATIENTS: HospitalPatient[] = [
  { id: 'p1', full_name: 'Priya Sharma', age: 29, sex: 'female', blood_group: 'B+', region: 'Maharashtra', phone: '+91 98765 43210', dob: '1996-03-12', allergies: 'None', chronic_conditions: 'PCOS', diet: 'vegetarian', latest_report_status: 'completed', latest_health_score: 72, assigned_doctor_id: 'd1', assigned_doctor_name: 'Dr. Raghav Sharma' },
  { id: 'p2', full_name: 'Ananya Iyer', age: 34, sex: 'female', blood_group: 'O+', region: 'Tamil Nadu', phone: null, dob: '1991-07-08', allergies: 'Penicillin', chronic_conditions: 'Type 2 Diabetes', diet: 'non_veg', latest_report_status: 'processing', latest_health_score: null, assigned_doctor_id: null, assigned_doctor_name: null },
  { id: 'p3', full_name: 'Rohan Gupta', age: 45, sex: 'male', blood_group: 'A-', region: 'Delhi', phone: '+91 87654 32109', dob: '1980-11-23', allergies: null, chronic_conditions: 'Hypertension', diet: 'non_veg', latest_report_status: 'completed', latest_health_score: 42, assigned_doctor_id: 'd2', assigned_doctor_name: 'Dr. Meera Reddy' },
  { id: 'p4', full_name: 'Meera Patel', age: 27, sex: 'female', blood_group: 'AB+', region: 'Gujarat', phone: null, dob: '1998-05-17', allergies: 'Sulfa drugs', chronic_conditions: null, diet: 'vegetarian', latest_report_status: 'failed', latest_health_score: null, assigned_doctor_id: null, assigned_doctor_name: null },
  { id: 'p5', full_name: 'Suresh Nair', age: 52, sex: 'male', blood_group: 'O-', region: 'Kerala', phone: '+91 76543 21098', dob: '1973-09-30', allergies: 'Aspirin', chronic_conditions: 'Diabetes, Cholesterol', diet: 'non_veg', latest_report_status: 'completed', latest_health_score: 38, assigned_doctor_id: null, assigned_doctor_name: null },
];

export default function HospitalPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<HospitalPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPatients = useCallback(async (p = 1, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const res = await apiClient.get<HospitalPatientsResponse>(`/hospital/patients?page=${p}&limit=${DEFAULT_PAGE_SIZE}`);
      setPatients(prev => append ? [...prev, ...res.data.patients] : res.data.patients);
      setTotal(res.data.total);
    } catch {
      if (!append) { setPatients(MOCK_PATIENTS); setTotal(MOCK_PATIENTS.length); }
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchPatients(1); }, [fetchPatients]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPatients(next, true);
  };

  const filtered = search
    ? patients.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.region?.toLowerCase().includes(search.toLowerCase()))
    : patients;

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-text-muted';
    if (score >= 71) return 'text-success';
    if (score >= 41) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-text-primary">Patient Registry</h1>
          <p className="text-text-secondary text-[14px] mt-1">{total} patients registered in your hospital network.</p>
        </div>
        <Button onClick={() => router.push('/hospital/patients/assign')}>
          <i className="fa-solid fa-user-plus"/> Assign Patient
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <CardTitle icon={<i className="fa-solid fa-users"/>}>All Patients</CardTitle>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or region..."
              className="bg-bg-input border border-border rounded-xl py-2 pl-4 pr-10 text-[13px] w-[240px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            <i className="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[13px]"/>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-text-secondary">
            <i className="fa-solid fa-users-slash text-[40px] text-text-muted block mb-3"/>
            {search ? `No patients matching "${search}"` : 'No patients found.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border">
                    <th className="pb-3 pr-4 font-medium">Patient</th>
                    <th className="pb-3 pr-4 font-medium">Age / Sex</th>
                    <th className="pb-3 pr-4 font-medium">Blood Group</th>
                    <th className="pb-3 pr-4 font-medium">Region</th>
                    <th className="pb-3 pr-4 font-medium">Report Status</th>
                    <th className="pb-3 pr-4 font-medium">Score</th>
                    <th className="pb-3 pr-4 font-medium">Assigned Doctor</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg-input/50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                            {p.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary">{p.full_name}</div>
                            {p.chronic_conditions && <div className="text-[11px] text-text-muted truncate max-w-[120px]">{p.chronic_conditions}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-text-secondary">{p.age ?? '—'} / {p.sex?.charAt(0).toUpperCase() ?? '—'}</td>
                      <td className="py-4 pr-4 font-medium text-text-primary">{p.blood_group ?? '—'}</td>
                      <td className="py-4 pr-4 text-text-secondary">{p.region ?? '—'}</td>
                      <td className="py-4 pr-4">
                        {p.latest_report_status
                          ? <Badge status={p.latest_report_status as BadgeStatus}>{p.latest_report_status.charAt(0).toUpperCase() + p.latest_report_status.slice(1)}</Badge>
                          : <span className="text-text-muted">None</span>}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`font-bold text-[15px] ${getScoreColor(p.latest_health_score)}`}>
                          {p.latest_health_score ?? '—'}
                        </span>
                        {p.latest_health_score && <span className="text-text-muted text-[11px]">/100</span>}
                      </td>
                      <td className="py-4 pr-4 text-[12px]">
                        {p.assigned_doctor_name
                          ? <span className="text-text-secondary">{p.assigned_doctor_name}</span>
                          : <span className="text-warning italic">Unassigned</span>}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => router.push(`/hospital/patients/${p.id}`)}>
                            View
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/hospital/patients/assign?patient_id=${p.id}`)} title="Assign Doctor">
                            <i className="fa-solid fa-user-tag"/>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} hasMore={patients.length < total} onLoadMore={handleLoadMore} loading={loadingMore} />
          </>
        )}
      </Card>
    </div>
  );
}
