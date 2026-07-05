// Indian States & UTs
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

export type IndianState = typeof INDIAN_STATES[number];

// Blood Groups
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof BLOOD_GROUPS[number];

// Diet types
export const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non_veg', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
] as const;

// WhatsApp number for report upload
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const DOCTOR_PAGE_SIZE = 50;

// Polling intervals (ms)
export const DASHBOARD_POLL_INTERVAL = 15_000;
export const REPORT_DETAIL_POLL_INTERVAL = 10_000;

// Report status colours
export const STATUS_CONFIG = {
  processing: { label: 'Processing', color: 'amber' },
  completed:  { label: 'Completed',  color: 'green'  },
  failed:     { label: 'Failed',     color: 'red'    },
} as const;

// Health score zones
export const HEALTH_SCORE_ZONES = {
  danger:  { min: 0,  max: 40,  color: '#EF4444' },
  warning: { min: 41, max: 70,  color: '#F59E0B' },
  success: { min: 71, max: 100, color: '#10B981' },
} as const;

// Risk level colours
export const RISK_TIER_COLOR: Record<string, string> = {
  normal:            '#10B981',
  borderline:        '#F59E0B',
  insulin_resistant: '#EF4444',
  low:               '#10B981',
  moderate:          '#F59E0B',
  high:              '#EF4444',
  none:              '#10B981',
  mild:              '#F59E0B',
  severe:            '#EF4444',
  optimal:           '#10B981',
  high_risk:         '#EF4444',
};
