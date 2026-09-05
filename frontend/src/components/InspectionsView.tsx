import React, { useState } from 'react';
import { ASSETS } from '../data/mockData';
import { NavigationTab } from '../types';

type InspectionStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Evidence Captured'
  | 'AI Analysis'
  | 'Finding Identified'
  | 'Corrective Action'
  | 'Resolved'
  | 'Closed';

type RiskLevel = 'High' | 'Medium' | 'Low';
type InspectionCategory = 'Safety' | 'Environmental' | 'Equipment' | 'Ventilation';

interface InspectionCheck {
  id: string;
  name: string;
  completed: boolean;
  notes?: string;
}

interface Inspection {
  id: string;
  inspectionId: string;
  mine: string;
  location: string;
  sector: string;
  gpsText: string;
  type: string;
  category: InspectionCategory;
  inspector: string;
  scheduledDate: string;
  dueDate: string;
  riskLevel: RiskLevel;
  status: InspectionStatus;
  requiredChecks: InspectionCheck[];
  notes?: string;
}

interface InspectionsViewProps {
  onNavigate?: (tab: NavigationTab) => void;
  onStartInspection?: (inspection: Inspection) => void;
}

const STATUS_FLOW: InspectionStatus[] = [
  'Scheduled',
  'In Progress',
  'Evidence Captured',
  'AI Analysis',
  'Finding Identified',
  'Corrective Action',
  'Resolved',
  'Closed',
];

const MINES = [
  'Jharia Main Colliery',
  'Korba Deep Mine',
  'Raniganj Eastern Block',
  'Singrauli North Extension',
];

const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-001',
    inspectionId: 'INSP-2024-001',
    mine: 'Jharia Main Colliery',
    location: 'Sector 4 - Conveyor Belt B',
    sector: 'Sector 4',
    gpsText: 'GPS: 23.7466° N, 86.4154° E',
    type: 'Routine Safety Audit',
    category: 'Safety',
    inspector: 'Officer R. Sharma (DGMS Certified)',
    scheduledDate: 'Oct 24, 2024',
    dueDate: 'Oct 24, 2024',
    riskLevel: 'High',
    status: 'Finding Identified',
    requiredChecks: [
      { id: 'check-1', name: 'Safety gear inspection', completed: true },
      { id: 'check-2', name: 'Conveyor belt tension check', completed: true },
      { id: 'check-3', name: 'Dust suppression system', completed: true },
      { id: 'check-4', name: 'Emergency escape route', completed: false },
    ],
    notes: 'Excessive coal dust accumulation noted near primary drive motor. Elevated temperatures observed during inspection.',
  },
  {
    id: 'insp-002',
    inspectionId: 'INSP-2024-002',
    mine: 'Korba Deep Mine',
    location: 'Ventilation Shaft 2 - Intake Fan',
    sector: 'Shaft 2',
    gpsText: 'GPS: 22.3595° N, 82.7501° E',
    type: 'Ventilation Compliance Check',
    category: 'Ventilation',
    inspector: 'Officer V. Singh (Mechanical Inspector)',
    scheduledDate: 'Oct 25, 2024',
    dueDate: 'Oct 28, 2024',
    riskLevel: 'High',
    status: 'In Progress',
    requiredChecks: [
      { id: 'check-1', name: 'Airflow velocity measurement', completed: true },
      { id: 'check-2', name: 'Ventilation shaft integrity', completed: false },
      { id: 'check-3', name: 'Auxiliary fan inspection', completed: false },
    ],
    notes: 'Declining airflow velocity documented in Sector 4G during last inspection.',
  },
  {
    id: 'insp-003',
    inspectionId: 'INSP-2024-003',
    mine: 'Raniganj Eastern Block',
    location: 'Environmental Monitoring Station A',
    sector: 'Station A',
    gpsText: 'GPS: 23.6190° N, 87.0805° E',
    type: 'Environmental Emissions Audit',
    category: 'Environmental',
    inspector: 'Officer S. Patel (Environmental Inspector)',
    scheduledDate: 'Oct 26, 2024',
    dueDate: 'Oct 30, 2024',
    riskLevel: 'Medium',
    status: 'Scheduled',
    requiredChecks: [
      { id: 'check-1', name: 'Particulate matter monitoring', completed: false },
      { id: 'check-2', name: 'Water leachate sampling', completed: false },
      { id: 'check-3', name: 'Noise level assessment', completed: false },
      { id: 'check-4', name: 'Emissions filter inspection', completed: false },
    ],
    notes: '',
  },
  {
    id: 'insp-004',
    inspectionId: 'INSP-2024-004',
    mine: 'Singrauli North Extension',
    location: 'Longwall Shearer Unit 3',
    sector: 'LW-3',
    gpsText: 'GPS: 24.1981° N, 82.6684° E',
    type: 'Equipment Mechanical Inspection',
    category: 'Equipment',
    inspector: 'Officer A. Kumar (Safety Lead)',
    scheduledDate: 'Oct 20, 2024',
    dueDate: 'Oct 22, 2024',
    riskLevel: 'Low',
    status: 'Closed',
    requiredChecks: [
      { id: 'check-1', name: 'Shearer drum wear', completed: true },
      { id: 'check-2', name: 'Hydraulic system pressure', completed: true },
      { id: 'check-3', name: 'Emergency stop function', completed: true },
    ],
    notes: 'All systems nominal. Emissions filters replaced and certified.',
  },
];

