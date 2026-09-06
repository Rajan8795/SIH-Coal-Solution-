import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Mine, NavigationTab } from '../types';

interface IndiaMapProps {
  mines: Mine[];
  onSelectMine?: (mineId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export interface StateRiskAggregate {
  stateName: string;
  code: string;
  lat: number;
  lng: number;
  totalMines: number;
  avgRiskScore: number | null;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  insufficientCount: number;
  avgEvidenceCoverage: number | null;
  dominantCategory: 'CRITICAL / HIGH' | 'ATTENTION / MEDIUM' | 'LOW' | 'INSUFFICIENT EVIDENCE';
}

const STATE_CENTROIDS: Record<string, { lat: number; lng: number; code: string }> = {
  'Jharkhand': { lat: 23.6102, lng: 85.2799, code: 'JH' },
  'West Bengal': { lat: 22.9868, lng: 87.8550, code: 'WB' },
  'Odisha': { lat: 20.9517, lng: 85.0985, code: 'OR' },
  'Chhattisgarh': { lat: 21.2787, lng: 81.8661, code: 'CG' },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569, code: 'MP' },
  'Maharashtra': { lat: 19.7515, lng: 75.7139, code: 'MH' },
  'Telangana': { lat: 18.1124, lng: 79.0193, code: 'TS' },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, code: 'UP' },
  'Assam': { lat: 26.2006, lng: 92.9376, code: 'AS' },
  'Jammu & Kashmir': { lat: 33.7782, lng: 76.5762, code: 'JK' },
  'Jammu and Kashmir': { lat: 33.7782, lng: 76.5762, code: 'JK' },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569, code: 'TN' },
  'Gujarat': { lat: 22.2587, lng: 71.1924, code: 'GJ' },
  'Rajasthan': { lat: 27.0238, lng: 74.2179, code: 'RJ' },
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400, code: 'AP' },
  'Meghalaya': { lat: 25.4670, lng: 91.3662, code: 'ML' },
  'Nagaland': { lat: 26.1584, lng: 94.5624, code: 'NL' },
};

const getCategoryColor = (cat: StateRiskAggregate['dominantCategory']) => {
  switch (cat) {
    case 'CRITICAL / HIGH':
      return {
        bg: '#dc2626',
        border: '#991b1b',
        text: '#ffffff',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-800',
      };
    case 'ATTENTION / MEDIUM':
      return {
        bg: '#f59e0b',
        border: '#b45309',
        text: '#ffffff',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
      };
    case 'LOW':
      return {
        bg: '#10b981',
        border: '#047857',
        text: '#ffffff',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800',
      };
    default:
      return {
        bg: '#64748b',
        border: '#334155',
        text: '#ffffff',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-800',
      };
  }
};

