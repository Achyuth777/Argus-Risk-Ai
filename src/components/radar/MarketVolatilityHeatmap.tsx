import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  Treemap,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Flame,
  Activity,
  Layers,
  Info,
  Maximize2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';
import { RiskTier } from '../../types';

interface PoolNode {
  name: string;
  protocol: string;
  tvl: number; // in Millions USD
  volatility: number; // 24h Realized Volatility %
  impliedVol: number; // Implied Volatility %
  utilization: number; // %
  riskRating: RiskTier;
  children?: PoolNode[];
  [key: string]: any;
}

const HEATMAP_DATA: { name: string; children: PoolNode[] }[] = [
  {
    name: 'Kamino Finance',
    children: [
      {
        name: 'Kamino SOL/USDC Main',
        protocol: 'Kamino',
        tvl: 640,
        volatility: 42.4,
        impliedVol: 48.2,
        utilization: 84.2,
        riskRating: 'WATCH',
      },
      {
        name: 'JitoSOL Leverage Loop',
        protocol: 'Kamino',
        tvl: 310,
        volatility: 21.5,
        impliedVol: 24.0,
        utilization: 76.5,
        riskRating: 'SAFE',
      },
      {
        name: 'KMNO/SOL Multiply',
        protocol: 'Kamino',
        tvl: 84,
        volatility: 78.5,
        impliedVol: 86.2,
        utilization: 94.1,
        riskRating: 'CRITICAL',
      },
      {
        name: 'bSOL Core Reserve',
        protocol: 'Kamino',
        tvl: 110,
        volatility: 22.8,
        impliedVol: 25.4,
        utilization: 52.0,
        riskRating: 'SAFE',
      },
    ],
  },
  {
    name: 'Jupiter',
    children: [
      {
        name: 'JLP Multi-Asset Pool',
        protocol: 'Jupiter',
        tvl: 820,
        volatility: 18.5,
        impliedVol: 21.2,
        utilization: 68.4,
        riskRating: 'SAFE',
      },
      {
        name: 'SOL-USDC Perps Liquidity',
        protocol: 'Jupiter',
        tvl: 210,
        volatility: 54.1,
        impliedVol: 61.5,
        utilization: 88.0,
        riskRating: 'WARNING',
      },
      {
        name: 'JUP Locked Staking',
        protocol: 'Jupiter',
        tvl: 250,
        volatility: 34.2,
        impliedVol: 39.0,
        utilization: 42.1,
        riskRating: 'SAFE',
      },
    ],
  },
  {
    name: 'Drift Protocol',
    children: [
      {
        name: 'Drift SOL-PERP Margin',
        protocol: 'Drift',
        tvl: 280,
        volatility: 58.2,
        impliedVol: 66.4,
        utilization: 91.2,
        riskRating: 'WARNING',
      },
      {
        name: 'JTO-PERP Market',
        protocol: 'Drift',
        tvl: 95,
        volatility: 68.4,
        impliedVol: 74.8,
        utilization: 87.5,
        riskRating: 'HIGH RISK',
      },
      {
        name: 'DRIFT-PERP Market',
        protocol: 'Drift',
        tvl: 52,
        volatility: 72.1,
        impliedVol: 81.0,
        utilization: 82.0,
        riskRating: 'HIGH RISK',
      },
    ],
  },
  {
    name: 'Marginfi',
    children: [
      {
        name: 'SOL Prime Lending',
        protocol: 'Marginfi',
        tvl: 320,
        volatility: 38.6,
        impliedVol: 44.1,
        utilization: 79.2,
        riskRating: 'WATCH',
      },
      {
        name: 'USDT High-Yield Pool',
        protocol: 'Marginfi',
        tvl: 140,
        volatility: 9.4,
        impliedVol: 12.0,
        utilization: 92.4,
        riskRating: 'SAFE',
      },
      {
        name: 'mSOL Collateral Pool',
        protocol: 'Marginfi',
        tvl: 98,
        volatility: 26.4,
        impliedVol: 29.8,
        utilization: 64.0,
        riskRating: 'SAFE',
      },
    ],
  },
  {
    name: 'Raydium & Meteora',
    children: [
      {
        name: 'Raydium SOL-USDC CLMM',
        protocol: 'Raydium',
        tvl: 165,
        volatility: 61.2,
        impliedVol: 69.5,
        utilization: 85.0,
        riskRating: 'WARNING',
      },
      {
        name: 'Meteora DLMM JUP-USDC',
        protocol: 'Meteora',
        tvl: 62,
        volatility: 64.8,
        impliedVol: 72.0,
        utilization: 78.4,
        riskRating: 'WARNING',
      },
      {
        name: 'RAY-SOL Concentrated',
        protocol: 'Raydium',
        tvl: 74,
        volatility: 74.0,
        impliedVol: 84.2,
        utilization: 89.1,
        riskRating: 'HIGH RISK',
      },
    ],
  },
];

// 24H Real-time Volatility Trend data points
const VOLATILITY_TREND_DATA = [
  { time: '00:00', kamino: 38.2, drift: 52.1, jupiter: 18.0, marginfi: 34.5, raydium: 54.0 },
  { time: '04:00', kamino: 40.5, drift: 54.8, jupiter: 18.2, marginfi: 35.8, raydium: 56.2 },
  { time: '08:00', kamino: 44.1, drift: 61.4, jupiter: 19.1, marginfi: 39.2, raydium: 62.0 },
  { time: '12:00', kamino: 48.6, drift: 68.2, jupiter: 21.0, marginfi: 41.5, raydium: 68.5 },
  { time: '16:00', kamino: 45.2, drift: 63.0, jupiter: 19.8, marginfi: 38.0, raydium: 64.1 },
  { time: '20:00', kamino: 43.0, drift: 59.4, jupiter: 18.9, marginfi: 36.8, raydium: 62.4 },
  { time: 'Now', kamino: 42.4, drift: 58.2, jupiter: 18.5, marginfi: 38.6, raydium: 61.2 },
];

