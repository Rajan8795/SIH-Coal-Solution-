import { Mine, ComplianceRequirement, AlertItem, FieldInspection, Contractor, ChatMessage } from '../types';

export const ASSETS = {
  logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC-aVigNwcIqLF-kuQGHMW4EcqC2DYiRZS7qySGYAgtINXbHVJ5MP0YZaQ0eaaWJv2mxXkM1C4GR0yLUGQZCkY-Z-b_TVSch1XdeIyp4q4UQ05WUmons4njM8HRWfphAJrpLRLtvOqUfBOZ80vj2Ehm5E74bQiQ-hlsbZnMUqSuskOQVqz7M0bTARTsX3S5ihmIWwhgHD7nYGkEdkBfdKXQtkE3pq-Z8W1yID_YF5tVzjN1ugd4SgI',
  adminProfile: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqHwhbqcOfcOQawYj_BpfvYLH1G8wUFKFt4VIE7fnGb8iG8o8J7LAqW1PHnO5_ovb5_XAQXH18xvrGPjC_eJjeABgHKEpHwUZ0zGG0JDN7x-dJmvUGZhQRG8g-H36MHY7Veo_KrpYzTE68DxjpD-xZopja6z9mxA9kz9qckKxhcp2Xo8FYbCAt36BReKLMzX6NkdHsO1MLeppnVqArIXRFdmNVcbGDMPdZR_rp3uQieKs20Xe97cFM',
  corporateProfile: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL6KOpZGiySHRa_MmSnru3xngeiTrbUIBWQV_1rfyw5MWyjkzEQfc7-vweOoOzhncB75pqwXLfWeZT1rMGEAaPpJlELcGXXceacU5HreOmrxQ5-skYG92isWaFr-HdTHfhM1pTeLxM0Um0KDSZMrrW58DYNDyIJ4H6xLb74HB0b-JmDLGwKvBiHYIutyZ82D2kzwW3NL13uLWlzqHabegMpRly4Xkb3risPBMnw6SrAM6hDpQ2LqIB',
  darkAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPSicsYRzsaRF_yRzBZIUNBX3zwuJDff6GK4BbitclfJKgSFjjTDFR5fTniZEj58Xs72pVyV6rIzHs7R5XYStHtVbyqDZb5dgAyjDPlpBeFLGv1aYMYkErPr_rYaei6bURC6wIkqi0WI8L5-4sX3NdbPxcM7g5Ro0w7NjO7TeZLSJY9XOknN7A6EZYnsp4g6Fbl2sUrRBfbN3Tv2E8bGl5Kz8Z_6zPw8Valrd-bJf-qR84H6jahPBF',
  mapBackground: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUNFl3KywBg5f8eC3uLJUniOptYAQm12AjWHqSm9k4jxybnw65yct8Wcr347FJuZwnSlZ03s15QPayGuzC3PytGZVEuN1JhC7PUbPiMlMYKkUwq_pxUj4CS5UBoPD-NRMYyAecG5OotbTNGRUsEs6cp1jjZCM8YEG80oIh0KQByZVwYuRv80nDIA6_rKnP_xR_1FD-xxVvkN-rdhYxSLDlUdc71DCVVBvr3opgjjRjQZLOCHBGlex_',
  satelliteMap: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt0QturyAUPbAb4FxVmM2we-m-TLnFQU6vWd4BSC5bW_kEficnuQ83WImJeVPtzNOLZJ-SeUVeOXGiczq8LiSoR4ZDj-v7_L2X7ld2Dmj9QqYfIqDzCuDMx3Xfzbz5U9pWpHNDP7vzasRj0_6jkePdPGXxc8uXQixFQoLv2yKcofDnmaXJkzxo2fgd8V4_TJ5fhgVY9CGD9I5naSLnSN-NHle8l94e0cngqifbrMb05kQimps7kwLb',
  nationalMap: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvOMyLzug7pPVJu9D6iduyLjl_EWXs9eVJCniZX6vptChS0tNV3kmsfRHHQ9a30ZA52pUfq0D4ZYstEBL3y_vIVb6GFkYXoaoHojrzjyv1Erx0E58y7AZe0Zxb5TvgeXjwiEDm9kBJRrzMvXXKVu9HeiFEL9w2dzc7qIumzG9h6EOHgqUqa_IdYZMkQEpujXWOfFMOrpqcJCsnSwo9a4TYKG9Hyh9jDAUmNtK9QlzFqMtuUmqoUTiP',
  conveyorMedia: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBr_44rx6uZHjEiJzuJNUOKCyrjP1nyseA_TcvE7_rcoeq2IJUSU0c8PA1RaX9FzVSd2dn8B7dw_suipWrfR3wzOxdlDzF0QzSUvEACFohb3UbaNlmyPdEcrHnEvW2H2Pam7vvbKFyVBwfz-wmvmlkEFuCvSxJYBFUdOBvEiy642RfJNBN1fvUVYg7AI29O0fVnV6S9yQ3l-DHzso3ztpncAZtmF6lWwmT-8tccSDDYL370jdv9LPth',
  complianceTrend: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwNS6oVXXH1__RMqfzN_EW-aP5nyGteybVmVu8HbvRk6YWnf18Kd0yhkP7RG8XE-krfe7OKljpdA8nRwtDCk_bTjRsfDbJnTi4VzHR_3CDK35ZQQPf6dv68dAh6mwlf8PQugZDcC1G1ai7Av-dtPtHggGINZDfj5TQNxnfPCYPxjP0WBdje2QlW6k52syk2-bEA15MQ4F52Gq5Nry31hUlEevZf3MXRG_tA01VfD8poewlfPq8nBEs',
  safetyIncidents: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZhfEq3_dBrKqYJ2rFsML5290uwErKBCfdbFkPQyawdVs6M--riZmiKP8YG7CsNUp9xNI1LuQuil0vMzsZwfzsx1RAb3IVWjqVWJmeyu50Or5G1VY9Z46qPPTTWLYOJtMSC8hVMU1kPC2JtQrqr83wVa24faLfLg2S3TFkuRIceadVHsn_7upEh15CDFMUJ0t0qJFmUUv_8Nutm9bAKNi5TDmhgIe812gndhp6NNWIP8ztFonzRKn-',
  officerMitchell: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUvfofn5T7dzyssUjgn8kXOwKp-3ZENdeZsfS9GoV07yhzS8Xui0I52fTwrQSnCkc7YNxC6W7K0oDzflbiESZgBcVS3-Y5N44UAv-4sR1FZvhGYgkiuuDV2UDvWPkBPN-J9Dha8WH6rva0__1wzS-aVWqIxmNl2t2gVSxioSBu5BUOmneF064Zzi6IilXl6wORdxGtlTISYcn7TkTvcDHgJcNxqxICV80enO5iOfZCuBFzocpFqrE8',
  officerReynolds: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ7ESK2OgzWsWpcwpgaP8dY129LYUDNI5lQ55aa_ucUpAUmy10kXXkzVYL1PdFr40_m45ZqWbt6V9Suw1hkL__ipi8_TkL5ZTXglcSW6XmxVz0vIiGEIREI-JqmayJPZPV5JJuCk-e7R4ZdSJaBTPlayer5L-9BcBWlQW3VNMAyQvEneWKwVD-oCV17iSRKzxZIjnh7CtIoI4c1-aI78xJ55DlqiuHLf0-HopZsuDU49OaAJVPAJfq',
  officerDoe: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGDN38cCUL9qcKvjHzLzCVCROVEKYML4OPkJXX-mUBVfkVHQi7WAtymlLEW1mkrb47OsEpE_f03sYTlo8sbjpbULYwsROeirme_o_jVAMuzDCdPhJKu52xbGB6jkiswMOCSW773h8E-hhZDZYrAtsG-UnWlHVWiRjJZH1miXomOZyCZmNMmedv9tAfwBs2zMhCNpIjx5qR5OZ95FcdYmGAdVZKNgbxN33mGflKGWjqLaNTUHx1E3oh',
};

