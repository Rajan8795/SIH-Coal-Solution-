export type NavigationTab =
  | 'dashboard'
  | 'mines'
  | 'compliance'
  | 'inspections'
  | 'contractors'
  | 'field-ops'
  | 'ai-command'
  | 'alerts'
  | 'reports'
  | 'settings';

export interface Mine {
  id: string;
  name: string;
  code: string;
  mineId?: string;
  location: string;
  region: string;
  state?: string;
  district?: string;
  coalfield?: string;
  area?: string;
  ownership?: string;
  production?: number | null;
  despatch?: number | null;
  mineType: string;
  status: 'Active (At Risk)' | 'Operational' | 'Maintenance Required' | 'Inspection Scheduled';
  riskScore: number | null;
  primaryContractor: string;
  coordinates: {
    lat: number;
    lng: number;
    gpsText: string;
  } | null;
  riskFactors: {
    safetyViolations: number | string;
    overdueActions: number | string;
    contractorIssues: number | string;
    envRenewals: number | string;
  };
  aiRecommendation: {
    headline: string;
    description: string;
    actionLabel: string;
    probability: number | null;
  };
  confidenceScore?: number | null;
  confidenceCategory?: string;
  evidenceStatus?: string;
  evidenceCoverage?: number | null;
  environmentalAnomaly?: string;
  environmentalAnomalyScore?: number | null;
  environmentalRiskScore?: number | null;
  operationalRiskScore?: number | null;
  safetyRiskScore?: number | null;
  inspectionPriority?: string;
  priorityScore?: number | null;
  riskCategory?: string;
  riskDrivers?: string;
  explanation?: string;
  mappingStatus?: string;
}

export interface ComplianceRequirement {
  id: string;
  code: string;
  requirement: string;
  mine: string;
  category: 'Safety' | 'Environmental' | 'Equipment' | 'Ventilation' | 'Evidence' | 'Operational' | 'Safety Evidence' | 'Overall Assessment';
  dueDate: string;
  status: 'Overdue' | 'Pending' | 'Completed' | 'Insufficient Evidence' | 'Assessment Available' | 'Prototype Workflow';
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Insufficient Evidence';
  mineId?: string;
  responsibleOfficer: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  aiInsight?: {
    type: string;
    text: string;
    delayProbability?: number;
  };
}

export interface AlertItem {
  id: string;
  mineId?: string;
  title: string;
  location: string;
  mine: string;
  time: string;
  status: 'Unacknowledged' | 'Investigating' | 'Resolved' | 'In Progress';
  severity: 'Critical' | 'High' | 'Medium' | 'Resolved';
  assignedTo: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  deadline: string;
  isAiPrediction?: boolean;
  probScore?: string;
  description?: string;
}

export interface FieldInspection {
  id: string;
  location: string;
  sector: string;
  gpsText: string;
  time: string;
  date: string;
  imageUrl: string;
  notes: string;
  status: 'Active' | 'Resolved' | 'Dismissed';
  analysis: {
    title: string;
    severity: 'HIGH SEVERITY' | 'MEDIUM SEVERITY' | 'LOW SEVERITY';
    description: string;
    confidenceScore: number;
    standardRef: string;
    category?: string;
    recommendedAction?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  richData?: {
    mineName?: string;
    riskScore?: number;
    factorBreakdown?: {
      label: string;
      value: number;
      color: string;
    }[];
    recommendation?: {
      title: string;
      text: string;
      actionText?: string;
      logsUrl?: string;
    };
  };
}

export interface Contractor {
  id: string;
  name: string;
  primarySite: string;
  activePersonnel: number;
  complianceScore: number;
  expiringCertifications: number;
  status: 'Compliant' | 'Flagged' | 'Review Required';
  lastAuditDate: string;
}

export interface PredictiveRiskItem {
  mineId: string;
  mineName: string;
  state: string;
  predictedRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  riskTrend: 'increasing' | 'stable' | 'decreasing';
  contributingFactors: string[];
  recommendation: string;
}
