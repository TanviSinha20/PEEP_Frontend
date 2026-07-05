import React from 'react';

interface HealthScoreGaugeProps {
  score: number; // 0 - 100
  label?: string;
}

export function HealthScoreGauge({ score, label = 'out of 100' }: HealthScoreGaugeProps) {
  // SVG Arc calculation
  // 180 degrees arc with radius 60
  // Length = Math.PI * 60 ≈ 188
  const maxOffset = 188;
  const offset = maxOffset - (score / 100) * maxOffset;

  let statusText = 'Excellent';
  let statusColor = '#10B981'; // success
  let statusBg = 'rgba(16,185,129,0.12)';
  let icon = 'fa-circle-check';

  if (score <= 40) {
    statusText = 'Critical';
    statusColor = '#EF4444';
    statusBg = 'rgba(239,68,68,0.12)';
    icon = 'fa-triangle-exclamation';
  } else if (score <= 70) {
    statusText = 'Needs Attention';
    statusColor = '#F59E0B';
    statusBg = 'rgba(245,158,11,0.12)';
    icon = 'fa-circle-exclamation';
  }

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative flex flex-col items-center justify-center">
        <svg className="w-[160px] h-[100px]" viewBox="0 0 160 90">
          {/* Background arc */}
          <path 
            d="M 20 85 A 60 60 0 0 1 140 85" 
            fill="none" 
            stroke="var(--border-color)" 
            strokeWidth="14" 
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path 
            d="M 20 85 A 60 60 0 0 1 140 85" 
            fill="none" 
            stroke="url(#gaugeGrad)" 
            strokeWidth="14" 
            strokeLinecap="round"
            strokeDasharray="188" 
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444"/>
              <stop offset="50%" stopColor="#F59E0B"/>
              <stop offset="100%" stopColor="#10B981"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="text-[36px] font-extrabold text-text-primary text-center -mt-8">{score}</div>
        <div className="text-[12px] text-text-secondary text-center mt-0.5">{label}</div>
      </div>
      <div 
        className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-[11px] font-semibold"
        style={{ backgroundColor: statusBg, color: statusColor }}
      >
        <i className={`fa-solid ${icon}`}></i> {statusText}
      </div>
    </div>
  );
}
