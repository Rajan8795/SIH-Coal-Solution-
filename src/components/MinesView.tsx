import React, { useState } from 'react';
import { Mine, NavigationTab } from '../types';
import { ASSETS } from '../data/mockData';

interface MinesViewProps {
  mines: Mine[];
  selectedMineId: string;
  onSelectMine: (id: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onDeployInspection: (mineName: string) => void;
}

export const MinesView: React.FC<MinesViewProps> = ({
  mines,
  selectedMineId,
  onSelectMine,
  onNavigate,
  onDeployInspection,
}) => {
  const currentMine = mines.find((m) => m.id === selectedMineId) || mines[0];
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [assignedInspector, setAssignedInspector] = useState('Officer J. Mitchell');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  // SVG Gauge calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.3
  const strokeDashoffset = circumference - (currentMine.riskScore / 100) * circumference;

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignmentSuccess(true);
    setTimeout(() => {
      setAssignmentSuccess(false);
      setShowAssignModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Section & Breadcrumb */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#45464d]">
              RISK INTELLIGENCE
            </span>
            <span className="material-symbols-outlined text-[#76777d] text-[16px]">
              chevron_right
            </span>
            <select
              value={currentMine.id}
              onChange={(e) => onSelectMine(e.target.value)}
              className="bg-transparent text-[11px] font-bold tracking-wider uppercase text-black font-mono cursor-pointer border-b border-black/30 focus:outline-none"
            >
              {mines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
            {currentMine.name} Intelligence
          </h2>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-[#c6c6cd] rounded-lg text-xs font-bold text-[#191c1e] hover:bg-[#f2f4f6] transition-colors shadow-xs"
          >
            View Inspection History
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex-1 md:flex-none px-4 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1e293b] transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Assign Inspector
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Details & Map (Col Span 4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Details Card */}
          <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
            <h3 className="text-[11px] font-bold tracking-wider uppercase text-[#45464d] mb-4">
              MINE PROFILE
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-[#eceef0] pb-2.5">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  Location
                </span>
                <span className="font-bold text-[#191c1e] text-right">
                  {currentMine.location}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[#eceef0] pb-2.5">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[18px]">terrain</span>
                  Mine Type
                </span>
                <span className="font-bold text-[#191c1e] text-right">
                  {currentMine.mineType}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[#eceef0] pb-2.5">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[18px]">vital_signs</span>
                  Status
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ffdad6]/60 text-[#ba1a1a] text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] mr-1.5"></span>
                  {currentMine.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                  Primary Contractor
                </span>
                <span className="font-bold text-[#191c1e] text-right">
                  {currentMine.primaryContractor}
                </span>
              </div>
            </div>
          </div>

          {/* Map Thumbnail Placeholder */}
          <div className="bg-white border border-[#e0e3e5] rounded-xl overflow-hidden industrial-shadow h-48 relative group">
            <img
              src={ASSETS.satelliteMap}
              alt="Mine Location Map"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <button
                onClick={() => setShowMapModal(true)}
                className="w-full px-4 py-2 bg-white/95 backdrop-blur-xs border border-white/40 rounded-lg text-xs font-bold text-[#191c1e] hover:bg-white transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">map</span>
                Open Full Map
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Risk & AI (Col Span 8) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Risk Score Banner */}
          <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 md:p-6 industrial-shadow flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#f2f4f6"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={currentMine.riskScore > 70 ? '#ba1a1a' : currentMine.riskScore > 40 ? '#f59e0b' : '#10b981'}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl font-extrabold leading-none ${
                    currentMine.riskScore > 70 ? 'text-[#ba1a1a]' : 'text-gray-900'
                  }`}
                >
                  {currentMine.riskScore}
                </span>
                <span className="text-[10px] font-bold text-[#45464d] mt-1 tracking-wider uppercase">
                  / 100
                </span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#ffdad6]/70 text-[#ba1a1a] text-[10px] font-bold tracking-wider uppercase mb-2">
                HIGH RISK CLASSIFICATION
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-[#191c1e] mb-1.5">
                Critical Attention Required
              </h3>
              <p className="text-xs sm:text-sm text-[#45464d] leading-relaxed">
                The current risk score indicates a severe elevation in operational hazards. Immediate intervention is strongly advised to prevent potential incidents and ensure compliance.
              </p>
            </div>
          </div>

          {/* AI Insights Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Risk Factors Card */}
            <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold tracking-wider uppercase text-[#45464d]">
                  RISK FACTORS
                </h3>
                <span className="material-symbols-outlined text-[#76777d]">warning</span>
              </div>

              <div className="space-y-2.5 flex-1 text-xs">
                <div
                  onClick={() => onNavigate('compliance')}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#f7f9fb] hover:bg-[#eceef0] transition-colors border border-transparent hover:border-[#e0e3e5] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a]">
                      <span className="material-symbols-outlined text-[18px] material-symbols-filled">
                        error
                      </span>
                    </div>
                    <span className="font-bold text-[#191c1e]">Safety Violations</span>
                  </div>
                  <span className="font-mono font-bold text-[#ba1a1a]">
                    {currentMine.riskFactors.safetyViolations} Active
                  </span>
                </div>

                <div
                  onClick={() => onNavigate('compliance')}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#f7f9fb] hover:bg-[#eceef0] transition-colors border border-transparent hover:border-[#e0e3e5] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#fcdeb5]/70 flex items-center justify-center text-[#574425]">
                      <span className="material-symbols-outlined text-[18px] material-symbols-filled">
                        assignment_late
                      </span>
                    </div>
                    <span className="font-bold text-[#191c1e]">Overdue Actions</span>
                  </div>
                  <span className="font-mono font-bold text-[#574425]">
                    {currentMine.riskFactors.overdueActions} Pending
                  </span>
                </div>

                <div
                  onClick={() => onNavigate('contractors')}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#f7f9fb] hover:bg-[#eceef0] transition-colors border border-transparent hover:border-[#e0e3e5] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e0e3e5] flex items-center justify-center text-[#45464d]">
                      <span className="material-symbols-outlined text-[18px] material-symbols-filled">
                        groups
                      </span>
                    </div>
                    <span className="font-bold text-[#191c1e]">Contractor Issues</span>
                  </div>
                  <span className="font-mono font-bold text-[#191c1e]">
                    {currentMine.riskFactors.contractorIssues} Flagged
                  </span>
                </div>

                <div
                  onClick={() => onNavigate('compliance')}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#f7f9fb] hover:bg-[#eceef0] transition-colors border border-transparent hover:border-[#e0e3e5] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e0e3e5] flex items-center justify-center text-[#45464d]">
                      <span className="material-symbols-outlined text-[18px] material-symbols-filled">
                        eco
                      </span>
                    </div>
                    <span className="font-bold text-[#191c1e]">Env. Renewals</span>
                  </div>
                  <span className="font-mono font-bold text-[#191c1e]">
                    {currentMine.riskFactors.envRenewals} Due
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('compliance')}
                className="mt-4 w-full py-2 border border-[#c6c6cd] rounded-lg text-xs font-bold text-[#191c1e] hover:bg-[#f2f4f6] transition-colors"
              >
                View Compliance Details
              </button>
            </div>

            {/* AI Recommendation Card */}
            <div className="ai-border rounded-xl industrial-shadow h-full flex flex-col">
              <div className="p-5 bg-white rounded-xl flex flex-col h-full relative overflow-hidden">
                {/* Background Watermark */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-7xl text-black">
                    psychology
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3 z-10">
                  <span className="material-symbols-outlined text-indigo-600">
                    auto_awesome
                  </span>
                  <h3 className="text-[11px] font-bold tracking-wider uppercase text-indigo-700">
                    AI RECOMMENDATION
                  </h3>
                </div>

                <div className="flex-1 z-10 flex flex-col justify-center my-2">
                  <p className="text-base font-bold text-[#191c1e] leading-snug mb-3">
                    "{currentMine.aiRecommendation.headline}"
                  </p>
                  <p className="text-xs text-[#45464d] leading-relaxed">
                    {currentMine.aiRecommendation.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#eceef0] z-10">
                  <button
                    onClick={() => onDeployInspection(currentMine.name)}
                    className="flex items-center justify-between w-full text-black hover:text-indigo-900 transition-colors font-bold text-xs group"
                  >
                    <span>{currentMine.aiRecommendation.actionLabel}</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Inspector Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">Assign Field Inspector</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {assignmentSuccess ? (
              <div className="py-8 text-center space-y-2">
                <span className="material-symbols-outlined text-4xl text-emerald-500 animate-bounce">
                  check_circle
                </span>
                <p className="font-bold text-gray-900">Inspector Dispatched Successfully!</p>
                <p className="text-xs text-gray-500">Notification sent to {assignedInspector}.</p>
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Facility</label>
                  <input
                    type="text"
                    disabled
                    value={currentMine.name}
                    className="w-full px-3 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Certified Officer</label>
                  <select
                    value={assignedInspector}
                    onChange={(e) => setAssignedInspector(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="Officer J. Mitchell (MSHA Tier 3)">Officer J. Mitchell (MSHA Tier 3)</option>
                    <option value="Officer S. Reynolds (Environmental PE)">Officer S. Reynolds (Environmental PE)</option>
                    <option value="Officer J. Doe (Mechanical Inspector)">Officer J. Doe (Mechanical Inspector)</option>
                    <option value="Officer A. Kowalski (Safety Lead)">Officer A. Kowalski (Safety Lead)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Inspection Priority</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 font-bold">Immediate (24h)</span>
                    <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600">Standard</span>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#0F172A] text-white rounded-lg font-bold hover:bg-[#1e293b]"
                  >
                    Confirm Dispatch
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">
                {currentMine.name} — Inspection History
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
              <div className="p-3 border border-red-200 bg-red-50/50 rounded-xl flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-red-800">Oct 24, 2023 - Sector 4 Conveyor Belt B</span>
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 font-bold rounded text-[10px]">Active Hazard</span>
                  </div>
                  <p className="text-gray-600">Excessive combustible coal dust accumulation near motor housing.</p>
                </div>
                <span className="font-mono text-gray-500">Insp. #1024</span>
              </div>
              <div className="p-3 border border-gray-200 bg-gray-50 rounded-xl flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">Oct 12, 2023 - Shaft 1 Auxiliary Fan</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]">Resolved</span>
                  </div>
                  <p className="text-gray-600">Airflow volume verified at 42,000 CFM across intake gates.</p>
                </div>
                <span className="font-mono text-gray-500">Insp. #0988</span>
              </div>
              <div className="p-3 border border-gray-200 bg-gray-50 rounded-xl flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">Sep 28, 2023 - North Pit Diesel Haulers</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]">Resolved</span>
                  </div>
                  <p className="text-gray-600">Emissions filters replaced and certified under MSHA §75.325.</p>
                </div>
                <span className="font-mono text-gray-500">Insp. #0941</span>
              </div>
            </div>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="mt-4 w-full py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Full Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 flex flex-col h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">{currentMine.name} High-Res Geological Map</h3>
                <p className="text-xs text-gray-500">{currentMine.coordinates.gpsText}</p>
              </div>
              <button onClick={() => setShowMapModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
              <img
                src={ASSETS.satelliteMap}
                alt="Full Mine Satellite Map"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg backdrop-blur-md text-xs space-y-1">
                <p className="font-bold text-emerald-400">Atmospheric Sensors: Nominal</p>
                <p className="font-mono">Methane: 0.18% (Permissible &lt; 1.0%)</p>
                <p className="font-mono">CO Level: 4.2 PPM</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowMapModal(false)}
                className="px-4 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-bold"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