const createStateBubbleIcon = (state: StateRiskAggregate) => {
  const colors = getCategoryColor(state.dominantCategory);
  // Size range ~20px to ~42px proportional to mine count
  const size = Math.max(20, Math.min(42, Math.round(18 + Math.sqrt(state.totalMines) * 2.2)));

  return L.divIcon({
    className: 'custom-state-bubble',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${colors.bg};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 3px 8px rgba(0,0,0,0.22);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: ${colors.text};
        font-family: system-ui, -apple-system, sans-serif;
        cursor: pointer;
        transition: transform 0.15s ease;
      ">
        <span style="font-size: ${size > 30 ? '9px' : '8px'}; font-weight: 800; line-height: 1; letter-spacing: -0.02em;">
          ${state.code}
        </span>
        <span style="font-size: ${size > 30 ? '10px' : '8px'}; font-weight: 900; line-height: 1; margin-top: 1px;">
          ${state.totalMines}
        </span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const MapControls: React.FC<{
  onReset: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}> = ({ onReset, onToggleFullscreen, isFullscreen }) => {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-[1000]">
      <button
        onClick={() => map.zoomIn()}
        title="Zoom In (+)"
        className="w-8 h-8 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-black active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
      </button>
      <button
        onClick={() => map.zoomOut()}
        title="Zoom Out (−)"
        className="w-8 h-8 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-black active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-[18px]">remove</span>
      </button>
      <button
        onClick={() => {
          map.setView([22.5, 80.0], 5);
          onReset();
        }}
        title="Reset India View"
        className="w-8 h-8 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-black active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
      </button>
      <button
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        className="w-8 h-8 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-black active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
        </span>
      </button>
    </div>
  );
};

export const IndiaMap: React.FC<IndiaMapProps> = ({ mines, onNavigate }) => {
  const [, setSelectedState] = useState<StateRiskAggregate | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mappls Token Configuration
  const mapplsToken =
    (import.meta as unknown as { env?: Record<string, string> }).env
      ?.VITE_MAPPLS_ACCESS_TOKEN || '';
  const tileUrl = mapplsToken
    ? `https://apis.mappls.com/advancedmaps/v1/${mapplsToken}/tile/{z}/{x}/{y}.png`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = mapplsToken
    ? '&copy; <a href="https://www.mappls.com/">Mappls / MapmyIndia</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Aggregate real 408 mines by state dynamically
  const stateAggregates = useMemo(() => {
    const mapByName: Record<string, {
      total: number;
      sumRisk: number;
      riskCount: number;
      high: number;
      medium: number;
      low: number;
      insufficient: number;
      sumCoverage: number;
      coverageCount: number;
    }> = {};

    mines.forEach((mine) => {
      const rawState = mine.state || mine.location || 'Other';
      let stateName = rawState.trim();
      if (stateName === 'Jammu and Kashmir') stateName = 'Jammu & Kashmir';

      if (!mapByName[stateName]) {
        mapByName[stateName] = {
          total: 0,
          sumRisk: 0,
          riskCount: 0,
          high: 0,
          medium: 0,
          low: 0,
          insufficient: 0,
          sumCoverage: 0,
          coverageCount: 0,
        };
      }

      const entry = mapByName[stateName];
      entry.total += 1;

      if (mine.riskScore != null) {
        entry.sumRisk += mine.riskScore;
        entry.riskCount += 1;
      }

      const cat = (mine.riskCategory || '').toUpperCase();
      const prio = (mine.inspectionPriority || '').toUpperCase();

      if (cat === 'HIGH' || cat === 'CRITICAL' || prio === 'URGENT' || prio === 'HIGH') {
        entry.high += 1;
      } else if (cat === 'MEDIUM' || cat === 'ATTENTION' || prio === 'MEDIUM') {
        entry.medium += 1;
      } else if (cat === 'LOW' || prio === 'LOW') {
        entry.low += 1;
      } else {
        entry.insufficient += 1;
      }

      if (mine.evidenceCoverage != null) {
        entry.sumCoverage += mine.evidenceCoverage;
        entry.coverageCount += 1;
      }
    });

    const results: StateRiskAggregate[] = [];

    Object.entries(mapByName).forEach(([stateName, data]) => {
      const centroid = STATE_CENTROIDS[stateName] || {
        lat: 22.5,
        lng: 80.0,
        code: stateName.substring(0, 2).toUpperCase(),
      };
      const avgRisk = data.riskCount > 0 ? Number((data.sumRisk / data.riskCount).toFixed(1)) : null;
      const avgCoverage = data.coverageCount > 0 ? Number((data.sumCoverage / data.coverageCount).toFixed(1)) : null;

      let dominantCategory: StateRiskAggregate['dominantCategory'] = 'LOW';
      if (data.high > 0 || (avgRisk !== null && avgRisk >= 40)) {
        dominantCategory = 'CRITICAL / HIGH';
      } else if (data.medium > 0 || (avgRisk !== null && avgRisk >= 20)) {
        dominantCategory = 'ATTENTION / MEDIUM';
      } else if (data.low > 0) {
        dominantCategory = 'LOW';
      } else {
        dominantCategory = 'INSUFFICIENT EVIDENCE';
      }

      results.push({
        stateName,
        code: centroid.code,
        lat: centroid.lat,
        lng: centroid.lng,
        totalMines: data.total,
        avgRiskScore: avgRisk,
        highCount: data.high,
        mediumCount: data.medium,
        lowCount: data.low,
        insufficientCount: data.insufficient,
        avgEvidenceCoverage: avgCoverage,
        dominantCategory,
      });
    });

    return results.sort((a, b) => b.totalMines - a.totalMines);
  }, [mines]);

  // Overall summary metrics across all real mines
  const totalAssessed = mines.length;
  const statesCovered = stateAggregates.length;
  const totalHigh = mines.filter(
    (m) =>
      m.riskCategory === 'HIGH' ||
      m.riskCategory === 'CRITICAL' ||
      m.inspectionPriority === 'URGENT' ||
      m.inspectionPriority === 'HIGH'
  ).length;
  const totalMedium = mines.filter(
    (m) =>
      m.riskCategory === 'MEDIUM' ||
      m.riskCategory === 'ATTENTION' ||
      m.inspectionPriority === 'MEDIUM'
  ).length;
  const totalLow = mines.filter(
    (m) =>
      m.riskCategory === 'LOW' ||
      m.inspectionPriority === 'LOW' ||
      (!m.riskCategory && !m.inspectionPriority)
  ).length;

  // Top 3 attention states ranked by highCount then avgRiskScore
  const topAttentionStates = useMemo(() => {
    return [...stateAggregates]
      .sort((a, b) => {
        if (b.highCount !== a.highCount) return b.highCount - a.highCount;
        return (b.avgRiskScore ?? 0) - (a.avgRiskScore ?? 0);
      })
      .slice(0, 3);
  }, [stateAggregates]);

  const mapContent = (
    <div className={`flex flex-col w-full bg-white rounded-xl overflow-hidden border border-slate-200/80 industrial-shadow ${isFullscreen ? 'h-full' : 'h-full'}`}>
      <style>{`
        .custom-state-bubble {
          background: transparent;
          border: none;
        }
        .leaflet-container {
          font-family: inherit;
          background: #f8fafc;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1);
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
          min-width: 240px;
        }
      `}</style>

      {/* Header Section */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-[#0F172A] uppercase">
              INDIA COAL MINE RISK INTELLIGENCE
            </h3>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-200 rounded text-[9px] font-black uppercase tracking-wider">
              STATE-LEVEL VIEW
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            "AI-derived state-level risk distribution across {mines.length} assessed mines"
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="tracking-wider text-[10px]">LIVE DATA</span>
            <span className="text-slate-400">|</span>
            <span className="text-[10px]">{totalAssessed} MINES</span>
            <span className="text-slate-400">|</span>
            <span className="text-[10px]">{statesCovered} STATES</span>
          </div>
        </div>
      </div>

      {/* Top Intelligence Metrics Strip */}
      <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-slate-50/80 border-b border-slate-200/80">
        <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs text-center">
          <span className="font-mono text-base sm:text-lg font-extrabold text-slate-900">{totalAssessed}</span>
          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">MINES ASSESSED</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs text-center">
          <span className="font-mono text-base sm:text-lg font-extrabold text-slate-900">{statesCovered}</span>
          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">STATES</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-red-200/80 shadow-2xs text-center">
          <span className="font-mono text-base sm:text-lg font-extrabold text-red-600">{totalHigh}</span>
          <span className="text-[9px] font-extrabold text-red-600 uppercase tracking-wider">HIGH / CRITICAL</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-amber-200/80 shadow-2xs text-center">
          <span className="font-mono text-base sm:text-lg font-extrabold text-amber-600">{totalMedium}</span>
          <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider">ATTENTION</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-emerald-200/80 shadow-2xs text-center">
          <span className="font-mono text-base sm:text-lg font-extrabold text-emerald-600">{totalLow}</span>
          <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider">LOW</span>
        </div>
      </div>

      {/* Map Body (approx 65-70% height focus) */}
      <div className="relative flex-1 min-h-[380px] sm:min-h-[420px] w-full">
        {/* Data Integrity Badge */}
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 max-w-[calc(100%-140px)] sm:max-w-none">
          <span className="material-symbols-outlined text-xs text-indigo-600">verified_user</span>
          <span className="text-[10px] font-bold text-slate-700 tracking-wide truncate">
            State-level view • Source dataset does not provide mine-level GPS
          </span>
        </div>

        <MapContainer
          center={[22.5, 80.0]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={false}
        >
          <TileLayer attribution={tileAttribution} url={tileUrl} />
          <MapControls
            onReset={() => setSelectedState(null)}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            isFullscreen={isFullscreen}
          />

          {stateAggregates.map((state) => {
            const colors = getCategoryColor(state.dominantCategory);

            return (
              <Marker
                key={state.stateName}
                position={[state.lat, state.lng]}
                icon={createStateBubbleIcon(state)}
                eventHandlers={{
                  click: () => {
                    setSelectedState(state);
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="px-2 py-1 text-xs font-bold text-slate-900">
                    {state.stateName} • {state.totalMines} Mines (Avg Risk: {state.avgRiskScore !== null ? state.avgRiskScore : 'N/A'})
                  </div>
                </Tooltip>

                <Popup>
                  <div className="p-3.5 min-w-[240px] font-sans">
                    <div className="flex justify-between items-start mb-2.5 pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 block">
                          STATE INTELLIGENCE
                        </span>
                        <h4 className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">
                          {state.stateName}
                        </h4>
                        <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                          {state.totalMines} Mines Assessed
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${colors.badgeBg} ${colors.badgeText}`}
                      >
                        {state.dominantCategory}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                        <span className="text-slate-500 text-[10px] uppercase font-extrabold">
                          AI Risk Score
                        </span>
                        <span
                          className={`font-mono text-base font-extrabold ${
                            state.avgRiskScore && state.avgRiskScore >= 40
                              ? 'text-red-600'
                              : state.avgRiskScore && state.avgRiskScore >= 20
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {state.avgRiskScore !== null ? `${state.avgRiskScore} / 100` : 'N/A'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs space-y-1">
                        <span className="text-slate-500 text-[9px] uppercase font-extrabold block mb-1">
                          Risk Distribution
                        </span>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-slate-600">HIGH / CRITICAL</span>
                          <span className="font-mono font-extrabold text-red-600">{state.highCount}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-slate-600">ATTENTION</span>
                          <span className="font-mono font-extrabold text-amber-600">{state.mediumCount}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-slate-600">LOW</span>
                          <span className="font-mono font-extrabold text-emerald-600">{state.lowCount}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-slate-600">INSUFFICIENT</span>
                          <span className="font-mono font-extrabold text-slate-500">{state.insufficientCount}</span>
                        </div>
                      </div>

                      {state.avgEvidenceCoverage !== null && (
                        <div className="bg-indigo-50/70 p-2 rounded-lg border border-indigo-100/80 text-[11px]">
                          <div className="flex justify-between items-center text-indigo-950 font-bold">
                            <span>Evidence Coverage:</span>
                            <span>{state.avgEvidenceCoverage}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onNavigate('mines')}
                      className="w-full py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1e293b] transition-colors flex items-center justify-center gap-2 shadow-xs uppercase tracking-wider"
                    >
                      <span>VIEW MINE INTELLIGENCE</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Compact Floating Risk Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/90 p-2.5 z-[1000] text-xs">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
            AI RISK LEVEL
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] border-2 border-white shadow-2xs"></span>
              <span className="text-[11px] font-bold text-slate-700">CRITICAL / HIGH</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border-2 border-white shadow-2xs"></span>
              <span className="text-[11px] font-bold text-slate-700">ATTENTION / MEDIUM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-white shadow-2xs"></span>
              <span className="text-[11px] font-bold text-slate-700">LOW</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64748b] border-2 border-white shadow-2xs"></span>
              <span className="text-[11px] font-bold text-slate-700">INSUFFICIENT EVIDENCE</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Intelligence Strip Below Map */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            RISK DISTRIBUTION
          </span>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-red-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              High/Critical: {totalHigh}
            </span>
            <span className="text-amber-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Attention: {totalMedium}
            </span>
            <span className="text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Low: {totalLow}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            TOP ATTENTION STATES:
          </span>
          <div className="flex items-center gap-2">
            {topAttentionStates.map((st) => (
              <span
                key={st.stateName}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-bold text-[11px] text-slate-800 flex items-center gap-1.5 shadow-2xs"
              >
                <span>{st.stateName}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-100 text-red-800 font-mono">
                  {st.highCount} High
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md p-4 sm:p-6 flex flex-col animate-in fade-in duration-200">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setIsFullscreen(false)}
            className="px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            Exit Fullscreen
          </button>
        </div>
        <div className="flex-1 overflow-hidden">{mapContent}</div>
      </div>
    );
  }

  return mapContent;
};

export default IndiaMap;
