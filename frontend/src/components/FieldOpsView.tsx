import React, { useState, useEffect, useRef } from 'react';
import { FieldInspection, NavigationTab } from '../types';
import { ASSETS } from '../data/mockData';

interface FieldOpsViewProps {
  inspection: FieldInspection;
  onNavigate: (tab: NavigationTab) => void;
  onCreateCorrectiveAction: (inspection: FieldInspection) => void;
}

const LOCATION_OPTIONS = [
  { name: 'Sector 4 - Conveyor Belt B', gps: '23.7466° N, 86.4154° E', status: 'Verified' },
  { name: 'Main Shaft 2G - Intake Fan', gps: '23.7480° N, 86.4170° E', status: 'Pending Audit' },
  { name: 'Sub-Level 3 - Explosives Magazine', gps: '23.7450° N, 86.4140° E', status: 'Compliant' },
];

export const FieldOpsView: React.FC<FieldOpsViewProps> = ({
  inspection,
  onNavigate,
  onCreateCorrectiveAction,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(() => {
    try {
      const saved = localStorage.getItem('fieldOpsStep');
      const step = saved ? parseInt(saved, 10) : 1;
      if (step === 3) return 2;
      if (step >= 1 && step <= 2) return step as 1 | 2 | 3;
    } catch {}
    return 1;
  });

  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    try {
      return localStorage.getItem('fieldOpsLocation') || '';
    } catch {
      return '';
    }
  });

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [observationText, setObservationText] = useState<string>(() => {
    try {
      return localStorage.getItem('fieldOpsObservation') || '';
    } catch {
      return '';
    }
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [dismissed, setDismissed] = useState(false);
  const [actionCreated, setActionCreated] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('fieldOpsStep', String(activeStep));
    } catch {}
  }, [activeStep]);

  useEffect(() => {
    try {
      localStorage.setItem('fieldOpsLocation', selectedLocation);
    } catch {}
  }, [selectedLocation]);

  useEffect(() => {
    try {
      localStorage.setItem('fieldOpsObservation', observationText);
    } catch {}
  }, [observationText]);

  useEffect(() => {
    if (activeStep === 3 && isAnalyzing) {
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeStep, isAnalyzing]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleSelectLocation = (locName: string) => {
    setSelectedLocation(locName);
  };

  const goToStep = (step: 1 | 2 | 3) => {
    if (step === 2 && !selectedLocation) return;
    if (step === 3 && (!selectedLocation || !capturedImage)) return;
    setActiveStep(step);
  };

  const handleProceedToCapture = () => {
    if (!selectedLocation) return;
    setActiveStep(2);
  };

  const handleProceedToAnalysis = () => {
    if (!selectedLocation || !capturedImage) return;
    setActiveStep(3);
    setIsAnalyzing(true);
  };

  const handleBackToLocation = () => {
    setActiveStep(1);
  };

  const handleBackToCapture = () => {
    setActiveStep(2);
  };

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser. File upload is available below.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setVideoStream(stream);
      setIsCameraOpen(true);
    } catch {
      setCameraError('Camera permission denied or unavailable. File upload is available below.');
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setVideoStream(null);
    setIsCameraOpen(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCameraError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateAction = () => {
    setActionCreated(true);
    onCreateCorrectiveAction({
      ...inspection,
      notes: observationText || inspection.notes,
      location: selectedLocation || inspection.location,
    });
  };

  const displayNotes = observationText || inspection.notes;
  const displayImage = capturedImage || inspection.imageUrl;
  const selectedLocObj = LOCATION_OPTIONS.find((l) => l.name === selectedLocation);
  const displayGps = selectedLocObj?.gps || inspection.gpsText;

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
          onClick={() => goToStep(1)}
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
            {activeStep > 1 ? (
              <span className="material-symbols-outlined text-[16px]">check</span>
            ) : (
              '1'
            )}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mt-1 group-hover:text-black">
            Location
          </span>
        </button>

        <div className="h-[2px] bg-gray-300 flex-1 mx-2" />

        <button
          onClick={() => goToStep(2)}
          disabled={!selectedLocation || activeStep < 2}
          className={`flex flex-col items-center flex-1 cursor-pointer group ${
            !selectedLocation || activeStep < 2 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
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
            {activeStep > 2 ? (
              <span className="material-symbols-outlined text-[16px]">check</span>
            ) : (
              '2'
            )}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mt-1 group-hover:text-black">
            Capture
          </span>
        </button>

        <div className="h-[2px] bg-gray-300 flex-1 mx-2" />

        <button
          onClick={() => goToStep(3)}
          disabled={!selectedLocation || !capturedImage}
          className={`flex flex-col items-center flex-1 cursor-pointer group ${
            !selectedLocation || !capturedImage ? 'opacity-50 cursor-not-allowed' : ''
          }`}
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
            {LOCATION_OPTIONS.map((loc) => (
              <div
                key={loc.name}
                onClick={() => handleSelectLocation(loc.name)}
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

          {selectedLocation && (
            <div className="flex items-center gap-2 p-3 bg-[#f0fdf4] rounded-lg border border-[#bbf7d0]">
              <span className="material-symbols-outlined text-emerald-600 text-sm">
                check_circle
              </span>
              <div>
                <p className="text-xs font-bold text-emerald-800">Location Selected</p>
                <p className="text-xs text-emerald-700">{selectedLocation}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleProceedToCapture}
            disabled={!selectedLocation}
            className="w-full py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1e293b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Camera Capture →
          </button>
        </div>
      )}

      {/* STEP 2 VIEW (Capture Mode) */}
      {activeStep === 2 && (
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Live Optical Capture - {selectedLocation}
          </h3>

          {cameraError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-red-600 text-sm mt-0.5">
                warning
              </span>
              <p className="text-xs text-red-700 leading-relaxed">
                {cameraError}
              </p>
            </div>
          )}

          {/* Camera Live Preview */}
          {isCameraOpen && videoStream && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 rounded-xl object-cover border-2 border-gray-300"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                <button
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#1e293b] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">camera</span>
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Capture / Upload Options (shown when no image and camera not open) */}
          {!capturedImage && !isCameraOpen && (
            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full py-3 bg-[#0F172A] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1e293b] transition-colors"
              >
                <span className="material-symbols-outlined text-base">camera_alt</span>
                Open Camera
              </button>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex-1 h-px bg-gray-300" />
                <span>OR</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border border-[#e0e3e5] text-[#191c1e] rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#f2f4f6] transition-colors"
              >
                <span className="material-symbols-outlined text-base">upload</span>
                Upload Image
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Image Preview */}
          {capturedImage && (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured evidence"
                className="w-full h-64 rounded-xl object-cover border-2 border-gray-200"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={retakePhoto}
                  className="p-1 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 transition-colors"
                  title="Remove / Retake"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <button
                  onClick={retakePhoto}
                  className="px-3 py-1 bg-[#0F172A]/85 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#0F172A] transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">redo</span>
                  Retake
                </button>
              </div>
            </div>
          )}

          {/* Observation Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <span className="material-symbols-outlined text-gray-400 text-sm">description</span>
              Observation Description
            </label>
            <textarea
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              placeholder="Excessive coal dust accumulation near conveyor drive motor..."
              className="w-full p-2.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-black bg-white placeholder:text-gray-400 resize-none"
              rows={3}
            />
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleBackToLocation}
              className="px-6 py-2.5 rounded-lg border border-[#c6c6cd] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors text-xs font-bold"
            >
              Back
            </button>
            <button
              onClick={handleProceedToAnalysis}
              disabled={!selectedLocation || !capturedImage}
              className="flex-1 py-2.5 bg-[#6366F1] text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">psychology</span>
              Proceed to Analysis →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 VIEW (Analysis) */}
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
                  {selectedLocation || inspection.location}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-[#45464d]">
                    {displayGps}
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
              <div className="p-3.5 border-b border-[#e0e3e5]">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                  Observation Media
                </h3>
              </div>

              <div className="relative w-full h-48 bg-[#f2f4f6]">
                <img
                  src={displayImage}
                  alt="Inspection Conveyor Belt Observation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-[#0F172A]/85 text-white font-mono text-[10px] px-2 py-1 rounded backdrop-blur-xs font-semibold">
                  {inspection.time} — {inspection.date}
                </div>
              </div>

              <div className="p-3.5 bg-[#f7f9fb] flex-1">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-sm mt-0.5">
                    notes
                  </span>
                  <p className="text-xs text-[#45464d] italic leading-relaxed flex-1">
                    "{displayNotes || 'No observation description provided.'}"
                  </p>
                </div>
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

              {isAnalyzing ? (
                <div className="p-4 flex flex-col items-center justify-center space-y-4 flex-1">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6366F1] border-t-transparent"></div>
                  <p className="text-sm font-semibold text-[#6366F1]">Analyzing...</p>
                  <p className="text-xs text-[#45464d] text-center">
                    Running AI Vision diagnostic on captured evidence
                  </p>
                </div>
              ) : (
                <div className="p-4 flex flex-col flex-1 justify-between space-y-3.5">
                  {/* Detected Issue & Severity */}
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col">
                        <h4 className="text-base font-bold text-[#191c1e]">
                          {inspection.analysis.title}
                        </h4>
                        {inspection.analysis.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#e6e8ea] text-[#45464d] text-[10px] font-bold mt-1">
                            {inspection.analysis.category}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ba1a1a]/10 text-[#ba1a1a] text-[10px] font-bold">
                        <span className="material-symbols-outlined text-[13px]">warning</span>
                        {inspection.analysis.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[#45464d] leading-relaxed mt-2">
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

                  {/* Recommended Corrective Action */}
                  {inspection.analysis.recommendedAction && (
                    <div className="bg-[#fef9e7] p-3 rounded-lg border border-[#fef08a] flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5">
                        lightbulb
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">
                          Recommended Corrective Action
                        </p>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          {inspection.analysis.recommendedAction}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-4 border-t border-[#c6c6cd]/30 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleBackToCapture}
              className="px-6 py-2.5 rounded-lg border border-[#c6c6cd] text-[#191c1e] hover:bg-[#f2f4f6] transition-colors text-xs font-bold w-full sm:w-auto"
            >
              Back
            </button>

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