export const INITIAL_MINES: Mine[] = [
  {
    id: 'mine-a',
    name: 'Mine A (Site Alpha)',
    code: 'MINE-ALPHA',
    location: 'Jharia Coalfield, Dhanbad, JH',
    region: 'Eastern Coalfields Division',
    mineType: 'Underground Bituminous',
    status: 'Active (At Risk)',
    riskScore: 78,
    primaryContractor: 'Apex Mining Solutions',
    coordinates: {
      lat: 23.7466,
      lng: 86.4154,
      gpsText: '23.7466° N, 86.4154° E'
    },
    riskFactors: {
      safetyViolations: 4,
      overdueActions: 2,
      contractorIssues: 3,
      envRenewals: 1
    },
    aiRecommendation: {
      headline: 'Immediate safety inspection recommended within 24 hours.',
      description: 'Based on historical data patterns and current risk factors (primarily 4 unmitigated safety violations), predictive models indicate a 82% probability of a significant operational disruption if no action is taken.',
      actionLabel: 'Deploy Inspection Team',
      probability: 82
    }
  },
  {
    id: 'site-beta',
    name: 'Site Beta (Nominal)',
    code: 'MINE-BETA',
    location: 'Raniganj Coalfield, Paschim Bardhaman, WB',
    region: 'Raniganj Mining Circle',
    mineType: 'Surface Anthracite',
    status: 'Operational',
    riskScore: 24,
    primaryContractor: 'Appalachian Drillers Corp',
    coordinates: {
      lat: 23.6190,
      lng: 87.0805,
      gpsText: '23.6190° N, 87.0805° E'
    },
    riskFactors: {
      safetyViolations: 0,
      overdueActions: 1,
      contractorIssues: 1,
      envRenewals: 0
    },
    aiRecommendation: {
      headline: 'Routine monitoring cycle active.',
      description: 'All air quality and methane telemetry sensors are operating within nominal regulatory bands. Contractor certifications due for renewal in 48 hours.',
      actionLabel: 'View Compliance Logs',
      probability: 12
    }
  },
  {
    id: 'blackwood-north',
    name: 'Blackwood North',
    code: 'BW-NORTH-01',
    location: 'Korba Coalfield, Korba, CG',
    region: 'South Eastern Coalfields (SECL)',
    mineType: 'Underground Bituminous',
    status: 'Active (At Risk)',
    riskScore: 84,
    primaryContractor: 'Apex Mining Solutions',
    coordinates: {
      lat: 22.3595,
      lng: 82.7501,
      gpsText: '22.3595° N, 82.7501° E'
    },
    riskFactors: {
      safetyViolations: 5,
      overdueActions: 3,
      contractorIssues: 2,
      envRenewals: 1
    },
    aiRecommendation: {
      headline: 'Ventilation shaft pressure variance detected.',
      description: 'Sensors in Sector 4 indicate 14% drop in static airflow pressure. Recommend immediate damper and fan auxiliary motor audit.',
      actionLabel: 'Deploy Inspection Team',
      probability: 89
    }
  },
  {
    id: 'ironridge-alpha',
    name: 'IronRidge Alpha',
    code: 'IR-ALPHA-02',
    location: 'Singrauli Coalfield, MP',
    region: 'Northern Coalfields (NCL)',
    mineType: 'Continuous Longwall',
    status: 'Inspection Scheduled',
    riskScore: 56,
    primaryContractor: 'Peak Ventilation Corp',
    coordinates: {
      lat: 24.1981,
      lng: 82.6684,
      gpsText: '24.1981° N, 82.6684° E'
    },
    riskFactors: {
      safetyViolations: 1,
      overdueActions: 2,
      contractorIssues: 1,
      envRenewals: 2
    },
    aiRecommendation: {
      headline: 'Emissions sensor recalibration needed.',
      description: 'Diesel particulate emissions audit pending. Schedule contractor certified technician to complete emissions filter replacement.',
      actionLabel: 'Assign Inspector',
      probability: 44
    }
  },
  {
    id: 'silvercreek',
    name: 'SilverCreek',
    code: 'SC-DEEP-09',
    location: 'Godavari Valley Coalfield, TS',
    region: 'Singareni Collieries (SCCL)',
    mineType: 'Surface Strip & Pit',
    status: 'Operational',
    riskScore: 38,
    primaryContractor: 'Frontier Geotech LLC',
    coordinates: {
      lat: 17.5186,
      lng: 80.6104,
      gpsText: '17.5186° N, 80.6104° E'
    },
    riskFactors: {
      safetyViolations: 2,
      overdueActions: 1,
      contractorIssues: 3,
      envRenewals: 0
    },
    aiRecommendation: {
      headline: 'Contractor availability delay risk.',
      description: 'Historical data suggests a 78% probability of delay for Structural Support Recertification due to contractor availability.',
      actionLabel: 'Review Contractor Status',
      probability: 78
    }
  }
];

