// ============================================================
// HOSPITAL TYPES
// ============================================================

import { Report } from './report';
import { User } from './auth';

export interface HospitalAnalytics {
  total_patients: number;
  active_reports: number;    // processing status
  high_risk_patients: number;
}

export interface HospitalPatient {
  id: string;
  full_name: string;
  age: number | null;
  sex: string | null;
  blood_group: string | null;
  region: string | null;
  phone: string | null;
  dob: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  diet: string | null;
  latest_report_status: 'processing' | 'completed' | 'failed' | null;
  latest_health_score: number | null;
  assigned_doctor_id: string | null;
  assigned_doctor_name: string | null;
}

export interface HospitalPatientsResponse {
  patients: HospitalPatient[];
  total: number;
  page: number;
  limit: number;
}

export interface HospitalDoctor {
  id: string;
  full_name: string;
  email: string;
  assigned_patient_count: number;
}

export interface HospitalDoctorsResponse {
  doctors: HospitalDoctor[];
}

export interface ClusterUser {
  anonymized_id: string;
  latitude: number;
  longitude: number;
  value: number;
  distance_km: number;
}

export interface ClusterResponse {
  users: ClusterUser[];
  biomarker_slug: string;
  threshold: number;
  radius_km: number;
}

export interface AssignPatientRequest {
  patient_id: string;
  doctor_id: string;
}

export interface AssignPatientResponse {
  message: string;
}

export interface HospitalPatientDetail extends HospitalPatient {
  reports: Report[];
  latitude: number | null;
  longitude: number | null;
}
