import React, { useState } from 'react';
import { FieldInspection, NavigationTab } from '../types';
import { ASSETS } from '../data/mockData';

interface FieldOpsViewProps {
  inspection: FieldInspection;
  onNavigate: (tab: NavigationTab) => void;
  onCreateCorrectiveAction: (inspection: FieldInspection) => void;
}

export const FieldOpsView: React.FC<FieldOpsViewProps> = ({
  inspection,
  onNavigate,
  onCreateCorrectiveAction,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(3);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(inspection.notes);
  const [dismissed, setDismissed] = useState(false);
  const [actionCreated, setActionCreated] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(inspection.location);

  const handleCreateAction = () => {
    setActionCreated(true);
    onCreateCorrectiveAction({
      ...inspection,
      notes,
      location: selectedLocation,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Mobile-Friendly Title Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight">
              Field Operations
            </h2>
            <p className="text-xs text-[#45464d]">Inspection Documentation & AI Analysis</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('inspections')}
          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">history</span>
          All Audits
        </button>
      </div>

      {/* Progress / Flow Indicator */}
      <div className="flex items-center justify-between px-4 py-2 bg-white rounded-xl border border-[#e0e3e5] shadow-xs">
        <button
          onClick={() => setActiveStep(1)}
          className="flex flex-col items-center flex-1 cursor-pointer group"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              activeStep === 1
                ? 'bg-black text-white ring-2 ring-blue-400'
                : activeStep > 1
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {activeStep > 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : '1'}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mt-1 group-hover:text-black">
            Location
          </span>
        </button>

        <div className="h-[2px] bg-gray-300 flex-1 mx-2" />

        <button
          onClick={() => setActiveStep(2)}
          className="flex flex-col items-center flex-1 cursor-pointer group"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              activeStep === 2
                ? 'bg-black text-white ring-2 ring-blue-400'
                : activeStep > 2
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {activeStep > 2 ? <span className="material-symbols-outlined text-[16px]">check</span> : '2'}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mt-1 group-hover:text-black">
            Capture
          </span>
        </button>

        <div className="h-[2px] bg-gray-300 flex-1 mx-2" />

        <button
          onClick={() => setActiveStep(3)}
          className="flex flex-col items-center flex-1 cursor-pointer group"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              activeStep === 3
                ? 'bg-black text-white ring-2 ring-indigo-500'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            3
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 mt-1">
            Analysis
          </span>
        </button>
      </div>

      {/* STEP 1 VIEW (Location Selection) */}
      {activeStep === 1 && (
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Confirm Facility Inspection Target
          </h3>
          <div className="space-y-2">
            {[
              { name: 'Sector 4 - Conveyor Belt B', gps: '23.7466° N, 86.4154° E', status: 'Verified' },
              { name: 'Main Shaft 2G - Intake Fan', gps: '23.7480° N, 86.4170° E', status: 'Pending Audit' },
              { name: 'Sub-Level 3 - Explosives Magazine', gps: '23.7450° N, 86.4140° E', status: 'Compliant' },
            ].map((loc) => (
              <div
                key={loc.name}
                onClick={() => setSelectedLocation(loc.name)}
                className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                  selectedLocation === loc.name
                    ? 'border-black bg-gray-50 ring-1 ring-black'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-700">location_on</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{loc.name}</p>
                    <p className="text-xs font-mono text-gray-500">{loc.gps}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {loc.status}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveStep(2)}
            className="w-full py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold"
          >
            Proceed to Camera Capture →
          </button>
        </div>
      )}

      {/* STEP 2 VIEW (Capture Mode) */}
      {activeStep === 2 && (
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-5 shadow-xs space-y-4 text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Live Optical Capture - {selectedLocation}
          </h3>
          <div className="relative h-64 bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center border border-gray-800">
            <img
              src={ASSETS.conveyorMedia}
              alt="Live Conveyor Stream"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 border-2 border-dashed border-red-500/80 m-6 rounded-lg pointer-events-none flex items-center justify-center">
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Hazard Target Locked
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveStep(3)}
            className="w-full py-3 bg-[#6366F1] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">psychology</span>
            Run AI Computer Vision Diagnostic
          </button>
        </div>
      )}

      {/* STEP 3 VIEW (Full Analysis Matching Screen 4) */}
      {activeStep === 3 && (
        <>
          {/* Active Inspection Location Card */}
          <div className="bg-white rounded-xl border border-[#e0e3e5] shadow-xs p-4 md:p-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-3">
              Active Inspection Location
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#e6e8ea] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-black text-2xl">location_on</span>
              </div>
              <div className="flex-1">
                <h4 className="text-base sm:text-lg font-bold text-[#191c1e]">
                  {selectedLocation}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-[#45464d]">
                    {inspection.gpsText}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#d5e3fd]/60 text-[#0d1c2f] text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Observation Media & AI Vision Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Observation Media Card */}
            <div className="bg-white rounded-xl border border-[#e0e3e5] shadow-xs overflow-hidden flex flex-col">
              <div className="p-3.5 border-b border-[#e0e3e5] flex justify-between items-center">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                  Observation Media
                </h3>
                <button
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className="text-black hover:bg-[#f2f4f6] p-1 rounded transition-colors"
                  title="Edit Observation Notes"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>

              <div className="relative w-full h-48 bg-[#f2f4f6]">
                <img
                  src={ASSETS.conveyorMedia}
                  alt="Inspection Conveyor Belt Observation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-[#0F172A]/85 text-white font-mono text-[10px] px-2 py-1 rounded backdrop-blur-xs font-semibold">
                  {inspection.time} — {inspection.date}
                </div>
              </div>

              <div className="p-3.5 bg-[#f7f9fb] flex-1">
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black bg-white"
                      rows={3}
                    />
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1 bg-black text-white rounded text-[11px] font-bold"
                    >
                      Save Note
                    </button>
                  </div>
                ) : (
                  <p className="text-xs italic text-[#45464d] leading-relaxed">
                    "{notes}"
                  </p>
                )}
              </div>
            </div>

            {/* AI Vision Analysis Card */}
            <div className="bg-white rounded-xl border border-[#e0e3e5] shadow-xs overflow-hidden flex flex-col border-t-2 border-t-[#6366F1] relative">
              {/* Subtle AI gradient background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6366F1]/10 to-transparent rounded-bl-full pointer-events-none" />

              <div className="p-3.5 border-b border-[#e0e3e5] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#6366F1]">psychology</span>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1]">
                  AI Vision Analysis
                </h3>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between space-y-3.5">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-base font-bold text-[#191c1e]">
                      {inspection.analysis.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ba1a1a]/10 text-[#ba1a1a] text-[10px] font-bold">
                      <span className="material-symbols-outlined text-[13px]">warning</span>
                      {inspection.analysis.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[#45464d] leading-relaxed">
                    {inspection.analysis.description}
                  </p>
                </div>

                {/* Confidence Score Bar */}
                <div className="bg-[#f7f9fb] p-3 rounded-lg border border-[#e0e3e5]">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                      Confidence Score
                    </span>
                    <span className="font-mono text-sm font-extrabold text-black">
                      {inspection.analysis.confidenceScore}%
                    </span>
                  </div>
                  <div className="w-full bg-[#e6e8ea] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-700"
                      style={{ width: `${inspection.analysis.confidenceScore}%` }}
                    />
                  </div>
                </div>

                {/* Standard Reference */}
                <div className="flex items-center gap-2 text-[#45464d] text-xs pt-1 border-t border-gray-100">
                  <span className="material-symbols-outlined text-[16px] text-gray-500">
                    rule
                  </span>
                  <span>{inspection.analysis.standardRef}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-4 border-t border-[#c6c6cd]/30 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={() => {
                setDismissed(true);
                setTimeout(() => setDismissed(false), 2000);
              }}
              className="px-6 py-2.5 rounded-lg border border-[#c6c6cd] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors text-xs font-bold w-full sm:w-auto"
            >
              {dismissed ? 'Dismissed' : 'Dismiss'}
            </button>

            <button
              onClick={handleCreateAction}
              disabled={actionCreated}
              className="px-6 py-2.5 rounded-lg bg-[#0F172A] text-white hover:bg-[#1e293b] transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto disabled:bg-emerald-700"
            >
              <span className="material-symbols-outlined text-[18px]">
                {actionCreated ? 'check_circle' : 'add_task'}
              </span>
              {actionCreated ? 'Corrective Action Dispatched!' : 'Create Corrective Action'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
