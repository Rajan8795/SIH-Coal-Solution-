import React, { useState } from 'react';
import { ComplianceRequirement, Mine, NavigationTab } from '../types';
import { ASSETS } from '../data/mockData';

interface ComplianceViewProps {
  requirements: ComplianceRequirement[];
  mines: Mine[];
  onNavigate: (tab: NavigationTab) => void;
  onAddRequirement: (req: Omit<ComplianceRequirement, 'id'>) => void;
  onUpdateStatus: (id: string, newStatus: ComplianceRequirement['status']) => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({
  requirements,
  mines,
  onNavigate,
  onAddRequirement,
  onUpdateStatus,
}) => {
  const [mineFilter, setMineFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<ComplianceRequirement | null>(null);
  const [showAiAnalysisModal, setShowAiAnalysisModal] = useState(false);
  const [exportedToast, setExportedToast] = useState(false);

  // Filtered requirements
  const filtered = requirements.filter((item) => {
    if (mineFilter !== 'all' && !item.mine.toLowerCase().includes(mineFilter.toLowerCase())) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (riskFilter !== 'all' && item.riskLevel !== riskFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const totalCount = 248; // Total corporate items
  const completedCount = 182;
  const pendingCount = 54;
  const overdueCount = 12;

  // New Requirement Form State
  const [newTitle, setNewTitle] = useState('');
  const [newMine, setNewMine] = useState(mines[0]?.name || 'Blackwood North');
  const [newCategory, setNewCategory] = useState<'Safety' | 'Environmental' | 'Equipment' | 'Ventilation'>('Safety');
  const [newDueDate, setNewDueDate] = useState('2023-11-30');
  const [newRisk, setNewRisk] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newOfficer, setNewOfficer] = useState('J. Mitchell');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddRequirement({
      code: `REQ-2023-${Math.floor(100 + Math.random() * 900)}`,
      requirement: newTitle,
      mine: newMine,
      category: newCategory,
      dueDate: newDueDate,
      status: 'Pending',
      riskLevel: newRisk,
      responsibleOfficer: {
        name: newOfficer,
        avatar: ASSETS.officerMitchell,
      },
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  const handleExport = () => {
    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
            Compliance Center
          </h2>
          <p className="text-sm text-[#45464d] mt-1">
            Monitor, manage, and execute regulatory requirements across all active sites.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#0F172A] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-colors shadow-xs active:scale-98"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Requirement
        </button>
      </div>

      {/* Bento Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
            Total Compliance
          </div>
          <div className="text-3xl font-extrabold text-[#191c1e] font-mono">{totalCount}</div>
          <div className="text-xs text-[#45464d] mt-1">All Active Sites</div>
        </div>

        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
            Completed
          </div>
          <div className="text-3xl font-extrabold text-[#191c1e] font-mono">{completedCount}</div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +12 this week
          </div>
        </div>

        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
            Pending
          </div>
          <div className="text-3xl font-extrabold text-[#191c1e] font-mono">{pendingCount}</div>
          <div className="text-xs text-[#45464d] mt-1">Awaiting Action</div>
        </div>

        <div className="bg-white border border-[#ba1a1a]/30 rounded-xl p-5 industrial-shadow border-t-2 border-t-[#ba1a1a]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#ba1a1a] mb-1">
            Overdue
          </div>
          <div className="text-3xl font-extrabold text-[#ba1a1a] font-mono">{overdueCount}</div>
          <div className="text-xs font-bold text-[#ba1a1a] mt-1">Requires Immediate Action</div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-[#e0e3e5] rounded-xl p-4 industrial-shadow flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mine Filter */}
          <select
            value={mineFilter}
            onChange={(e) => setMineFilter(e.target.value)}
            className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold text-[#191c1e] rounded-lg border-none outline-none cursor-pointer"
          >
            <option value="all">All Mines</option>
            <option value="Blackwood">Blackwood North</option>
            <option value="Alpha">Mine Alpha</option>
            <option value="Beta">Site Beta</option>
            <option value="IronRidge">IronRidge Alpha</option>
            <option value="SilverCreek">SilverCreek</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold text-[#191c1e] rounded-lg border-none outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Safety">Safety</option>
            <option value="Environmental">Environmental</option>
            <option value="Equipment">Equipment</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold text-[#191c1e] rounded-lg border-none outline-none cursor-pointer"
          >
            <option value="all">Any Risk Level</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold text-[#191c1e] rounded-lg border-none outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Overdue">Overdue</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-[#f2f4f6] hover:bg-[#eceef0] text-xs font-bold text-[#45464d] rounded-lg transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            Oct 01 - Oct 31, 2023
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-[#f2f4f6] hover:bg-[#eceef0] text-xs font-bold text-[#45464d] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            {exportedToast ? 'Exported!' : 'Export'}
          </button>
        </div>
      </div>

      {/* Interactive Table Container */}
      <div className="bg-white border border-[#e0e3e5] rounded-xl overflow-hidden industrial-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-[#45464d]">
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Requirement</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Mine</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Category</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Due Date</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Risk Level</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Assigned To</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0]">
              {filtered.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="hover:bg-[#f7f9fb] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#191c1e] text-xs">{item.requirement}</div>
                      <div className="font-mono text-[10px] text-[#76777d]">{item.code}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#191c1e] font-semibold">{item.mine}</td>
                    <td className="py-3.5 px-4 text-[#45464d]">{item.category}</td>
                    <td className="py-3.5 px-4 font-mono text-[#45464d]">{item.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Overdue'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : item.status === 'Pending'
                            ? 'bg-[#fcdeb5] text-[#574425]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={
                          item.riskLevel === 'High'
                            ? 'text-[#ba1a1a]'
                            : item.riskLevel === 'Medium'
                            ? 'text-[#f59e0b]'
                            : 'text-[#10B981]'
                        }
                      >
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {item.responsibleOfficer.avatar ? (
                          <img
                            src={item.responsibleOfficer.avatar}
                            alt={item.responsibleOfficer.name}
                            className="w-6 h-6 rounded-full object-cover border border-[#c6c6cd]"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#e0e3e5] text-[10px] font-bold flex items-center justify-center text-[#191c1e]">
                            {item.responsibleOfficer.initials || 'OFF'}
                          </div>
                        )}
                        <span className="font-medium text-[#191c1e]">{item.responsibleOfficer.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReviewItem(item)}
                        className="text-xs font-bold text-[#191c1e] hover:underline"
                      >
                        {item.status === 'Completed' ? 'View' : 'Review'}
                      </button>
                    </td>
                  </tr>

                  {/* AI Insight Inline Row */}
                  {item.aiInsight && (
                    <tr className="bg-[#dae2fd]/30 border-y border-[#dae2fd]">
                      <td colSpan={8} className="py-3 px-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-600 text-sm">
                              psychology
                            </span>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded">
                              AI Insight: {item.aiInsight.type}
                            </span>
                            <span className="text-xs text-[#0d1c2f] font-medium">
                              {item.aiInsight.text}
                            </span>
                          </div>
                          <button
                            onClick={() => setShowAiAnalysisModal(true)}
                            className="text-xs text-indigo-700 font-bold hover:underline"
                          >
                            View Analysis →
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#e0e3e5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#45464d]">
          <div>
            Showing <span className="font-bold text-[#191c1e]">1</span> to{' '}
            <span className="font-bold text-[#191c1e]">{filtered.length}</span> of{' '}
            <span className="font-bold text-[#191c1e]">{totalCount}</span> results
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#45464d]">
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-[#0F172A] text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#45464d]">2</button>
            <button className="px-2.5 py-1 rounded border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#45464d]">3</button>
            <span className="px-1">...</span>
            <button className="px-2.5 py-1 rounded border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#45464d]">25</button>
            <button className="px-2.5 py-1 rounded border border-[#c6c6cd] hover:bg-[#f2f4f6] text-[#45464d]">Next</button>
          </div>
        </div>
      </div>

      {/* Review / Status Update Modal */}
      {selectedReviewItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100 mb-4">
              <div>
                <span className="font-mono text-xs text-gray-400">{selectedReviewItem.code}</span>
                <h3 className="font-bold text-base text-gray-900">{selectedReviewItem.requirement}</h3>
              </div>
              <button onClick={() => setSelectedReviewItem(null)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Site:</span>
                <span className="font-bold text-gray-900">{selectedReviewItem.mine}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Category:</span>
                <span className="font-bold text-gray-900">{selectedReviewItem.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Due Date:</span>
                <span className="font-mono font-bold text-gray-900">{selectedReviewItem.dueDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Responsible Officer:</span>
                <span className="font-bold text-gray-900">{selectedReviewItem.responsibleOfficer.name}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUpdateStatus(selectedReviewItem.id, 'Completed');
                    setSelectedReviewItem(null);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus(selectedReviewItem.id, 'Pending');
                    setSelectedReviewItem(null);
                  }}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Set to Pending
                </button>
              </div>
              <button
                onClick={() => setSelectedReviewItem(null)}
                className="w-full py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Requirement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">Add Compliance Requirement</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Requirement Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Methane Detector Calibration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Mine</label>
                <select
                  value={newMine}
                  onChange={(e) => setNewMine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                >
                  {mines.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                  >
                    <option value="Safety">Safety</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Ventilation">Ventilation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Risk Level</label>
                  <select
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Officer</label>
                <select
                  value={newOfficer}
                  onChange={(e) => setNewOfficer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                >
                  <option value="R. Sharma">R. Sharma</option>
                  <option value="S. Patel">S. Patel</option>
                  <option value="A. Kumar">A. Kumar</option>
                  <option value="T. Reddy">T. Reddy</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0F172A] text-white rounded-lg font-bold hover:bg-[#1e293b]"
                >
                  Save Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAiAnalysisModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <span className="material-symbols-outlined">psychology</span>
                <h3 className="font-bold text-base text-gray-900">Predictive Delay Analysis</h3>
              </div>
              <button onClick={() => setShowAiAnalysisModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-600">
              <p>
                <strong>Target:</strong> Structural Support Recertification at Godavari Valley Block III.
              </p>
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1.5">
                <p className="font-bold text-indigo-950">Key Correlating Factors:</p>
                <ul className="list-disc list-inside space-y-1 text-indigo-900">
                  <li>Deccan Geotech Mining Ltd has 3 active projects in the Godavari Valley region.</li>
                  <li>Structural engineer capacity currently booked at 92%.</li>
                  <li>Average lead time for certified ultrasonic testing rigs is 14 days.</li>
                </ul>
              </div>
              <p className="text-gray-500">
                <strong>Recommended Mitigation:</strong> Contract secondary certified inspector from Bharat Coal Mining Services to prevent overdue non-compliance penalty.
              </p>
            </div>
            <button
              onClick={() => setShowAiAnalysisModal(false)}
              className="mt-5 w-full py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold"
            >
              Acknowledge Insight
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
