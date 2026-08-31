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
    // Switch to field ops with target sector
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
      mine: 'Mine A (Site Alpha)',
      time: 'Just now',
      status: 'Unacknowledged',
      severity: 'Critical',
      assignedTo: {
        name: 'J. Doe',
        initials: 'JD',
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

    // Simulated AI response engine grounded in CoalGuard telemetry
    setTimeout(() => {
      let aiReply: ChatMessage;
      const lower = text.toLowerCase();

      if (lower.includes('mine a') || lower.includes('alpha')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `Analyzing telemetry for **Mine A (Site Alpha)**. High risk score (78/100) is driven by 4 active safety violations and ventilation differential drops in Sector 4.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          richData: {
            mineName: 'Mine A (Site Alpha)',
            riskScore: 78,
            factorBreakdown: [
              { label: 'Ventilation & Airflow', value: 85, color: '#ba1a1a' },
              { label: 'Combustible Dust', value: 68, color: '#f59e0b' },
              { label: 'Contractor Training', value: 34, color: '#3b82f6' },
            ],
            recommendation: {
              title: 'MSHA Title 30 §75.370 Priority Action',
              text: 'Recommend immediate maintenance team dispatch to Sector 4 fan drive motor to avoid forced regulatory stop.',
              actionText: 'Deploy Inspection Team',
            },
          },
        };
      } else if (lower.includes('violation') || lower.includes('msha')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `Currently tracking **12 active compliance items** and **4 critical safety violations** across Appalachian and Northern coalfields. \n\n1. **Ventilation Shaft Integrity Check** (REQ-2023-084) - Overdue\n2. **Conveyor Combustible Dust Build-up** (MSHA §75.400) - Sector 4\n3. **Methane Detector MS-409 Offline** - Blackwood North Pit`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else if (lower.includes('conveyor') || lower.includes('sector 4') || lower.includes('failure')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `Acoustic and thermal sensors on **Conveyor Belt B (Sector 4)** indicate high friction near roller assembly #12. Probability of motor burn-out within 18 hours is **89%**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          richData: {
            mineName: 'Sector 4 - Conveyor Belt B',
            riskScore: 89,
            factorBreakdown: [
              { label: 'Thermal Sensor Variance', value: 92, color: '#ba1a1a' },
              { label: 'Vibration Harmonics', value: 78, color: '#f59e0b' },
            ],
            recommendation: {
              title: 'Predictive Maintenance Alert',
              text: 'Perform bearing lubrication and replace worn belt skirt seals.',
              actionText: 'Schedule Inspection',
            },
          },
        };
      } else {
        aiReply = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: `Central command telemetry has indexed your query: "${text}". All atmospheric sensors (Methane CH4, CO PPM) and contractor compliance records are synchronized. Let me know if you would like a detailed risk assessment or inspector dispatch.`,
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
