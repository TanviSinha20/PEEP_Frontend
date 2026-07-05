'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { LoginResponse } from '@/types/auth';

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    (response: LoginResponse) => {
      store.setAuth(response);

      // Set cookies for middleware (httpOnly-style using client cookie)
      const maxAge = response.expires_in;
      document.cookie = `access_token=${response.access_token}; path=/; max-age=${maxAge}; SameSite=Strict`;
      document.cookie = `user_role=${response.user.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      document.cookie = `user_age=${response.user.age ?? 'null'}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;

      // Redirect based on role + onboarding status
      if (response.user.role === 'doctor') {
        router.push('/doctor/dashboard');
      } else if (response.user.role === 'hospital_partner') {
        router.push('/hospital/dashboard');
      } else if (response.user.age === null) {
        router.push('/onboarding');
      } else {
        router.push('/patient/dashboard');
      }
    },
    [store, router]
  );

  const logout = useCallback(() => {
    store.clearAuth();
    router.push('/auth/login');
  }, [store, router]);

  return {
    user: store.user,
    isAuthenticated: !!store.access_token,
    role: store.user?.role ?? null,
    login,
    logout,
  };
}
