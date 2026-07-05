'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Report } from '@/types/report';
import { REPORT_DETAIL_POLL_INTERVAL, RISK_TIER_COLOR } from '@/lib/constants';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const MOCK_REPORT: Report = {
  id: 'r1', user_id: 'u1', status: 'completed', source: 'web', file_url: null,
  health_score: 78,
  risks: {
    homa_ir: { value: 1.4, tier: 'normal' },
    pcos: { risk_level: 'low', indicators: ['slightly elevated LH'] },
    anemia: { risk_level: 'none' },
    lipid_profile: { tier: 'optimal' },
  },
  biomarkers: [
    { slug: 'fasting_glucose', value: 92, unit: 'mg/dL', normal_range: '70-100', status: 'normal' },
    { slug: 'hemoglobin', value: 13.5, unit: 'g/dL', normal_range: '12-17', status: 'normal' },
    { slug: 'ldl_cholesterol', value: 145, unit: 'mg/dL', normal_range: '<130', status: 'high' },
    { slug: 'tsh', value: 3.2, unit: 'mIU/L', normal_range: '0.4-4.0', status: 'normal' },
    { slug: 'vitamin_d', value: 18, unit: 'ng/mL', normal_range: '30-100', status: 'low' },
    { slug: 'hba1c', value: 5.4, unit: '%', normal_range: '<5.7', status: 'normal' },
  ],
  dos_donts: {
    dos: [
      'Eat balanced meals with plenty of fiber and vegetables',
      'Exercise for at least 30 minutes daily',
      'Stay hydrated — aim for 2-3L of water daily',
      'Get 7-8 hours of quality sleep',
    ],
    donts: [
      'Avoid refined carbohydrates and sugary drinks',
      'Limit saturated and trans fats',
      'Avoid smoking and excessive alcohol',
    ],
  },
  care_plan: {
    months: [
      { month: 1, diet_changes: 'Start a low-glycemic diet. Increase leafy greens.', lifestyle_tips: 'Walk 30 min/day.', supplements: 'Vitamin D 1000 IU, Omega-3 1000mg', follow_up: 'Repeat fasting glucose in 4 weeks' },
      { month: 2, diet_changes: 'Reduce saturated fat intake. Increase fiber.', lifestyle_tips: 'Add resistance training 2x/week.', supplements: 'Continue previous', follow_up: 'Lipid panel check' },
      { month: 3, diet_changes: 'Introduce Mediterranean diet principles.', lifestyle_tips: 'Yoga or meditation for stress.', supplements: 'Vitamin D 2000 IU if levels still low', follow_up: 'Full panel repeat' },
      { month: 4, diet_changes: 'Maintain current changes.', lifestyle_tips: 'Track sleep quality.', supplements: 'Reassess based on repeat test', follow_up: 'Doctor consultation' },
      { month: 5, diet_changes: 'Increase probiotic foods.', lifestyle_tips: 'Increase cardio to 45 min.', supplements: 'Probiotic supplement if needed', follow_up: 'HOMA-IR retest' },
      { month: 6, diet_changes: 'Consolidate dietary habits.', lifestyle_tips: 'Final lifestyle review.', supplements: 'As directed by doctor', follow_up: 'Comprehensive health review' },
    ],
  },
  created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'biomarkers' | 'care_plan'>('overview');
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchReport = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiClient.get<Report>(`/reports/${reportId}`);
      setReport(res.data);
    } catch {
      setReport(MOCK_REPORT);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    if (report?.status === 'processing') {
      pollRef.current = setInterval(() => fetchReport(true), REPORT_DETAIL_POLL_INTERVAL);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [report?.status, fetchReport]);

  const statusColors = { completed: '#10B981', processing: '#6C63FF', failed: '#EF4444' } as const;

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );

  if (!report) return (
    <div className="text-center py-20">
      <div className="text-[40px] mb-4">❌</div>
      <div className="text-text-primary font-bold text-[18px]">Report not found</div>
      <Button className="mt-6" onClick={() => router.push('/patient/dashboard')}>Back to Dashboard</Button>
    </div>
  );

  if (report.status === 'processing') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin block"></span>
      </div>
      <h2 className="text-[22px] font-bold text-text-primary">AI is Analyzing Your Report</h2>
      <p className="text-text-secondary max-w-md">This usually takes 1-3 minutes. This page will update automatically when results are ready.</p>
      <Button variant="outline" onClick={() => router.push('/patient/dashboard')}>
        <i className="fa-solid fa-arrow-left"/> Back to Dashboard
      </Button>
    </div>
  );

  if (report.status === 'failed') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <div className="w-20 h-20 rounded-full bg-[rgba(239,68,68,0.12)] flex items-center justify-center text-danger text-[36px]">
        <i className="fa-solid fa-circle-xmark"/>
      </div>
      <h2 className="text-[22px] font-bold text-text-primary">Analysis Failed</h2>
      <p className="text-text-secondary">We couldn't process this report. Please try uploading again with a clearer image.</p>
      <Button onClick={() => router.push('/patient/dashboard')}>
        <i className="fa-solid fa-arrow-left"/> Back to Dashboard
      </Button>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
    { id: 'biomarkers', label: 'Biomarkers', icon: 'fa-vials' },
    { id: 'care_plan', label: '6-Month Plan', icon: 'fa-calendar-check' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/patient/dashboard')} className="w-9 h-9 rounded-xl bg-bg-card border border-border flex items-center justify-center text-text-secondary hover:text-accent transition-colors">
            <i className="fa-solid fa-arrow-left"/>
          </button>
          <div>
            <h1 className="text-[24px] font-extrabold text-text-primary">Report Details</h1>
            <p className="text-[13px] text-text-secondary mt-0.5">
              Uploaded {new Date(report.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              &nbsp;·&nbsp;
              <Badge status={report.status}>{report.status.charAt(0).toUpperCase() + report.status.slice(1)}</Badge>
            </p>
          </div>
        </div>
        {report.file_url && (
          <a href={report.file_url} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><i className="fa-solid fa-download"/> Download PDF</Button>
          </a>
        )}
      </div>

      {/* Health Score Banner */}
      {report.health_score !== null && (
        <div className="bg-gradient-to-r from-accent to-[#7C3AED] rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium opacity-80 mb-1">Overall Health Score</div>
            <div className="text-[52px] font-extrabold leading-none">{report.health_score}</div>
            <div className="text-[13px] opacity-70 mt-1">out of 100</div>
          </div>
          <div className="text-right">
            <div className="text-[13px] opacity-80 mb-2">
              {report.health_score >= 71 ? '🟢 Good Shape' : report.health_score >= 41 ? '🟡 Needs Attention' : '🔴 Critical'}
            </div>
            <div className="text-[12px] opacity-60">Based on {report.biomarkers?.length ?? 0} biomarkers</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <i className={`fa-solid ${t.icon}`}/> {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Risk Tiers */}
          {report.risks && (
            <Card>
              <CardTitle icon={<i className="fa-solid fa-triangle-exclamation"/>}>Risk Assessment</CardTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {report.risks.homa_ir && (
                  <div className="bg-bg-input rounded-xl p-4 border border-border text-center">
                    <div className="text-[11px] text-text-muted mb-2 uppercase tracking-wide">HOMA-IR</div>
                    <div className="text-[22px] font-bold" style={{ color: RISK_TIER_COLOR[report.risks.homa_ir.tier] }}>
                      {report.risks.homa_ir.value.toFixed(2)}
                    </div>
                    <div className="text-[11px] mt-1 capitalize" style={{ color: RISK_TIER_COLOR[report.risks.homa_ir.tier] }}>
                      {report.risks.homa_ir.tier.replace('_', ' ')}
                    </div>
                  </div>
                )}
                {report.risks.pcos && (
                  <div className="bg-bg-input rounded-xl p-4 border border-border text-center">
                    <div className="text-[11px] text-text-muted mb-2 uppercase tracking-wide">PCOS Risk</div>
                    <div className="text-[22px] font-bold capitalize" style={{ color: RISK_TIER_COLOR[report.risks.pcos.risk_level] }}>
                      {report.risks.pcos.risk_level}
                    </div>
                    {report.risks.pcos.indicators.length > 0 && (
                      <div className="text-[10px] text-text-muted mt-1">{report.risks.pcos.indicators[0]}</div>
                    )}
                  </div>
                )}
                {report.risks.anemia && (
                  <div className="bg-bg-input rounded-xl p-4 border border-border text-center">
                    <div className="text-[11px] text-text-muted mb-2 uppercase tracking-wide">Anemia</div>
                    <div className="text-[22px] font-bold capitalize" style={{ color: RISK_TIER_COLOR[report.risks.anemia.risk_level] }}>
                      {report.risks.anemia.risk_level}
                    </div>
                  </div>
                )}
                {report.risks.lipid_profile && (
                  <div className="bg-bg-input rounded-xl p-4 border border-border text-center">
                    <div className="text-[11px] text-text-muted mb-2 uppercase tracking-wide">Lipid Profile</div>
                    <div className="text-[22px] font-bold capitalize" style={{ color: RISK_TIER_COLOR[report.risks.lipid_profile.tier] }}>
                      {report.risks.lipid_profile.tier.replace('_', ' ')}
                    </div>
                  </div>
                )}
              </div>
              {/* PCOS Indicators */}
              {(report.risks.pcos?.indicators?.length ?? 0) > 0 && (
                <div className="mt-4 p-4 bg-bg-input rounded-xl border border-border">
                  <div className="text-[13px] font-semibold text-text-primary mb-2">PCOS Indicators Detected</div>
                  <div className="flex flex-wrap gap-2">
                    {report.risks.pcos!.indicators.map((ind, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[rgba(245,158,11,0.12)] text-warning text-[11px] rounded-full font-medium">{ind}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Dos & Donts */}
          {report.dos_donts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardTitle icon={<i className="fa-solid fa-circle-check text-success"/>}>What to Do</CardTitle>
                <ul className="space-y-3">
                  {report.dos_donts.dos.map((d, i) => (
                    <li key={i} className="flex items-start gap-3 text-[14px] text-text-secondary">
                      <div className="w-5 h-5 rounded-full bg-[rgba(16,185,129,0.12)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="fa-solid fa-check text-success text-[9px]"/>
                      </div>
                      {d}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <CardTitle icon={<i className="fa-solid fa-circle-xmark text-danger"/>}>What to Avoid</CardTitle>
                <ul className="space-y-3">
                  {report.dos_donts.donts.map((d, i) => (
                    <li key={i} className="flex items-start gap-3 text-[14px] text-text-secondary">
                      <div className="w-5 h-5 rounded-full bg-[rgba(239,68,68,0.12)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="fa-solid fa-xmark text-danger text-[9px]"/>
                      </div>
                      {d}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Tab: Biomarkers */}
      {activeTab === 'biomarkers' && report.biomarkers && (
        <Card>
          <CardTitle icon={<i className="fa-solid fa-vials"/>}>All Biomarkers</CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="pb-3 pr-6 font-medium">Biomarker</th>
                  <th className="pb-3 pr-6 font-medium">Your Value</th>
                  <th className="pb-3 pr-6 font-medium">Normal Range</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.biomarkers.map((b) => (
                  <tr key={b.slug} className="border-b border-border last:border-0">
                    <td className="py-4 pr-6 font-semibold text-text-primary capitalize">{b.slug.replace(/_/g, ' ')}</td>
                    <td className="py-4 pr-6 font-bold text-text-primary">
                      {b.value} <span className="text-text-muted font-normal">{b.unit}</span>
                    </td>
                    <td className="py-4 pr-6 text-text-secondary">{b.normal_range} {b.unit}</td>
                    <td className="py-4">
                      <Badge status={b.status === 'normal' ? 'success' : b.status === 'high' ? 'error' : 'warning'}>
                        {b.status === 'normal' ? '✓ Normal' : b.status === 'high' ? '↑ High' : '↓ Low'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Care Plan */}
      {activeTab === 'care_plan' && report.care_plan && (
        <div className="space-y-4">
          <p className="text-[14px] text-text-secondary">Your personalized 6-month recovery and improvement plan based on your biomarker analysis.</p>
          {report.care_plan.months.map((m) => (
            <Card key={m.month}>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center font-extrabold text-[18px] flex-shrink-0">
                  {m.month}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-text-primary mb-3">Month {m.month}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1.5">Diet Changes</div>
                      <div className="text-[13px] text-text-secondary">{m.diet_changes}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1.5">Lifestyle Tips</div>
                      <div className="text-[13px] text-text-secondary">{m.lifestyle_tips}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1.5">Supplements</div>
                      <div className="text-[13px] text-text-secondary">{m.supplements}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted uppercase tracking-wide mb-1.5">Follow-up</div>
                      <div className="text-[13px] text-text-secondary">{m.follow_up}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
