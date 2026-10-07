import React, { useState, useMemo } from 'react';
import { useRisk } from '../../context/RiskContext';
import { Position, ProtocolId, RiskTier } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { HealthFactorGauge } from '../common/HealthFactorGauge';
import {
  Search,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const PositionsView: React.FC = () => {
  const { positions, setSelectedPosition } = useRisk();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'supplied' | 'borrowed' | 'health' | 'distance' | 'apy'>('health');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtered and sorted positions
  const filteredPositions = useMemo(() => {
    return positions
      .filter((p) => {
        // Search
        if (
          searchQuery &&
          !p.asset.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.protocolName.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        // Protocol
        if (selectedProtocol !== 'all' && p.protocol !== selectedProtocol) {
          return false;
        }
        // Risk
        if (selectedRisk !== 'all' && p.riskTier !== selectedRisk) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'health') diff = a.healthFactor - b.healthFactor;
        if (sortBy === 'supplied') diff = a.suppliedUsd - b.suppliedUsd;
        if (sortBy === 'borrowed') diff = a.borrowedUsd - b.borrowedUsd;
        if (sortBy === 'distance') diff = a.liquidationDistancePct - b.liquidationDistancePct;
        if (sortBy === 'apy') diff = a.netApy - b.netApy;

        return sortDirection === 'asc' ? diff : -diff;
      });
  }, [positions, searchQuery, selectedProtocol, selectedRisk, sortBy, sortDirection]);

  const handleSort = (field: 'supplied' | 'borrowed' | 'health' | 'distance' | 'apy') => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white uppercase font-mono">
            Positions Portfolio
          </h2>
          <p className="text-xs text-neutral-500">
            Real-time liquidation monitors, collateral ratios, and health buffers across Solana
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by asset or protocol..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] text-xs">
        {/* Protocol tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-semibold text-neutral-400 mr-1 uppercase">
            Protocol:
          </span>
          {[
            { id: 'all', label: 'All Protocols' },
            { id: 'kamino', label: 'Kamino' },
            { id: 'marginfi', label: 'Marginfi' },
            { id: 'drift', label: 'Drift' },
            { id: 'jupiter', label: 'Jupiter' },
            { id: 'raydium', label: 'Raydium' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedProtocol(item.id)}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedProtocol === item.id
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-neutral-400 mr-1 uppercase">
            Risk:
          </span>
          {['all', 'CRITICAL', 'WARNING', 'WATCH', 'SAFE'].map((risk) => (
            <button
              key={risk}
              type="button"
              onClick={() => setSelectedRisk(risk)}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                selectedRisk === risk
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800/60'
              }`}
            >
              {risk === 'all' ? 'All' : risk}
            </button>
          ))}
        </div>
      </div>

      {/* Main Financial Positions Table */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-[11px] text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Position</th>
                <th className="py-3 px-4 font-semibold">Protocol</th>
                <th
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white"
                  onClick={() => handleSort('supplied')}
                >
                  <div className="inline-flex items-center gap-1">
                    Supplied Collateral
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white"
                  onClick={() => handleSort('borrowed')}
                >
                  <div className="inline-flex items-center gap-1">
                    Borrowed Debt
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white"
                  onClick={() => handleSort('apy')}
                >
                  <div className="inline-flex items-center gap-1">
                    Net APY
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 font-semibold text-center cursor-pointer hover:text-neutral-900 dark:hover:text-white"
                  onClick={() => handleSort('health')}
                >
                  <div className="inline-flex items-center gap-1">
                    Health Factor
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-right">Liquidation Price</th>
                <th
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-neutral-900 dark:hover:text-white"
                  onClick={() => handleSort('distance')}
                >
                  <div className="inline-flex items-center gap-1">
                    Distance
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-center">Risk Tier</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filteredPositions.length > 0 ? (
                filteredPositions.map((pos) => (
                  <tr
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos)}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                      <div>{pos.asset}</div>
                      <div className="text-[10px] text-neutral-400 font-normal">
                        {pos.strategyType}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 font-medium">
                      {pos.protocolName}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-900 dark:text-white font-semibold">
                      ${pos.suppliedUsd.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                      ${pos.borrowedUsd.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      {pos.netApy}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-mono font-bold tabular-nums text-sm ${
                          pos.healthFactor < 1.15
                            ? 'text-rose-600 dark:text-rose-400'
                            : pos.healthFactor < 1.45
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {pos.healthFactor >= 9.99 ? '∞' : `${pos.healthFactor.toFixed(2)}x`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold">
                      ${pos.liquidationPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                      {pos.liquidationDistancePct < 100
                        ? `-${pos.liquidationDistancePct.toFixed(1)}%`
                        : 'Safe'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <RiskBadge tier={pos.riskTier} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPosition(pos);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-neutral-700 dark:text-neutral-300 hover:text-emerald-500 transition-colors"
                      >
                        Rebalance
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-neutral-500">
                    No positions matched the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
