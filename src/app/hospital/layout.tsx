'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
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
    { label: 'Dashboard', href: '/hospital/dashboard', icon: 'fa-hospital' },
    { label: 'Analytics Map', href: '/hospital/map', icon: 'fa-map-location-dot' },
    { label: 'Patient Registry', href: '/hospital/patients', icon: 'fa-users' },
    { label: 'Doctors', href: '/hospital/doctors', icon: 'fa-user-doctor' },
  ];

  return (
    <div className="flex bg-bg-main min-h-screen">
      <Sidebar basePath="/hospital/dashboard" items={navItems} />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
