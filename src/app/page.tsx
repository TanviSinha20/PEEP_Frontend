'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LandingPage() {
  const router = useRouter();
  const { access_token, user } = useAuthStore();

  useEffect(() => {
    if (access_token && user) {
      if (user.role === 'patient') {
        router.push(user.age ? '/patient/dashboard' : '/onboarding');
      } else if (user.role === 'doctor') {
        router.push('/doctor/dashboard');
      } else if (user.role === 'hospital_partner') {
        router.push('/hospital/dashboard');
      }
    }
  }, [access_token, user, router]);

  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 bg-bg-card border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-light border border-[rgba(79,70,229,0.15)] flex items-center justify-center">
            <span className="text-accent text-xl font-bold">♥</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">PEEP</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-medium text-text-secondary hover:text-accent transition-colors">
            Sign In
          </Link>
          <Link href="/auth/register" className="text-sm font-medium bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h2 className="text-5xl md:text-6xl font-extrabold text-text-primary mb-6 tracking-tight">
          Pathology Intelligence <br />
          <span className="text-accent">Made Simple</span>
        </h2>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
          Upload your blood test reports and instantly get AI-powered insights, personalized diet plans, and health score tracking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/auth/register" className="bg-accent hover:bg-accent-hover text-white px-8 py-3.5 rounded-xl text-lg font-medium shadow-md transition-all">
            Join as Patient
          </Link>
          <Link href="/auth/register?role=hospital_partner" className="bg-white hover:bg-bg-input text-text-primary border border-border px-8 py-3.5 rounded-xl text-lg font-medium shadow-sm transition-all">
            For Hospitals & Clinics
          </Link>
        </div>

        {/* Features / How it works simple section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mt-24">
          <div className="bg-bg-card p-8 rounded-2xl border border-border shadow-sm text-left">
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center text-accent text-xl mb-6">1</div>
            <h3 className="text-xl font-bold text-text-primary mb-3">Upload Report</h3>
            <p className="text-text-secondary">Drag and drop your PDF or image pathology report. Our AI reads it instantly.</p>
          </div>
          <div className="bg-bg-card p-8 rounded-2xl border border-border shadow-sm text-left">
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center text-accent text-xl mb-6">2</div>
            <h3 className="text-xl font-bold text-text-primary mb-3">Get Insights</h3>
            <p className="text-text-secondary">Understand your biomarkers, health score, and potential risks clearly.</p>
          </div>
          <div className="bg-bg-card p-8 rounded-2xl border border-border shadow-sm text-left">
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center text-accent text-xl mb-6">3</div>
            <h3 className="text-xl font-bold text-text-primary mb-3">Take Action</h3>
            <p className="text-text-secondary">Follow a personalized diet and care plan based on Indian food guidelines.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-text-muted text-sm border-t border-border">
        &copy; {new Date().getFullYear()} PEEP Healthcare. All rights reserved.
      </footer>
    </div>
  );
}
