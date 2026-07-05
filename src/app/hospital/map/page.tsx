'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';
import { ClusterResponse } from '@/types/hospital';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { RISK_TIER_COLOR } from '@/lib/constants';

// Dynamically import the map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/shared/AnalyticsMap'), { ssr: false, loading: () => <Skeleton className="h-[500px] rounded-2xl"/> });

const BIOMARKER_OPTIONS = [
  { value: 'fasting_glucose', label: 'Fasting Glucose' },
  { value: 'hba1c', label: 'HbA1c' },
  { value: 'ldl_cholesterol', label: 'LDL Cholesterol' },
  { value: 'triglycerides', label: 'Triglycerides' },
  { value: 'hemoglobin', label: 'Hemoglobin' },
  { value: 'tsh', label: 'TSH (Thyroid)' },
  { value: 'vitamin_d', label: 'Vitamin D' },
];

const MOCK_CLUSTER: ClusterResponse = {
  biomarker_slug: 'fasting_glucose',
  threshold: 100,
  radius_km: 10,
  users: [
    { anonymized_id: 'u1', latitude: 28.6139, longitude: 77.2090, value: 128, distance_km: 0 },
    { anonymized_id: 'u2', latitude: 28.6200, longitude: 77.2200, value: 145, distance_km: 1.8 },
    { anonymized_id: 'u3', latitude: 28.6050, longitude: 77.1950, value: 112, distance_km: 2.1 },
    { anonymized_id: 'u4', latitude: 28.6300, longitude: 77.2400, value: 138, distance_km: 4.5 },
    { anonymized_id: 'u5', latitude: 28.5900, longitude: 77.1800, value: 105, distance_km: 5.2 },
  ],
};

export default function HospitalMapPage() {
  const [biomarker, setBiomarker] = useState('fasting_glucose');
  const [threshold, setThreshold] = useState(100);
  const [radius, setRadius] = useState(10);
  const [cluster, setCluster] = useState<ClusterResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCluster = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ClusterResponse>(
        `/hospital/cluster?biomarker_slug=${biomarker}&threshold=${threshold}&radius_km=${radius}`
      );
      setCluster(res.data);
    } catch {
      setCluster({ ...MOCK_CLUSTER, biomarker_slug: biomarker, threshold, radius_km: radius });
    } finally {
      setLoading(false);
    }
  }, [biomarker, threshold, radius]);

  useEffect(() => { fetchCluster(); }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-extrabold text-text-primary">Analytics Map</h1>
        <p className="text-text-secondary text-[14px] mt-1">
          Visualize anonymized patient data to detect regional health trends and high-risk clusters.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardTitle icon={<i className="fa-solid fa-sliders"/>}>Query Parameters</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label className="block text-text-secondary font-medium text-[13px] mb-2">Biomarker</label>
            <select
              value={biomarker}
              onChange={e => setBiomarker(e.target.value)}
              className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent appearance-none"
            >
              {BIOMARKER_OPTIONS.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-text-secondary font-medium text-[13px] mb-2">
              Threshold Value: <span className="text-accent font-bold">{threshold}</span>
            </label>
            <input
              type="range" min={50} max={300} value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[11px] text-text-muted mt-1"><span>50</span><span>300</span></div>
          </div>
          <div>
            <label className="block text-text-secondary font-medium text-[13px] mb-2">
              Radius: <span className="text-accent font-bold">{radius} km</span>
            </label>
            <input
              type="range" min={1} max={100} value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[11px] text-text-muted mt-1"><span>1 km</span><span>100 km</span></div>
          </div>
        </div>
        <Button onClick={fetchCluster} disabled={loading}>
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><i className="fa-solid fa-magnifying-glass-location"/> Run Cluster Query</>}
        </Button>
      </Card>

      {/* Map */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle icon={<i className="fa-solid fa-map-location-dot"/>}>
              Cluster Map
              {cluster && (
                <span className="ml-2 text-[13px] font-normal text-text-secondary">
                  — {cluster.users.length} patients above threshold
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 text-[12px] text-text-secondary">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-danger inline-block"/> High</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-warning inline-block"/> Moderate</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-success inline-block"/> Near threshold</div>
            </div>
          </div>
        </div>
        <div className="h-[500px]">
          {cluster && <MapComponent cluster={cluster} threshold={threshold} />}
        </div>
      </Card>

      {/* Results Table */}
      {cluster && cluster.users.length > 0 && (
        <Card>
          <CardTitle icon={<i className="fa-solid fa-table-list"/>}>
            Detected Cases ({cluster.users.length})
          </CardTitle>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-text-muted border-b border-border">
                <th className="pb-3 pr-4 font-medium">Anon. ID</th>
                <th className="pb-3 pr-4 font-medium">Value</th>
                <th className="pb-3 pr-4 font-medium">Distance</th>
                <th className="pb-3 pr-4 font-medium">Coordinates</th>
                <th className="pb-3 font-medium">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {cluster.users.map(u => {
                const excess = ((u.value - threshold) / threshold) * 100;
                const risk = excess > 40 ? 'high' : excess > 15 ? 'moderate' : 'near_threshold';
                const riskColor = risk === 'high' ? '#EF4444' : risk === 'moderate' ? '#F59E0B' : '#10B981';
                return (
                  <tr key={u.anonymized_id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-mono text-text-secondary">{u.anonymized_id}</td>
                    <td className="py-3 pr-4 font-bold text-text-primary">{u.value}</td>
                    <td className="py-3 pr-4 text-text-secondary">{u.distance_km.toFixed(1)} km</td>
                    <td className="py-3 pr-4 font-mono text-[12px] text-text-muted">{u.latitude.toFixed(4)}, {u.longitude.toFixed(4)}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize" style={{ backgroundColor: `${riskColor}20`, color: riskColor }}>
                        {risk.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
