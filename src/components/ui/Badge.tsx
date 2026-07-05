import React from 'react';

export type BadgeStatus = 'processing' | 'completed' | 'failed' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  status: BadgeStatus;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ status, children, className = '' }: BadgeProps) {
  let baseClass = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold";
  let colorClass = "";

  switch (status) {
    case 'processing':
    case 'info':
      colorClass = "bg-[rgba(108,99,255,0.12)] text-accent";
      break;
    case 'completed':
    case 'success':
      colorClass = "bg-[rgba(16,185,129,0.12)] text-success";
      break;
    case 'failed':
    case 'error':
      colorClass = "bg-[rgba(239,68,68,0.12)] text-danger";
      break;
    case 'warning':
      colorClass = "bg-[rgba(245,158,11,0.12)] text-warning";
      break;
  }

  return (
    <span className={`${baseClass} ${colorClass} ${className}`}>
      {status === 'processing' && (
        <span className="w-3 h-3 border-[1.5px] border-accent/30 border-t-accent rounded-full animate-spin inline-block"></span>
      )}
      {children}
    </span>
  );
}
