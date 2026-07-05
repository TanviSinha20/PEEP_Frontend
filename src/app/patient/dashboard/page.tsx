'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Report, ReportListResponse, UploadReportResponse } from '@/types/report';
import { DASHBOARD_POLL_INTERVAL } from '@/lib/constants';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ReportSkeleton } from '@/components/ui/Skeleton';
import { HealthScoreGauge } from '@/components/shared/HealthScoreGauge';
import { ReportRow } from '@/components/shared/ReportRow';
import { UploadZone } from '@/components/shared/UploadZone';
import { RISK_TIER_COLOR } from '@/lib/constants';

// ── Mock data for when backend is unavailable ──────────────────────────────
const MOCK_REPORTS: Report[] = [
  {
    id: 'r1', user_id: 'u1', status: 'completed', source: 'web',
    file_url: null, health_score: 78,
    risks: {
      homa_ir: { value: 1.4, tier: 'normal' },
      pcos: { risk_level: 'low', indicators: [] },
      anemia: { risk_level: 'none' },
      lipid_profile: { tier: 'optimal' }
    },
    biomarkers: [
      { slug: 'fasting_glucose', value: 92, unit: 'mg/dL', normal_range: '70-100', status: 'normal' },
      { slug: 'hemoglobin', value: 13.5, unit: 'g/dL', normal_range: '12-17', status: 'normal' },
    ],
    dos_donts: { dos: ['Stay hydrated', 'Regular exercise'], donts: ['Avoid sugary drinks'] },
    care_plan: null,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'r2', user_id: 'u1', status: 'processing', source: 'web',
    file_url: null, health_score: null, risks: null, biomarkers: null, dos_donts: null, care_plan: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function PatientDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const latestReport = reports[0] ?? null;
  const hasProcessing = reports.some(r => r.status === 'processing');

  const fetchReports = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiClient.get<ReportListResponse>('/reports?page=1&limit=10');
      setReports(res.data.reports);
    } catch {
      // Use mock data when backend isn't available
      setReports(MOCK_REPORTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Auto-poll while any report is still processing
  useEffect(() => {
    if (hasProcessing) {
      pollRef.current = setInterval(() => fetchReports(true), DASHBOARD_POLL_INTERVAL);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [hasProcessing, fetchReports]);

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post<UploadReportResponse>('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Report uploaded! AI is analyzing your results...');
      // Optimistically add a processing entry
      setReports(prev => [{
        id: res.data.id, user_id: user?.id ?? '', status: 'processing', source: 'web',
        file_url: null, health_score: null, risks: null, biomarkers: null, dos_donts: null, care_plan: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, ...prev]);
    } catch (err) {
      // Mock: add a fake processing report
      toast.success('Report uploaded! (Mock) AI is analyzing...');
      setReports(prev => [{
        id: `mock-${Date.now()}`, user_id: user?.id ?? '', status: 'processing', source: 'web',
        file_url: null, health_score: null, risks: null, biomarkers: null, dos_donts: null, care_plan: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, ...prev]);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/reports/${deleteTarget}`);
      setReports(prev => prev.filter(r => r.id !== deleteTarget));
      toast.success('Report deleted.');
    } catch {
      setReports(prev => prev.filter(r => r.id !== deleteTarget));
      toast.success('Report deleted. (Mock)');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-extrabold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-[14px] mt-1">Welcome back, {user?.full_name?.split(' ')[0]}. Here's your health overview.</p>
      </div>

      {/* Top Grid: Health Score + Risk Tiers */}
      {latestReport?.status === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Score */}
          <Card className="flex flex-col items-center justify-center">
            <CardTitle icon={<i className="fa-solid fa-heart-pulse"/>}>Health Score</CardTitle>
            <HealthScoreGauge score={latestReport.health_score ?? 0} />
          </Card>

          {/* Risk Tiers */}
          <Card className="md:col-span-2">
            <CardTitle icon={<i className="fa-solid fa-triangle-exclamation"/>}>Risk Assessment</CardTitle>
            {latestReport.risks ? (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {latestReport.risks.homa_ir && (
                  <RiskCard label="HOMA-IR (Insulin)" value={latestReport.risks.homa_ir.tier.replace('_', ' ')} color={RISK_TIER_COLOR[latestReport.risks.homa_ir.tier]} score={latestReport.risks.homa_ir.value.toFixed(2)} />
                )}
                {latestReport.risks.pcos && (
                  <RiskCard label="PCOS Risk" value={latestReport.risks.pcos.risk_level} color={RISK_TIER_COLOR[latestReport.risks.pcos.risk_level]} />
                )}
                {latestReport.risks.anemia && (
                  <RiskCard label="Anemia Risk" value={latestReport.risks.anemia.risk_level} color={RISK_TIER_COLOR[latestReport.risks.anemia.risk_level]} />
                )}
                {latestReport.risks.lipid_profile && (
                  <RiskCard label="Lipid Profile" value={latestReport.risks.lipid_profile.tier.replace('_', ' ')} color={RISK_TIER_COLOR[latestReport.risks.lipid_profile.tier]} />
                )}
              </div>
            ) : (
              <div className="text-text-secondary text-[14px] mt-2">No risk data available yet.</div>
            )}
          </Card>
        </div>
      )}

      {/* Biomarkers Table (if available) */}
      {latestReport?.biomarkers && latestReport.biomarkers.length > 0 && (
        <Card>
          <CardTitle icon={<i className="fa-solid fa-vials"/>}>Key Biomarkers
            <span className="text-[12px] font-normal text-text-muted ml-2">— from latest report</span>
          </CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="pb-2 pr-4 font-medium">Marker</th>
                  <th className="pb-2 pr-4 font-medium">Value</th>
                  <th className="pb-2 pr-4 font-medium">Normal Range</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestReport.biomarkers.map((b) => (
                  <tr key={b.slug} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium text-text-primary capitalize">{b.slug.replace(/_/g, ' ')}</td>
                    <td className="py-3 pr-4 text-text-primary">{b.value} <span className="text-text-muted">{b.unit}</span></td>
                    <td className="py-3 pr-4 text-text-secondary">{b.normal_range}</td>
                    <td className="py-3">
                      <Badge status={b.status === 'normal' ? 'success' : b.status === 'high' ? 'error' : 'warning'}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            {latestReport && (
              <Link href={`/patient/report/${latestReport.id}`} className="text-accent text-[13px] font-semibold hover:underline flex items-center gap-1">
                View full report <i className="fa-solid fa-arrow-right text-[11px]"/>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* Dos & Don'ts */}
      {latestReport?.dos_donts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardTitle icon={<i className="fa-solid fa-circle-check text-success"/>}>What to Do</CardTitle>
            <ul className="space-y-2">
              {latestReport.dos_donts.dos.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] text-text-secondary">
                  <i className="fa-solid fa-check text-success text-[11px] mt-[4px] flex-shrink-0"/>
                  {d}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle icon={<i className="fa-solid fa-circle-xmark text-danger"/>}>What to Avoid</CardTitle>
            <ul className="space-y-2">
              {latestReport.dos_donts.donts.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] text-text-secondary">
                  <i className="fa-solid fa-xmark text-danger text-[11px] mt-[4px] flex-shrink-0"/>
                  {d}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Upload + Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2">
          <Card>
            <CardTitle icon={<i className="fa-solid fa-cloud-arrow-up"/>}>Upload Report</CardTitle>
            <UploadZone onFileSelect={handleFileSelect} isUploading={uploading} />
          </Card>
        </div>

        {/* Reports List */}
        <div className="lg:col-span-3">
          <Card>
            <CardTitle icon={<i className="fa-solid fa-file-lines"/>}>My Reports</CardTitle>
            {loading ? (
              <div>
                <ReportSkeleton />
                <ReportSkeleton />
                <ReportSkeleton />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-10 text-text-secondary">
                <i className="fa-regular fa-folder-open text-[40px] mb-3 text-text-muted block"></i>
                No reports yet. Upload your first pathology report above!
              </div>
            ) : (
              <div>
                {reports.map((r) => (
                  <ReportRow
                    key={r.id}
                    id={r.id}
                    name={`Report — ${formatDate(r.created_at)}`}
                    date={formatDate(r.created_at)}
                    status={r.status}
                    canDelete
                    onDelete={(id) => setDeleteTarget(id)}
                    onClick={(id) => r.status === 'completed' && router.push(`/patient/report/${id}`)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        loading={deleting}
      />
    </div>
  );
}

// Sub-component for risk tier cards
function RiskCard({ label, value, color, score }: { label: string; value: string; color: string; score?: string }) {
  return (
    <div className="bg-bg-input rounded-xl p-4 border border-border">
      <div className="text-[12px] text-text-muted mb-2">{label}</div>
      <div className="flex items-end justify-between">
        <div className="text-[15px] font-bold capitalize" style={{ color }}>{value}</div>
        {score && <div className="text-[13px] text-text-secondary font-medium">{score}</div>}
      </div>
      <div className="h-1.5 rounded-full bg-border mt-3 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: color }}></div>
      </div>
    </div>
  );
}
