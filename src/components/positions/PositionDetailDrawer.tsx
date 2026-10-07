import React, { useState } from 'react';
import { useRisk } from '../../context/RiskContext';
import { Drawer } from '../common/Drawer';
import { RiskBadge } from '../common/RiskBadge';
import { HealthFactorGauge } from '../common/HealthFactorGauge';
import { LiquidationRiskGauge } from './LiquidationRiskGauge';
import {
  ShieldAlert,
  ArrowDownRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  Bell,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const PositionDetailDrawer: React.FC = () => {
  const { selectedPosition, setSelectedPosition, simulateRepay, simulateAddCollateral, addCustomAlert } = useRisk();
  const [repayInput, setRepayInput] = useState<number>(0);
  const [addCollateralInput, setAddCollateralInput] = useState<number>(0);
  const [activeSimTab, setActiveSimTab] = useState<'repay' | 'deposit'>('repay');
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  if (!selectedPosition) return null;

  const repaySimulation = simulateRepay(selectedPosition.id, repayInput);
  const depositSimulation = simulateAddCollateral(selectedPosition.id, addCollateralInput);

  const activeSimulation =
    activeSimTab === 'repay' ? repaySimulation : depositSimulation;

  const handleSetAlert = () => {
    addCustomAlert(
      `Watchdog Trigger: ${selectedPosition.asset}`,
      'WARNING',
      selectedPosition.asset,
      `Alert when HF < ${(selectedPosition.healthFactor * 0.95).toFixed(2)}x or Liq Dist < 10%`
    );
    setAlertSuccess('Autonomous risk watchdog armed for this position.');
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  return (
    <Drawer
      isOpen={Boolean(selectedPosition)}
      onClose={() => setSelectedPosition(null)}
      title={
        <div className="flex items-center gap-2.5">
          <span>{selectedPosition.asset}</span>
          <RiskBadge tier={selectedPosition.riskTier} size="sm" />
        </div>
      }
      subtitle={
        <div className="flex items-center gap-2">
          <span>{selectedPosition.protocolName}</span>
          <span>·</span>
          <span>{selectedPosition.strategyType}</span>
          <span>·</span>
          <span className="font-mono">{selectedPosition.netApy}% Net APY</span>
        </div>
      }
      width="max-w-xl"
    >
      <div className="space-y-6">
        {/* Visual Liquidation Risk Gauge using Recharts */}
        <LiquidationRiskGauge position={selectedPosition} />

        {/* Core Risk Radar Banner */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Solana Liquidation Health
            </span>
            <span className="text-xs font-mono font-medium text-neutral-400">
              Oracle: Pyth / Switchboard
            </span>
          </div>

          <HealthFactorGauge
            healthFactor={selectedPosition.healthFactor}
            liquidationDistancePct={selectedPosition.liquidationDistancePct}
          />

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
            <div>
              <span className="text-[11px] text-neutral-500">Current Oracle Price</span>
              <div className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                ${selectedPosition.currentPrice.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-neutral-500">Liquidation Price</span>
              <div className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                ${selectedPosition.liquidationPrice.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* ARGUS Autonomous Risk Analysis */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              ARGUS Autonomous Intelligence
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                What Happened:
              </span>{' '}
              <span className="text-neutral-600 dark:text-neutral-400">
                {selectedPosition.analysis.whatHappened}
              </span>
            </div>
            <div>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Why It Matters:
              </span>{' '}
              <span className="text-neutral-600 dark:text-neutral-400">
                {selectedPosition.analysis.whyItMatters}
              </span>
            </div>
            <div className="pt-1 border-t border-emerald-500/20">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Recommended Action:
              </span>{' '}
              <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                {selectedPosition.analysis.recommendedAction}
              </span>
            </div>
          </div>
        </div>

        {/* Collateral & Debt Composition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Supplied Collateral */}
          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-500">Supplied Collateral</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                +{selectedPosition.supplyApy}% APY
              </span>
            </div>
            <div className="text-lg font-mono font-bold text-neutral-900 dark:text-white">
              ${selectedPosition.suppliedUsd.toLocaleString()}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              {selectedPosition.collateralAssets.map((c) => (
                <div key={c.symbol} className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {c.amount.toLocaleString()} {c.symbol}
                  </span>
                  <span className="text-neutral-900 dark:text-white font-medium">
                    ${c.valueUsd.toLocaleString()} ({(c.weight * 100).toFixed(0)}% LTV)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Borrowed Debt */}
          <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-500">Borrowed Debt</span>
              <span className="font-mono text-rose-500">
                -{selectedPosition.borrowApy}% APY
              </span>
            </div>
            <div className="text-lg font-mono font-bold text-neutral-900 dark:text-white">
              ${selectedPosition.borrowedUsd.toLocaleString()}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              {selectedPosition.debtAssets.length > 0 ? (
                selectedPosition.debtAssets.map((d) => (
                  <div key={d.symbol} className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {d.amount.toLocaleString()} {d.symbol}
                    </span>
                    <span className="text-neutral-900 dark:text-white font-medium">
                      ${d.valueUsd.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-neutral-400 italic">No debt liability</div>
              )}
            </div>
          </div>
        </div>

        {/* 7-Day Health Factor Trend History */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              7-Day Health Factor Trend
            </span>
            <span className="font-mono text-neutral-400">
              Current: {selectedPosition.healthFactor.toFixed(2)}x
            </span>
          </div>

          <div className="flex items-end justify-between h-20 pt-2 gap-2">
            {selectedPosition.historicalHealth.map((item, idx) => {
              const heightPct = Math.min(
                100,
                Math.max(15, ((item.hf - 1.0) / (2.5 - 1.0)) * 100)
              );
              const isWarning = item.hf < 1.30;
              const isCritical = item.hf < 1.10;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.hf.toFixed(2)}x
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t h-full flex items-end">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isCritical
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-neutral-400 font-mono">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Risk Mitigation Simulator */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Interactive Rebalance Simulator
              </span>
            </div>
            <div className="flex p-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveSimTab('repay')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeSimTab === 'repay'
                    ? 'bg-white dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Repay Debt
              </button>
              <button
                type="button"
                onClick={() => setActiveSimTab('deposit')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeSimTab === 'deposit'
                    ? 'bg-white dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Deposit Collateral
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">
                {activeSimTab === 'repay'
                  ? 'Simulated Debt Repayment (USD)'
                  : 'Simulated Collateral Deposit (USD)'}
              </span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                $
                {activeSimTab === 'repay'
                  ? repayInput.toLocaleString()
                  : addCollateralInput.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={
                activeSimTab === 'repay'
                  ? Math.max(1000, selectedPosition.borrowedUsd)
                  : Math.max(10000, selectedPosition.suppliedUsd * 0.5)
              }
              step={100}
              value={activeSimTab === 'repay' ? repayInput : addCollateralInput}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (activeSimTab === 'repay') {
                  setRepayInput(val);
                } else {
                  setAddCollateralInput(val);
                }
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            {/* Quick preset chips */}
            <div className="flex gap-2 text-[11px]">
              {[1000, 5000, 15000, 50000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    if (activeSimTab === 'repay') {
                      setRepayInput(Math.min(preset, selectedPosition.borrowedUsd));
                    } else {
                      setAddCollateralInput(preset);
                    }
                  }}
                  className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-emerald-500 transition-colors"
                >
                  +${preset.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Rebalanced Result Preview */}
            <div className="p-3 rounded border border-emerald-500/30 bg-emerald-500/10 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Projected Health Factor
                </span>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {selectedPosition.healthFactor.toFixed(2)}x → {activeSimulation.newHf.toFixed(2)}x
                </div>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Projected Liquidation Price
                </span>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  ${selectedPosition.liquidationPrice.toFixed(2)} → ${activeSimulation.newLiqPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSetAlert}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Arm Autonomous Watchdog</span>
            </button>
          </div>

          {alertSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{alertSuccess}</span>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
