import React, { useState } from 'react';
import { ASSETS } from '../data/mockData';
import { NavigationTab } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onDispatchInspection: (sectorName: string) => void;
  onSelectMine: (mineId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onDispatchInspection,
  onSelectMine,
}) => {
  const [viewMode, setViewMode] = useState<'standard' | 'national'>('standard');
  const [mapZoom, setMapZoom] = useState(1);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Section with View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
            {getGreeting()}, Officer.
          </h2>
          <p className="text-base text-[#45464d] mt-1 font-medium">
            Here’s what needs your attention today.
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

      {/* NATIONAL COMMAND VIEW (Screen 3) */}
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
                  Intelligent Governance & Compliance for Coal Mines. Centralized oversight, predictive risk analysis, and real-time operational telemetry.
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

            {/* National Map Card */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-[#c6c6cd]/30 industrial-shadow p-4 flex flex-col min-h-[320px]">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                  National Deployment Overview
                </span>
                <button
                  onClick={() => onNavigate('mines')}
                  className="text-[#45464d] hover:text-black p-1 rounded"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                </button>
              </div>
              <div className="flex-1 rounded-lg relative overflow-hidden border border-[#e0e3e5] bg-[#eceef0] min-h-[240px]">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90"
                  style={{ backgroundImage: `url('${ASSETS.nationalMap}')` }}
                ></div>
                {/* Animated Pins */}
                <div className="absolute top-[30%] left-[45%] flex flex-col items-center cursor-pointer group" onClick={() => onSelectMine('mine-a')}>
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#ba1a1a] border-2 border-white shadow-xs"></span>
                  </span>
                  <span className="hidden group-hover:block bg-[#0F172A] text-white text-[10px] px-2 py-0.5 rounded shadow mt-1">Mine Alpha (Crit)</span>
                </div>
                <div className="absolute top-[40%] left-[60%] w-3 h-3 bg-black rounded-full border-2 border-white shadow-xs cursor-pointer" onClick={() => onSelectMine('blackwood-north')}></div>
                <div className="absolute top-[65%] left-[50%] w-3 h-3 bg-[#515f74] rounded-full border-2 border-white shadow-xs cursor-pointer" onClick={() => onSelectMine('site-beta')}></div>
                <div className="absolute top-[55%] left-[30%] w-3 h-3 bg-black rounded-full border-2 border-white shadow-xs cursor-pointer" onClick={() => onSelectMine('silvercreek')}></div>
                <div className="absolute top-[25%] left-[70%] w-3 h-3 bg-[#ba1a1a] rounded-full border-2 border-white shadow-xs animate-pulse cursor-pointer" onClick={() => onSelectMine('ironridge-alpha')}></div>
              </div>
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
              <div className="font-mono text-3xl font-extrabold text-[#191c1e] tracking-tight">128</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mt-1">Active Mines</div>
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
              <div className="font-mono text-3xl font-extrabold text-[#191c1e] tracking-tight">84%</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mt-1">Network Compliance</div>
            </div>

            <div className="bg-white rounded-xl border border-[#ba1a1a]/30 industrial-shadow p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#ba1a1a] opacity-100"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#ffdad6] text-[#93000a] flex items-center justify-center">
                  <span className="material-symbols-outlined">warning</span>
                </div>
              </div>
              <div className="font-mono text-3xl font-extrabold text-[#ba1a1a] tracking-tight">17</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#ba1a1a] mt-1">High-Risk Mines</div>
            </div>

            <div className="bg-white rounded-xl border border-[#c6c6cd]/30 industrial-shadow p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#515f74] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#45464d]">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
              </div>
              <div className="font-mono text-3xl font-extrabold text-[#191c1e] tracking-tight">32</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mt-1">Pending Actions</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* STANDARD SITE COMMAND VIEW (Screen 1) */}
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Risks */}
        <div
          onClick={() => onNavigate('alerts')}
          className="bg-white border border-[#c6c6cd]/30 rounded-xl p-5 industrial-shadow hover:shadow-md hover:border-t-2 hover:border-t-[#ba1a1a] transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
              Critical Risks
            </span>
            <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#191c1e]">3</span>
            <span className="text-xs font-semibold text-[#ba1a1a] flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 1 since yesterday
            </span>
          </div>
        </div>

        {/* Pending Actions */}
        <div
          onClick={() => onNavigate('compliance')}
          className="bg-white border border-[#c6c6cd]/30 rounded-xl p-5 industrial-shadow hover:shadow-md hover:border-t-2 hover:border-t-[#515f74] transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
              Pending Actions
            </span>
            <span className="material-symbols-outlined text-[#515f74]">assignment_late</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#191c1e]">12</span>
            <span className="text-xs text-[#45464d]">4 require approval</span>
          </div>
        </div>

        {/* Compliance Score */}
        <div
          onClick={() => onNavigate('compliance')}
          className="bg-white border border-[#c6c6cd]/30 rounded-xl p-5 industrial-shadow hover:shadow-md hover:border-t-2 hover:border-t-black transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
              Compliance Score
            </span>
            <span className="material-symbols-outlined text-black">verified</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#191c1e]">94%</span>
            <span className="text-xs font-semibold text-[#10B981] flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 2.1% this week
            </span>
          </div>
        </div>

        {/* Active Mines */}
        <div
          onClick={() => onNavigate('mines')}
          className="bg-white border border-[#c6c6cd]/30 rounded-xl p-5 industrial-shadow hover:shadow-md hover:border-t-2 hover:border-t-black transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
              Active Mines
            </span>
            <span className="material-symbols-outlined text-black">landscape</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#191c1e]">8</span>
            <span className="text-xs text-[#45464d]">Across 3 regions</span>
          </div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map Widget (Span 2) */}
        <div className="lg:col-span-2 bg-white border border-[#c6c6cd]/30 rounded-xl overflow-hidden industrial-shadow flex flex-col h-[420px]">
          <div className="p-4 border-b border-[#e6e8ea] flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#45464d]">pin_drop</span>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#191c1e]">
                Interactive Mine Risk Map
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMapZoom((prev) => Math.min(prev + 0.2, 1.8))}
                className="p-1.5 rounded bg-[#eceef0] hover:bg-[#e0e3e5] text-[#45464d] transition-colors"
                title="Zoom in"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
              </button>
              <button
                onClick={() => setMapZoom((prev) => Math.max(prev - 0.2, 0.8))}
                className="p-1.5 rounded bg-[#eceef0] hover:bg-[#e0e3e5] text-[#45464d] transition-colors"
                title="Zoom out"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_out</span>
              </button>
              <button
                onClick={() => onNavigate('mines')}
                className="text-xs text-blue-600 font-bold px-2 py-1 hover:underline"
              >
                Full Intel →
              </button>
            </div>
          </div>

          <div
            className="flex-1 relative bg-[#f2f4f6] overflow-hidden bg-cover bg-center transition-all duration-300"
            style={{
              backgroundImage: `url('${ASSETS.mapBackground}')`,
              transform: `scale(${mapZoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Map Pins / Overlay */}
            <div className="absolute inset-0 p-4 pointer-events-auto">
              {/* Site Alpha Pin (Critical) */}
              <div
                onClick={() => {
                  setSelectedPin('alpha');
                  onSelectMine('mine-a');
                }}
                className="absolute top-1/4 left-1/3 flex flex-col items-center cursor-pointer group z-20"
              >
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#ba1a1a] border-2 border-white shadow-sm"></span>
                </span>
                <span className="mt-1 bg-white/95 backdrop-blur text-[11px] font-mono font-semibold px-2 py-0.5 rounded shadow-sm border border-[#ba1a1a]/30 group-hover:scale-105 transition-transform text-[#191c1e]">
                  Site Alpha (Crit)
                </span>
              </div>

              {/* Site Beta Pin (Nominal) */}
              <div
                onClick={() => {
                  setSelectedPin('beta');
                  onSelectMine('site-beta');
                }}
                className="absolute top-2/3 right-1/4 flex flex-col items-center cursor-pointer group z-20"
              >
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#10B981] border-2 border-white shadow-sm"></span>
                <span className="mt-1 bg-white/95 backdrop-blur text-[11px] font-mono font-semibold px-2 py-0.5 rounded shadow-sm border border-[#c6c6cd]/40 group-hover:scale-105 transition-transform text-[#191c1e]">
                  Site Beta (Nom)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Widget (Span 1) */}
        <div className="bg-white rounded-xl p-4 industrial-shadow ai-border flex flex-col h-[420px]">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#e6e8ea]">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">psychology</span>
              Priority Actions
            </h3>
            <span className="bg-[#dae2fd]/80 text-[#131b2e] text-[10px] px-2 py-0.5 rounded-full font-bold">
              AI GENERATED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {/* Ventilation Anomaly Card */}
            <div className="p-3 bg-[#ba1a1a]/5 border border-[#ba1a1a]/20 rounded-lg hover:bg-[#ba1a1a]/10 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm text-[#191c1e]">Ventilation Anomaly</span>
                <span className="font-mono text-[#ba1a1a] text-xs font-bold">98% PROB</span>
              </div>
              <p className="text-xs text-[#45464d] mb-2 leading-relaxed">
                Sensor array in Sector 4G indicates declining airflow. Predict critical failure in 4 hrs.
              </p>
              <button
                onClick={() => onDispatchInspection('Sector 4G Ventilation')}
                className="bg-[#000000] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#271901] transition-colors w-full active:scale-98"
              >
                Dispatch Inspection Team
              </button>
            </div>

            {/* Contractor Certification */}
            <div
              onClick={() => onNavigate('contractors')}
              className="p-3 bg-[#f7f9fb] border border-[#c6c6cd]/30 rounded-lg hover:bg-[#eceef0] transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm text-[#191c1e]">Contractor Certification</span>
                <span className="font-mono text-[#515f74] text-xs font-bold">EXP 2 DAYS</span>
              </div>
              <p className="text-xs text-[#45464d] leading-relaxed">
                12 contractors at Site Beta have MSHA certifications expiring within 48 hours.
              </p>
            </div>

            {/* Dust Suppression Low */}
            <div
              onClick={() => onNavigate('alerts')}
              className="p-3 bg-[#f7f9fb] border border-[#c6c6cd]/30 rounded-lg hover:bg-[#eceef0] transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm text-[#191c1e]">Dust Suppression Low</span>
                <span className="font-mono text-[#515f74] text-xs font-bold">REVIEW</span>
              </div>
              <p className="text-xs text-[#45464d] leading-relaxed">
                Water pressure in suppression lines on Level 3 below optimal thresholds.
              </p>
            </div>
          </div>
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
            className="flex-1 w-full bg-[#f7f9fb] relative rounded-lg border border-[#e6e8ea] overflow-hidden bg-cover bg-center cursor-pointer hover:border-gray-400 transition-colors"
            style={{ backgroundImage: `url('${ASSETS.complianceTrend}')` }}
            title="Click to view detailed telemetry metrics"
          >
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
            className="flex-1 w-full bg-[#f7f9fb] relative rounded-lg border border-[#e6e8ea] overflow-hidden bg-cover bg-center cursor-pointer hover:border-gray-400 transition-colors"
            style={{ backgroundImage: `url('${ASSETS.safetyIncidents}')` }}
            title="Click to view detailed telemetry metrics"
          >
            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-mono text-gray-700 shadow-xs">
              Total: 14 Events
            </div>
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
                      <span>Airflow & Ventilation Degradation</span>
                      <span className="font-mono font-bold text-red-600">6 incidents</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Conveyor & Mechanical Roller Wear</span>
                      <span className="font-mono font-bold text-amber-600">4 incidents</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Combustible Dust Buildup</span>
                      <span className="font-mono font-bold text-gray-800">3 incidents</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Electrical Sensor Loss</span>
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
