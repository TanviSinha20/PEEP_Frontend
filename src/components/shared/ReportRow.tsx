import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface ReportRowProps {
  id: string;
  name: string;
  date: string;
  size?: string;
  status: 'processing' | 'completed' | 'failed';
  canDelete?: boolean;
  canUpload?: boolean;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

export function ReportRow({ id, name, date, size, status, canDelete = false, onDelete, onClick }: ReportRowProps) {
  
  let iconClass = "bg-[rgba(16,185,129,0.12)] text-success";
  let iconName = "fa-file-pdf";

  if (status === 'processing') {
    iconClass = "bg-[rgba(108,99,255,0.12)] text-accent animate-pulse";
    iconName = "fa-spinner fa-spin";
  } else if (status === 'failed') {
    iconClass = "bg-[rgba(239,68,68,0.12)] text-danger";
    iconName = "fa-circle-xmark";
  }

  return (
    <div 
      className="flex items-center gap-3.5 py-3.5 border-b border-border last:border-0 hover:bg-bg-card-secondary transition-colors cursor-pointer px-2 -mx-2 rounded-lg"
      onClick={() => onClick && onClick(id)}
    >
      <div className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0 ${iconClass}`}>
        <i className={`fa-solid ${iconName}`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-text-primary truncate">{name}</div>
        <div className="text-[12px] text-text-secondary mt-0.5 truncate">
          {date} {size ? `• ${size}` : ''}
        </div>
      </div>
      <Badge status={status} className={status === 'processing' ? 'animate-pulse' : ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
      
      {canDelete && status !== 'processing' && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(id);
          }}
          className="ml-2 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-[rgba(239,68,68,0.12)] hover:text-danger transition-colors"
          title="Delete Report"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      )}
    </div>
  );
}
