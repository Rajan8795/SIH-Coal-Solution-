import React, { useMemo } from 'react';

// Prototype 30-day compliance trend data (India-focused, CoalGuard demo).
// Values represent the daily network compliance score (%) across all monitored mines.
const COMPLIANCE_TREND_30D: number[] = [
  86.1, 87.4, 85.9, 88.2, 89.0, 88.6, 90.1, 89.7, 90.8, 91.2,
  90.5, 91.8, 92.3, 91.6, 93.0, 92.7, 93.4, 94.0, 93.2, 92.8,
  93.6, 94.1, 93.8, 94.4, 93.9, 94.6, 94.0, 94.2, 93.7, 94.0
];

interface SafetyIncidentDatum {
  category: string;
  count: number;
  color: string;
}

// Prototype safety incident breakdown for CoalGuard (Q3, India operations).
const SAFETY_INCIDENTS_BY_TYPE: SafetyIncidentDatum[] = [
  { category: 'Ventilation Findings', count: 6, color: '#ba1a1a' },
  { category: 'Conveyor & Mechanical', count: 4, color: '#f59e0b' },
  { category: 'Combustible Dust', count: 3, color: '#515f74' },
  { category: 'Contractor Cert. Lapses', count: 1, color: '#10B981' }
];

const formatDayLabel = (idx: number): string => {
  const daysAgo = 29 - idx;
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export const ComplianceTrendChart: React.FC = () => {
  const data = COMPLIANCE_TREND_30D;
  const { points, areaPath, linePath, minY, maxY, ticks } = useMemo(() => {
    const width = 520;
    const height = 180;
    const padX = 36;
    const padY = 18;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;
    const minVal = 80;
    const maxVal = 100;
    const stepX = innerW / (data.length - 1);
    const toY = (v: number) => padY + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;
    const pts = data.map((v, i) => ({ x: padX + i * stepX, y: toY(v), value: v }));
    const lineD = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');
    const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(2)} ${(height - padY).toFixed(2)} L ${pts[0].x.toFixed(2)} ${(height - padY).toFixed(2)} Z`;
    const gridTicks = [80, 85, 90, 95, 100];
    return {
      points: pts,
      linePath: lineD,
      areaPath: areaD,
      minY: minVal,
      maxY: maxVal,
      ticks: gridTicks
    };
  }, [data]);

  const lastValue = data[data.length - 1];
  const firstValue = data[0];
  const peakValue = Math.max(...data);
  const peakIdx = data.indexOf(peakValue);

  return (
    <div className="flex-1 w-full relative">
      <svg
        viewBox="0 0 520 180"
        preserveAspectRatio="none"
        className="w-full h-full"
        role="img"
        aria-label="30-day compliance trend line chart"
      >
        <defs>
          <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {ticks.map((t) => {
          const y = 18 + (180 - 36) - ((t - minY) / (maxY - minY)) * (180 - 36);
          return (
            <g key={t}>
              <line x1={36} x2={520 - 36} y1={y} y2={y} stroke="#e6e8ea" strokeWidth={1} />
              <text x={4} y={y + 3} fontSize={9} fill="#9aa0a6" fontFamily="monospace">
                {t}%
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#complianceGradient)" />
        <path d={linePath} fill="none" stroke="#10B981" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => {
          if (i % 5 !== 0 && i !== points.length - 1) return null;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={2.5} fill="#10B981" />
              <title>{`Day ${i + 1}: ${p.value.toFixed(1)}%`}</title>
            </g>
          );
        })}

        {(() => {
          const peak = points[peakIdx];
          return (
            <g>
              <circle cx={peak.x} cy={peak.y} r={4} fill="#fff" stroke="#10B981" strokeWidth={2} />
              <title>{`Peak: ${peakValue.toFixed(1)}%`}</title>
            </g>
          );
        })()}

        <text x={36} y={170} fontSize={9} fill="#9aa0a6" fontFamily="monospace">
          {formatDayLabel(0)}
        </text>
        <text x={520 / 2 - 12} y={170} fontSize={9} fill="#9aa0a6" fontFamily="monospace">
          {formatDayLabel(14)}
        </text>
        <text x={520 - 36 - 24} y={170} fontSize={9} fill="#9aa0a6" fontFamily="monospace">
          {formatDayLabel(29)}
        </text>
      </svg>

      <div className="absolute top-1 left-2 text-[9px] font-mono text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">
        Start: {firstValue.toFixed(1)}%
      </div>
      <div className="absolute top-1 right-2 text-[9px] font-mono text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded">
        Now: {lastValue.toFixed(1)}%
      </div>
    </div>
  );
};

export const SafetyIncidentsChart: React.FC = () => {
  const data = SAFETY_INCIDENTS_BY_TYPE;
  const maxCount = Math.max(...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);
  const width = 520;
  const height = 180;
  const padX = 110;
  const padY = 14;
  const rowH = (height - padY * 2) / data.length;
  const barH = Math.min(22, rowH - 10);
  const trackW = width - padX - 16;

  return (
    <div className="flex-1 w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        role="img"
        aria-label="Safety incidents by type horizontal bar chart"
      >
        {data.map((d, i) => {
          const w = (d.count / maxCount) * trackW;
          const y = padY + i * rowH + (rowH - barH) / 2;
          return (
            <g key={d.category}>
              <text x={padX - 8} y={y + barH / 2 + 3} fontSize={10} fill="#191c1e" textAnchor="end" fontWeight={600}>
                {d.category}
              </text>
              <rect x={padX} y={y} width={trackW} height={barH} rx={4} fill="#f2f4f6" />
              <rect x={padX} y={y} width={Math.max(2, w)} height={barH} rx={4} fill={d.color}>
                <title>{`${d.category}: ${d.count} incident${d.count === 1 ? '' : 's'}`}</title>
              </rect>
              <text x={padX + Math.max(2, w) + 6} y={y + barH / 2 + 3} fontSize={10} fill="#191c1e" fontFamily="monospace" fontWeight={700}>
                {d.count}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-1 right-2 text-[9px] font-mono text-gray-700 bg-white/80 px-1.5 py-0.5 rounded">
        Total: {total} Events
      </div>
    </div>
  );
};