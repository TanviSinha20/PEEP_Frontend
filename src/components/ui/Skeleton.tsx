import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-border animate-pulse rounded-md ${className}`} />
  );
}

export function ReportSkeleton() {
  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-border">
      <Skeleton className="w-[42px] h-[42px] rounded-[10px] flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}
