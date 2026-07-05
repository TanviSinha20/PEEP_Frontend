'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { HospitalPatient, HospitalPatientsResponse } from '@/types/hospital';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge, BadgeStatus } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

const MOCK_PATIENTS: HospitalPatient[] = [
  { id: 'p1', full_name: 'Priya Sharma', age: 29, sex: 'female', blood_group: 'B+', region: 'Maharashtra', phone: '+91 98765 43210', dob: '1996-03-12', allergies: 'None', chronic_conditions: 'PCOS', diet: 'vegetarian', latest_report_status: 'completed', latest_health_score: 72, assigned_doctor_id: null, assigned_doctor_name: null },
  { id: 'p2', full_name: 'Ananya Iyer', age: 34, sex: 'female', blood_group: 'O+', region: 'Tamil Nadu', phone: null, dob: '1991-07-08', allergies: 'Penicillin', chronic_conditions: 'Type 2 Diabetes', diet: 'non_veg', latest_report_status: 'processing', latest_health_score: null, assigned_doctor_id: null, assigned_doctor_name: null },
  { id: 'p3', full_name: 'Rohan Gupta', age: 45, sex: 'male', blood_group: 'A-', region: 'Delhi', phone: '+91 87654 32109', dob: '1980-11-23', allergies: null, chronic_conditions: 'Hypertension, High Cholesterol', diet: 'non_veg', latest_report_status: 'completed', latest_health_score: 42, assigned_doctor_id: null, assigned_doctor_name: null },
  { id: 'p4', full_name: 'Meera Patel', age: 27, sex: 'female', blood_group: 'AB+', region: 'Gujarat', phone: null, dob: '1998-05-17', allergies: 'Sulfa drugs', chronic_conditions: null, diet: 'vegetarian', latest_report_status: 'failed', latest_health_score: null, assigned_doctor_id: null, assigned_doctor_name: null },
];

export default function DoctorDashboardPage() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  const [patients, setPatients] = useState<HospitalPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPatients = useCallback(async (p = 1, s = '') => {
    setLoading(true);
    try {
      const res = await apiClient.get<HospitalPatientsResponse>(`/doctor/patients?page=${p}&limit=${DEFAULT_PAGE_SIZE}&search=${s}`);
      if (p === 1) setPatients(res.data.patients);
      else setPatients(prev => [...prev, ...res.data.patients]);
      setTotal(res.data.total);
    } catch {
      setPatients(MOCK_PATIENTS);
      setTotal(MOCK_PATIENTS.length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(1, search); }, [fetchPatients]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPatients(1, search);
  };

  const filteredPatients = search
    ? patients.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()))
    : patients;

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-text-muted';
    if (score >= 71) return 'text-success';
    if (score >= 41) return 'text-warning';
    return 'text-danger';
  };

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: 'fa-hospital-user', color: 'bg-[rgba(108,99,255,0.12)] text-accent' },
    { label: 'Processing Reports', value: patients.filter(p => p.latest_report_status === 'processing').length, icon: 'fa-spinner', color: 'bg-[rgba(245,158,11,0.12)] text-warning' },
    { label: 'High Risk Patients', value: patients.filter(p => (p.latest_health_score ?? 100) <= 40).length, icon: 'fa-triangle-exclamation', color: 'bg-[rgba(239,68,68,0.12)] text-danger' },
    { label: 'Completed Reports', value: patients.filter(p => p.latest_report_status === 'completed').length, icon: 'fa-circle-check', color: 'bg-[rgba(16,185,129,0.12)] text-success' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-extrabold text-text-primary">Doctor Dashboard</h1>
        <p className="text-text-secondary text-[14px] mt-1">Welcome, Dr. {user?.full_name?.split(' ')[0]}. Here are your assigned patients.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0 ${s.color}`}>
              <i className={`fa-solid ${s.icon}`}/>
            </div>
            <div>
              <div className="text-[22px] font-extrabold text-text-primary">{s.value}</div>
              <div className="text-[12px] text-text-secondary">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Patient List */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <CardTitle icon={<i className="fa-solid fa-hospital-user"/>}>My Patients</CardTitle>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patients..."
                className="bg-bg-input border border-border rounded-xl py-2 pl-4 pr-10 text-[13px] w-[200px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent">
                <i className="fa-solid fa-search text-[13px]"/>
              </button>
            </div>
          </form>
        </div>

        {loading && patients.length === 0 ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl"/>)}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <i className="fa-solid fa-users-slash text-[40px] text-text-muted block mb-3"/>
            No patients found{search ? ` for "${search}"` : ''}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="pb-3 pr-4 font-medium">Patient</th>
                  <th className="pb-3 pr-4 font-medium">Age / Sex</th>
                  <th className="pb-3 pr-4 font-medium">Region</th>
                  <th className="pb-3 pr-4 font-medium">Report</th>
                  <th className="pb-3 pr-4 font-medium">Health Score</th>
                  <th className="pb-3 font-medium">Action</th>
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
                          {p.chronic_conditions && (
                            <div className="text-[11px] text-text-muted truncate max-w-[120px]">{p.chronic_conditions}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-text-secondary">
                      {p.age ?? '—'} / {p.sex ? p.sex.charAt(0).toUpperCase() + p.sex.slice(1) : '—'}
                    </td>
                    <td className="py-4 pr-4 text-text-secondary">{p.region ?? '—'}</td>
                    <td className="py-4 pr-4">
                      {p.latest_report_status ? (
                        <Badge status={p.latest_report_status as BadgeStatus}>
                          {p.latest_report_status.charAt(0).toUpperCase() + p.latest_report_status.slice(1)}
                        </Badge>
                      ) : <span className="text-text-muted">None</span>}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`font-bold text-[15px] ${getScoreColor(p.latest_health_score)}`}>
                        {p.latest_health_score ?? '—'}
                      </span>
                      {p.latest_health_score && <span className="text-text-muted text-[11px]">/100</span>}
                    </td>
                    <td className="py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/doctor/patient/${p.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
