import React from 'react';
import { useRisk } from '../../context/RiskContext';
import { useWallet } from '../../context/WalletContext';
import { Flame, AlertTriangle, RefreshCw, Zap, TrendingDown } from 'lucide-react';

export const StressTestController: React.FC = () => {
  const {
    solCrashPct,
    setSolCrashPct,
    totalLiquidatedCount,
    totalLiquidationCapitalAtRisk,
    stressedPositions,
  } = useRisk();
  const { activeWallet } = useWallet();

  const presets = [
    { label: '0% Spot', value: 0 },
    { label: '-10%', value: 10 },
    { label: '-15%', value: 15 },
    { label: '-20%', value: 20 },
    { label: '-25%', value: 25 },
    { label: '-35%', value: 35 },
    { label: '-50%', value: 50 },
  ];

  // Calculate stressed aggregate health factor
  const baseHf = activeWallet ? activeWallet.aggregateHealthFactor : 1.38;
  const stressedHf = Math.max(
    0.1,
    Number((baseHf * (1 - (solCrashPct / 100) * 0.82)).toFixed(2))
  );

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Controller Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded flex items-center justify-center ${
              solCrashPct > 0
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}
          >
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                StressTestController
              </h3>
              {solCrashPct > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                  SIMULATION ACTIVE: -{solCrashPct}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Toggle simulated SOL market drawdown scenarios to project real-time liquidation health
            </p>
          </div>
        </div>

        {/* Reset button if active */}
        {solCrashPct > 0 && (
          <button
            type="button"
            onClick={() => setSolCrashPct(0)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to Current Spot</span>
          </button>
        )}
      </div>

      {/* Preset Drawdown Toggle Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">
            Simulated Drawdown Preset:
          </span>
          <span className="font-mono text-neutral-500">
            SOL Spot: ${Number((148.82 * (1 - solCrashPct / 100)).toFixed(2))}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {presets.map((preset) => {
            const isSelected = solCrashPct === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => setSolCrashPct(preset.value)}
                className={`py-2 px-1 text-xs font-mono font-bold rounded border transition-all ${
                  isSelected
                    ? preset.value === 0
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-xs ring-1 ring-rose-500/40'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider for fine-grained tuning */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[11px] text-neutral-500">
          <span>Continuous Drawdown Slider</span>
          <span className="font-mono font-bold text-neutral-900 dark:text-white">
            {solCrashPct === 0 ? '0% (Baseline)' : `-${solCrashPct}% SOL Drawdown`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={solCrashPct}
          onChange={(e) => setSolCrashPct(Number(e.target.value))}
          className="w-full accent-rose-500 cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
        />
      </div>

      {/* Real-time Projected Health Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs font-mono">
        <div className="p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-tight font-sans">
            Projected Health Factor
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-base font-bold tabular-nums ${
                stressedHf < 1.10
                  ? 'text-rose-500'
                  : stressedHf < 1.30
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}
            >
              {stressedHf.toFixed(2)}x
            </span>
            {solCrashPct > 0 && (
              <span className="text-[10px] text-neutral-400 line-through">
                {baseHf.toFixed(2)}x
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-tight font-sans">
            Liquidated Positions
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-base font-bold tabular-nums ${
                totalLiquidatedCount > 0 ? 'text-rose-500' : 'text-emerald-500'
              }`}
            >
              {totalLiquidatedCount} / {stressedPositions.length}
            </span>
            <span className="text-[10px] text-neutral-400">
              {totalLiquidatedCount > 0 ? 'breached' : 'safe'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-tight font-sans">
            Capital at Immediate Risk
          </span>
          <div className="text-base font-bold tabular-nums text-neutral-900 dark:text-white">
            ${totalLiquidationCapitalAtRisk.toLocaleString()}
          </div>
        </div>

        <div className="p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-tight font-sans">
            Stress Test Rating
          </span>
          <div className="text-xs font-bold pt-1 text-neutral-900 dark:text-white">
            {solCrashPct >= 25
              ? 'CRITICAL CASCADE'
              : solCrashPct >= 15
              ? 'HIGH VULNERABILITY'
              : solCrashPct > 0
              ? 'ELEVATED RISK'
              : 'NORMAL MONITORING'}
          </div>
        </div>
      </div>
    </div>
  );
};
