import React, { useMemo, useState } from 'react';
import { Mine, NavigationTab } from '../types';

interface ReportsViewProps {
  onNavigate: (tab: NavigationTab) => void;
  mines: Mine[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ mines }) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [mineFilter, setMineFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [evidenceFilter, setEvidenceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredMines = useMemo(() => mines.filter((mine) => {
    if (mineFilter !== 'all' && mine.id !== mineFilter) return false;
    if (stateFilter !== 'all' && mine.state !== stateFilter) return false;
    if (typeFilter !== 'all' && mine.mineType !== typeFilter) return false;
    if (riskFilter !== 'all' && mine.riskCategory !== riskFilter) return false;
    if (confidenceFilter === 'available' && mine.confidenceScore == null) return false;
    if (confidenceFilter === 'missing' && mine.confidenceScore != null) return false;
    if (evidenceFilter === 'available' && mine.evidenceStatus?.toLowerCase().includes('insufficient')) return false;
    if (evidenceFilter === 'missing' && !mine.evidenceStatus?.toLowerCase().includes('insufficient')) return false;
    if (priorityFilter !== 'all' && mine.inspectionPriority !== priorityFilter) return false;
    return true;
  }), [confidenceFilter, evidenceFilter, mineFilter, mines, priorityFilter, riskFilter, stateFilter, typeFilter]);

  const highCritical = filteredMines.filter((mine) => mine.riskCategory === 'HIGH' || mine.riskCategory === 'CRITICAL').length;
  const evidenceAvailable = filteredMines.filter((mine) => mine.evidenceStatus && !mine.evidenceStatus.toLowerCase().includes('insufficient')).length;
  const anomalies = filteredMines.filter((mine) => mine.environmentalAnomaly && mine.environmentalAnomaly !== 'No Anomaly').length;
  const reportCards = [
    ['AI/ML Risk Distribution', `${highCritical} high/critical mines in the filtered set.`, 'AI/ML-derived insight'],
    ['Evidence Availability', `${evidenceAvailable} of ${filteredMines.length} mines have available evidence signals.`, 'Evidence status summary'],
    ['Inspection Priority', `${filteredMines.filter((mine) => mine.inspectionPriority === 'URGENT' || mine.inspectionPriority === 'HIGH').length} urgent/high priorities.`, 'ML priority summary'],
    ['Environmental Anomaly Review', `${anomalies} environmental anomaly records available.`, 'Environmental ML output'],
  ];

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    const header = 'Mine ID,Mine Name,State,Mine Type,Risk Category,Risk Score,Confidence,Evidence Status,Inspection Priority\n';
    const rows = filteredMines.map((mine) => [
      mine.id, mine.name, mine.state || 'Insufficient Evidence', mine.mineType,
      mine.riskCategory || 'Insufficient Evidence', mine.riskScore ?? '', mine.confidenceScore ?? '',
      mine.evidenceStatus || 'Insufficient Evidence', mine.inspectionPriority || '',
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coalguard-ml-report-${id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => {
      setDownloadingId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
            AI/ML Reports & Evidence Summaries
          </h2>
          <p className="text-sm text-[#45464d] mt-1">
            Real mine summaries from existing ML outputs. These are not official regulatory records.
          </p>
        </div>
        <button
          onClick={() => handleDownload('all')}
          className="bg-[#0F172A] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">post_add</span>
          Export Filtered CSV
        </button>
      </div>

      <div className="bg-white border border-[#e0e3e5] rounded-xl p-4 industrial-shadow flex flex-wrap gap-2">
        <select value={mineFilter} onChange={(e) => setMineFilter(e.target.value)} className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold rounded-lg">
          <option value="all">All Mines</option>
          {mines.map((mine) => <option key={mine.id} value={mine.id}>{mine.name}</option>)}
        </select>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold rounded-lg">
          <option value="all">All States</option>
          {[...new Set(mines.map((mine) => mine.state).filter(Boolean))].map((state) => <option key={state} value={state}>{state}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold rounded-lg">
          <option value="all">All Mine Types</option>
          {[...new Set(mines.map((mine) => mine.mineType))].map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold rounded-lg">
          <option value="all">All Risk Categories</option>
          <option value="CRITICAL">CRITICAL</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
        </select>
        <select value={confidenceFilter} onChange={(e) => setConfidenceFilter(e.target.value)} className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold rounded-lg">
          <option value="all">All Confidence</option><option value="available">Available</option><option value="missing">Missing</option>
        </select>
        <select value={evidenceFilter} onChange={(e) => setEvidenceFilter(e.target.value)} className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold rounded-lg">
          <option value="all">All Evidence</option><option value="available">Available</option><option value="missing">Insufficient</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-3 py-2 bg-[#f2f4f6] text-xs font-bold rounded-lg">
          <option value="all">All Priorities</option><option value="URGENT">URGENT</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportCards.map(([title, summary, status], index) => (
          <div
            key={title}
            className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase tracking-wider">
                  {status}
                </span>
                <span className="text-xs font-mono text-gray-400">{filteredMines.length} mines</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1">{title}</h3>
              <p className="text-xs text-gray-500">{summary}</p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
              <span className="text-xs font-mono text-gray-400">ML-derived insight</span>
              <button
                onClick={() => handleDownload(`report-${index + 1}`)}
                className="px-4 py-1.5 bg-[#f2f4f6] hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {downloadingId === `report-${index + 1}` ? 'check' : 'download'}
                </span>
                {downloadingId === `report-${index + 1}` ? 'Downloaded' : 'Download'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
