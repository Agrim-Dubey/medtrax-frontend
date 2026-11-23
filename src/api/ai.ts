import api from './axios';

export interface AIAgentItem {
  id: string;
  name: string;
  endpoint: string;
  allowed_roles: string[];
  rate_limit: string;
  capabilities: string[];
}

export interface AIRegistryResponse {
  success: boolean;
  data: {
    intelligence_mode: 'hybrid_llm' | 'deterministic';
    llm_provider: string;
    agents_count: number;
    agents: AIAgentItem[];
    disclaimer: string;
  };
}

export interface SafetyCheckMedication {
  medicine_name: string;
  dosage?: string;
  dosage_frequency?: string;
  duration_value?: number;
  duration_unit?: 'days' | 'weeks' | 'months';
}

export interface SafetyCheckRequest {
  patient_id: number;
  diagnosis?: string;
  medications: SafetyCheckMedication[];
}

export interface SafetyCheckInteraction {
  type: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  drug?: string;
  drugs?: string[];
  conflict_with?: string;
  condition?: string;
  explanation: string;
  recommendation: string;
}

export interface SafetyCheckResult {
  status: 'APPROVED' | 'WARNING' | 'BLOCKED';
  safety_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  summary: string;
  interactions_count: number;
  interactions: SafetyCheckInteraction[];
  active_medications_checked: string[];
  patient_instructions: string[];
  agent_metadata: Record<string, unknown>;
}

export interface SymptomTriageRequest {
  patient_id?: number;
  symptoms: string;
  duration_days?: number;
  severity?: 'mild' | 'moderate' | 'severe';
  vitals?: {
    temperature_f?: number;
    heart_rate?: number;
    spo2?: number;
    blood_pressure?: string;
  };
  preferred_city?: string;
}

export interface RecommendedDoctor {
  doctor_id: number;
  name: string;
  specialization: string;
  city: string;
  years_of_experience: number;
  average_rating: number | null;
  review_count: number;
}

export interface SymptomTriageResult {
  urgency_level: 'SELF_CARE' | 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  seek_immediate_care: boolean;
  recommended_timeframe: string;
  red_flags_detected: Array<{
    category: string;
    matched_symptom: string;
    explanation: string;
    immediate_action: string;
  }>;
  vital_alerts: string[];
  risk_factors: string[];
  recommended_specializations: string[];
  recommended_doctors: RecommendedDoctor[];
  clinical_guidance: string;
  questions_for_doctor: string[];
  agent_metadata: Record<string, unknown>;
}

export interface ClinicalSummarizerRequest {
  mode?: 'clinical_soap' | 'patient_friendly';
  prescription_id?: number;
  appointment_id?: number;
  chief_complaint?: string;
  clinical_notes?: string;
  diagnosis?: string;
  vitals?: Record<string, unknown>;
  medications?: Array<{
    medicine_name: string;
    dosage?: string;
    frequency?: string;
    duration?: number;
    duration_unit?: string;
    instructions?: string;
  }>;
  lab_tests?: Array<{
    test_name: string;
    instructions?: string;
  }>;
  follow_up_date?: string;
}

export interface ClinicalSummarizerResult {
  mode: 'clinical_soap' | 'patient_friendly';
  summary: string;
  soap_note: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  } | null;
  abnormal_vitals: string[];
  medication_guide: Array<Record<string, unknown>>;
  lab_test_guide: Array<Record<string, unknown>>;
  key_highlights: string[];
  agent_metadata: Record<string, unknown>;
}

export interface CarePlanRequest {
  patient_id?: number;
  prescription_id?: number;
}

export interface CarePlanResult {
  summary: string;
  adherence_complexity: 'LOW' | 'MODERATE' | 'HIGH';
  active_medications_count: number;
  active_medications: Array<{
    medicine_name: string;
    dosage: string;
    frequency: string;
    end_date: string;
    days_remaining: number;
    instructions: string;
  }>;
  completed_medications_count: number;
  daily_schedule: {
    morning: Array<{ medicine_name: string; dosage: string; timing_note: string }>;
    afternoon: Array<{ medicine_name: string; dosage: string; timing_note: string }>;
    evening: Array<{ medicine_name: string; dosage: string; timing_note: string }>;
    bedtime: Array<{ medicine_name: string; dosage: string; timing_note: string }>;
    as_needed: Array<{ medicine_name: string; dosage: string; timing_note: string }>;
  };
  condition_guidance: Array<{
    condition: string;
    monitoring: string;
    lifestyle: string[];
    warning_signs: string;
  }>;
  lab_checklist: Array<{
    test_name: string;
    instructions: string;
    ordered_on: string;
  }>;
  follow_ups: Array<{
    follow_up_date: string;
    status: 'scheduled' | 'due_soon' | 'overdue';
    days_until: number;
    diagnosis: string;
  }>;
  adherence_tips: string[];
  agent_metadata: Record<string, unknown>;
}

export interface AppointmentAssistantRequest {
  patient_id?: number;
  doctor_id?: number;
  specialization?: string;
  preferred_date?: string;
  preferred_time_of_day?: 'any' | 'morning' | 'afternoon';
  reason?: string;
}

export interface AppointmentAssistantResult {
  summary: string;
  follow_up_alerts: Array<{
    doctor_id: number;
    doctor_name: string;
    follow_up_date: string;
    urgency: 'UPCOMING' | 'DUE_SOON' | 'OVERDUE';
    message: string;
  }>;
  conflict_warnings: string[];
  recommended_slots: Array<{
    doctor_id: number;
    doctor_name: string;
    specialization: string;
    suggested_date: string;
    slots: string[];
    preferred_window_matched: boolean;
    today_queue_count: number;
    estimated_wait_minutes: number;
  }>;
  pre_visit_checklist: string[];
  agent_metadata: Record<string, unknown>;
}

export const aiAPI = {
  getRegistry: () => api.get<AIRegistryResponse>('/api/ai/agents/'),
  checkSafety: (data: SafetyCheckRequest) =>
    api.post<{ success: boolean; data: SafetyCheckResult }>('/api/ai/safety-check/', data),
  triageSymptoms: (data: SymptomTriageRequest) =>
    api.post<{ success: boolean; data: SymptomTriageResult }>('/api/ai/triage/', data),
  summarize: (data: ClinicalSummarizerRequest) =>
    api.post<{ success: boolean; data: ClinicalSummarizerResult }>('/api/ai/summarize/', data),
  getCarePlan: (data: CarePlanRequest = {}) =>
    api.post<{ success: boolean; data: CarePlanResult }>('/api/ai/care-plan/', data),
  getAppointmentAssistant: (data: AppointmentAssistantRequest = {}) =>
    api.post<{ success: boolean; data: AppointmentAssistantResult }>('/api/ai/appointment-assistant/', data),
};

