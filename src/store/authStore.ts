'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginResponse } from '@/types/auth';
import { registerAuthStore } from '@/lib/api';

interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: number | null; // Unix ms timestamp

  // Actions
  setAuth: (response: LoginResponse) => void;
  setTokens: (access_token: string, expires_in: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      token_expires_at: null,

      setAuth: (response: LoginResponse) => {
        set({
          user: response.user,
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          token_expires_at: Date.now() + response.expires_in * 1000,
        });
      },

      setTokens: (access_token: string, expires_in: number) => {
        set({
          access_token,
          token_expires_at: Date.now() + expires_in * 1000,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
        });
        // Clear cookies used by middleware
        if (typeof document !== 'undefined') {
          document.cookie = 'access_token=; path=/; max-age=0';
          document.cookie = 'user_role=; path=/; max-age=0';
          document.cookie = 'user_age=; path=/; max-age=0';
        }
      },
    }),
    {
      name: 'peep-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Register store with the API interceptor (client-side only)
if (typeof window !== 'undefined') {
  registerAuthStore(() => ({
    access_token: useAuthStore.getState().access_token,
    refresh_token: useAuthStore.getState().refresh_token,
    token_expires_at: useAuthStore.getState().token_expires_at,
    setTokens: useAuthStore.getState().setTokens,
    clearAuth: useAuthStore.getState().clearAuth,
  }));
}

// Selector helpers
export const selectUser = (s: AuthState) => s.user;
export const selectRole = (s: AuthState) => s.user?.role ?? null;
export const selectIsAuthenticated = (s: AuthState) => !!s.access_token;
