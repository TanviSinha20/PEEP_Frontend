import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-bg-card border border-border rounded-[14px] p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, icon, rightElement }: { children: React.ReactNode, icon?: React.ReactNode, rightElement?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 text-[15px] font-semibold text-text-primary">
        {icon && <span className="text-accent text-[16px] flex items-center justify-center">{icon}</span>}
        {children}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}
