// ============================================================
// AUTH TYPES
// ============================================================

export type UserRole = 'patient' | 'doctor' | 'hospital_partner';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  age: number | null;
  sex: 'male' | 'female' | 'other' | null;
  phone: string | null;
  dob: string | null;
  blood_group: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  diet: 'vegetarian' | 'non_veg' | 'vegan' | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  hospital_id: string | null;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds (900 = 15 min)
  user: User;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  hospital_id?: string;
}

export interface RegisterResponse {
  message: string;
}

export interface RefreshResponse {
  access_token: string;
  expires_in: number;
}

export interface OnboardRequest {
  age: number;
  sex: 'male' | 'female' | 'other';
  diet: 'vegetarian' | 'non_veg' | 'vegan';
  region: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
}

export interface ProfileUpdateRequest {
  full_name?: string;
  dob?: string;
  blood_group?: string;
  allergies?: string;
  chronic_conditions?: string;
  diet?: 'vegetarian' | 'non_veg' | 'vegan';
  region?: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
}
