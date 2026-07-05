// ============================================================
// REPORT TYPES
// ============================================================

export type ReportStatus = 'processing' | 'completed' | 'failed';
export type ReportSource = 'web' | 'whatsapp';

export interface Report {
  id: string;
  user_id: string;
  status: ReportStatus;
  source: ReportSource;
  file_url: string | null;
  health_score: number | null;
  risks: Risks | null;
  biomarkers: Biomarker[] | null;
  dos_donts: DosDonts | null;
  care_plan: CarePlan | null;
  created_at: string;
  updated_at: string;
}

export interface Biomarker {
  slug: string;       // e.g. "fasting_glucose"
  value: number;
  unit: string;
  normal_range: string;
  status: 'normal' | 'high' | 'low';
}

export interface Risks {
  homa_ir: {
    value: number;
    tier: 'normal' | 'borderline' | 'insulin_resistant';
  } | null;
  pcos: {
    risk_level: 'low' | 'moderate' | 'high';
    indicators: string[];
  } | null;
  anemia: {
    risk_level: 'none' | 'mild' | 'moderate' | 'severe';
  } | null;
  lipid_profile: {
    tier: 'optimal' | 'borderline' | 'high_risk';
  } | null;
}

export interface DosDonts {
  dos: string[];
  donts: string[];
}

export interface CarePlanMonth {
  month: number;           // 1–6
  diet_changes: string;
  lifestyle_tips: string;
  supplements: string;
  follow_up: string;
}

export interface CarePlan {
  months: CarePlanMonth[]; // 6 items
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
  page: number;
  limit: number;
}

export interface UploadReportResponse {
  id: string;
  status: ReportStatus;
  message: string;
}