// Helper color selector based on volatility
function getVolatilityColor(vol: number): string {
  if (vol < 25) return '#059669'; // Emerald (Safe)
  if (vol < 45) return '#0284c7'; // Sky/Cyan (Watch)
  if (vol < 60) return '#d97706'; // Amber (Warning)
  if (vol < 75) return '#ea580c'; // Orange (High Risk)
  return '#dc2626'; // Red (Critical)
}

// Custom Treemap Tile
const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, volatility, tvl, riskRating } = props;

  if (width < 35 || height < 25) return null;

  const bg = getVolatilityColor(volatility || 20);

  return (
    <g>
      <rect
        x={x + 2}
        y={y + 2}
        width={width - 4}
        height={height - 4}
        rx={4}
        fill={bg}
        fillOpacity={0.88}
        stroke="#111622"
        strokeWidth={1.5}
        className="cursor-pointer transition-opacity hover:opacity-100"
      />
      {width > 65 && height > 40 && (
        <>
          <text
            x={x + 8}
            y={y + 18}
            fill="#ffffff"
            fontSize={width > 120 ? 11 : 10}
            fontWeight="bold"
            fontFamily="sans-serif"
            className="select-none pointer-events-none"
          >
            {name ? name.slice(0, Math.floor(width / 7)) : ''}
          </text>
          <text
            x={x + 8}
            y={y + 32}
            fill="#ffffff"
            fillOpacity={0.9}
            fontSize={10}
            fontFamily="monospace"
            className="select-none pointer-events-none tabular-nums"
          >
            ${tvl}M · {volatility}% Vol
          </text>
        </>
      )}
    </g>
  );
};

export const MarketVolatilityHeatmap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'treemap' | 'trend'>('treemap');
  const [selectedPool, setSelectedPool] = useState<PoolNode | null>(null);

  // Flatten all pools for selection
  const allPools = useMemo(() => {
    const list: PoolNode[] = [];
    HEATMAP_DATA.forEach((group) => {
      group.children.forEach((p) => list.push(p));
    });
    return list;
  }, []);

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Component Title & View Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Solana Protocol Volatility Heatmap & Trends
            </h3>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time market cap sizing and volatility index heatmap across Kamino, Jupiter, Drift, Marginfi & Raydium
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex p-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('treemap')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'treemap'
                ? 'bg-white dark:bg-neutral-700 font-bold text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Liquidity Treemap Heatmap
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'trend'
                ? 'bg-white dark:bg-neutral-700 font-bold text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            24H Volatility Curve
          </button>
        </div>
      </div>

      {/* Volatility Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span className="font-sans font-semibold uppercase text-[10px] text-neutral-400">
            Volatility Index:
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#059669]" /> &lt;25% Low
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#0284c7]" /> 25-45% Watch
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#d97706]" /> 45-60% Warning
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#ea580c]" /> 60-75% High
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#dc2626]" /> &gt;75% Critical
          </span>
        </div>

        <div className="text-[10px] text-neutral-400 font-sans">
          Tile Area proportional to Pool TVL
        </div>
      </div>

      {/* Tab 1: Recharts Treemap Heatmap */}
      {activeTab === 'treemap' && (
        <div className="space-y-3">
          <div className="h-72 w-full rounded border border-neutral-100 dark:border-neutral-800/80 bg-neutral-900 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={HEATMAP_DATA}
                dataKey="tvl"
                aspectRatio={4 / 3}
                stroke="#090c10"
                content={<CustomTreemapContent />}
              />
            </ResponsiveContainer>
          </div>

          {/* Quick interactive inspector bar */}
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                Inspect Protocol Pool:
              </span>
              <select
                value={selectedPool ? selectedPool.name : allPools[0].name}
                onChange={(e) => {
                  const found = allPools.find((p) => p.name === e.target.value);
                  if (found) setSelectedPool(found);
                }}
                className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
              >
                {allPools.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.protocol} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick pool metrics pills */}
            {(() => {
              const pool = selectedPool || allPools[0];
              return (
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>
                    TVL: <strong className="text-neutral-900 dark:text-white">${pool.tvl}M</strong>
                  </span>
                  <span>
                    24h RV: <strong className="text-amber-500">{pool.volatility}%</strong>
                  </span>
                  <span>
                    Utilization: <strong>{pool.utilization}%</strong>
                  </span>
                  <RiskBadge tier={pool.riskRating} size="sm" />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Tab 2: Recharts 24H Volatility Curve */}
      {activeTab === 'trend' && (
        <div className="space-y-3">
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={VOLATILITY_TREND_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorKamino" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDrift" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorJupiter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRaydium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                  domain={[0, 80]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121622',
                    borderColor: '#1f2737',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#ffffff',
                  }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    paddingTop: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="kamino"
                  name="Kamino Lend"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorKamino)"
                />
                <Area
                  type="monotone"
                  dataKey="drift"
                  name="Drift Perps"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDrift)"
                />
                <Area
                  type="monotone"
                  dataKey="jupiter"
                  name="Jupiter JLP"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorJupiter)"
                />
                <Area
                  type="monotone"
                  dataKey="raydium"
                  name="Raydium CLMM"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRaydium)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <span>Highest Volatility Protocol: Drift Protocol (68.2% peak)</span>
            <span>Lowest Volatility Protocol: Jupiter JLP (18.5% stable)</span>
          </div>
        </div>
      )}
    </div>
  );
};
