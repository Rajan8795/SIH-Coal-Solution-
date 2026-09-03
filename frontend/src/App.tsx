import React, { useState } from 'react';
import { NavigationTab, Mine, ComplianceRequirement, AlertItem, FieldInspection, ChatMessage, Contractor } from './types';
import {
  INITIAL_MINES,
  INITIAL_COMPLIANCE,
  INITIAL_ALERTS,
  INITIAL_FIELD_INSPECTION,
  INITIAL_CONTRACTORS,
  INITIAL_CHAT_MESSAGES,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { MinesView } from './components/MinesView';
import { FieldOpsView } from './components/FieldOpsView';
import { ComplianceView } from './components/ComplianceView';
import { AiCommandView } from './components/AiCommandView';
import { AlertsView } from './components/AlertsView';
import { ContractorsView } from './components/ContractorsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedMineId, setSelectedMineId] = useState<string>('mine-a');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App Data State
  const [mines, setMines] = useState<Mine[]>(INITIAL_MINES);
  const [complianceList, setComplianceList] = useState<ComplianceRequirement[]>(INITIAL_COMPLIANCE);
  const [alertsList, setAlertsList] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [fieldInspection, setFieldInspection] = useState<FieldInspection>(INITIAL_FIELD_INSPECTION);
  const [contractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const criticalAlertCount = alertsList.filter((a) => a.severity === 'Critical' && a.status !== 'Resolved').length;

  // Handlers
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

  const handleSelectMine = (mineId: string) => {
    setSelectedMineId(mineId);
    setCurrentTab('mines');
  };

  const handleCreateCorrectiveAction = (insp: FieldInspection) => {
    const newAlert: AlertItem = {
      id: `alert-${Date.now()}`,
      title: `${insp.analysis.title} - ${insp.location}`,
      location: insp.location,
      mine: 'Jharia Main Colliery',
      time: 'Just now',
      status: 'Unacknowledged',
      severity: 'Critical',
      assignedTo: {
        name: 'V. Singh',
        initials: 'VS',
      },
      deadline: '24 Hours',
      description: `${insp.analysis.description} (${insp.analysis.standardRef})`,
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
      const lower = text.toLowerCase();

      if (lower.includes('high risk') || lower.includes('which mines')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `Based on current compliance records and inspection data, here are the **highest risk mines** in the network:\n\n1. **Korba Deep Mine** (Chhattisgarh) - Risk Score: 84/100\n   - 5 active safety violations, 3 overdue actions\n2. **Jharia Main Colliery** (Jharkhand) - Risk Score: 78/100\n   - 4 active safety violations, contractor compliance issues\n3. **Singrauli North Extension** (Madhya Pradesh) - Risk Score: 56/100\n   - Pending environmental audit, overdue certifications`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          richData: {
            mineName: 'Korba Deep Mine',
            riskScore: 84,
            factorBreakdown: [
              { label: 'Safety Violations', value: 92, color: '#ba1a1a' },
              { label: 'Overdue Compliance', value: 78, color: '#f59e0b' },
              { label: 'Inspection Findings', value: 65, color: '#3b82f6' },
            ],
            recommendation: {
              title: 'Predictive Governance Insight',
              text: 'Schedule targeted safety inspection and resolve overdue compliance actions to reduce risk escalation.',
              actionText: 'Schedule Inspection',
            },
          },
        };
      } else if (lower.includes('go wrong') || lower.includes('predict') || lower.includes('what could')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `Based on historical patterns and current compliance data, here are the **predicted risks**:\n\n**Korba Deep Mine (Chhattisgarh)**\n- Predicted Risk: HIGH (Score: 84/100)\n- Trend: Increasing\n- Main factors: Repeated safety violations, overdue compliance, recurring inspection findings\n\n**Jharia Main Colliery (Jharkhand)**\n- Predicted Risk: HIGH (Score: 78/100)\n- Trend: Increasing\n- Main factors: Active safety violations, contractor compliance issues\n\nRecommended preventive action: Schedule targeted inspections and resolve overdue compliance actions.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else if (lower.includes('korba') || lower.includes('why is')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `**Korba Deep Mine** is classified as HIGH RISK due to the following factors:\n\n- **5 active safety violations** - highest in the network\n- **3 overdue compliance actions** including ventilation shaft integrity check\n- **Recurring inspection findings** related to ventilation maintenance\n- **Contractor compliance issues** with Bharat Coal Mining Services\n\nHistorical data shows a pattern of repeated findings in consecutive inspections, indicating systemic compliance gaps.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          richData: {
            mineName: 'Korba Deep Mine',
            riskScore: 84,
            factorBreakdown: [
              { label: 'Safety Violations', value: 92, color: '#ba1a1a' },
              { label: 'Overdue Actions', value: 78, color: '#f59e0b' },
              { label: 'Contractor Issues', value: 54, color: '#3b82f6' },
            ],
            recommendation: {
              title: 'DGMS Compliance Priority',
              text: 'Recommend immediate targeted inspection focusing on ventilation compliance and resolution of overdue actions as per CMR 2017 requirements.',
              actionText: 'Deploy Inspection Team',
            },
          },
        };
      } else if (lower.includes('overdue') || lower.includes('compliance')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `Currently tracking **12 active compliance items** across the network. **Overdue items:**\n\n1. **Ventilation Shaft Integrity Check** (DGMS-2024-084)\n   - Mine: Korba Deep Mine | Due: 2024-10-24 | Risk: High\n\n2. **Structural Support Recertification** (DGMS-2024-145)\n   - Mine: Godavari Valley Block III | Due: 2024-11-12 | Risk: Medium\n\n3. **Dust Suppression System Calibration** (DGMS-2024-199)\n   - Mine: Jharia Main Colliery | Due: 2024-11-20 | Risk: High`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else if (lower.includes('preventive') || lower.includes('recommendation') || lower.includes('action')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `**Recommended Preventive Actions:**\n\n1. **Korba Deep Mine** - Schedule targeted safety inspection focusing on recurring ventilation findings\n2. **Jharia Main Colliery** - Review contractor certifications and dispatch inspection team to Sector 4\n3. **Singrauli North Extension** - Schedule overdue emissions audit with certified inspector\n\nThese actions are based on compliance history patterns and aim to prevent escalation of identified risks.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else if (lower.includes('jharia') || lower.includes('mine a') || lower.includes('alpha')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `Analyzing compliance data for **Jharia Main Colliery** (Jharkhand). Risk score: 78/100 driven by 4 active safety violations and contractor compliance issues in Sector 4.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          richData: {
            mineName: 'Jharia Main Colliery',
            riskScore: 78,
            factorBreakdown: [
              { label: 'Safety Violations', value: 85, color: '#ba1a1a' },
              { label: 'Overdue Compliance', value: 68, color: '#f59e0b' },
              { label: 'Contractor Training', value: 34, color: '#3b82f6' },
            ],
            recommendation: {
              title: 'AI Recommendation',
              text: 'Immediate inspection recommended for Sector 4 ventilation compliance. Schedule targeted inspection to address recurring findings.',
              actionText: 'Schedule Inspection',
            },
          },
        };
      } else {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `CoalGuard AI has indexed your query: "${text}". I analyze compliance records, inspection reports, environmental data, contractor records, and field observations to provide predictive risk insights. Ask me about high-risk mines, overdue compliance, or preventive actions recommended for your facilities.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }

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
            />
          )}

          {currentTab === 'mines' && (
            <MinesView
              mines={mines}
              selectedMineId={selectedMineId}
              onSelectMine={setSelectedMineId}
              onNavigate={setCurrentTab}
              onDeployInspection={handleDispatchInspection}
            />
          )}

          {currentTab === 'field-ops' && (
            <FieldOpsView
              inspection={fieldInspection}
              onNavigate={setCurrentTab}
              onCreateCorrectiveAction={handleCreateCorrectiveAction}
            />
          )}

          {currentTab === 'compliance' && (
            <ComplianceView
              requirements={complianceList}
              mines={mines}
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
              onNavigate={setCurrentTab}
              onUpdateAlertStatus={handleUpdateAlertStatus}
              onCreateAlert={handleCreateAlert}
            />
          )}

          {currentTab === 'contractors' && (
            <ContractorsView
              contractors={contractors}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'inspections' && (
            <FieldOpsView
              inspection={fieldInspection}
              onNavigate={setCurrentTab}
              onCreateCorrectiveAction={handleCreateCorrectiveAction}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView onNavigate={setCurrentTab} />
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
