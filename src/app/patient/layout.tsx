'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.access_token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token, router]);

  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', href: '/patient/dashboard', icon: 'fa-chart-pie' },
    { label: 'Diet Plan', href: '/patient/diet-plan', icon: 'fa-apple-whole' },
    { label: 'Clinical Notes', href: '/patient/notes', icon: 'fa-note-sticky' },
    { label: 'Settings', href: '/patient/settings', icon: 'fa-gear' },
  ];

  return (
    <div className="flex bg-bg-main min-h-screen">
      <Sidebar basePath="/patient/dashboard" items={navItems} />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
