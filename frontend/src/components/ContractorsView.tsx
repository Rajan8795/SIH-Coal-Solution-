import React, { useState } from 'react';
import { Mine, NavigationTab } from '../types';

interface ContractorsViewProps {
  mines: Mine[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectMine?: (mineId: string) => void;
}

export const ContractorsView: React.FC<ContractorsViewProps> = ({
  mines,
  onNavigate,
  onSelectMine,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  const assessedMinesCount = mines.length;
  const unavailableEvidenceCount = mines.filter(
    (m) => !m.evidenceStatus || m.evidenceStatus.toLowerCase().includes('insufficient')
  ).length;
  const highRiskCount = mines.filter(
    (m) => m.riskCategory === 'HIGH' || m.riskCategory === 'CRITICAL'
  ).length;

  const uniqueStates = Array.from(new Set(mines.map((m) => m.state || m.location).filter(Boolean))).sort();

  const filteredMines = mines.filter((mine) => {
    const matchesSearch =
      mine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mine.district && mine.district.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesState = stateFilter === 'ALL' || (mine.state || mine.location) === stateFilter;
    return matchesSearch && matchesState;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
            Contractor & Contract Governance
          </h2>
          <p className="text-sm text-[#45464d] mt-1 font-medium">
            Statutory workforce integration and external contractor safety oversight context.
          </p>
        </div>
        <button
          onClick={() => onNavigate('compliance')}
          className="bg-[#0F172A] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          View Statutory Compliance
        </button>
      </div>

      {/* Integration Panel Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Enterprise Integration Gateway
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
              CIL CONTRACTOR DATA INTEGRATION
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Contractor-level statutory records are not present in the current source dataset. Connect CIL contractual workforce / contract-management systems to enable worker registration, certification expiry, machinery and contractor compliance monitoring.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-center flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Source Dataset Scope</span>
              <span className="text-xl font-mono font-extrabold text-indigo-400">408 Real Mines</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-center flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Contractor Roster</span>
              <span className="text-xl font-mono font-extrabold text-amber-400">External Integration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
            Mines Assessed
          </div>
          <div className="text-3xl font-extrabold text-[#191c1e] font-mono">{assessedMinesCount}</div>
          <div className="text-xs text-slate-600 font-semibold mt-1">Operational mine dataset</div>
        </div>

        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
            Contractor Evidence Status
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-mono">{unavailableEvidenceCount}</div>
          <div className="text-xs text-amber-700 font-medium mt-1">External evidence integration required</div>
        </div>

        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
            High-Risk Facilities
          </div>
          <div className="text-3xl font-extrabold text-red-600 font-mono">{highRiskCount}</div>
          <div className="text-xs text-red-700 font-medium mt-1">Contractor safety audit target</div>
        </div>
      </div>

      {/* Mine Contractor Evidence Oversight Table */}
      <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-200">
          <div>
            <h3 className="text-base font-extrabold text-[#191c1e]">
              Mine Risk & Contractor Evidence Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Assessing contractor safety governance requirements across verified mine sites.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <input
                type="text"
                placeholder="Search mine name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* State Filter */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-[#f8fafc] border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
            >
              <option value="ALL">All States ({uniqueStates.length})</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-700 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Mine ID & Name</th>
                <th className="py-2.5 px-3">State / District</th>
                <th className="py-2.5 px-3">Risk Category</th>
                <th className="py-2.5 px-3">Contractor Evidence Status</th>
                <th className="py-2.5 px-3">AI Recommendation</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredMines.slice(0, 15).map((mine) => (
                <tr key={mine.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{mine.name}</div>
                    <div className="font-mono text-[10px] text-slate-400 font-bold">
                      {mine.mineId || mine.id}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div>{mine.state || mine.location}</div>
                    <div className="text-[10px] text-slate-400">{mine.district || 'Unspecified'}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                        mine.riskCategory === 'HIGH' || mine.riskCategory === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : mine.riskCategory === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {mine.riskCategory || 'LOW'} ({mine.riskScore != null ? mine.riskScore.toFixed(1) : 'N/A'})
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-semibold border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      External / Unavailable
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-slate-600 text-[11px]">
                    {typeof mine.aiRecommendation === 'string'
                      ? mine.aiRecommendation
                      : mine.aiRecommendation?.headline || 'Review ML Intelligence'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        if (onSelectMine) onSelectMine(mine.mineId || mine.id);
                        onNavigate('mines');
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold transition-colors shadow-2xs"
                    >
                      Inspect Mine
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMines.length > 15 && (
            <div className="p-2 text-center text-[11px] text-slate-400 font-semibold border-t border-slate-100">
              Showing top 15 of {filteredMines.length} matching mines from 408 real mine dataset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
