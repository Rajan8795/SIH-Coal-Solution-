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
  location: string;
  region: string;
  mineType: string;
  status: 'Active (At Risk)' | 'Operational' | 'Maintenance Required' | 'Inspection Scheduled';
  riskScore: number; // 0-100
  primaryContractor: string;
  coordinates: {
    lat: number;
    lng: number;
    gpsText: string;
  };
  riskFactors: {
    safetyViolations: number;
    overdueActions: number;
    contractorIssues: number;
    envRenewals: number;
  };
  aiRecommendation: {
    headline: string;
    description: string;
    actionLabel: string;
    probability: number;
  };
}

export interface ComplianceRequirement {
  id: string;
  code: string;
  requirement: string;
  mine: string;
  category: 'Safety' | 'Environmental' | 'Equipment' | 'Ventilation';
  dueDate: string;
  status: 'Overdue' | 'Pending' | 'Completed';
  riskLevel: 'High' | 'Medium' | 'Low';
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
  mshaAuditDate: string;
}