export const INITIAL_COMPLIANCE: ComplianceRequirement[] = [
  {
    id: 'req-1',
    code: 'REQ-2023-084',
    requirement: 'Ventilation Shaft Integrity Check',
    mine: 'Blackwood North',
    category: 'Safety',
    dueDate: '2023-10-24',
    status: 'Overdue',
    riskLevel: 'High',
    responsibleOfficer: {
      name: 'J. Mitchell',
      avatar: ASSETS.officerMitchell
    }
  },
  {
    id: 'req-2',
    code: 'REQ-2023-112',
    requirement: 'Heavy Machinery Emissions Audit',
    mine: 'IronRidge Alpha',
    category: 'Environmental',
    dueDate: '2023-11-05',
    status: 'Pending',
    riskLevel: 'Medium',
    responsibleOfficer: {
      name: 'A. Kowalski',
      initials: 'AK'
    }
  },
  {
    id: 'req-3',
    code: 'REQ-2023-145',
    requirement: 'Structural Support Recertification',
    mine: 'SilverCreek',
    category: 'Equipment',
    dueDate: '2023-11-12',
    status: 'Pending',
    riskLevel: 'Medium',
    responsibleOfficer: {
      name: 'S. Reynolds',
      avatar: ASSETS.officerReynolds
    },
    aiInsight: {
      type: 'RISK PATTERN DETECTED',
      text: "Historical data suggests a 78% probability of delay for 'Structural Support Recertification' at SilverCreek due to contractor availability.",
      delayProbability: 78
    }
  },
  {
    id: 'req-4',
    code: 'REQ-2023-042',
    requirement: 'Quarterly Explosives Inventory',
    mine: 'Blackwood North',
    category: 'Safety',
    dueDate: '2023-10-15',
    status: 'Completed',
    riskLevel: 'Low',
    responsibleOfficer: {
      name: 'T. Russo',
      initials: 'TR'
    }
  },
  {
    id: 'req-5',
    code: 'REQ-2023-199',
    requirement: 'Dust Suppression Line Pressure Calibration',
    mine: 'Mine A (Site Alpha)',
    category: 'Equipment',
    dueDate: '2023-11-20',
    status: 'Pending',
    riskLevel: 'High',
    responsibleOfficer: {
      name: 'J. Doe',
      avatar: ASSETS.officerDoe
    }
  },
  {
    id: 'req-6',
    code: 'REQ-2023-205',
    requirement: 'Groundwater Leachate & Effluent Sampling',
    mine: 'Site Beta (Nominal)',
    category: 'Environmental',
    dueDate: '2023-11-28',
    status: 'Pending',
    riskLevel: 'Low',
    responsibleOfficer: {
      name: 'S. Reynolds',
      avatar: ASSETS.officerReynolds
    }
  }
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alert-1',
    title: 'Methane Sensor Failure',
    location: 'Sector 4, North Pit',
    mine: 'Blackwood North',
    time: '10:42 AM',
    status: 'Unacknowledged',
    severity: 'Critical',
    assignedTo: {
      name: 'J. Doe',
      avatar: ASSETS.officerDoe
    },
    deadline: '11:00 AM',
    description: 'Telemetry stream from sensor MS-409 dropped offline. Automated failsafe activated. Requires physical manual inspection.'
  },
  {
    id: 'alert-2',
    title: 'Conveyor Belt Wear Detected',
    location: 'Processing Plant B',
    mine: 'Mine A (Site Alpha)',
    time: '09:15 AM',
    status: 'Investigating',
    severity: 'High',
    assignedTo: {
      name: 'S. Miller',
      initials: 'SM'
    },
    deadline: 'EOD',
    isAiPrediction: true,
    probScore: '89% PROB',
    description: 'Acoustic vibration sensors detected micro-fracture harmonics along primary roller bearings. Preventative shutdown advised.'
  },
  {
    id: 'alert-3',
    title: 'Ventilation Fan Differential Pressure Drop',
    location: 'Main Shaft 2G',
    mine: 'Mine A (Site Alpha)',
    time: '08:30 AM',
    status: 'In Progress',
    severity: 'Critical',
    assignedTo: {
      name: 'J. Mitchell',
      avatar: ASSETS.officerMitchell
    },
    deadline: '12:30 PM',
    description: 'Declining airflow velocity in Sector 4G. Potential critical failure in auxiliary ventilation within 4 hours.'
  },
  {
    id: 'alert-4',
    title: 'Contractor MSHA Certifications Expiring',
    location: 'Site Beta Portal',
    mine: 'Site Beta (Nominal)',
    time: '07:45 AM',
    status: 'Unacknowledged',
    severity: 'Medium',
    assignedTo: {
      name: 'A. Kowalski',
      initials: 'AK'
    },
    deadline: 'Tomorrow',
    description: '12 contractors from Appalachian Drillers Corp have MSHA Surface certifications expiring within 48 hours.'
  },
  {
    id: 'alert-5',
    title: 'Emergency Escapeway Signage Obstructed',
    location: 'Sub-level 4 West',
    mine: 'SilverCreek',
    time: 'Yesterday',
    status: 'Resolved',
    severity: 'Resolved',
    assignedTo: {
      name: 'T. Russo',
      initials: 'TR'
    },
    deadline: 'Completed',
    description: 'Debris cleared and photoluminescent wayfinding indicators recertified by safety inspector.'
  }
];

