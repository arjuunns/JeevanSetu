import type { GuidelineCitation, SafetyScreenResult, SeverityLevel } from '@jeevansetu/types';

/** Client-side view models mirroring the server's response shapes. */

export interface DashboardMetricsView {
  totals: { patients: number; criticalPatients: number; referrals: number; activeAlerts: number };
  rates: {
    routingSuccessRate: number;
    overrideRate: number;
    avgAiConfidence: number;
    avgTriageSeconds: number | null;
  };
  severityDistribution: { severity: string; count: number }[];
  hospitalOccupancy: { hospitalId: string; name: string; occupancyPct: number; availableBeds: number }[];
  referralTrend: { date: string; count: number }[];
}

export interface FullIntakeResultView {
  patientId: string;
  visitId: string;
  patientName: string;
  hospitalName: string;
  safety: SafetyScreenResult;
}

export interface ReviewQueueItem {
  id: string;
  visitId: string;
  safetyIsCritical: boolean;
  aiSeverity: SeverityLevel | null;
  finalSeverity: SeverityLevel | null;
  aiConfidence: number | null;
  recommendedDepartment: string | null;
  riskFactors: string[];
  redFlags: string[];
  createdAt: string;
  visit: {
    id: string;
    patient: { name: string; age: number; gender: string };
    routing?: {
      selectedHospital?: { name: string } | null;
      rankedCandidates?: any[] | null;
    } | null;
  };
  citations: GuidelineCitation[];
  reasoning?: {
    reasoningText: string;
  } | null;
  review?: {
    action: string;
    justification?: string;
    overrideSeverity?: string;
    overrideDepartment?: string;
    reviewedAt: string;
    doctor: { firstName: string | null; lastName: string | null; email: string };
  } | null;
}
