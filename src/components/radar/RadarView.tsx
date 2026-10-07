import React, { useState } from 'react';
import { useRisk } from '../../context/RiskContext';
import { RiskBadge } from '../common/RiskBadge';
import { MarketVolatilityHeatmap } from './MarketVolatilityHeatmap';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  TrendingDown,
  PieChart,
  BarChart2,
  ChevronRight,
  Sliders,
  Zap,
} from 'lucide-react';

export const RadarView: React.FC = () => {
  const {
    positions,
    solCrashPct,
    setSolCrashPct,
    stressedPositions,
    totalLiquidatedCount,
    totalLiquidationCapitalAtRisk,
    setSelectedPosition,
  } = useRisk();

  // Liquidation proximity tiers
  const dangerPositions = stressedPositions.filter((p) => p.stressedDistance < 10);
  const warningPositions = stressedPositions.filter(
    (p) => p.stressedDistance >= 10 && p.stressedDistance < 25
  );
  const safePositions = stressedPositions.filter((p) => p.stressedDistance >= 25);

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white uppercase font-mono">
          Autonomous Risk Radar Workspace
        </h2>
        <p className="text-xs text-neutral-500">
          Solana systemic stress engine, liquidation proximity waterfall, protocol market volatility heatmap, and collateral concentration analysis
        </p>
      </div>

      {/* Visual Market Volatility Heatmap using Recharts */}
      <MarketVolatilityHeatmap />

      {/* Interactive Solana Volatility Stress Engine */}
      <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Solana Volatility Stress Engine
              </h3>
              <p className="text-xs text-neutral-500">
                Simulate instant spot drawdown to identify cascading liquidation thresholds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase">
              Drawdown Scenario:
            </span>
            <span className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded border border-rose-500/30">
              {solCrashPct === 0 ? '0% (Current Spot)' : `-${solCrashPct}% Drop`}
            </span>
          </div>
        </div>

        {/* Stress Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={solCrashPct}
            onChange={(e) => setSolCrashPct(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-[11px] font-mono text-neutral-500">
            <span>0% (Spot $148.82)</span>
            <span>-10% ($133.90)</span>
            <span>-20% ($119.05)</span>
            <span>-30% ($104.17)</span>
            <span>-40% ($89.29)</span>
            <span>-50% ($74.41)</span>
          </div>
        </div>

        {/* Real-time stress impact readout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] space-y-1">
            <div className="text-[11px] font-medium text-neutral-500">
              Positions Liquidated Under Stress
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-mono font-bold ${
                  totalLiquidatedCount > 0 ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                {totalLiquidatedCount} / {positions.length}
              </span>
              <span className="text-xs text-neutral-400">breached 1.00x</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] space-y-1">
            <div className="text-[11px] font-medium text-neutral-500">
              Total Capital at Immediate Risk
            </div>
            <div className="text-2xl font-mono font-bold text-rose-500">
              ${totalLiquidationCapitalAtRisk.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] space-y-1">
            <div className="text-[11px] font-medium text-neutral-500">
              Stress System Status
            </div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-white pt-1">
              {solCrashPct > 20
                ? 'CRITICAL CASCADE ZONE'
                : solCrashPct > 10
                ? 'ELEVATED LIQUIDATION RISK'
                : 'STABLE MARGIN CUSHION'}
            </div>
          </div>
        </div>

        {/* Breached positions warning list */}
        {totalLiquidatedCount > 0 && (
          <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 space-y-2">
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Positions breaching liquidation threshold at -{solCrashPct}%:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stressedPositions
                .filter((p) => p.isLiquidated)
                .map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPosition(p)}
                    className="p-2.5 rounded bg-white dark:bg-[#141824] border border-rose-500/30 flex items-center justify-between text-xs cursor-pointer hover:border-rose-500"
                  >
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {p.asset}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {p.protocolName} · ${p.borrowedUsd.toLocaleString()} debt
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-rose-500">
                        {p.stressedHf.toFixed(2)}x HF
                      </div>
                      <div className="text-[10px] text-rose-400">Liquidated</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Liquidation Proximity Waterfall */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Liquidation Proximity Waterfall
            </h3>
            <p className="text-[11px] text-neutral-500">
              Positions clustered by distance to forced liquidation price
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Danger Zone: <10% distance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Danger Zone (&lt; 10% distance)
              </span>
              <span className="font-mono text-neutral-500">
                {dangerPositions.length} positions
              </span>
            </div>
            {dangerPositions.length > 0 ? (
              <div className="space-y-1.5">
                {dangerPositions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPosition(p)}
                    className="p-3 rounded border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {p.asset}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {p.protocolName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-neutral-500">
                        Liq: ${p.liquidationPrice.toLocaleString()}
                      </span>
                      <span className="font-bold text-rose-500">
                        -{p.stressedDistance.toFixed(1)}% distance
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-neutral-400 italic p-2 bg-neutral-50 dark:bg-neutral-900/40 rounded">
                No positions currently in immediate danger zone.
              </div>
            )}
          </div>

          {/* Warning Zone: 10% - 25% distance */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Warning Buffer (10% - 25% distance)
              </span>
              <span className="font-mono text-neutral-500">
                {warningPositions.length} positions
              </span>
            </div>
            <div className="space-y-1.5">
              {warningPositions.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPosition(p)}
                  className="p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 hover:border-amber-500/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {p.asset}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {p.protocolName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-neutral-500">
                      Liq: ${p.liquidationPrice.toLocaleString()}
                    </span>
                    <span className="font-bold text-amber-500">
                      -{p.stressedDistance.toFixed(1)}% distance
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Zone: >25% distance */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Safe Margin Buffer (&gt; 25% distance)
              </span>
              <span className="font-mono text-neutral-500">
                {safePositions.length} positions
              </span>
            </div>
            <div className="space-y-1.5">
              {safePositions.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPosition(p)}
                  className="p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {p.asset}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {p.protocolName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-neutral-500">
                      Liq: ${p.liquidationPrice.toLocaleString()}
                    </span>
                    <span className="font-bold text-emerald-500">
                      {p.stressedDistance < 100
                        ? `-${p.stressedDistance.toFixed(1)}%`
                        : 'Over-collateralized'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Exposure & Asset Concentration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Protocol Concentration */}
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Protocol Reliance Breakdown
            </h3>
            <span className="text-[11px] text-neutral-400 font-mono">
              Smart Contract Exposure
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  Kamino Lend & Multiply
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  64% ($1,230,000)
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[64%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  Marginfi Lending
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  18% ($345,000)
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full w-[18%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  Drift Protocol
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  12% ($230,000)
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-[12%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  Jupiter Perps & CLMM
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  6% ($115,000)
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[6%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Collateral Asset Volatility Profile */}
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Collateral Asset Volatility Profile
            </h3>
            <span className="text-[11px] text-neutral-400 font-mono">
              Liquidity & Slippage Risk
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-between items-center">
              <div>
                <div className="font-bold text-neutral-900 dark:text-white">
                  SOL Spot & Staked LSTs (JitoSOL, bSOL)
                </div>
                <div className="text-[10px] text-neutral-400">
                  High liquidity, correlation ratio &gt; 99.4%
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-500">
                LOW DEPEG RISK
              </span>
            </div>

            <div className="p-2.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-between items-center">
              <div>
                <div className="font-bold text-neutral-900 dark:text-white">
                  USDC / USDT Stablecoin Debt
                </div>
                <div className="text-[10px] text-neutral-400">
                  Dollar denominated liability, 0% volatility
                </div>
              </div>
              <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
                STABLE DEBT
              </span>
            </div>

            <div className="p-2.5 rounded border border-amber-500/30 bg-amber-500/5 flex justify-between items-center">
              <div>
                <div className="font-bold text-neutral-900 dark:text-white">
                  Governance Tokens (KMNO, DRIFT, JUP)
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400">
                  Higher beta, sensitive to unlock events
                </div>
              </div>
              <span className="font-mono font-bold text-amber-500">
                MONITOR BETA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
