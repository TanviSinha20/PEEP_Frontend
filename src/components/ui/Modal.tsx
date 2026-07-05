'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export function Modal({ 
  isOpen, onClose, onConfirm, title, message, 
  confirmText = 'Confirm', cancelText = 'Cancel', 
  isDestructive = false, loading = false 
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-card border border-border rounded-[20px] p-6 shadow-lg max-w-sm w-full animate-in zoom-in-95 duration-200">
        <h3 className="text-[18px] font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-[14px] text-text-secondary mb-6">{message}</p>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            fullWidth 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={isDestructive ? 'danger' : 'primary'} 
            fullWidth 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
