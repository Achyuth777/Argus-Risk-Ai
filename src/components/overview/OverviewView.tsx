import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { useRisk } from '../../context/RiskContext';
import { RiskBadge } from '../common/RiskBadge';
import { HealthFactorGauge } from '../common/HealthFactorGauge';
import { StressTestController } from './StressTestController';
import { LiquidationPriceCalculator } from './LiquidationPriceCalculator';
import { PROTOCOLS_LIST } from '../../data/mockData';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  AlertTriangle,
  Layers,
  ChevronRight,
  TrendingDown,
  Sparkles,
  ExternalLink,
  Flame,
} from 'lucide-react';

interface OverviewViewProps {
  onNavigateToPositions: () => void;
  onNavigateToRadar: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateToPositions,
  onNavigateToRadar,
}) => {
  const { activeWallet, walletType, connectWallet, connectCustomAddress, isConnected, openWalletModal } = useWallet();
  const {
    positions,
    stressedPositions,
    solCrashPct,
    setSolCrashPct,
    setSelectedPosition,
    alerts,
  } = useRisk();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      connectCustomAddress(searchInput.trim());
      setSearchInput('');
    }
  };

  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH RISK');
  const warningAlerts = alerts.filter((a) => a.severity === 'WARNING');

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Search & Demo Wallet Switcher Section (Reference 1) */}
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#0d1017] p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Your entire <span className="text-emerald-500">Solana DeFi</span> world,
            <br className="hidden sm:inline" /> tracked in one <span className="text-emerald-500">dashboard</span>.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
            Track holdings, leverage positions, liquidation buffers, and yields across Kamino, Marginfi, Drift, and 194 Solana protocols.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 max-w-xl mx-auto bg-white dark:bg-[#131722] rounded-lg border border-neutral-200 dark:border-neutral-700/80 p-1.5 shadow-sm"
          >
            <div className="relative flex-1 flex items-center pl-3">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search any wallet address or .sns domain"
                className="w-full bg-transparent pl-2.5 pr-2 py-1.5 text-xs font-mono text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs transition-colors shrink-0 whitespace-nowrap"
            >
              Monitor Wallet
            </button>
          </form>

          {/* Demo Wallets row */}
          <div className="pt-3 text-left">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-neutral-500 dark:text-neutral-400">
                Demo portfolios:
              </span>
              <button
                type="button"
                onClick={() => connectWallet('group')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                View all 3 as a group
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => connectWallet('whale')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  walletType === 'whale' && isConnected
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131722] hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded bg-cyan-500/20 text-cyan-500 flex items-center justify-center font-bold text-xs">
                    W
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      DeFi whale
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400">
                      Demo...3tKG
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-baseline text-[11px] font-mono">
                  <span className="text-neutral-500">Kamino Multiply</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    $1.84M
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => connectWallet('jup-staker')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  walletType === 'jup-staker' && isConnected
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131722] hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    J
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      JUP staker
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400">
                      jupE...BH5H
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-baseline text-[11px] font-mono">
                  <span className="text-neutral-500">Staked & Lending</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    $438K
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => connectWallet('airdrop-farmer')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  walletType === 'airdrop-farmer' && isConnected
                    ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#131722] hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                    F
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      Airdrop farmer
                    </div>
                    <div className="text-[10px] font-mono text-rose-500">
                      teSt...51nd · 1.07x
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-baseline text-[11px] font-mono">
                  <span className="text-neutral-500">High Risk KMNO</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    $84.6K
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Financial Overview Grid */}
      {activeWallet && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] space-y-1">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Total Portfolio Value
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
              ${activeWallet.totalValueUsd.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`font-mono font-semibold flex items-center ${
                  activeWallet.pnl24hPct >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {activeWallet.pnl24hPct >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {activeWallet.pnl24hPct.toFixed(2)}%
              </span>
              <span className="text-neutral-400 font-mono">
                (${Math.abs(activeWallet.pnl24hUsd).toLocaleString()} 24h)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] space-y-1">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Aggregate Health Factor
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl sm:text-2xl font-mono font-bold tabular-nums ${
                  activeWallet.aggregateHealthFactor < 1.15
                    ? 'text-rose-600 dark:text-rose-400'
                    : activeWallet.aggregateHealthFactor < 1.45
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {activeWallet.aggregateHealthFactor.toFixed(2)}x
              </span>
              <span className="text-xs font-mono text-neutral-400">
                (Liq: 1.00x)
              </span>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {activeWallet.aggregateHealthFactor < 1.20
                ? 'High liquidation vulnerability'
                : 'Controlled leverage buffer'}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] space-y-1">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Total Debt Liabilities
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
              ${activeWallet.totalDebtUsd.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Against ${activeWallet.totalCollateralUsd.toLocaleString()} collateral
            </div>
          </div>

          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] space-y-1">
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Active Alerts & Watchdogs
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {activeWallet.criticalCount + activeWallet.warningCount}
              </span>
              <span className="text-xs text-neutral-400">
                ({activeWallet.criticalCount} Critical · {activeWallet.warningCount} Warning)
              </span>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Continuous Pyth oracle monitoring
            </div>
          </div>
        </div>
      )}

      {/* ARGUS Autonomous Risk Intelligence Action Panel */}
      <div className="p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111520] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              ARGUS Autonomous Risk Diagnosis
            </h3>
          </div>
          <button
            type="button"
            onClick={onNavigateToRadar}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
          >
            Open Stress Tester <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {positions.slice(0, 2).map((pos) => (
            <div
              key={pos.id}
              className="p-3.5 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141824] space-y-2 cursor-pointer hover:border-emerald-500/40 transition-colors"
              onClick={() => setSelectedPosition(pos)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">
                    {pos.asset}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    ({pos.protocolName})
                  </span>
                </div>
                <RiskBadge tier={pos.riskTier} size="sm" />
              </div>

              <div className="text-xs text-neutral-600 dark:text-neutral-300">
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Diagnosis:
                </span>{' '}
                {pos.analysis.whatHappened}
              </div>

              <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Action:
                </span>{' '}
                {pos.analysis.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liquidation Price Calculator tool */}
      <LiquidationPriceCalculator />

      {/* StressTestController for simulated market drawdown toggles */}
      <StressTestController />

      {/* Positions Watchlist Table */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] overflow-hidden">
        {solCrashPct > 0 && (
          <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between text-xs font-mono text-rose-600 dark:text-rose-400">
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>
                Simulated Market Drawdown Active (-{solCrashPct}%): Table displays projected health factors and liquidation distances.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSolCrashPct(0)}
              className="text-[11px] underline hover:text-rose-300 transition-colors shrink-0 font-medium"
            >
              Reset to Spot
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Active DeFi Positions
              </h3>
              {solCrashPct > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-500 font-bold border border-rose-500/30">
                  Projected at -{solCrashPct}% Drawdown
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500">
              Click any position row to open the complete health breakdown and rebalancing simulator
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToPositions}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
          >
            View All ({positions.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-[11px] text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Position</th>
                <th className="py-2.5 px-4 font-semibold">Protocol</th>
                <th className="py-2.5 px-4 font-semibold text-right">Supplied</th>
                <th className="py-2.5 px-4 font-semibold text-right">Borrowed</th>
                <th className="py-2.5 px-4 font-semibold text-center">
                  {solCrashPct > 0 ? (
                    <span className="text-rose-500 font-mono font-bold">
                      Projected HF (-{solCrashPct}%)
                    </span>
                  ) : (
                    'Health Factor'
                  )}
                </th>
                <th className="py-2.5 px-4 font-semibold text-right">
                  {solCrashPct > 0 ? 'Projected Liq Distance' : 'Liq Distance'}
                </th>
                <th className="py-2.5 px-4 font-semibold text-center">Risk Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {(solCrashPct > 0 ? stressedPositions : positions).map((pos) => {
                const isStressed = solCrashPct > 0;
                const stressedData = pos as typeof stressedPositions[0];

                const dynamicTier = isStressed
                  ? stressedData.isLiquidated
                    ? 'CRITICAL'
                    : stressedData.stressedHf < 1.15
                    ? 'CRITICAL'
                    : stressedData.stressedHf < 1.30
                    ? 'HIGH RISK'
                    : stressedData.stressedHf < 1.50
                    ? 'WARNING'
                    : pos.riskTier
                  : pos.riskTier;

                return (
                  <tr
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos)}
                    className={`cursor-pointer transition-colors ${
                      isStressed && stressedData.isLiquidated
                        ? 'bg-rose-500/10 hover:bg-rose-500/15'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                      <div>{pos.asset}</div>
                      {isStressed && stressedData.isLiquidated && (
                        <div className="text-[10px] text-rose-500 font-mono font-bold">
                          ⚠️ BREACHES LIQUIDATION LTV
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 font-medium">
                      {pos.protocolName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-900 dark:text-white font-medium">
                      ${pos.suppliedUsd.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                      ${pos.borrowedUsd.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isStressed ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 font-mono font-bold tabular-nums">
                            <span className="text-[10px] text-neutral-400 line-through">
                              {pos.healthFactor >= 9.99 ? '∞' : `${pos.healthFactor.toFixed(2)}x`}
                            </span>
                            <span className="text-neutral-400 text-xs">→</span>
                            <span
                              className={`text-xs ${
                                stressedData.isLiquidated || stressedData.stressedHf < 1.10
                                  ? 'text-rose-500 font-extrabold'
                                  : stressedData.stressedHf < 1.30
                                  ? 'text-amber-500 font-bold'
                                  : 'text-emerald-500'
                              }`}
                            >
                              {stressedData.isLiquidated
                                ? 'LIQ (1.00x)'
                                : `${stressedData.stressedHf.toFixed(2)}x`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            pos.healthFactor < 1.15
                              ? 'text-rose-500'
                              : pos.healthFactor < 1.45
                              ? 'text-amber-500'
                              : 'text-emerald-500'
                          }`}
                        >
                          {pos.healthFactor >= 9.99 ? '∞' : `${pos.healthFactor.toFixed(2)}x`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {isStressed ? (
                        <span
                          className={`font-bold ${
                            stressedData.stressedDistance < 10
                              ? 'text-rose-500'
                              : 'text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {stressedData.stressedDistance <= 0
                            ? '0.0% (Liquidated)'
                            : `-${stressedData.stressedDistance.toFixed(1)}%`}
                        </span>
                      ) : (
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {pos.liquidationDistancePct < 100
                            ? `-${pos.liquidationDistancePct.toFixed(1)}%`
                            : 'Safe'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RiskBadge tier={dynamicTier} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Protocol coverage strip */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3 text-center sm:text-left">
          Monitored Solana Ecosystem Protocols
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
          {PROTOCOLS_LIST.map((p) => (
            <div
              key={p.id}
              className="p-2 rounded border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-[#121622] text-center"
            >
              <div className="text-xs font-bold text-neutral-900 dark:text-white">
                {p.icon}
              </div>
              <div className="text-[10px] text-neutral-400 truncate">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