export const INITIAL_FIELD_INSPECTION: FieldInspection = {
  id: 'insp-1024',
  location: 'Sector 4 - Conveyor Belt B',
  sector: 'Sector 4',
  gpsText: 'GPS: 23.7466° N, 86.4154° E',
  time: '10:42 AM',
  date: 'Oct 24',
  imageUrl: ASSETS.conveyorMedia,
  notes: 'Excessive coal dust accumulation noted near primary drive motor. Heat sensors indicate elevated temperatures.',
  status: 'Active',
  analysis: {
    title: 'Fire Safety Violation',
    severity: 'HIGH SEVERITY',
    description: 'Combustible dust build-up near active heat source exceeds permissible thresholds.',
    confidenceScore: 94,
    standardRef: 'Ref: MSHA §75.400 - Accumulation of combustible materials.'
  }
};

export const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: 'cont-1',
    name: 'Apex Mining Solutions',
    primarySite: 'Mine A & Blackwood North',
    activePersonnel: 142,
    complianceScore: 74,
    expiringCertifications: 8,
    status: 'Flagged',
    mshaAuditDate: '2023-09-12'
  },
  {
    id: 'cont-2',
    name: 'Appalachian Drillers Corp',
    primarySite: 'Site Beta',
    activePersonnel: 68,
    complianceScore: 91,
    expiringCertifications: 12,
    status: 'Review Required',
    mshaAuditDate: '2023-10-01'
  },
  {
    id: 'cont-3',
    name: 'Peak Ventilation Corp',
    primarySite: 'IronRidge Alpha',
    activePersonnel: 45,
    complianceScore: 98,
    expiringCertifications: 0,
    status: 'Compliant',
    mshaAuditDate: '2023-10-18'
  },
  {
    id: 'cont-4',
    name: 'Frontier Geotech LLC',
    primarySite: 'SilverCreek',
    activePersonnel: 88,
    complianceScore: 86,
    expiringCertifications: 3,
    status: 'Compliant',
    mshaAuditDate: '2023-08-22'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    text: 'Show me a risk breakdown for Mine A focusing on recent ventilation issues.',
    timestamp: '10:45 AM'
  },
  {
    id: 'msg-2',
    role: 'assistant',
    text: 'Analyzing data for **Mine A** over the last 30 days. I found elevated risk indicators primarily linked to ventilation subsystem degradation in Sector 7. Here is the breakdown:',
    timestamp: '10:45 AM',
    richData: {
      mineName: 'Mine A (Site Alpha)',
      riskScore: 78,
      factorBreakdown: [
        { label: 'Ventilation', value: 85, color: '#ba1a1a' },
        { label: 'Structural', value: 42, color: '#98805d' },
        { label: 'Electrical', value: 18, color: '#3a485c' }
      ],
      recommendation: {
        title: 'AI Recommendation',
        text: 'Immediate inspection of main fan unit M-04 is advised. Predict maintenance required within 72 hours to prevent forced shutdown.',
        actionText: 'Schedule Inspection',
        logsUrl: '#telemetry-logs'
      }
    }
  }
];
