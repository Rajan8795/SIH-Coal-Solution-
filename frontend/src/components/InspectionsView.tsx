import React, { useState } from 'react';
import { ASSETS } from '../data/mockData';
import { Mine, NavigationTab } from '../types';

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
  mineId: string;
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
  workflowType?: string;
  // ML Fields from real mine dataset
  riskScore?: number | null;
  riskCategory?: string;
  confidenceScore?: number | null;
  evidenceStatus?: string;
  evidenceCoverage?: number | null;
  inspectionPriority?: string;
  recommendation?: string;
  environmentalAnomaly?: string;
  environmentalAnomalyScore?: number | null;
  environmentalRiskScore?: number | null;
  riskDrivers?: string;
  explanation?: string;
  mappingStatus?: string;
}

interface InspectionsViewProps {
  mines?: Mine[];
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
  mines = [],
  onNavigate,
  onStartInspection,
}) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMineDetail, setSelectedMineDetail] = useState<Mine | null>(null);
  const [viewTab, setViewTab] = useState<'queue' | 'workflows'>('queue');

  const [riskFilter, setRiskFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Calculate top summary card counts directly from real 408 mine ML data
  const urgentCount = mines.filter((m) => m.inspectionPriority === 'URGENT').length;
  const highCount = mines.filter(
    (m) =>
      m.inspectionPriority === 'HIGH' ||
      m.riskCategory === 'HIGH' ||
      m.riskCategory === 'CRITICAL'
  ).length;
  const mediumCount = mines.filter(
    (m) => m.inspectionPriority === 'MEDIUM' || m.riskCategory === 'MEDIUM'
  ).length;
  const lowCount = mines.filter(
    (m) =>
      m.inspectionPriority === 'LOW' ||
      (!m.inspectionPriority && (m.riskCategory === 'LOW' || !m.riskCategory))
  ).length;

  // Sorting logic for Priority Queue:
  // 1. Priority order: URGENT -> HIGH -> MEDIUM -> LOW
  // 2. Within same priority level, sort by riskScore descending
  const getPriorityRank = (p?: string, category?: string) => {
    if (p === 'URGENT') return 1;
    if (p === 'HIGH' || category === 'HIGH' || category === 'CRITICAL') return 2;
    if (p === 'MEDIUM' || category === 'MEDIUM') return 3;
    if (p === 'LOW' || category === 'LOW') return 4;
    return 5;
  };

  const sortedRealMines = [...mines].sort((a, b) => {
    const rankA = getPriorityRank(a.inspectionPriority, a.riskCategory);
    const rankB = getPriorityRank(b.inspectionPriority, b.riskCategory);
    if (rankA !== rankB) return rankA - rankB;
    return (b.riskScore ?? 0) - (a.riskScore ?? 0);
  });

  const filteredRealMines = sortedRealMines.filter((mine) => {
    if (riskFilter !== 'all' && mine.riskCategory !== riskFilter) return false;
    if (priorityFilter !== 'all' && mine.inspectionPriority !== priorityFilter)
      return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchesName = mine.name.toLowerCase().includes(q);
      const matchesId = mine.id.toLowerCase().includes(q);
      const matchesLoc = mine.location ? mine.location.toLowerCase().includes(q) : false;
      if (!matchesName && !matchesId && !matchesLoc) return false;
    }
    return true;
  });

  const selectedInspection = selectedId
    ? inspections.find((i) => i.id === selectedId) || null
    : null;

  const handleStartRealMineInspection = (mine: Mine) => {
    const nextNum = inspections.length + 1;
    const year = new Date().getFullYear();
    const inspectionId = `INSP-${year}-${String(nextNum).padStart(3, '0')}`;

    const recText =
      typeof mine.aiRecommendation === 'string'
        ? mine.aiRecommendation
        : mine.aiRecommendation?.headline || 'Review Evidence';

    const prototypeInspection: Inspection = {
      id: `insp-${Date.now()}`,
      inspectionId,
      mine: mine.name,
      mineId: mine.mineId || mine.id,
      location: mine.location || 'Location Unspecified',
      sector: mine.area || mine.mineId || mine.id,
      gpsText: mine.coordinates?.gpsText || 'GPS / sub-location data unavailable',
      type: 'Recommended Inspection',
      category: 'Safety',
      inspector: 'Officer V. Singh (DGMS Certified)',
      scheduledDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      dueDate: 'Targeted Dispatch',
      riskLevel:
        mine.riskCategory === 'HIGH' || mine.riskCategory === 'CRITICAL'
          ? 'High'
          : mine.riskCategory === 'MEDIUM'
          ? 'Medium'
          : 'Low',
      status: 'Scheduled',
      requiredChecks: [
        { id: 'c1', name: 'Operational & Production Verification', completed: false },
        { id: 'c2', name: 'Environmental Evidence Audit', completed: false },
        { id: 'c3', name: 'Contractor Compliance Record Check', completed: false },
      ],
      workflowType: 'Prototype Workflow',
      notes: 'Initiated from AI Inspection Priority Queue.',
      riskScore: mine.riskScore,
      riskCategory: mine.riskCategory,
      confidenceScore: mine.confidenceScore,
      evidenceStatus: mine.evidenceStatus,
      evidenceCoverage: mine.evidenceCoverage,
      inspectionPriority: mine.inspectionPriority,
      recommendation: recText,
      riskDrivers: mine.riskDrivers,
      explanation: mine.explanation,
      environmentalAnomaly: mine.environmentalAnomaly,
      environmentalAnomalyScore: mine.environmentalAnomalyScore,
      environmentalRiskScore: mine.environmentalRiskScore,
      mappingStatus: mine.mappingStatus,
    };

    setInspections((prev) => [prototypeInspection, ...prev]);
    setSelectedMineDetail(null);
    setToast(`Prototype Workflow started for ${mine.name} (${mine.mineId || mine.id})`);

    // Connect directly to Field Operations workflow
    onStartInspection?.(prototypeInspection);

    setTimeout(() => setToast(null), 3500);
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
        <div className="fixed top-4 right-4 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-white/20">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            check_circle
          </span>
          {toast}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e0e3e5] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
              AI Inspection Priority Queue
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {mines.length} Real Mines Connected
            </span>
          </div>
          <p className="text-xs text-[#76777d] mt-1 font-medium">
            Priorities generated from the current ML risk assessment. These are recommended inspection targets, not historical inspection records.
          </p>
        </div>

        {selectedInspection ? (
          <button
            onClick={() => setSelectedId(null)}
            className="px-4 py-2 bg-white border border-[#c6c6cd] rounded-lg text-xs font-bold text-[#191c1e] hover:bg-[#f2f4f6] transition-colors shadow-xs flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Queue
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-[#f2f4f6] p-1 rounded-xl border border-[#e0e3e5]">
            <button
              onClick={() => setViewTab('queue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewTab === 'queue'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              AI Priority Queue ({filteredRealMines.length})
            </button>
            <button
              onClick={() => setViewTab('workflows')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewTab === 'workflows'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Active Workflows ({inspections.length})
            </button>
          </div>
        )}
      </div>

      {/* Real-Mine ML Priority Summary Cards */}
      {!selectedInspection && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e0e3e5] rounded-xl p-4 border-t-4 border-t-red-600 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-1">
                URGENT PRIORITY
              </div>
              <div className="text-3xl font-extrabold text-[#191c1e] font-mono">
                {urgentCount}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Real mine ML targets</div>
            </div>

            <div className="bg-white border border-[#e0e3e5] rounded-xl p-4 border-t-4 border-t-amber-500 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                HIGH PRIORITY
              </div>
              <div className="text-3xl font-extrabold text-[#191c1e] font-mono">
                {highCount}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Elevated risk signals</div>
            </div>

            <div className="bg-white border border-[#e0e3e5] rounded-xl p-4 border-t-4 border-t-blue-500 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">
                MEDIUM PRIORITY
              </div>
              <div className="text-3xl font-extrabold text-[#191c1e] font-mono">
                {mediumCount}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Routine evidence audit</div>
            </div>

            <div className="bg-white border border-[#e0e3e5] rounded-xl p-4 border-t-4 border-t-emerald-600 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                LOW PRIORITY
              </div>
              <div className="text-3xl font-extrabold text-[#191c1e] font-mono">
                {lowCount}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Baseline monitoring</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-[#e0e3e5] rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                Filter Queue:
              </span>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#f2f4f6] font-bold text-[#191c1e] rounded-lg border border-[#e0e3e5] outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="URGENT">Urgent Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#f2f4f6] font-bold text-[#191c1e] rounded-lg border border-[#e0e3e5] outline-none cursor-pointer"
              >
                <option value="all">All Risk Categories</option>
                <option value="HIGH">HIGH Risk</option>
                <option value="CRITICAL">CRITICAL Risk</option>
                <option value="MEDIUM">MEDIUM Risk</option>
                <option value="LOW">LOW Risk</option>
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
                placeholder="Search real mine name, ID, location..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#e0e3e5] rounded-xl text-xs outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </>
      )}

      {/* Detail Drawer / Modal for Real Mine Review */}
      {selectedMineDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-[#191c1e]">
                  {selectedMineDetail.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ID: {selectedMineDetail.mineId || selectedMineDetail.id}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {selectedMineDetail.location}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMineDetail(null)}
                className="p-1 rounded-full text-gray-400 hover:text-black"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 uppercase text-[10px] font-bold block mb-1">
                  Risk Score
                </span>
                <span className="text-base font-extrabold font-mono text-gray-900">
                  {selectedMineDetail.riskScore != null
                    ? `${selectedMineDetail.riskScore.toFixed(2)} / 100`
                    : 'Insufficient Evidence'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 uppercase text-[10px] font-bold block mb-1">
                  Risk Category
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {selectedMineDetail.riskCategory || 'Insufficient Evidence'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 uppercase text-[10px] font-bold block mb-1">
                  Confidence Score
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {selectedMineDetail.confidenceScore != null
                    ? `${selectedMineDetail.confidenceScore}% (${selectedMineDetail.confidenceCategory || 'Moderate'})`
                    : 'Insufficient Evidence'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 uppercase text-[10px] font-bold block mb-1">
                  Inspection Priority
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {selectedMineDetail.inspectionPriority || 'LOW'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 uppercase text-[10px] font-bold block mb-1">
                  Evidence Status
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {selectedMineDetail.evidenceStatus || 'Insufficient Evidence'}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500 uppercase text-[10px] font-bold block mb-1">
                  Evidence Coverage
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {selectedMineDetail.evidenceCoverage != null
                    ? `${selectedMineDetail.evidenceCoverage}%`
                    : 'Insufficient Evidence'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1.5">
              <div>
                <span className="font-bold text-gray-700">Risk Drivers: </span>
                <span className="text-gray-800">
                  {selectedMineDetail.riskDrivers || 'Insufficient Evidence'}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-700">Explanation: </span>
                <span className="text-gray-800">
                  {selectedMineDetail.explanation &&
                  selectedMineDetail.explanation !== 'Insufficient Evidence'
                    ? selectedMineDetail.explanation
                    : 'Insufficient Evidence'}
                </span>
              </div>
              <div className="text-amber-700 font-mono text-[11px] italic pt-1 border-t border-gray-200">
                GPS / sub-location data unavailable
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
              <span className="font-bold text-amber-900 uppercase text-[10px] block">
                AI Preventive Recommendation
              </span>
              <p className="text-amber-900 leading-relaxed font-medium">
                {typeof selectedMineDetail.aiRecommendation === 'string'
                  ? selectedMineDetail.aiRecommendation
                  : selectedMineDetail.aiRecommendation?.headline ||
                    'Review Evidence'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedMineDetail(null)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex-1"
              >
                Close
              </button>
              <button
                onClick={() => handleStartRealMineInspection(selectedMineDetail)}
                className="px-4 py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1e293b] flex-1 flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">camera_alt</span>
                Start Inspection →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {!selectedInspection ? (
        viewTab === 'queue' ? (
          /* Real-Mine AI Inspection Priority Queue Table */
          <div className="bg-white border border-[#e0e3e5] rounded-xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-[#f7f9fb] border-b border-[#e0e3e5] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">auto_awesome</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#191c1e]">
                  Target Facilities Queue ({filteredRealMines.length} Real Mines)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Sorted by Priority & Risk Score
              </span>
            </div>

            {filteredRealMines.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">
                  search_off
                </span>
                <p className="font-bold text-sm text-gray-700">No real mines match filter criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-[#45464d]">
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">
                        Mine
                      </th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">
                        Mine ID
                      </th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">
                        Risk
                      </th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">
                        Category
                      </th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">
                        Confidence
                      </th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">
                        Evidence
                      </th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">
                        Priority
                      </th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">
                        Recommended Action
                      </th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceef0]">
                    {filteredRealMines.map((mine) => {
                      const recText =
                        typeof mine.aiRecommendation === 'string'
                          ? mine.aiRecommendation
                          : mine.aiRecommendation?.headline || 'Review Evidence';

                      return (
                        <tr
                          key={mine.id}
                          className="hover:bg-[#f7f9fb] transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#191c1e] text-xs">
                              {mine.name}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {mine.location}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {mine.mineId || mine.id}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-extrabold text-[#191c1e]">
                            {mine.riskScore != null
                              ? `${mine.riskScore.toFixed(2)}`
                              : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                mine.riskCategory === 'HIGH' ||
                                mine.riskCategory === 'CRITICAL'
                                  ? 'bg-red-100 text-red-800'
                                  : mine.riskCategory === 'MEDIUM'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {mine.riskCategory || 'LOW'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#191c1e]">
                            {mine.confidenceScore != null
                              ? `${mine.confidenceScore}%`
                              : 'Insufficient Evidence'}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {mine.evidenceStatus || 'Operational Only'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                mine.inspectionPriority === 'URGENT'
                                  ? 'bg-red-600 text-white'
                                  : mine.inspectionPriority === 'HIGH'
                                  ? 'bg-red-100 text-red-800'
                                  : mine.inspectionPriority === 'MEDIUM'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {mine.inspectionPriority || 'LOW'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-700 max-w-xs truncate">
                            {recText}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedMineDetail(mine)}
                                className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:text-black border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => handleStartRealMineInspection(mine)}
                                className="px-2.5 py-1 text-xs font-bold bg-[#0F172A] text-white rounded hover:bg-[#1e293b] transition-colors"
                              >
                                Start Inspection
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Active Workflows Table */
          <div className="bg-white border border-[#e0e3e5] rounded-xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-[#f7f9fb] border-b border-[#e0e3e5] flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#191c1e]">
                Active Prototype Workflows ({inspections.length})
              </h3>
            </div>

            {inspections.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">
                  assignment_late
                </span>
                <p className="font-bold text-sm text-gray-700">No active prototype workflows running</p>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Click <span className="font-bold text-gray-700">"Start Inspection"</span> on any mine in the AI Priority Queue to launch a prototype inspection workflow.
                </p>
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
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceef0]">
                    {inspections.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f7f9fb] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#191c1e] text-xs">{item.mine}</span>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                              {item.mineId}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                              Prototype Workflow
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#191c1e]">{item.inspectionId}</td>
                        <td className="py-3.5 px-4 text-[#45464d]">{item.type}</td>
                        <td className="py-3.5 px-4 text-[#191c1e]">{item.inspector}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedId(item.id)}
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
        )
      ) : (
        /* Inspection Detail View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedId(null)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight flex items-center gap-3">
                  {selectedInspection.inspectionId}
                  <span className="text-xs px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                    Prototype Workflow
                  </span>
                </h2>
                <p className="text-xs text-[#45464d]">Inspection Details & Field Operations</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(selectedInspection.status)}`}>
              {selectedInspection.status}
            </span>
          </div>

          <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#eceef0] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">auto_awesome</span>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  Real Mine ML Intelligence ({selectedInspection.mineId})
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Prototype Workflow
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#f7f9fb] p-3 rounded-lg border border-[#e0e3e5]">
                <span className="text-[#45464d] text-[10px] font-bold uppercase block mb-1">Risk Score</span>
                <span className="text-base font-extrabold text-[#191c1e] font-mono">
                  {selectedInspection.riskScore != null ? `${selectedInspection.riskScore.toFixed(2)} / 100` : 'Insufficient Evidence'}
                </span>
              </div>

              <div className="bg-[#f7f9fb] p-3 rounded-lg border border-[#e0e3e5]">
                <span className="text-[#45464d] text-[10px] font-bold uppercase block mb-1">Risk Category</span>
                <span className="text-xs font-bold text-[#191c1e]">
                  {selectedInspection.riskCategory || 'Insufficient Evidence'}
                </span>
              </div>

              <div className="bg-[#f7f9fb] p-3 rounded-lg border border-[#e0e3e5]">
                <span className="text-[#45464d] text-[10px] font-bold uppercase block mb-1">Confidence</span>
                <span className="text-xs font-bold text-[#191c1e]">
                  {selectedInspection.confidenceScore != null ? `${selectedInspection.confidenceScore.toFixed(1)}%` : 'Insufficient Evidence'}
                </span>
              </div>

              <div className="bg-[#f7f9fb] p-3 rounded-lg border border-[#e0e3e5]">
                <span className="text-[#45464d] text-[10px] font-bold uppercase block mb-1">Inspection Priority</span>
                <span className="text-xs font-bold text-[#191c1e]">
                  {selectedInspection.inspectionPriority || 'Insufficient Evidence'}
                </span>
              </div>
            </div>

            {selectedInspection.recommendation && (
              <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-lg text-xs text-indigo-950">
                <span className="font-bold text-indigo-900 block mb-0.5">AI Preventive Recommendation:</span>
                "{selectedInspection.recommendation}"
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#c6c6cd]/30">
            {selectedInspection.status === 'Scheduled' || selectedInspection.status === 'In Progress' ? (
              <>
                <button
                  onClick={() => {
                    if (selectedInspection) {
                      onStartInspection?.(selectedInspection);
                    }
                    onNavigate?.('field-ops' as NavigationTab);
                  }}
                  className="px-6 py-3 bg-[#0F172A] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1e293b] transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">camera_alt</span>
                  Start Field Capture
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
