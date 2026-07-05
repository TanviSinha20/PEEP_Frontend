'use client';

import { useState } from 'react';
import Link from 'next/link';
import { publicClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await publicClient.post('/auth/forgot-password', { email });
    } catch (err) {
      // Ignore error for security reasons (don't leak if email exists)
      console.warn("Forgot password API failed/mocked", err);
    } finally {
      setLoading(false);
      setSubmitted(true); // Always show success
    }
  };

  if (submitted) {
    return (
      <div className="bg-bg-card border border-border rounded-[24px] p-8 shadow-md text-center">
        <div className="w-16 h-16 bg-[rgba(16,185,129,0.12)] text-success rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          ✓
        </div>
        <div className="text-[24px] font-bold text-text-primary mb-2">Check your email</div>
        <div className="text-[14px] text-text-secondary mb-8">
          If an account exists for {email}, you will receive a password reset link shortly.
        </div>
        <Link href="/auth/login" className="w-full inline-block bg-bg-input hover:bg-border text-text-primary py-3.5 rounded-xl text-[14px] font-medium transition-colors">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-[24px] p-8 shadow-md">
      <div className="text-[24px] font-bold text-text-primary mb-1.5">Reset Password</div>
      <div className="text-[14px] text-text-secondary mb-7">Enter your email address and we'll send you a link to reset your password.</div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-text-secondary font-medium text-[13px] mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl text-[14px] font-medium transition-colors disabled:opacity-70 flex items-center justify-center mb-6"
        >
          {loading ? (
             <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <div className="text-center text-[14px] text-text-secondary">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-accent font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
