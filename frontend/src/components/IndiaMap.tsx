import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NavigationTab } from '../types';
import { geocodeLocation } from '../services/nominatim';

interface IndiaMapProps {
  onSelectMine: (mineId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

interface MineLocation {
  id: string;
  name: string;
  state: string;
  mineType: string;
  riskScore: number;
  complianceScore: number;
  openIssues: number;
  status: 'critical' | 'warning' | 'nominal';
  lat?: number;
  lng?: number;
}

const MINE_LOCATIONS: MineLocation[] = [
  {
    id: 'mine-a',
    name: 'Jharia Main Colliery',
    state: 'Jharkhand',
    mineType: 'UG',
    riskScore: 78,
    complianceScore: 74,
    openIssues: 6,
    status: 'critical',
    lat: 23.7466,
    lng: 86.4154,
  },
  {
    id: 'site-beta',
    name: 'Raniganj Eastern Block',
    state: 'West Bengal',
    mineType: 'OC',
    riskScore: 24,
    complianceScore: 91,
    openIssues: 1,
    status: 'nominal',
    lat: 23.6190,
    lng: 87.0805,
  },
  {
    id: 'blackwood-north',
    name: 'Korba Deep Mine',
    state: 'Chhattisgarh',
    mineType: 'UG',
    riskScore: 84,
    complianceScore: 74,
    openIssues: 8,
    status: 'critical',
    lat: 22.3595,
    lng: 82.7501,
  },
  {
    id: 'ironridge-alpha',
    name: 'Singrauli North Extension',
    state: 'Madhya Pradesh',
    mineType: 'OC',
    riskScore: 56,
    complianceScore: 98,
    openIssues: 3,
    status: 'warning',
    lat: 24.1981,
    lng: 82.6684,
  },
  {
    id: 'silvercreek',
    name: 'Godavari Valley Block III',
    state: 'Telangana',
    mineType: 'OC',
    riskScore: 38,
    complianceScore: 86,
    openIssues: 2,
    status: 'nominal',
    lat: 17.5186,
    lng: 80.6104,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical': return '#ba1a1a';
    case 'warning': return '#f59e0b';
    case 'nominal': return '#10B981';
    default: return '#515f74';
  }
};

const createCustomIcon = (status: string) => {
  const color = getStatusColor(status);
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 24px;
          height: 24px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
        ${status === 'critical' ? `
          <div style="
            position: absolute;
            top: -4px;
            left: -4px;
            width: 32px;
            height: 32px;
            border: 2px solid ${color};
            border-radius: 50%;
            animation: pulse 1.5s infinite;
            opacity: 0.6;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const MapController = () => {
  const map = useMap();
  React.useEffect(() => {
    map.setView([22.5, 80.5], 5);
  }, [map]);
  return null;
};

export const IndiaMap: React.FC<IndiaMapProps> = ({ onSelectMine, onNavigate }) => {
  const [selectedMine, setSelectedMine] = useState<MineLocation | null>(null);
  const [resolvedCoords, setResolvedCoords] = useState<Record<string, { lat: number; lng: number }>>({});
  const [geocodingIds, setGeocodingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const missing = MINE_LOCATIONS.filter(m => m.lat == null || m.lng == null);
    if (missing.length === 0) return;

    const resolveCoordinates = async () => {
      for (const mine of missing) {
        setGeocodingIds(prev => new Set(prev).add(mine.id));
        const result = await geocodeLocation(`${mine.name}, ${mine.state}`);
        if (result) {
          setResolvedCoords(prev => ({ ...prev, [mine.id]: result }));
        }
        setGeocodingIds(prev => {
          const next = new Set(prev);
          next.delete(mine.id);
          return next;
        });
      }
    };

    resolveCoordinates();
  }, []);

  const getCoords = (mine: MineLocation): [number, number] | null => {
    if (mine.lat != null && mine.lng != null) {
      return [mine.lat, mine.lng];
    }
    const resolved = resolvedCoords[mine.id];
    if (resolved) {
      return [resolved.lat, resolved.lng];
    }
    return null;
  };

  const handleMarkerClick = (mine: MineLocation) => {
    setSelectedMine(mine);
    onSelectMine(mine.id);
  };

  return (
    <div className="relative w-full h-full">
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .leaflet-container {
          font-family: inherit;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 0;
          min-width: 200px;
        }
      `}</style>

      <MapContainer
        center={[22.5, 80.5]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController />

        {MINE_LOCATIONS.map((mine) => {
          const coords = getCoords(mine);
          if (!coords) return null;

          return (
            <Marker
              key={mine.id}
              position={coords}
              icon={createCustomIcon(mine.status)}
              eventHandlers={{
                click: () => handleMarkerClick(mine),
              }}
            >
            <Popup>
              <div className="p-2 min-w-[220px]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{mine.name}</h4>
                    <p className="text-xs text-gray-500">{mine.state}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      mine.status === 'critical' ? 'bg-red-100 text-red-800' :
                      mine.status === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {mine.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500 text-[10px]">Type</span>
                    <p className="font-bold text-gray-900">{mine.mineType === 'UG' ? 'Underground' : 'Open Cast'}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500 text-[10px]">Risk Score</span>
                    <p className={`font-bold ${mine.riskScore > 70 ? 'text-red-600' : mine.riskScore > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {mine.riskScore}/100
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500 text-[10px]">Compliance</span>
                    <p className={`font-bold ${mine.complianceScore < 80 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {mine.complianceScore}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500 text-[10px]">Open Issues</span>
                    <p className="font-bold text-gray-900">{mine.openIssues}</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('mines')}
                  className="w-full py-2 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1e293b] transition-colors"
                >
                  View Full Details
                </button>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 p-3 z-[1000]">
        <div className="text-[10px] font-bold uppercase text-gray-500 mb-2">Risk Level</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ba1a1a] border-2 border-white shadow-sm"></span>
            <span className="text-[11px] text-gray-700">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b] border-2 border-white shadow-sm"></span>
            <span className="text-[11px] text-gray-700">Attention</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-white shadow-sm"></span>
            <span className="text-[11px] text-gray-700">Low Risk</span>
          </div>
        </div>
      </div>

      {/* Selected Mine Info Panel */}
      {selectedMine && (
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-[1000] min-w-[240px] animate-in fade-in slide-in-from-right duration-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-sm text-gray-900">{selectedMine.name}</h4>
              <p className="text-xs text-gray-500">{selectedMine.state} • {selectedMine.mineType === 'UG' ? 'Underground' : 'Open Cast'} Mine</p>
            </div>
            <button
              onClick={() => setSelectedMine(null)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <span className="material-symbols-outlined text-[16px] text-gray-500">close</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-[10px] font-bold uppercase text-gray-500">Risk Score</div>
              <div className={`text-lg font-extrabold ${
                selectedMine.riskScore > 70 ? 'text-red-600' : selectedMine.riskScore > 40 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {selectedMine.riskScore}
              </div>
              <div className="text-[9px] text-gray-500">/100</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-[10px] font-bold uppercase text-gray-500">Compliance</div>
              <div className={`text-lg font-extrabold ${
                selectedMine.complianceScore < 80 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {selectedMine.complianceScore}%
              </div>
              <div className="text-[9px] text-gray-500">DGMS</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">Open Issues</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-gray-900">{selectedMine.openIssues}</span>
              <span className="text-[10px] text-gray-500">Pending Actions</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('mines')}
              className="flex-1 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1e293b] transition-colors"
            >
              View Details
            </button>
            <button
              onClick={() => onNavigate('compliance')}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              Compliance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
