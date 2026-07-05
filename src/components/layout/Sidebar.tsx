'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  items: NavItem[];
  basePath: string;
}

export function Sidebar({ items, basePath }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] h-screen bg-bg-card border-r border-border flex flex-col fixed left-0 top-0 z-50">
      
      {/* Logo */}
      <div className="h-[70px] flex items-center px-6 border-b border-border shrink-0">
        <Link href={basePath} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-[16px]">
            P
          </div>
          <span className="text-[20px] font-extrabold text-text-primary tracking-tight">PEEP</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== basePath);
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-[rgba(108,99,255,0.08)] text-accent' 
                  : 'text-text-secondary hover:bg-bg-input hover:text-text-primary'
              }`}
            >
              <div className={`w-6 text-center text-[16px] transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <span className="text-[14px]">{item.label}</span>
              
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Note */}
      <div className="p-6 mt-auto shrink-0 border-t border-border">
        <div className="bg-bg-input rounded-xl p-4 border border-border">
          <div className="text-[12px] font-bold text-text-primary mb-1 flex items-center gap-1.5">
            <i className="fa-solid fa-shield-halved text-success"></i> Secure
          </div>
          <div className="text-[11px] text-text-secondary leading-relaxed">
            Your data is encrypted and protected under HIPAA compliance.
          </div>
        </div>
      </div>
    </aside>
  );
}
