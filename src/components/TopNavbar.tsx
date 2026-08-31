import React, { useState } from 'react';
import { ASSETS } from '../data/mockData';
import { NavigationTab, AlertItem } from '../types';

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
  onNavigate: (tab: NavigationTab) => void;
  criticalAlerts: AlertItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileMenu,
  onNavigate,
  criticalAlerts,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="h-16 fixed top-0 right-0 z-40 bg-[#ffffff] border-b border-[#e0e3e5] shadow-xs flex justify-between items-center w-full md:w-[calc(100%-280px)] px-4 md:px-8 transition-all">
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-[#45464d] hover:bg-[#f2f4f6] transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="relative w-full max-w-sm md:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search facilities, equipment, reports..."
            className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] border-none rounded-full text-[13px] text-[#191c1e] placeholder:text-[#76777d] focus:bg-white focus:ring-2 focus:ring-black/10 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#45464d] hover:bg-[#f2f4f6] transition-colors relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {criticalAlerts.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Critical Alerts ({criticalAlerts.length})
                </span>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('alerts');
                  }}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {criticalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('alerts');
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">{alert.title}</p>
                      <p className="text-[11px] text-gray-500">{alert.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-red-600 font-semibold">
                          Due: {alert.deadline}
                        </span>
                        <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.2 rounded font-medium">
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Grid View toggle */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-10 h-10 hidden sm:flex items-center justify-center rounded-full text-[#45464d] hover:bg-[#f2f4f6] transition-colors"
          title="Command Overview"
        >
          <span className="material-symbols-outlined">grid_view</span>
        </button>

        {/* Help button */}
        <button
          onClick={() => setShowHelp(true)}
          className="w-10 h-10 hidden sm:flex items-center justify-center rounded-full text-[#45464d] hover:bg-[#f2f4f6] transition-colors"
          title="System Help & MSHA Guides"
        >
          <span className="material-symbols-outlined">help</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#c6c6cd] mx-1 sm:mx-2" />

        {/* User Profile */}
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#f2f4f6] transition-colors"
          title="Admin Site Manager"
        >
          <img
            src={ASSETS.adminProfile}
            alt="Site Manager Profile"
            className="w-8 h-8 rounded-full object-cover border border-[#c6c6cd] shadow-xs"
          />
          <span className="hidden lg:inline text-xs font-bold text-[#191c1e]">
            Chief Officer
          </span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">help</span>
                <h3 className="font-bold text-base text-gray-900">CoalGuard AI Guide</h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-600">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="font-bold text-blue-900 mb-1">MSHA Compliance & Risk Intelligence</p>
                <p>
                  CoalGuard AI aggregates telemetry from atmospheric sensors, equipment vibrations, and contractor certifications to calculate predictive risk scores.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-bold text-gray-800 mb-1">Navigation Shortcuts</p>
                <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
                  <li><strong>Dashboard</strong>: Daily command telemetry, priority AI actions, and risk map.</li>
                  <li><strong>Mines</strong>: Deep-dive risk score (78/100), factors breakdown, and inspector assignment.</li>
                  <li><strong>Field Ops</strong>: 3-step field inspection with live computer vision analysis.</li>
                  <li><strong>AI Command</strong>: Ask CoalGuard natural language questions about safety thresholds.</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1e293b] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
