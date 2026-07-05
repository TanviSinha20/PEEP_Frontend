'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ClusterResponse } from '@/types/hospital';

interface AnalyticsMapProps {
  cluster: ClusterResponse;
  threshold: number;
}

export default function AnalyticsMap({ cluster, threshold }: AnalyticsMapProps) {
  // Compute center from first point or default to India center
  const center: [number, number] = cluster.users.length > 0
    ? [cluster.users[0].latitude, cluster.users[0].longitude]
    : [20.5937, 78.9629];

  const getMarkerColor = (value: number) => {
    const excess = ((value - threshold) / threshold) * 100;
    if (excess > 40) return '#EF4444';   // red — high
    if (excess > 15) return '#F59E0B';   // amber — moderate
    return '#10B981';                     // green — near threshold
  };

  return (
    <MapContainer
      center={center}
      zoom={cluster.users.length > 0 ? 11 : 5}
      className="w-full h-full"
      style={{ background: '#1E293B' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Radius circle around the first point */}
      {cluster.users.length > 0 && (
        <Circle
          center={center}
          radius={cluster.radius_km * 1000}
          pathOptions={{ color: '#6C63FF', fillColor: '#6C63FF', fillOpacity: 0.05, weight: 1.5, dashArray: '6 4' }}
        />
      )}

      {/* Anonymized patient dots */}
      {cluster.users.map((u) => (
        <CircleMarker
          key={u.anonymized_id}
          center={[u.latitude, u.longitude]}
          radius={10}
          pathOptions={{
            color: getMarkerColor(u.value),
            fillColor: getMarkerColor(u.value),
            fillOpacity: 0.85,
            weight: 2,
          }}
        >
          <Tooltip>
            <div className="text-[12px]">
              <div className="font-semibold">ID: {u.anonymized_id}</div>
              <div>Value: <strong>{u.value}</strong></div>
              <div>Distance: {u.distance_km.toFixed(1)} km</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
