import React, { useState } from 'react';
import { Mine, NavigationTab } from '../types';
import IndiaMap from './IndiaMap';
import { ComplianceTrendChart, SafetyIncidentsChart } from './DashboardCharts';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onDispatchInspection: (sectorName: string) => void;
  onSelectMine: (mineId: string) => void;
  mines: Mine[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onDispatchInspection,
  onSelectMine,
  mines,
}) => {
  const predictiveRiskData = mines
    .filter((mine) => mine.riskScore !== null)
    .sort((first, second) => (second.riskScore || 0) - (first.riskScore || 0))
    .slice(0, 3)
    .map((mine) => ({
      mine: mine.name,
      state: mine.location,
      predictedRisk: mine.riskCategory || 'INSUFFICIENT EVIDENCE',
      riskScore: mine.riskScore as number,
      riskTrend: mine.riskCategory === 'HIGH' || mine.riskCategory === 'CRITICAL' ? 'increasing' : 'stable',
      contributingFactors: [mine.riskDrivers],
      recommendation: mine.aiRecommendation.headline,
    }));
  const assessedMines = mines.filter((mine) => mine.riskScore !== null).length;
  const highCriticalMines = mines.filter((mine) => mine.riskCategory === 'HIGH' || mine.riskCategory === 'CRITICAL').length;
  const evidenceAvailable = mines.filter((mine) => mine.evidenceStatus && !mine.evidenceStatus.toLowerCase().includes('insufficient')).length;
  const environmentalAnomalies = mines.filter((mine) => mine.environmentalAnomaly && mine.environmentalAnomaly !== 'No Anomaly').length;
  const uniqueStatesCount = new Set(mines.map((m) => m.state || m.location).filter(Boolean)).size;
  const priorityTargetsCount = mines.filter((m) => m.inspectionPriority === 'URGENT' || m.inspectionPriority === 'HIGH').length;
  const evidenceCoveragePct = assessedMines > 0 ? ((evidenceAvailable / assessedMines) * 100).toFixed(1) : '0';
  const priorityMines = mines
    .filter((mine) => mine.inspectionPriority === 'URGENT' || mine.inspectionPriority === 'HIGH' || mine.riskCategory === 'CRITICAL' || mine.riskCategory === 'HIGH')
    .sort((first, second) => (second.riskScore || 0) - (first.riskScore || 0))
    .slice(0, 4);

  const priorityActions = priorityMines.map((mine) => ({
    mineId: mine.mineId || mine.id,
    name: mine.name,
    location: mine.location || mine.state || 'Location Unspecified',
    riskScore: mine.riskScore,
    riskCategory: mine.riskCategory || 'HIGH',
    inspectionPriority: mine.inspectionPriority || 'HIGH',
    evidenceStatus: mine.evidenceStatus || 'Operational Only',
    riskDriver: mine.riskDrivers || 'No major driver identified',
    recommendation: typeof mine.aiRecommendation === 'string' ? mine.aiRecommendation : mine.aiRecommendation?.headline || 'Review ML Intelligence',
  }));
  const [viewMode, setViewMode] = useState<'standard' | 'national'>('standard');
  const [showChartModal, setShowChartModal] = useState<string | null>(null);
  const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
};

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'trending_up';
      case 'decreasing': return 'trending_down';
      default: return 'trending_flat';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return '#ba1a1a';
      case 'decreasing': return '#10B981';
      default: return '#515f74';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Section with View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
            {getGreeting()}, Officer.
          </h2>
          <p className="text-base text-[#45464d] mt-1 font-medium">
            Here's what needs your attention today.
          </p>
        </div>

        {/* View Mode Switcher Pill */}
        <div className="flex items-center gap-1.5 p-1 bg-[#eceef0] rounded-xl self-start sm:self-auto border border-[#c6c6cd]/30">
          <button
            onClick={() => setViewMode('standard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'standard'
                ? 'bg-white text-[#191c1e] shadow-xs'
                : 'text-[#45464d] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            Site Operations
          </button>
          <button
            onClick={() => setViewMode('national')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'national'
                ? 'bg-white text-[#191c1e] shadow-xs'
                : 'text-[#45464d] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">public</span>
            National Overview
          </button>
        </div>
      </div>

      {/* NATIONAL COMMAND VIEW */}
      {viewMode === 'national' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Hero Card */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-[#c6c6cd]/30 industrial-shadow p-6 md:p-8 flex flex-col justify-center relative overflow-hidden ai-gradient-border">
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dae2fd]/60 text-[#131b2e] text-[11px] font-bold tracking-wider uppercase mb-4 border border-[#bec6e0]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Operational
                </span>
                <h3 className="text-3xl md:text-4xl font-extrabold text-[#191c1e] mb-2 tracking-tight">
                  CoalGuard AI
                </h3>
                <p className="text-base text-[#45464d] mb-6 max-w-lg leading-relaxed">
                  Intelligent Governance & Compliance for Indian Coal Mines. Centralized oversight, predictive risk analysis, and compliance intelligence.
                </p>
                <button
                  onClick={() => onNavigate('ai-command')}
                  className="bg-[#0F172A] text-white px-5 py-3 rounded-lg text-xs font-bold inline-flex items-center gap-2 hover:bg-[#1e293b] transition-all shadow-md active:scale-95"
                >
                  Explore Command Center
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
              {/* Decorative radial */}
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#d5e3fd] rounded-full blur-3xl opacity-30 -mr-16 -mb-16 pointer-events-none"></div>
            </div>

            {/* National Map Card - India Focused */}
            <div className="lg:col-span-5 flex flex-col min-h-[580px]">
              <IndiaMap mines={mines} onSelectMine={onSelectMine} onNavigate={onNavigate} />
            </div>
          </div>

          {/* National Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-[#c6c6cd]/30 industrial-shadow p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#45464d]">
                  <span className="material-symbols-outlined">factory</span>
                </div>
              </div>
              <div className="font-mono text-3xl font-extrabold text-[#191c1e] tracking-tight">{assessedMines}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mt-1">Mines Assessed</div>
            </div>

            <div className="bg-white rounded-xl border border-[#c6c6cd]/30 industrial-shadow p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#45464d]">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <span className="flex items-center text-xs font-bold text-emerald-600">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> +2.4%
                </span>
              </div>
              <div className="font-mono text-3xl font-extrabold text-[#191c1e] tracking-tight">{evidenceAvailable}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mt-1">Evidence Available</div>
            </div>

            <div className="bg-white rounded-xl border border-[#ba1a1a]/30 industrial-shadow p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#ba1a1a] opacity-100"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#ffdad6] text-[#93000a] flex items-center justify-center">
                  <span className="material-symbols-outlined">warning</span>
                </div>
              </div>
              <div className="font-mono text-3xl font-extrabold text-[#ba1a1a] tracking-tight">{highCriticalMines}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#ba1a1a] mt-1">High / Critical</div>
            </div>

            <div className="bg-white rounded-xl border border-[#c6c6cd]/30 industrial-shadow p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#515f74] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#45464d]">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
              </div>
              <div className="font-mono text-3xl font-extrabold text-[#191c1e] tracking-tight">{environmentalAnomalies}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mt-1">Environmental Anomalies</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* STANDARD SITE COMMAND VIEW */}
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* High / Critical Risks */}
        <div
          onClick={() => onNavigate('inspections')}
          className="bg-white border border-[#c6c6cd]/30 rounded-xl p-5 industrial-shadow hover:shadow-md hover:border-t-2 hover:border-t-[#ba1a1a] transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
              High / Critical Risks
            </span>
            <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#ba1a1a] font-mono">{highCriticalMines}</span>
            <span className="text-xs text-[#45464d]">Targeted for AI dispatch</span>
          </div>
        </div>

        {/* AI Inspection Targets */}
        <div
          onClick={() => onNavigate('inspections')}
          className="bg-white border border-[#c6c6cd]/30 rounded-xl p-5 industrial-shadow hover:shadow-md hover:border-t-2 hover:border-t-[#515f74] transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
              AI Inspection Targets
            </span>
            <span className="material-symbols-outlined text-[#515f74]">assignment_late</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#191c1e] font-mono">{priorityTargetsCount}</span>
            <span className="text-xs text-[#45464d]">Urgent / High priority</span>
          </div>
        </div>

        {/* Evidence Coverage */}
        <div
          onClick={() => onNavigate('mines')}
          className="bg-white border border-[#c6c6cd]/30 rounded-xl p-5 industrial-shadow hover:shadow-md hover:border-t-2 hover:border-t-black transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
              Evidence Coverage
            </span>
            <span className="material-symbols-outlined text-black">verified</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#191c1e] font-mono">{evidenceCoveragePct}%</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> Active signal
            </span>
          </div>
        </div>

        {/* Mines Assessed */}
        <div
          onClick={() => onNavigate('mines')}
          className="bg-white border border-[#c6c6cd]/30 rounded-xl p-5 industrial-shadow hover:shadow-md hover:border-t-2 hover:border-t-black transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
              Mines Assessed
            </span>
            <span className="material-symbols-outlined text-black">landscape</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#191c1e] font-mono">{assessedMines}</span>
            <span className="text-xs text-[#45464d]">Across {uniqueStatesCount} states</span>
          </div>
        </div>
      </div>


      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map Widget (Span 2) - India Coal Mine Risk Intelligence */}
        <div className="lg:col-span-2 flex flex-col min-h-[580px]">
          <IndiaMap mines={mines} onSelectMine={onSelectMine} onNavigate={onNavigate} />
        </div>

        {/* AI Insights Widget (Span 1) - Priority Actions */}
        <div className="bg-white rounded-xl p-5 border border-[#c6c6cd]/30 industrial-shadow ai-border flex flex-col min-h-[580px]">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#e6e8ea]">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-lg">psychology</span>
              Priority Actions
            </h3>
            <span className="bg-[#dae2fd]/80 text-[#131b2e] text-[10px] px-2.5 py-0.5 rounded-full font-extrabold">
              AI GENERATED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {priorityActions.length === 0 ? (
              <div className="p-4 text-xs text-slate-500">No urgent ML inspection priorities available.</div>
            ) : (
              priorityActions.map((action) => (
                <div
                  key={action.mineId}
                  className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0F172A] leading-tight">
                        {action.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 font-bold block mt-0.5">
                        ID: {action.mineId} • {action.location}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        action.riskCategory === 'CRITICAL' || action.riskCategory === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {action.riskCategory} ({action.riskScore !== null ? action.riskScore : 'N/A'})
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="line-clamp-2 leading-relaxed">
                      <span className="font-bold text-slate-800">Recommendation:</span> "{action.recommendation}"
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium">
                      <span>Priority: <strong className="text-slate-800">{action.inspectionPriority}</strong></span>
                      <span>•</span>
                      <span>Evidence: <strong className="text-slate-800">{action.evidenceStatus}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectMine(action.mineId);
                      onNavigate('mines');
                    }}
                    className="w-full py-2 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1e293b] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>Review Mine Intelligence</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Predictive Risk Intelligence Section */}
      <div className="bg-white rounded-xl border border-[#c6c6cd]/30 industrial-shadow overflow-hidden">
        <div className="p-5 border-b border-[#e6e8ea] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#191c1e]">Predictive Risk Intelligence</h3>
              <p className="text-xs text-[#45464d]">What could go wrong next? AI-powered governance insights.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ai-command')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            Ask CoalGuard
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictiveRiskData.map((risk, idx) => (
              <div
                key={idx}
                className="border border-[#e0e3e5] rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#191c1e]">{risk.mine}</h4>
                    <p className="text-[11px] text-[#45464d]">{risk.state}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      risk.predictedRisk === 'HIGH' || risk.predictedRisk === 'CRITICAL'
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : risk.predictedRisk === 'MEDIUM'
                        ? 'bg-[#fcdeb5] text-[#574425]'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {risk.predictedRisk} RISK
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#45464d]">Risk Score</span>
                      <span className="font-mono font-bold text-[#191c1e]">{risk.riskScore.toFixed(2)}/100</span>
                    </div>
                    <div className="w-full bg-[#e6e8ea] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${risk.riskScore}%`,
                          backgroundColor: risk.riskScore > 70 ? '#ba1a1a' : risk.riskScore > 40 ? '#f59e0b' : '#10B981'
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1" style={{ color: getTrendColor(risk.riskTrend) }}>
                    <span className="material-symbols-outlined text-[18px]">{getTrendIcon(risk.riskTrend)}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#45464d] mb-1">Contributing Factors</p>
                  <ul className="text-[11px] text-[#45464d] space-y-0.5">
                    {risk.contributingFactors.map((factor, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1">
                        <span className="text-[#ba1a1a] mt-0.5">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/80 rounded-lg">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1">Recommendation</p>
                  <p className="text-[11px] text-[#45464d] leading-relaxed">{risk.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ask CoalGuard Entry Section */}
      <div className="bg-gradient-to-r from-[#131b2e] to-[#2e3b5e] rounded-xl p-5 industrial-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[28px]">psychology</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Ask CoalGuard</h3>
              <p className="text-xs text-[#bec6e0]">Get AI-powered insights on mine risks, compliance, and preventive actions.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ai-command')}
            className="bg-white text-[#131b2e] px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#dae2fd] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Open AI Assistant
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            'Which mines are high risk?',
            'What could go wrong next?',
            'Why is Aadocm low risk?',
            'Show overdue compliance.',
            'What preventive action is recommended?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('ai-command')}
              className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-[11px] font-semibold text-white hover:bg-white/20 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Compliance Trend Card */}
        <div className="bg-white border border-[#c6c6cd]/30 rounded-xl p-5 industrial-shadow h-64 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#191c1e]">
              Compliance Trend (30 Days)
            </h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +94.2% Peak
            </span>
          </div>
          <div
            onClick={() => setShowChartModal('compliance')}
            className="flex-1 w-full bg-[#f7f9fb] relative rounded-lg border border-[#e6e8ea] overflow-hidden cursor-pointer hover:border-gray-400 transition-colors p-2"
            title="Click to view detailed compliance metrics"
          >
            <ComplianceTrendChart />
            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-mono text-gray-700 shadow-xs">
              Avg: 92.4%
            </div>
          </div>
        </div>

        {/* Safety Incident Chart Card */}
        <div className="bg-white border border-[#c6c6cd]/30 rounded-xl p-5 industrial-shadow h-64 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#191c1e]">
              Safety Incidents by Type
            </h3>
            <span className="text-xs text-[#45464d]">Q3 Breakdown</span>
          </div>
          <div
            onClick={() => setShowChartModal('safety')}
            className="flex-1 w-full bg-[#f7f9fb] relative rounded-lg border border-[#e6e8ea] overflow-hidden cursor-pointer hover:border-gray-400 transition-colors p-2"
            title="Click to view detailed safety metrics"
          >
            <SafetyIncidentsChart />
          </div>
        </div>
      </div>

      {/* Chart Detail Modal */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">
                {showChartModal === 'compliance' ? '30-Day Compliance Trend Analytics' : 'Safety Incidents by Category'}
              </h3>
              <button onClick={() => setShowChartModal(null)} className="p-1 text-gray-400 hover:text-gray-700 rounded">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-xs text-gray-700">
              {showChartModal === 'compliance' ? (
                <div>
                  <p className="mb-2">Historical regulatory audit compliance score over the past month:</p>
                  <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg text-center font-mono">
                    <div>
                      <div className="text-gray-500 text-[10px]">30D Low</div>
                      <div className="text-sm font-bold text-red-600">81.4%</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-[10px]">30D Avg</div>
                      <div className="text-sm font-bold text-gray-800">92.4%</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-[10px]">Current</div>
                      <div className="text-sm font-bold text-emerald-600">94.0%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-2">Recorded incidents grouped by operational safety category:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Ventilation Compliance Findings</span>
                      <span className="font-mono font-bold text-red-600">6 incidents</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Conveyor & Mechanical Maintenance</span>
                      <span className="font-mono font-bold text-amber-600">4 incidents</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Combustible Dust Buildup</span>
                      <span className="font-mono font-bold text-gray-800">3 incidents</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Contractor Certification Lapses</span>
                      <span className="font-mono font-bold text-gray-800">1 incident</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowChartModal(null)}
              className="mt-5 w-full py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold"
            >
              Close Analytics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
