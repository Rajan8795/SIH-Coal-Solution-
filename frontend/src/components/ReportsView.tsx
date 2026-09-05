import React, { useState } from 'react';
import { NavigationTab } from '../types';

interface ReportsViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigate }) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const reportsList = [
    {
      id: 'rep-1',
      title: 'DGMS Quarterly Production & Injury Report',
      period: 'Q3 2024 Comprehensive',
      size: '2.4 MB PDF',
      status: 'Certified',
      date: 'Oct 20, 2024',
    },
    {
      id: 'rep-2',
      title: 'Jharia Main Colliery Ventilation Compliance Log',
      period: 'Oct 01 - Oct 24, 2024',
      size: '8.1 MB CSV',
      status: 'Auto-Generated',
      date: 'Oct 24, 2024',
    },
    {
      id: 'rep-3',
      title: 'Annual Combustible Coal Dust & Rock Dust Compliance Audit',
      period: 'Fiscal Year 2024',
      size: '4.7 MB PDF',
      status: 'Review Pending',
      date: 'Oct 15, 2024',
    },
    {
      id: 'rep-4',
      title: 'Contractor Safety Index & DGMS Certification Expiration Rollup',
      period: 'Rolling 30-Day',
      size: '1.2 MB XLSX',
      status: 'Certified',
      date: 'Oct 23, 2024',
    },
  ];

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
            Regulatory Reports & Audits
          </h2>
          <p className="text-sm text-[#45464d] mt-1">
            DGMS regulatory compliance filings, safety inspection exports, and audit trails.
          </p>
        </div>
        <button
          onClick={() => handleDownload('all')}
          className="bg-[#0F172A] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">post_add</span>
          Generate New Audit Packet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((rep) => (
          <div
            key={rep.id}
            className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase tracking-wider">
                  {rep.status}
                </span>
                <span className="text-xs font-mono text-gray-400">{rep.date}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1">{rep.title}</h3>
              <p className="text-xs text-gray-500">Period: {rep.period}</p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
              <span className="text-xs font-mono text-gray-400">{rep.size}</span>
              <button
                onClick={() => handleDownload(rep.id)}
                className="px-4 py-1.5 bg-[#f2f4f6] hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {downloadingId === rep.id ? 'check' : 'download'}
                </span>
                {downloadingId === rep.id ? 'Downloaded' : 'Download'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