const getRiskColor = (riskLevel: RiskLevel) => {
  if (riskLevel === 'High') return '#ba1a1a';
  if (riskLevel === 'Medium') return '#f59e0b';
  return '#10B981';
};

const getRiskBadge = (riskLevel: RiskLevel) => {
  if (riskLevel === 'High') return 'bg-[#ffdad6] text-[#ba1a1a]';
  if (riskLevel === 'Medium') return 'bg-[#fcdeb5] text-[#574425]';
  return 'bg-emerald-100 text-emerald-800';
};

  const getStatusBadge = (status: InspectionStatus) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-gray-100 text-gray-700 border border-gray-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Evidence Captured':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'AI Analysis':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'Finding Identified':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Corrective Action':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Closed':
        return 'bg-gray-200 text-gray-600 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

export const InspectionsView: React.FC<InspectionsViewProps> = ({
  onNavigate,
  onStartInspection,
}) => {
  const [inspections, setInspections] = useState<Inspection[]>(MOCK_INSPECTIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mineFilter, setMineFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newInspection, setNewInspection] = useState({
    mine: '',
    type: '',
    category: '',
    inspector: '',
    dueDate: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const selectedInspection = selectedId
    ? inspections.find((i) => i.id === selectedId) || null
    : null;

  const filtered = inspections.filter((item) => {
    if (mineFilter !== 'all' && !item.mine.toLowerCase().includes(mineFilter.toLowerCase()))
      return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (
      searchFilter &&
      !item.inspectionId.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !item.mine.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !item.type.toLowerCase().includes(searchFilter.toLowerCase())
    )
      return false;
    return true;
  });

  const scheduledCount = inspections.filter((i) => i.status === 'Scheduled').length;
  const inProgressCount = inspections.filter(
    (i) => i.status === 'In Progress' || i.status === 'Evidence Captured' || i.status === 'AI Analysis'
  ).length;
  const findingCount = inspections.filter((i) => i.status === 'Finding Identified' || i.status === 'Corrective Action').length;
  const closedCount = inspections.filter((i) => i.status === 'Closed' || i.status === 'Resolved').length;

  const handleStartInspection = (inspection: Inspection) => {
    setInspections((prev) =>
      prev.map((i) => (i.id === inspection.id ? { ...i, status: 'In Progress' } : i))
    );
    onStartInspection?.(inspection);
  };

  const handleViewDetails = (inspection: Inspection) => {
    setSelectedId(inspection.id);
  };

  const handleBackToList = () => {
    setSelectedId(null);
  };

  const handleOpenNewModal = () => {
    setNewInspection({
      mine: '',
      type: '',
      category: '',
      inspector: '',
      dueDate: '',
      notes: '',
    });
    setFormErrors([]);
    setShowNewModal(true);
  };

  const handleCloseNewModal = () => {
    setShowNewModal(false);
    setFormErrors([]);
  };

  const handleCreateInspection = () => {
    const errors: string[] = [];
    if (!newInspection.mine) errors.push('Mine is required');
    if (!newInspection.type.trim()) errors.push('Inspection Type is required');
    if (!newInspection.category) errors.push('Category is required');
    if (!newInspection.inspector.trim()) errors.push('Inspector is required');
    if (!newInspection.dueDate) errors.push('Due Date is required');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const year = new Date().getFullYear();
    const nextNumber =
      inspections.length > 0
        ? Math.max(...inspections.map((i) => parseInt(i.inspectionId.split('-')[2] || '0', 10))) + 1
        : 1;
    const inspectionId = `INSP-${year}-${String(nextNumber).padStart(3, '0')}`;

    const newEntry: Inspection = {
      id: `insp-${Date.now()}`,
      inspectionId,
      mine: newInspection.mine,
      location: '',
      sector: '',
      gpsText: '',
      type: newInspection.type,
      category: newInspection.category as InspectionCategory,
      inspector: newInspection.inspector,
      scheduledDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: newInspection.dueDate,
      riskLevel: 'Medium',
      status: 'Scheduled',
      requiredChecks: [],
      notes: newInspection.notes || undefined,
    };

    setInspections((prev) => [newEntry, ...prev]);
    setShowNewModal(false);
    setFormErrors([]);
    setToast(`Inspection ${inspectionId} created successfully.`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = (id: string, status: InspectionStatus) => {
    const currentIdx = STATUS_FLOW.indexOf(
      inspections.find((i) => i.id === id)?.status || 'Scheduled'
    );
    const nextIdx = STATUS_FLOW.indexOf(status);
    if (nextIdx > currentIdx) {
      setInspections((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i))
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
            Inspections
          </h2>
          <p className="text-sm text-[#45464d] mt-1">
            Inspection planning, management, and findings across all active sites.
          </p>
        </div>
        {selectedInspection ? (
          <button
            onClick={handleBackToList}
            className="px-4 py-2.5 bg-white border border-[#c6c6cd] rounded-lg text-xs font-bold text-[#191c1e] hover:bg-[#f2f4f6] transition-colors shadow-xs flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to List
          </button>
        ) : (
          <button
            onClick={handleOpenNewModal}
            className="px-4 py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Inspection
          </button>
        )}
      </div>

      {/* Stats Row */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl border border-[#e0e3e5] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#eceef0]">
              <h3 className="text-sm font-extrabold text-[#191c1e]">Create New Inspection</h3>
              <button
                onClick={handleCloseNewModal}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-red-700 mb-1">Please fix the following:</p>
                  <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                    {formErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">Mine *</label>
                <select
                  value={newInspection.mine}
                  onChange={(e) => setNewInspection((prev) => ({ ...prev, mine: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f2f4f6] text-xs font-bold text-[#191c1e] rounded-lg border border-[#e0e3e5] outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="">Select a mine</option>
                  {MINES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">Inspection Type *</label>
                <input
                  type="text"
                  value={newInspection.type}
                  onChange={(e) => setNewInspection((prev) => ({ ...prev, type: e.target.value }))}
                  placeholder="e.g., Routine Safety Audit"
                  className="w-full px-3 py-2 bg-white border border-[#e0e3e5] rounded-lg text-xs outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">Category *</label>
                <select
                  value={newInspection.category}
                  onChange={(e) => setNewInspection((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#f2f4f6] text-xs font-bold text-[#191c1e] rounded-lg border border-[#e0e3e5] outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="">Select a category</option>
                  <option value="Safety">Safety</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Ventilation">Ventilation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">Inspector *</label>
                <input
                  type="text"
                  value={newInspection.inspector}
                  onChange={(e) => setNewInspection((prev) => ({ ...prev, inspector: e.target.value }))}
                  placeholder="e.g., Officer R. Sharma (DGMS Certified)"
                  className="w-full px-3 py-2 bg-white border border-[#e0e3e5] rounded-lg text-xs outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">Due Date *</label>
                <input
                  type="date"
                  value={newInspection.dueDate}
                  onChange={(e) => setNewInspection((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-[#e0e3e5] rounded-lg text-xs outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464d] mb-1">Notes</label>
                <textarea
                  value={newInspection.notes}
                  onChange={(e) => setNewInspection((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-[#e0e3e5] rounded-lg text-xs outline-none focus:ring-1 focus:ring-black resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#eceef0]">
              <button
                onClick={handleCloseNewModal}
                className="px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs font-bold text-[#191c1e] hover:bg-[#f2f4f6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInspection}
                className="px-4 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1e293b] transition-colors shadow-xs"
              >
                Create Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      {!selectedInspection && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
                Scheduled
              </div>
              <div className="text-3xl font-extrabold text-[#191c1e] font-mono">{scheduledCount}</div>
              <div className="text-xs text-[#45464d] mt-1">Awaiting assignment</div>
            </div>
            <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
                In Progress
              </div>
              <div className="text-3xl font-extrabold text-[#191c1e] font-mono">{inProgressCount}</div>
              <div className="text-xs text-[#45464d] mt-1">Field work active</div>
            </div>
            <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
                Findings
              </div>
              <div className="text-3xl font-extrabold text-[#191c1e] font-mono">{findingCount}</div>
              <div className="text-xs text-[#45464d] mt-1">Requires action</div>
            </div>
            <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow border-t-2 border-t-emerald-600">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
                Closed
              </div>
              <div className="text-3xl font-extrabold text-[#191c1e] font-mono">{closedCount}</div>
              <div className="text-xs text-[#45464d] mt-1">Completed this cycle</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-[#e0e3e5] rounded-xl p-4 industrial-shadow flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={mineFilter}
                onChange={(e) => setMineFilter(e.target.value)}
                className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold text-[#191c1e] rounded-lg border-none outline-none cursor-pointer"
              >
                <option value="all">All Mines</option>
                <option value="jharia">Jharia Main Colliery</option>
                <option value="korba">Korba Deep Mine</option>
                <option value="raniganj">Raniganj Eastern Block</option>
                <option value="singrauli">Singrauli North Extension</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold text-[#191c1e] rounded-lg border-none outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Safety">Safety</option>
                <option value="Environmental">Environmental</option>
                <option value="Equipment">Equipment</option>
                <option value="Ventilation">Ventilation</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold text-[#191c1e] rounded-lg border-none outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Finding Identified">Finding Identified</option>
                <option value="Corrective Action">Corrective Action</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search inspections..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#e0e3e5] rounded-xl text-xs outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </>
      )}

      {/* Content Area */}
      {!selectedInspection ? (
        /* Inspection Table */
        <div className="bg-white border border-[#e0e3e5] rounded-xl overflow-hidden industrial-shadow">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">
                search_off
              </span>
              <p className="font-bold text-sm text-gray-700">No inspections matching this filter</p>
              <p className="text-xs text-gray-400">Adjust your filters to see more results.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-[#45464d]">
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Mine</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Inspection ID</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Type</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Inspector</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Due Date</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Category</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Risk</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
                    <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0]">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f7f9fb] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#191c1e] text-xs">{item.mine}</span>
                        <div className="font-mono text-[10px] text-[#76777d]">
                          {item.location}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#191c1e]">{item.inspectionId}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#45464d]">{item.type}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {item.inspector.includes('Sharma') ? (
                            <img
                              src={ASSETS.officerMitchell}
                              alt={item.inspector}
                              className="w-6 h-6 rounded-full object-cover border border-[#c6c6cd]"
                            />
                          ) : item.inspector.includes('Patel') ? (
                            <img
                              src={ASSETS.officerReynolds}
                              alt={item.inspector}
                              className="w-6 h-6 rounded-full object-cover border border-[#c6c6cd]"
                            />
                          ) : item.inspector.includes('Singh') ? (
                            <img
                              src={ASSETS.officerDoe}
                              alt={item.inspector}
                              className="w-6 h-6 rounded-full object-cover border border-[#c6c6cd]"
                            />
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-[#e0e3e5] text-[9px] font-bold flex items-center justify-center text-[#191c1e]">
                              AK
                            </span>
                          )}
                          <span className="text-xs font-medium text-[#191c1e]">
                            {item.inspector.split(' ')[1]}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#45464d]">{item.dueDate}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-[#45464d]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getRiskBadge(item.riskLevel)}`}>
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="text-xs font-bold text-[#191c1e] hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Inspection Detail View */
        <div className="space-y-6">
          {/* Detail Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight">
                  {selectedInspection.inspectionId}
                </h2>
                <p className="text-xs text-[#45464d]">Inspection Details & Field Operations</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(selectedInspection.status)}`}>
              {selectedInspection.status}
            </span>
          </div>

          {/* Status Flow Timeline */}
          <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-4">
              Inspection Status Flow
            </h3>
            <div className="flex items-center justify-between">
              {STATUS_FLOW.map((step, index) => {
                const isCompleted = STATUS_FLOW.indexOf(step) < STATUS_FLOW.indexOf(selectedInspection.status);
                const isCurrent = step === selectedInspection.status;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-black text-white ring-2 ring-blue-400'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase mt-1 text-center ${
                          isCurrent ? 'text-[#191c1e]' : 'text-[#45464d]'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {index < STATUS_FLOW.length - 1 && (
                      <div
                        className={`flex-1 h-[2px] ${
                          isCompleted ? 'bg-emerald-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-4">
              Inspection Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between items-center py-2.5 border-b border-[#eceef0]">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  Mine
                </span>
                <span className="font-bold text-[#191c1e] text-right">
                  {selectedInspection.mine}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#eceef0]">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  Inspection ID
                </span>
                <span className="font-mono font-bold text-[#191c1e] text-right">
                  {selectedInspection.inspectionId}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#eceef0]">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[16px]">category</span>
                  Type
                </span>
                <span className="text-[#191c1e] text-right">{selectedInspection.type}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#eceef0]">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[16px]">category</span>
                  Category
                </span>
                <span
                  className={`font-bold text-right`}
                  style={{ color: getRiskColor(selectedInspection.riskLevel) }}
                >
                  {selectedInspection.category}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#eceef0]">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Inspector
                </span>
                <span className="text-[#191c1e] text-right">{selectedInspection.inspector.split('(')[0].trim()}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#eceef0]">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Scheduled Date
                </span>
                <span className="font-mono text-[#191c1e] text-right">
                  {selectedInspection.scheduledDate}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#eceef0]">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[16px]">event</span>
                  Due Date
                </span>
                <span className="font-mono font-bold text-[#191c1e] text-right">
                  {selectedInspection.dueDate}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-[#eceef0]">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[16px]">place</span>
                  Location
                </span>
                <span className="text-[#45464d] text-right font-mono text-[10px]">
                  {selectedInspection.gpsText}
                </span>
              </div>
              <div className="flex justify-between items-start py-2.5 border-b border-[#eceef0]">
                <span className="text-[#45464d] flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[16px]">shield</span>
                  Risk Level
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-bold" style={{ color: getRiskColor(selectedInspection.riskLevel) }}>
                    {selectedInspection.riskLevel} RISK
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Required Checks */}
          <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-4">
              Required Checks
            </h3>
            <div className="space-y-2">
              {selectedInspection.requiredChecks.map((check) => (
                <div
                  key={check.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                    check.completed
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      check.completed ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    {check.completed ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={`flex-1 text-xs font-medium ${
                    check.completed ? 'text-emerald-800' : 'text-[#45464d]'
                  }`}>
                    {check.name}
                  </span>
                  {check.notes && (
                    <span className="text-[10px] text-[#76777d] italic">
                      "{check.notes}"
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Observation Notes */}
          {selectedInspection.notes && (
            <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-3">
                Observation Notes
              </h3>
              <p className="text-xs text-[#45464d] italic leading-relaxed">
                "{selectedInspection.notes}"
              </p>
            </div>
          )}

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#c6c6cd]/30">
            {selectedInspection.status === 'Scheduled' || selectedInspection.status === 'In Progress' ? (
              <>
                <button
                  onClick={() => {
                    if (onNavigate) {
                      handleStartInspection(selectedInspection);
                      onNavigate('field-ops' as NavigationTab);
                    } else {
                      handleStartInspection(selectedInspection);
                    }
                  }}
                  className="px-6 py-3 bg-[#0F172A] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1e293b] transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">camera_alt</span>
                  Start Inspection
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(
                      selectedInspection.id,
                      selectedInspection.status === 'Scheduled'
                        ? 'In Progress'
                        : 'Evidence Captured'
                    )
                  }
                  className="px-6 py-3 border border-[#c6c6cd] text-[#191c1e] rounded-lg text-xs font-bold hover:bg-[#f2f4f6] transition-colors"
                >
                  Mark {selectedInspection.status === 'Scheduled' ? 'In Progress' : 'Evidence Captured'}
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate?.('field-ops' as NavigationTab)}
                className="px-6 py-3 bg-[#0F172A] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1e293b] transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-base">psychology</span>
                Continue to Field Operations
              </button>
            )}

            {selectedInspection.status === 'Finding Identified' && (
              <button
                onClick={() => handleUpdateStatus(selectedInspection.id, 'Corrective Action')}
                className="px-6 py-3 bg-[#6366F1] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-base">add_task</span>
                Create Corrective Action
              </button>
            )}

            {selectedInspection.status === 'Corrective Action' && (
              <button
                onClick={() => handleUpdateStatus(selectedInspection.id, 'Resolved')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-base">task_alt</span>
                Mark Resolved
              </button>
            )}

            {selectedInspection.status === 'Resolved' && (
              <button
                onClick={() => handleUpdateStatus(selectedInspection.id, 'Closed')}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-base">lock</span>
                Close Inspection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
