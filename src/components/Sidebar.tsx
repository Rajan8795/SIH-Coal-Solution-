import React from 'react';
import { NavigationTab } from '../types';
import { ASSETS } from '../data/mockData';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  criticalAlertCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  criticalAlertCount,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems: { id: NavigationTab; label: string; icon: string; badge?: number; isAiSpecial?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'mines', label: 'Mines', icon: 'factory' },
    { id: 'compliance', label: 'Compliance', icon: 'verified_user' },
    { id: 'inspections', label: 'Inspections', icon: 'rule' },
    { id: 'contractors', label: 'Contractors', icon: 'group' },
    { id: 'field-ops', label: 'Field Operations', icon: 'engineering' },
    { id: 'ai-command', label: 'AI Command Center', icon: 'psychology', isAiSpecial: true },
    { id: 'alerts', label: 'Alerts', icon: 'notifications_active', badge: criticalAlertCount },
    { id: 'reports', label: 'Reports', icon: 'description' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] bg-[#131b2e] border-r border-[#c6c6cd]/20 shadow-xl flex flex-col py-6 px-4 z-50 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <img
              src={ASSETS.logo}
              alt="CoalGuard AI Logo"
              className="w-10 h-10 rounded-lg object-cover ring-1 ring-white/20 shadow-sm"
            />
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                CoalGuard AI
              </h1>
              <p className="text-[11px] font-bold tracking-wider text-[#7c839b] uppercase">
                Enterprise Command
              </p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-[#7c839b] hover:text-white p-1 rounded-lg"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#d5e3fd] text-[#0d1c2f] font-bold shadow-sm scale-[0.99]'
                    : 'text-[#bec6e0] hover:text-white hover:bg-white/5 opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${
                      isActive ? 'material-symbols-filled text-[#0d1c2f]' : ''
                    } ${item.isAiSpecial && !isActive ? 'text-[#dae2fd] ai-glow' : ''}`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[13px] font-semibold tracking-wide">
                    {item.label}
                  </span>
                </div>

                {item.badge ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#ba1a1a] text-white'
                        : 'bg-[#ba1a1a]/90 text-white animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}

                {item.isAiSpecial && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions & User Profile */}
        <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-3">
          <button
            onClick={() => {
              onSelectTab('settings');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2 rounded-lg text-left transition-colors ${
              currentTab === 'settings'
                ? 'bg-[#d5e3fd] text-[#0d1c2f] font-bold'
                : 'text-[#bec6e0] hover:text-white hover:bg-white/5'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentTab === 'settings' ? 'material-symbols-filled' : ''
              }`}
            >
              settings
            </span>
            <span className="text-[13px] font-semibold">Settings</span>
          </button>

          {/* Admin User Chip */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5 border border-white/10">
            <img
              src={ASSETS.darkAvatar}
              alt="Admin Profile"
              className="w-8 h-8 rounded-full object-cover border border-white/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white truncate">
                Admin Officer
              </p>
              <p className="text-[10px] text-[#7c839b] truncate">
                admin@coalguard.ai
              </p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
        </div>
      </aside>
    </>
  );
};
