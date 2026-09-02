import React, { useState } from 'react';
import { Contractor, NavigationTab } from '../types';

interface ContractorsViewProps {
  contractors: Contractor[];
  onNavigate: (tab: NavigationTab) => void;
}

export const ContractorsView: React.FC<ContractorsViewProps> = ({
  contractors,
  onNavigate,
}) => {
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [auditRequestedToast, setAuditRequestedToast] = useState(false);

  const handleRequestAudit = () => {
    setAuditRequestedToast(true);
    setTimeout(() => setAuditRequestedToast(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
            Contractor Governance
          </h2>
          <p className="text-sm text-[#45464d] mt-1">
            DGMS workforce training, safety audits, and certification tracking.
          </p>
        </div>
        <button
          onClick={handleRequestAudit}
          className="bg-[#0F172A] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          {auditRequestedToast ? 'Audit Dispatched!' : 'Request Network Audit'}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
            Active Contractors
          </div>
          <div className="text-3xl font-extrabold text-[#191c1e] font-mono">343</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Across 8 active sites</div>
        </div>

        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
            Expiring Certifications (&lt; 7 Days)
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-mono">23</div>
          <div className="text-xs text-amber-700 font-medium mt-1">12 at Site Beta (Exp 48 hrs)</div>
        </div>

        <div className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-1">
            Average Compliance Index
          </div>
          <div className="text-3xl font-extrabold text-[#191c1e] font-mono">87.2%</div>
          <div className="text-xs text-gray-500 mt-1">Target threshold: &gt; 85%</div>
        </div>
      </div>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contractors.map((contractor) => (
          <div
            key={contractor.id}
            className="bg-white border border-[#e0e3e5] rounded-xl p-5 industrial-shadow hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-[#191c1e]">{contractor.name}</h3>
                  <p className="text-xs text-gray-500">{contractor.primarySite}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    contractor.status === 'Compliant'
                      ? 'bg-emerald-100 text-emerald-800'
                      : contractor.status === 'Flagged'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {contractor.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-gray-50 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Active Personnel
                  </span>
                  <span className="font-mono font-bold text-gray-800 text-sm">
                    {contractor.activePersonnel} Workers
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Compliance Score
                  </span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      contractor.complianceScore < 80 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {contractor.complianceScore}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Expiring Certs
                  </span>
                  <span className="font-mono font-bold text-gray-800 text-sm">
                    {contractor.expiringCertifications} Pending
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Last DGMS Audit
                  </span>
                  <span className="font-mono text-gray-800 text-sm">
                    {contractor.lastAuditDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedContractor(contractor)}
                className="flex-1 py-2 border border-[#c6c6cd] rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Inspect Roster
              </button>
              <button
                onClick={() => onNavigate('compliance')}
                className="flex-1 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1e293b] transition-colors"
              >
                View Requirements
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Contractor Roster Modal */}
      {selectedContractor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  {selectedContractor.name} Roster
                </h3>
                <p className="text-xs text-gray-500">
                  Site: {selectedContractor.primarySite} • {selectedContractor.activePersonnel} Personnel
                </p>
              </div>
              <button
                onClick={() => setSelectedContractor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">Rajesh Kumar (Heavy Equipment Lead)</p>
                  <p className="text-gray-500">Cert: DGMS Underground Miner • EXP: 2025-06-15</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">Valid</span>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg flex justify-between items-center border border-amber-200">
                <div>
                  <p className="font-bold text-amber-900">Suresh Patel (Ventilation Tech)</p>
                  <p className="text-amber-700">Cert: DGMS Air Quality Specialist • EXP: 2024-10-31</p>
                </div>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded text-[10px]">Expiring 48h</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">Anita Sharma (Electrical Engineer)</p>
                  <p className="text-gray-500">Cert: DGMS High-Voltage Certified • EXP: 2025-11-20</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">Valid</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedContractor(null)}
              className="mt-4 w-full py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold"
            >
              Close Roster
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
