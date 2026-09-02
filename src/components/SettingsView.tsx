import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { ASSETS } from '../data/mockData';

interface SettingsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const [inspectionFrequency, setInspectionFrequency] = useState('30');
  const [complianceAlertThreshold, setComplianceAlertThreshold] = useState('80');
  const [riskScoreThreshold, setRiskScoreThreshold] = useState('70');
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200 pb-10">
      <div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
          System & Compliance Settings
        </h2>
        <p className="text-sm text-[#45464d] mt-1">
          Configure compliance thresholds, AI risk prediction sensitivity, and officer profiles.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile Card */}
        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow flex items-center gap-4">
          <img
            src={ASSETS.adminProfile}
            alt="Site Manager Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow-sm"
          />
          <div>
            <h3 className="text-base font-bold text-gray-900">Chief Safety Officer</h3>
            <p className="text-xs text-gray-500">Badge ID: #DGMS-OFFICER-4890 • Eastern Coalfields Division</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Level 4 Admin Clearance
            </span>
          </div>
        </div>

        {/* DGMS Compliance Thresholds */}
        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="material-symbols-outlined text-red-600">warning</span>
            <h3 className="font-bold text-sm text-gray-900">Compliance Alert Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Inspection Frequency (Days)</label>
              <input
                type="number"
                value={inspectionFrequency}
                onChange={(e) => setInspectionFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">DGMS Recommended: 30 Days</span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Compliance Score Alert %</label>
              <input
                type="number"
                value={complianceAlertThreshold}
                onChange={(e) => setComplianceAlertThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Alert below 80%</span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Risk Score Alert Threshold</label>
              <input
                type="number"
                value={riskScoreThreshold}
                onChange={(e) => setRiskScoreThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Alert above 70</span>
            </div>
          </div>
        </div>

        {/* Data Sync & AI */}
        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="material-symbols-outlined text-indigo-600">sync</span>
            <h3 className="font-bold text-sm text-gray-900">Data Sync & AI Risk Engine</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Data Refresh Frequency</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black"
              >
                <option value="2">Real-Time (2 seconds)</option>
                <option value="5">Standard (5 seconds)</option>
                <option value="30">Power-Saver (30 seconds)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">AI Risk Prediction Sensitivity</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black">
                <option value="high">High Sensitivity (Early Warnings)</option>
                <option value="balanced">Balanced (Recommended)</option>
                <option value="conservative">Conservative</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#1e293b] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              {savedToast ? 'check' : 'save'}
            </span>
            {savedToast ? 'Configuration Saved!' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
