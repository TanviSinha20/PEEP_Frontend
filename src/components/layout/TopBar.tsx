'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export function TopBar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  return (
    <header className="h-[70px] bg-bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left side: Greeting */}
      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <div className="text-[14px] text-text-secondary">Welcome back,</div>
          <div className="text-[16px] font-bold text-text-primary">
            {user?.role === 'doctor' ? `Dr. ${user.full_name}` : user?.full_name || 'User'}
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex relative">
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-bg-input border border-border rounded-full py-2 pl-4 pr-10 text-[13px] w-[200px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          <i className="fa-solid fa-search absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-[13px]"></i>
        </div>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-full bg-bg-input border border-border flex items-center justify-center text-text-secondary hover:text-accent transition-colors relative">
          <i className="fa-regular fa-bell"></i>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full border border-bg-card"></span>
        </button>

        {/* Profile Dropdown (simplified as a logout button for now) */}
        <div className="h-8 w-[1px] bg-border mx-1"></div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-text-secondary hover:text-danger transition-colors text-[14px] font-medium px-2"
          title="Sign Out"
        >
          <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[14px]">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
