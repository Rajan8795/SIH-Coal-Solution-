import React, { useState } from 'react';
import { AlertItem, NavigationTab } from '../types';
import { ASSETS } from '../data/mockData';

interface AlertsViewProps {
  alerts: AlertItem[];
  onNavigate: (tab: NavigationTab) => void;
  onUpdateAlertStatus: (id: string, newStatus: AlertItem['status']) => void;
  onCreateAlert: (alert: Omit<AlertItem, 'id'>) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onNavigate,
  onUpdateAlertStatus,
  onCreateAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Resolved'>('Critical');
  const [searchFilter, setSearchFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAlertForDetail, setSelectedAlertForDetail] = useState<AlertItem | null>(null);

  // New alert form
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newMine, setNewMine] = useState('Blackwood North');
  const [newSeverity, setNewSeverity] = useState<'Critical' | 'High' | 'Medium'>('Critical');
  const [newAssignee, setNewAssignee] = useState('J. Doe');
  const [newDeadline, setNewDeadline] = useState('12:00 PM');
  const [newDesc, setNewDesc] = useState('');

  const filteredAlerts = alerts.filter((item) => {
    if (activeTab !== 'All' && activeTab !== 'Critical') {
      if (item.severity !== activeTab) return false;
    } else if (activeTab === 'Critical') {
      if (item.severity !== 'Critical') return false;
    }
    if (searchFilter && !item.title.toLowerCase().includes(searchFilter.toLowerCase()) && !item.location.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateAlert({
      title: newTitle,
      location: newLocation || 'Primary Shaft',
      mine: newMine,
      time: 'Just now',
      status: 'Unacknowledged',
      severity: newSeverity,
      assignedTo: {
        name: newAssignee,
        avatar: ASSETS.officerDoe,
      },
      deadline: newDeadline,
      description: newDesc || 'Automated safety incident dispatched from central control room.',
    });

    setNewTitle('');
    setNewLocation('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  const criticalCount = alerts.filter((a) => a.severity === 'Critical').length;
  const highCount = alerts.filter((a) => a.severity === 'High').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
            Action Center
          </h2>
          <p className="text-sm text-[#45464d] mt-1">
            Manage critical safety alerts, incident responses, and predictive maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0F172A] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_alert</span>
            Create Alert
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#eceef0] rounded-xl border border-[#c6c6cd]/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('Critical')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'Critical'
                ? 'bg-white text-[#ba1a1a] shadow-xs'
                : 'text-[#45464d] hover:text-[#191c1e]'
            }`}
          >
            Critical
            <span className="px-1.5 py-0.2 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px]">
              {criticalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('High')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'High'
                ? 'bg-white text-[#191c1e] shadow-xs'
                : 'text-[#45464d] hover:text-[#191c1e]'
            }`}
          >
            High
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              {highCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Medium')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'Medium'
                ? 'bg-white text-[#191c1e] shadow-xs'
                : 'text-[#45464d] hover:text-[#191c1e]'
            }`}
          >
            Medium
          </button>

          <button
            onClick={() => setActiveTab('Resolved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'Resolved'
                ? 'bg-white text-[#191c1e] shadow-xs'
                : 'text-[#45464d] hover:text-[#191c1e]'
            }`}
          >
            Resolved
          </button>

          <button
            onClick={() => setActiveTab('All')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'All'
                ? 'bg-white text-[#191c1e] shadow-xs'
                : 'text-[#45464d] hover:text-[#191c1e]'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter alerts..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#e0e3e5] rounded-xl text-xs outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#c6c6cd] p-12 text-center text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">
              check_circle
            </span>
            <p className="font-bold text-sm text-gray-700">No active alerts matching this filter</p>
            <p className="text-xs text-gray-400">All systems in this category are operating within nominal thresholds.</p>
          </div>
        ) : (
          filteredAlerts.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-4 md:p-5 industrial-shadow transition-all hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                item.severity === 'Critical'
                  ? 'border-[#ba1a1a]/30 border-l-4 border-l-[#ba1a1a]'
                  : item.severity === 'High'
                  ? 'border-amber-300 border-l-4 border-l-amber-500'
                  : 'border-[#e0e3e5]'
              }`}
            >
              {/* Alert Left Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      item.severity === 'Critical'
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : item.severity === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : item.severity === 'Medium'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {item.severity === 'Critical' ? 'warning' : 'info'}
                    </span>
                    {item.severity}
                  </span>

                  {item.isAiPrediction && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold tracking-wider uppercase">
                      <span className="material-symbols-outlined text-[12px]">psychology</span>
                      AI PREDICTION • {item.probScore}
                    </span>
                  )}

                  <span className="text-xs font-semibold text-gray-400 font-mono">
                    {item.time}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#191c1e]">{item.title}</h3>
                  <p className="text-xs text-[#45464d]">
                    {item.location} • <span className="font-semibold text-[#191c1e]">{item.mine}</span>
                  </p>
                </div>

                {item.description && (
                  <p className="text-xs text-gray-600 leading-relaxed max-w-2xl bg-gray-50 p-2.5 rounded-lg">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Alert Right Status & Actions */}
              <div className="flex flex-wrap md:flex-col lg:flex-row items-start md:items-end lg:items-center gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                <div className="text-left md:text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">Assigned:</span>
                    <div className="flex items-center gap-1">
                      {item.assignedTo.avatar ? (
                        <img
                          src={item.assignedTo.avatar}
                          alt={item.assignedTo.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-gray-200 text-[9px] font-bold flex items-center justify-center">
                          {item.assignedTo.initials || 'AS'}
                        </span>
                      )}
                      <span className="text-xs font-bold text-gray-800">{item.assignedTo.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-start md:justify-end">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        item.status === 'Unacknowledged'
                          ? 'bg-amber-100 text-amber-900'
                          : item.status === 'Investigating'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#ba1a1a]">
                      Due: {item.deadline}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedAlertForDetail(item)}
                    className="px-4 py-2 bg-white border border-[#c6c6cd] rounded-lg text-xs font-bold text-[#191c1e] hover:bg-[#f2f4f6] transition-colors"
                  >
                    {item.isAiPrediction ? 'Details' : 'Review'}
                  </button>
                  {item.status !== 'Resolved' && (
                    <button
                      onClick={() => onUpdateAlertStatus(item.id, 'Resolved')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                      title="Mark as Resolved"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlertForDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                  {selectedAlertForDetail.severity} Severity Alert
                </span>
                <h3 className="font-bold text-base text-gray-900">
                  {selectedAlertForDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlertForDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <p>
                <strong>Location:</strong> {selectedAlertForDetail.location} ({selectedAlertForDetail.mine})
              </p>
              <p>
                <strong>Incident Summary:</strong> {selectedAlertForDetail.description}
              </p>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <p className="font-bold text-gray-800">Operational Response Protocol:</p>
                <p>1. Dispatch primary safety officer with calibrated handheld Multi-Gas Detector.</p>
                <p>2. Verify backup power on auxiliary suction blower.</p>
                <p>3. Upload inspection image via Field Operations module for real-time MSHA clearance.</p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  onUpdateAlertStatus(selectedAlertForDetail.id, 'Investigating');
                  setSelectedAlertForDetail(null);
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Set Investigating
              </button>
              <button
                onClick={() => {
                  onNavigate('field-ops');
                  setSelectedAlertForDetail(null);
                }}
                className="flex-1 py-2.5 bg-[#0F172A] hover:bg-[#1e293b] text-white rounded-lg text-xs font-bold"
              >
                Open Field Camera →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">Broadcast Safety Alert</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Conveyor Roller Overheating"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Specific Location</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Sector 4, North Pit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Resolution Deadline</label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    placeholder="e.g. 11:30 AM or EOD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Safety Officer</label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="J. Doe">J. Doe (Mechanical Inspector)</option>
                  <option value="J. Mitchell">J. Mitchell (MSHA Tier 3)</option>
                  <option value="S. Miller">S. Miller (Vibration Tech)</option>
                  <option value="A. Kowalski">A. Kowalski (Safety Lead)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Telemetry / Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details of the hazard detected by sensors or field personnel..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0F172A] text-white rounded-lg font-bold hover:bg-[#1e293b]"
                >
                  Dispatch Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
