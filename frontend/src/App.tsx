import React, { useEffect, useState } from 'react';
import { NavigationTab, Mine, ComplianceRequirement, AlertItem, FieldInspection, ChatMessage, Contractor } from './types';
import {
  INITIAL_FIELD_INSPECTION,
  INITIAL_CONTRACTORS,
  INITIAL_CHAT_MESSAGES,
} from './data/mockData';
import { fetchRealMines } from './services/realMines';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { MinesView } from './components/MinesView';
import { FieldOpsView } from './components/FieldOpsView';
import { InspectionsView } from './components/InspectionsView';
import { ComplianceView } from './components/ComplianceView';
import { AiCommandView } from './components/AiCommandView';
import { AlertsView } from './components/AlertsView';
import { ContractorsView } from './components/ContractorsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

const createMlAlerts = (mines: Mine[]): AlertItem[] => mines
  .filter((mine) =>
    mine.riskCategory === 'CRITICAL' ||
    mine.riskCategory === 'HIGH' ||
    mine.inspectionPriority === 'URGENT' ||
    mine.inspectionPriority === 'HIGH' ||
    Boolean(mine.environmentalAnomaly && mine.environmentalAnomaly !== 'No Anomaly') ||
    Boolean(mine.evidenceStatus?.toLowerCase().includes('insufficient'))
  )
  .map((mine) => {
    const severity: AlertItem['severity'] = mine.riskCategory === 'CRITICAL' || mine.inspectionPriority === 'URGENT'
      ? 'Critical'
      : mine.riskCategory === 'HIGH' || mine.inspectionPriority === 'HIGH'
      ? 'High'
      : 'Medium';
    return {
      id: `ai-alert-${mine.id}`,
      mineId: mine.id,
      title: `AI-derived ${mine.riskCategory || 'evidence'} assessment`,
      location: mine.location,
      mine: mine.name,
      time: 'ML assessment',
      status: 'Unacknowledged',
      severity,
      assignedTo: { name: 'Unassigned' },
      deadline: 'N/A',
      isAiPrediction: true,
      probScore: mine.confidenceScore == null ? 'N/A' : `${mine.confidenceScore.toFixed(1)}% confidence`,
      description: `Risk score: ${mine.riskScore == null ? 'N/A' : mine.riskScore.toFixed(2)}. Evidence: ${mine.evidenceStatus || 'Insufficient Evidence'}. Priority: ${mine.inspectionPriority || 'N/A'}. Recommendation: ${mine.aiRecommendation.headline}`,
    };
  });

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedMineId, setSelectedMineId] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App Data State
  const [mines, setMines] = useState<Mine[]>([]);
  const [mineLoadError, setMineLoadError] = useState<string | null>(null);
  const [complianceList, setComplianceList] = useState<ComplianceRequirement[]>([]);

  const [alertsList, setAlertsList] = useState<AlertItem[]>([]);
  const [fieldInspection, setFieldInspection] = useState<FieldInspection>(INITIAL_FIELD_INSPECTION);
  const [contractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  useEffect(() => {
    fetchRealMines()
      .then((data) => {
        setMines(data);
        setAlertsList(createMlAlerts(data));
        setMineLoadError(null);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load mine data';
        setMineLoadError(message);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const criticalAlertCount = alertsList.filter((a) => a.severity === 'Critical' && a.status !== 'Resolved').length;

  const handleDispatchInspection = (sectorName: string) => {
    setFieldInspection((prev) => ({
      ...prev,
      location: `${sectorName} - Active Audit`,
      time: '11:05 AM',
      date: 'Today',
      status: 'Active',
    }));
    setCurrentTab('field-ops');
    showToast(`Inspection team dispatched to ${sectorName}`);
  };

  const handleStartInspection = (inspection: {
    id: string;
    inspectionId: string;
    location: string;
    sector: string;
    gpsText: string;
    category: string;
    notes?: string;
  }) => {
    setFieldInspection({
      ...INITIAL_FIELD_INSPECTION,
      id: inspection.id,
      location: inspection.location,
      sector: inspection.sector,
      gpsText: inspection.gpsText,
      time: '11:05 AM',
      date: 'Today',
      notes: inspection.notes || '',
      status: 'Active',
      analysis: {
        title: 'Pending Analysis',
        severity: 'LOW SEVERITY',
        description: 'Awaiting field evidence capture and AI vision analysis. Proceed through Location, Capture, and Analysis steps.',
        confidenceScore: 0,
        standardRef: '',
        category: inspection.category,
        recommendedAction: '',
      },
    });
    setCurrentTab('field-ops');
    showToast(`Inspection ${inspection.inspectionId} started — field evidence workflow active`);
  };

  const handleSelectMine = (mineId: string) => {
    setSelectedMineId(mineId);
    setCurrentTab('mines');
  };

  const activeMineId = selectedMineId || mines[0]?.id || '';

  const handleCreateCorrectiveAction = (insp: FieldInspection) => {
    const newAlert: AlertItem = {
      id: `alert-${Date.now()}`,
      title: `${insp.analysis.title} - ${insp.location}`,
      location: insp.location,
      mine: 'Insufficient Evidence',
      time: 'Just now',
      status: 'Unacknowledged',
      severity: 'Critical',
      assignedTo: {
        name: 'V. Singh',
        initials: 'VS',
      },
      deadline: '24 Hours',
      description: `Prototype workflow action. ${insp.analysis.description} (${insp.analysis.standardRef || 'Insufficient Evidence'})`,
    };

    setAlertsList((prev) => [newAlert, ...prev]);
    showToast('Corrective action item dispatched to Action Center!');
  };

  const handleAddComplianceRequirement = (req: Omit<ComplianceRequirement, 'id'>) => {
    const newReq: ComplianceRequirement = {
      ...req,
      id: `req-${Date.now()}`,
    };
    setComplianceList((prev) => [newReq, ...prev]);
    showToast('New compliance requirement recorded.');
  };

  const handleUpdateComplianceStatus = (id: string, newStatus: ComplianceRequirement['status']) => {
    setComplianceList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    showToast(`Requirement status updated to ${newStatus}`);
  };

  const handleUpdateAlertStatus = (id: string, newStatus: AlertItem['status']) => {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    showToast(`Alert updated to ${newStatus}`);
  };

  const handleCreateAlert = (alert: Omit<AlertItem, 'id'>) => {
    const created: AlertItem = {
      ...alert,
      id: `alert-${Date.now()}`,
    };
    setAlertsList((prev) => [created, ...prev]);
    showToast('New safety alert dispatched across network.');
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let aiReply: ChatMessage;
      const lower = text.toLowerCase().trim();

      // Check for legacy demo mine names not in real 408 dataset
      const demoNames = ['korba deep', 'jharia main colliery', 'raniganj eastern', 'singrauli north'];
      const isDemoMention = demoNames.some((d) => lower.includes(d));
      const matchesRealMine = mines.some((m) => {
        const nameL = m.name.toLowerCase();
        const idL = m.id.toLowerCase();
        return lower.includes(nameL) || lower.includes(idL);
      });

      if (isDemoMention && !matchesRealMine) {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `This mine is not available in the current real-mine dataset.\n\nPlease query a valid real mine from the 408-mine dataset (e.g. **Aadocm**, **ABGC**, **AADOCM-0**).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, aiReply]);
        return;
      }

      // Find requested mine in real 408 mines dataset
      const requestedMine = mines.find((mine) => {
        const q = lower;
        const nameLower = mine.name.toLowerCase();
        const idLower = mine.id.toLowerCase();
        const codeLower = mine.code?.toLowerCase() || '';
        const mineIdLower = mine.mineId?.toLowerCase() || '';
        return (
          q.includes(nameLower) ||
          q.includes(idLower) ||
          (codeLower && q.includes(codeLower)) ||
          (mineIdLower && q.includes(mineIdLower))
        );
      });

      // Intent classification flags
      const isPredictive = lower.includes('go wrong') || lower.includes('predict') || lower.includes('next') || lower.includes('future') || lower.includes('could go');
      const isHighRiskList = lower.includes('high risk') || lower.includes('which mines are high');
      const isPriorityDispatch = (lower.includes('inspect first') || lower.includes('which mine should we inspect') || lower.includes('what should we inspect first')) && !requestedMine;
      const isWhy = lower.includes('why') || lower.includes('explain') || lower.includes('driver') || lower.includes('cause') || lower.includes('reason') || lower.includes('factor');
      const isAction = lower.includes('action') || lower.includes('should we do') || lower.includes('what should') || lower.includes('recommend') || lower.includes('preventive') || lower.includes('take for');
      const isPriority = lower.includes('priority') || lower.includes('inspect') || lower.includes('dispatch') || lower.includes('due');
      const isEnv = lower.includes('environ') || lower.includes('anomaly') || lower.includes('emissions') || lower.includes('leachate') || lower.includes('water') || lower.includes('air');
      const isEvidence = lower.includes('confident') || lower.includes('confidence') || lower.includes('certainty') || lower.includes('evidence') || lower.includes('coverage') || lower.includes('reliable') || lower.includes('data quality');
      const isExecutive = lower.includes('complete assessment') || lower.includes('management summary') || lower.includes('full assessment') || lower.includes('executive assessment') || lower.includes('complete report');
      const isRisk = lower.includes('risk') || lower.includes('score') || lower.includes('level') || lower.includes('category') || lower.includes('how risky');

      // Helper function for management decision
      const getManagementDecision = (m: Mine): string => {
        if (m.riskCategory === 'HIGH' || m.riskCategory === 'CRITICAL') {
          return 'Prioritize this mine for review and schedule targeted inspection based on current risk signals.';
        }
        if (m.inspectionPriority === 'HIGH' || m.inspectionPriority === 'MEDIUM') {
          return 'Schedule targeted inspection based on the current priority signal.';
        }
        if (!m.evidenceStatus || m.evidenceStatus === 'Insufficient Evidence') {
          return 'Review the available evidence before escalation.';
        }
        return 'Continue routine monitoring.';
      };

      // Helper for AI recommendation text
      const getRecText = (m: Mine): string => {
        if (!m.aiRecommendation) return 'Insufficient Evidence';
        if (typeof m.aiRecommendation === 'string') return m.aiRecommendation;
        return m.aiRecommendation.headline || m.aiRecommendation.description || 'Insufficient Evidence';
      };

      let responseText = '';

      // --- INTENT G: PREDICTIVE / FORWARD LOOKING ---
      if (isPredictive) {
        const sortedMines = [...mines]
          .filter((m) => m.riskScore != null)
          .sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));

        const topMines = sortedMines.slice(0, 5);

        if (topMines.length === 0) {
          responseText = `## DECISION BRIEF\n\n### Mine / Scope\nNational Predictive Risk Intelligence (408 Assessed Mines)\n\n### Risk Assessment\nAssessment is limited by insufficient mine-level evidence across dataset.\n\n### Evidence Limitation\nInsufficient Evidence`;
        } else {
          responseText = `## DECISION BRIEF\n\n### Mine / Scope\nNational Predictive Risk Intelligence (408 Assessed Mines)\n\n### Risk Assessment\nForward-looking risk signals from the current ML assessment:\n\n`;
          topMines.forEach((m, idx) => {
            const rec = getRecText(m);
            const scoreStr = m.riskScore != null ? `${m.riskScore.toFixed(2)} / 100` : 'Insufficient Evidence';
            const confStr = m.confidenceScore != null ? `${m.confidenceScore}%` : 'Insufficient Evidence';
            const covStr = m.evidenceCoverage != null ? `${m.evidenceCoverage}%` : 'Insufficient Evidence';

            responseText += `${idx + 1}. **${m.name}** (${m.mineId || m.id})\n`;
            responseText += `   - **Risk Score**: ${scoreStr}\n`;
            responseText += `   - **Risk Category**: ${m.riskCategory || 'Insufficient Evidence'}\n`;
            responseText += `   - **Inspection Priority**: ${m.inspectionPriority || 'Insufficient Evidence'}\n`;
            responseText += `   - **Actual Risk Drivers**: ${m.riskDrivers || 'Insufficient Evidence'}\n`;
            responseText += `   - **Actual AI Recommendation**: ${rec}\n`;
            responseText += `   - **Confidence / Evidence Coverage**: ${confStr} confidence (${covStr} coverage)\n\n`;
          });

          responseText += `### Why This Matters\nEarly risk drivers and operational anomalies highlight potential safety and compliance vulnerabilities before escalation.\n\n`;
          responseText += `### Recommended Action\nDeploy preventive operational controls and targeted evidence monitoring to top-ranked facilities.\n\n`;
          responseText += `### Management Decision\nBased on current ML risk indicators, facility **${topMines[0].name}** should receive higher management attention.\n\n`;
          responseText += `### Evidence Limitation\nAssessment is limited by insufficient mine-level evidence.`;
        }
      }
      // --- INTENT A/D: WHICH MINES ARE HIGH RISK? ---
      else if (isHighRiskList) {
        const sortedMines = [...mines]
          .filter((m) => m.riskScore != null)
          .sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));

        const highMines = sortedMines.filter(
          (m) => m.riskCategory === 'HIGH' || m.riskCategory === 'CRITICAL'
        );

        responseText = `## DECISION BRIEF\n\n### Mine / Scope\nNational Coal Mine Network (408 Assessed Mines)\n\n### Risk Assessment\n`;

        if (highMines.length === 0) {
          responseText += `No mine in the real dataset currently qualifies as HIGH or CRITICAL risk.\n\n`;
          responseText += `Top facilities ranked by current ML risk score:\n\n`;
          responseText += `| RANK | MINE | MINE ID | RISK SCORE | CATEGORY | CONFIDENCE | PRIORITY |\n`;
          responseText += `| --- | --- | --- | --- | --- | --- | --- |\n`;
          sortedMines.slice(0, 5).forEach((m, idx) => {
            responseText += `| ${idx + 1} | ${m.name} | ${m.mineId || m.id} | ${m.riskScore ? m.riskScore.toFixed(2) : 'N/A'} | ${m.riskCategory || 'LOW'} | ${m.confidenceScore ?? 'N/A'}% | ${m.inspectionPriority || 'LOW'} |\n`;
          });
        } else {
          responseText += `High-risk facilities summary from current ML assessment:\n\n`;
          responseText += `| RANK | MINE | MINE ID | RISK SCORE | CATEGORY | CONFIDENCE | PRIORITY |\n`;
          responseText += `| --- | --- | --- | --- | --- | --- | --- |\n`;
          highMines.slice(0, 10).forEach((m, idx) => {
            responseText += `| ${idx + 1} | ${m.name} | ${m.mineId || m.id} | ${m.riskScore ? m.riskScore.toFixed(2) : 'N/A'} | ${m.riskCategory} | ${m.confidenceScore ?? 'N/A'}% | ${m.inspectionPriority || 'N/A'} |\n`;
          });
        }

        responseText += `\n### Why This Matters\nFacilities with elevated ML risk indicators require continuous operational oversight and evidence coverage validation.\n\n`;
        responseText += `### Recommended Action\nPrioritize top-ranked high-risk facilities for targeted governance reviews and evidence verification.\n\n`;
        responseText += `### Management Decision\nBased on current ML risk indicators, top-ranked facilities should receive higher management attention.\n\n`;
        responseText += `### Evidence Limitation\nAssessment is limited by insufficient mine-level evidence.`;
      }
      // --- INTENT D: WHICH MINE SHOULD WE INSPECT FIRST? ---
      else if (isPriorityDispatch) {
        const sortedMines = [...mines]
          .filter((m) => m.riskScore != null)
          .sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));

        responseText = `## DECISION BRIEF\n\n### Mine / Scope\nNational Inspection Priority Queue (408 Assessed Mines)\n\n### Risk Assessment\nRanked by inspection priority signal from the 408 real mine dataset:\n\n`;
        responseText += `| RANK | MINE | MINE ID | PRIORITY | RISK SCORE | CATEGORY | CONFIDENCE |\n`;
        responseText += `| --- | --- | --- | --- | --- | --- | --- |\n`;

        sortedMines.slice(0, 5).forEach((m, idx) => {
          responseText += `| ${idx + 1} | ${m.name} | ${m.mineId || m.id} | ${m.inspectionPriority || 'LOW'} | ${m.riskScore ? m.riskScore.toFixed(2) : 'N/A'} | ${m.riskCategory || 'LOW'} | ${m.confidenceScore ?? 'N/A'}% |\n`;
        });

        responseText += `\n### Why This Matters\nInspection priority is dynamically assigned based on ML risk scores, evidence status, and environmental anomaly indicators.\n\n`;
        responseText += `### Recommended Action\nDispatch inspection teams starting with facility **${sortedMines[0]?.name || 'Aadocm'}**.\n\n`;
        responseText += `### Management Decision\nSchedule targeted inspection based on the current priority signal.\n\n`;
        responseText += `### Evidence Limitation\nAssessment is limited by insufficient mine-level evidence.`;
      }
      // --- MINE SPECIFIC QUERIES ---
      else {
        // Fallback target mine: requested mine OR Aadocm OR first real mine
        const targetMine =
          requestedMine ||
          mines.find((m) => m.name.toLowerCase() === 'aadocm') ||
          mines[0];

        if (!targetMine) {
          responseText = `## DECISION BRIEF\n\n### Mine / Scope\nUnknown Facility\n\n### Risk Assessment\nAssessment is limited by insufficient mine-level evidence. Real mine dataset is loading...\n\n### Evidence Limitation\nInsufficient Evidence`;
        } else {
          const recText = getRecText(targetMine);
          const formattedScore =
            targetMine.riskScore != null
              ? `${targetMine.riskScore.toFixed(2)} / 100`
              : 'Insufficient Evidence';
          const confScore =
            targetMine.confidenceScore != null
              ? `${targetMine.confidenceScore}%`
              : 'Insufficient Evidence';
          const covScore =
            targetMine.evidenceCoverage != null
              ? `${targetMine.evidenceCoverage}%`
              : 'Insufficient Evidence';

          // INTENT H: EXECUTIVE ASSESSMENT
          if (isExecutive) {
            responseText = `## DECISION BRIEF\n\n`;
            responseText += `### Mine / Scope\nMine Name: ${targetMine.name}\nMine ID: ${targetMine.mineId || targetMine.id}\nLocation: ${targetMine.location || targetMine.state}\n\n`;
            responseText += `### Risk Assessment\n`;
            responseText += `- **Risk Score**: ${formattedScore}\n`;
            responseText += `- **Risk Category**: ${targetMine.riskCategory || 'Insufficient Evidence'}\n`;
            responseText += `- **Confidence Score**: ${confScore}\n`;
            responseText += `- **Evidence Status**: ${targetMine.evidenceStatus || 'Insufficient Evidence'}\n`;
            responseText += `- **Evidence Coverage**: ${covScore}\n`;
            responseText += `- **Inspection Priority**: ${targetMine.inspectionPriority || 'Insufficient Evidence'}\n\n`;
            responseText += `### Why This Matters\n`;
            responseText += `- **Key Signal**: ${targetMine.explanation && targetMine.explanation !== 'Insufficient Evidence' ? targetMine.explanation : targetMine.riskDrivers || 'Insufficient Evidence'}\n`;
            responseText += `- **Environmental Signal**: ${targetMine.environmentalAnomaly && targetMine.environmentalAnomaly !== 'Insufficient Evidence' ? `Anomaly: ${targetMine.environmentalAnomaly} (Score: ${targetMine.environmentalAnomalyScore ?? 'N/A'})` : 'Environmental evidence is currently insufficient for this mine.'}\n`;
            responseText += `- **Operational Signal**: Operational Risk Score: ${targetMine.operationalRiskScore != null ? `${targetMine.operationalRiskScore.toFixed(2)} / 100` : 'Insufficient Evidence'}. Evidence Coverage: ${covScore}.\n\n`;
            responseText += `### Recommended Action\n${recText}\n\n`;
            responseText += `### Management Decision\n${getManagementDecision(targetMine)}\n\n`;
            responseText += `### Evidence Limitation\nAssessment is limited by insufficient mine-level evidence.`;
          }
          // INTENT B: WHY / EXPLANATION
          else if (isWhy) {
            responseText = `## DECISION BRIEF\n\n`;
            responseText += `### Mine / Scope\nMine Name: ${targetMine.name}\nMine ID: ${targetMine.mineId || targetMine.id}\nLocation: ${targetMine.location || targetMine.state}\n\n`;
            responseText += `### Risk Assessment\n`;
            responseText += `Current assessment is ${targetMine.riskCategory || 'LOW'} (${formattedScore}). The available signal is ${targetMine.evidenceStatus || 'Operational Only'} evidence, with ${confScore} confidence and ${covScore} evidence coverage.\n\n`;
            responseText += `### Why This Matters\n`;
            responseText += `- **Risk Signal**: ${targetMine.riskCategory || 'LOW'} (${formattedScore})\n`;
            responseText += `- **Evidence Available**: ${targetMine.evidenceStatus || 'Operational Only'}\n`;
            responseText += `- **Main Driver**: ${targetMine.riskDrivers || 'No major risk indicator'}\n`;
            responseText += `- **Explanation**: ${targetMine.explanation && targetMine.explanation !== 'Insufficient Evidence' ? targetMine.explanation : 'No immediate high-risk indicator detected; continue routine monitoring.'}\n`;
            responseText += `- **Confidence & Coverage**: ${confScore} confidence across ${covScore} evidence coverage\n\n`;
            responseText += `### Recommended Action\n${recText}\n\n`;
            responseText += `### Management Decision\n${getManagementDecision(targetMine)}\n\n`;
            responseText += `### Evidence Limitation\nAssessment is limited by insufficient mine-level evidence.`;
          }
          // INTENT C: DECISION / ACTION
          else if (isAction) {
            responseText = `## DECISION BRIEF\n\n`;
            responseText += `### Mine / Scope\nMine Name: ${targetMine.name}\nMine ID: ${targetMine.mineId || targetMine.id}\nLocation: ${targetMine.location || targetMine.state}\n\n`;
            responseText += `### Risk Assessment\n`;
            responseText += `- **Risk Score**: ${formattedScore}\n`;
            responseText += `- **Inspection Priority**: ${targetMine.inspectionPriority || 'LOW'}\n\n`;
            responseText += `### Why This Matters\n`;
            responseText += `- **Risk Drivers**: ${targetMine.riskDrivers || 'No major risk indicator'}\n`;
            responseText += `- **Explanation**: ${targetMine.explanation && targetMine.explanation !== 'Insufficient Evidence' ? targetMine.explanation : 'Routine operational signal; continue standard monitoring.'}\n\n`;
            responseText += `### Recommended Action\n${recText}\n\n`;
            responseText += `### Management Decision\n${getManagementDecision(targetMine)}\n\n`;
            responseText += `### Evidence Limitation\nAssessment is limited by insufficient mine-level evidence.`;
          }
          // INTENT E: ENVIRONMENTAL
          else if (isEnv) {
            const isEnvInsufficient =
              !targetMine.environmentalAnomaly ||
              targetMine.environmentalAnomaly === 'Insufficient Evidence' ||
              targetMine.environmentalAnomaly === 'No Anomaly';

            responseText = `## DECISION BRIEF\n\n`;
            responseText += `### Mine / Scope\nMine Name: ${targetMine.name}\nMine ID: ${targetMine.mineId || targetMine.id}\nLocation: ${targetMine.location || targetMine.state}\n\n`;
            responseText += `### Risk Assessment\n`;
            responseText += `- **Environmental Anomaly**: ${targetMine.environmentalAnomaly || 'Insufficient Evidence'}\n`;
            responseText += `- **Environmental Anomaly Score**: ${targetMine.environmentalAnomalyScore != null ? targetMine.environmentalAnomalyScore.toFixed(2) : 'Insufficient Evidence'}\n`;
            responseText += `- **Environmental Risk Score**: ${targetMine.environmentalRiskScore != null ? targetMine.environmentalRiskScore.toFixed(2) : 'Insufficient Evidence'}\n`;
            responseText += `- **Evidence Status**: ${targetMine.evidenceStatus || 'Insufficient Evidence'}\n`;
            responseText += `- **Confidence Score**: ${confScore}\n`;
            responseText += `- **Evidence Coverage**: ${covScore}\n\n`;
            responseText += `### Why This Matters\n`;
            responseText += isEnvInsufficient
              ? `Environmental evidence is currently insufficient for this mine.\n\n`
              : `Active environmental anomaly signal documented in dataset.\n\n`;
            responseText += `### Recommended Action\n${recText}\n\n`;
            responseText += `### Management Decision\n${isEnvInsufficient ? 'Review available environmental monitoring feeds before escalation.' : 'Prioritize environmental audit team dispatch.'}\n\n`;
            responseText += `### Evidence Limitation\nAssessment is limited by insufficient mine-level evidence.`;
          }

          // INTENT F: EVIDENCE / CONFIDENCE
          else if (isEvidence) {
            responseText = `## DECISION BRIEF\n\n`;
            responseText += `### Mine / Scope\nMine Name: ${targetMine.name}\nMine ID: ${targetMine.mineId || targetMine.id}\n\n`;
            responseText += `### Data Confidence & Evidence Quality\n`;
            responseText += `- **Confidence Score**: ${confScore}\n`;
            responseText += `- **Confidence Category**: ${targetMine.confidenceCategory || 'Moderate Confidence'}\n`;
            responseText += `- **Evidence Status**: ${targetMine.evidenceStatus || 'Insufficient Evidence'}\n`;
            responseText += `- **Evidence Coverage**: ${covScore}\n`;
            responseText += `- **Available Evidence Domains**: Operational statistics & production metrics.\n\n`;
            responseText += `### Management Note\nConfidence reflects available mine-level evidence, not official regulatory certification.\n\n`;
            responseText += `### Evidence Limitation\nAssessment is limited by insufficient mine-level evidence.`;
          }
          // INTENT D: INSPECTION PRIORITY (for specific mine)
          else if (isPriority) {
            responseText = `## DECISION BRIEF\n\n`;
            responseText += `### Mine / Scope\nMine Name: ${targetMine.name}\nMine ID: ${targetMine.mineId || targetMine.id}\n\n`;
            responseText += `### Inspection Priority & Dispatch Intelligence\n`;
            responseText += `- **Inspection Priority**: ${targetMine.inspectionPriority || 'Insufficient Evidence'}\n`;
            responseText += `- **Priority Score**: ${targetMine.priorityScore != null ? targetMine.priorityScore.toFixed(2) : 'Insufficient Evidence'}\n`;
            responseText += `- **Risk Score**: ${formattedScore}\n`;
            responseText += `- **Recommended Action**: ${recText}\n\n`;
            responseText += `### Management Decision\n${getManagementDecision(targetMine)}\n\n`;
            responseText += `### Evidence Limitation\nAssessment is limited by insufficient mine-level evidence.`;
          }
          // INTENT A: MINE RISK (default mine query)
          else {
            responseText = `## DECISION BRIEF\n\n`;
            responseText += `### Mine / Scope\nMine Name: ${targetMine.name}\nMine ID: ${targetMine.mineId || targetMine.id}\nLocation: ${targetMine.location}\n\n`;
            responseText += `### Risk Assessment\n`;
            responseText += `- **Risk Score**: ${formattedScore}\n`;
            responseText += `- **Risk Category**: ${targetMine.riskCategory || 'Insufficient Evidence'}\n`;
            responseText += `- **Confidence Score**: ${confScore}\n`;
            responseText += `- **Evidence Status**: ${targetMine.evidenceStatus || 'Insufficient Evidence'}\n`;
            responseText += `- **Evidence Coverage**: ${covScore}\n`;
            responseText += `- **Inspection Priority**: ${targetMine.inspectionPriority || 'Insufficient Evidence'}\n\n`;
            responseText += `### Why This Matters\n`;
            responseText += `- **Risk Drivers**: ${targetMine.riskDrivers || 'Insufficient Evidence'}\n`;
            responseText += `- **Explanation**: ${targetMine.explanation && targetMine.explanation !== 'Insufficient Evidence' ? targetMine.explanation : 'No immediate high-risk indicator detected; continue routine monitoring.'}\n\n`;
            responseText += `### Recommended Action\n${recText}\n\n`;
            responseText += `### Management Decision\n${getManagementDecision(targetMine)}\n\n`;
            responseText += `### Evidence Limitation\nAssessment is limited by insufficient mine-level evidence.`;
          }
        }
      }

      aiReply = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        richData: requestedMine && requestedMine.riskScore != null ? {
          mineName: requestedMine.name,
          riskScore: Number(requestedMine.riskScore.toFixed(2)),
          recommendation: {
            title: 'ML Recommendation',
            text: getRecText(requestedMine),
            actionText: 'Review Mine Intelligence',
          },
        } : undefined,
      };

      setChatMessages((prev) => [...prev, aiReply]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-2xl border border-white/20 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            notifications_active
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        criticalAlertCount={criticalAlertCount}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 md:ml-[280px] min-h-screen flex flex-col">
        {/* Top Header */}
        <TopNavbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={setCurrentTab}
          criticalAlerts={alertsList.filter((a) => a.severity === 'Critical')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Body */}
        <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentTab}
              onDispatchInspection={handleDispatchInspection}
              onSelectMine={handleSelectMine}
              mines={mines}
            />
          )}

          {currentTab === 'mines' && (
            <MinesView
              mines={mines}
              selectedMineId={activeMineId}
              onSelectMine={setSelectedMineId}
              onNavigate={setCurrentTab}
              onDeployInspection={handleDispatchInspection}
            />
          )}

          {!mineLoadError && mines.length === 0 && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              Loading real mine intelligence...
            </div>
          )}

          {mineLoadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              Real mine intelligence unavailable: {mineLoadError}
            </div>
          )}

          {currentTab === 'field-ops' && (
            <FieldOpsView
              mines={mines}
              inspection={fieldInspection}
              onNavigate={setCurrentTab}
              onCreateCorrectiveAction={handleCreateCorrectiveAction}
            />
          )}

          {currentTab === 'compliance' && (
            <ComplianceView
              requirements={complianceList}
              mines={mines}
              mineLoadError={mineLoadError}
              onNavigate={setCurrentTab}
              onAddRequirement={handleAddComplianceRequirement}
              onUpdateStatus={handleUpdateComplianceStatus}
            />
          )}

          {currentTab === 'ai-command' && (
            <AiCommandView
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onNavigate={setCurrentTab}
              onScheduleInspectionFromAi={handleDispatchInspection}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              alerts={alertsList}
              mines={mines}
              onNavigate={setCurrentTab}
              onUpdateAlertStatus={handleUpdateAlertStatus}
              onCreateAlert={handleCreateAlert}
            />
          )}

          {currentTab === 'contractors' && (
            <ContractorsView
              mines={mines}
              onNavigate={setCurrentTab}
              onSelectMine={handleSelectMine}
            />
          )}

          {currentTab === 'inspections' && (
            <InspectionsView
              mines={mines}
              onStartInspection={handleStartInspection}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView mines={mines} onNavigate={setCurrentTab} />
          )}

          {currentTab === 'settings' && (
            <SettingsView onNavigate={setCurrentTab} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
