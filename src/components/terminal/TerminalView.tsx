import React, { useState, useMemo } from 'react';
import { useRisk } from '../../context/RiskContext';
import { MARKET_TICKERS, POSITIONS_DATA } from '../../data/mockData';
import { MarketTicker, Position } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { HealthFactorGauge } from '../common/HealthFactorGauge';
import {
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  Layers,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Zap,
} from 'lucide-react';

export const TerminalView: React.FC = () => {
  const { positions, setSelectedPosition } = useRisk();
  const [selectedTicker, setSelectedTicker] = useState<MarketTicker>(MARKET_TICKERS[0]);
  const [timeframe, setTimeframe] = useState<'5m' | '1h' | '1D' | '7D' | '30D'>('1h');
  const [bottomTab, setBottomTab] = useState<'positions' | 'liquidations' | 'depth'>('positions');
  const [simLeverage, setSimLeverage] = useState<number>(3);
  const [simCollateral, setSimCollateral] = useState<number>(5000);
  const [hoveredCandle, setHoveredCandle] = useState<{ time: string; price: number; high: number; low: number; volume: string } | null>(null);

  // Generate realistic candlestick data for the selected ticker & timeframe
  const candles = useMemo(() => {
    const base = selectedTicker.price;
    const count = 28;
    const result = [];
    let current = base * 0.94;

    for (let i = 0; i < count; i++) {
      const volatility = base * 0.025;
      const change = (Math.sin(i * 0.6) + (Math.random() - 0.48)) * volatility;
      const open = current;
      const close = Math.max(base * 0.5, open + change);
      const high = Math.max(open, close) + Math.random() * volatility * 0.8;
      const low = Math.min(open, close) - Math.random() * volatility * 0.8;
      const isUp = close >= open;
      const vol = (Math.random() * 800000 + 200000).toFixed(0);

      current = close;
      result.push({
        idx: i,
        time: `${i + 1}h`,
        open,
        close,
        high,
        low,
        isUp,
        volume: vol,
      });
    }
    return result;
  }, [selectedTicker, timeframe]);

  // Derived liquidation cluster simulation
  const liquidationClusters = [
    { price: selectedTicker.price * 0.92, amount: '$42.5M', protocol: 'Kamino', severity: 'WARNING' },
    { price: selectedTicker.price * 0.86, amount: '$88.2M', protocol: 'Drift & Kamino', severity: 'HIGH RISK' },
    { price: selectedTicker.price * 0.78, amount: '$146.0M', protocol: 'Systemic Cascades', severity: 'CRITICAL' },
  ];

  // Simulated liquidation price from slider
  const simulatedLiqPrice = Number(
    (selectedTicker.price * (1 - 1 / simLeverage + 0.05)).toFixed(2)
  );

  return (
    <div className="space-y-3 pb-8">
      {/* Top Terminal Strip / Ticker Header (Hyperliquid Style) */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#10141e] p-2.5 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[850px] gap-6 text-xs font-mono">
          {/* Pair Selector */}
          <div className="flex items-center gap-2 pr-4 border-r border-neutral-200 dark:border-neutral-800 shrink-0">
            {MARKET_TICKERS.map((t) => (
              <button
                key={t.symbol}
                type="button"
                onClick={() => setSelectedTicker(t)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedTicker.symbol === t.symbol
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {t.pair}
              </button>
            ))}
          </div>

          {/* Real-time Ticker Metrics */}
          <div className="flex items-center gap-6 shrink-0">
            <div>
              <div className="text-[10px] text-neutral-400 font-sans">Index Price</div>
              <div className="font-bold text-sm text-neutral-900 dark:text-white">
                ${selectedTicker.price.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-neutral-400 font-sans">Pyth Oracle</div>
              <div className="text-neutral-700 dark:text-neutral-300">
                ${selectedTicker.oraclePrice.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-neutral-400 font-sans">24h Change</div>
              <div
                className={`font-semibold flex items-center gap-0.5 ${
                  selectedTicker.change24hPct >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {selectedTicker.change24hPct >= 0 ? '+' : ''}
                {selectedTicker.change24hPct.toFixed(2)}%
              </div>
            </div>

            <div>
              <div className="text-[10px] text-neutral-400 font-sans">24h Volume</div>
              <div className="text-neutral-700 dark:text-neutral-300">
                ${(selectedTicker.volume24hUsd / 1000000).toFixed(1)}M
              </div>
            </div>

            <div>
              <div className="text-[10px] text-neutral-400 font-sans">Open Interest</div>
              <div className="text-neutral-700 dark:text-neutral-300">
                ${(selectedTicker.openInterestUsd / 1000000).toFixed(1)}M
              </div>
            </div>

            <div>
              <div className="text-[10px] text-neutral-400 font-sans">Funding Rate</div>
              <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                {(selectedTicker.fundingRate * 100).toFixed(4)}%
                <span className="text-[9px] text-neutral-400 font-sans">
                  ({selectedTicker.nextFundingCountdown})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Chart + Right Terminal Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Central Terminal Chart Area (3 Cols) */}
        <div className="lg:col-span-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#10141e] p-4 flex flex-col justify-between space-y-4">
          {/* Chart Controls Bar */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {selectedTicker.pair} Oracle Depth
              </span>
              <div className="flex p-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono">
                {(['5m', '1h', '1D', '7D', '30D'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      timeframe === tf
                        ? 'bg-white dark:bg-neutral-700 font-bold text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Hover tooltip stats */}
            <div className="text-xs font-mono text-neutral-500 hidden sm:flex items-center gap-3">
              {hoveredCandle ? (
                <>
                  <span>
                    Close:{' '}
                    <strong className="text-neutral-900 dark:text-white">
                      ${hoveredCandle.price.toFixed(2)}
                    </strong>
                  </span>
                  <span>
                    High: <strong>${hoveredCandle.high.toFixed(2)}</strong>
                  </span>
                  <span>
                    Low: <strong>${hoveredCandle.low.toFixed(2)}</strong>
                  </span>
                </>
              ) : (
                <span className="text-neutral-400">Hover candlestick for metrics</span>
              )}
            </div>
          </div>

          {/* Interactive SVG Financial Candlestick Chart */}
          <div className="relative h-64 sm:h-72 w-full pt-2">
            {/* SVG Candlestick visualization */}
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
            >
              {/* Background grid lines */}
              <line x1="0" y1="40" x2="1000" y2="40" stroke="currentColor" className="text-neutral-100 dark:text-neutral-800/60" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="1000" y2="100" stroke="currentColor" className="text-neutral-100 dark:text-neutral-800/60" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="1000" y2="160" stroke="currentColor" className="text-neutral-100 dark:text-neutral-800/60" strokeWidth="1" strokeDasharray="4 4" />

              {/* Liquidation Danger Line Band */}
              <line
                x1="0"
                y1="210"
                x2="1000"
                y2="210"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="6 3"
                opacity="0.7"
              />
              <text x="10" y="205" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                CRITICAL LIQUIDATION CASCADE ZONE ($118.40)
              </text>

              {/* Render Candlesticks */}
              {candles.map((candle, i) => {
                const candleWidth = 18;
                const x = 30 + i * 33;
                // Min / Max bounds
                const minPrice = selectedTicker.price * 0.88;
                const maxPrice = selectedTicker.price * 1.08;
                const range = maxPrice - minPrice;

                const getY = (val: number) => 210 - ((val - minPrice) / range) * 180;

                const openY = getY(candle.open);
                const closeY = getY(candle.close);
                const highY = getY(candle.high);
                const lowY = getY(candle.low);
                const top = Math.min(openY, closeY);
                const height = Math.max(2, Math.abs(closeY - openY));

                const color = candle.isUp ? '#10b981' : '#ef4444';

                return (
                  <g
                    key={i}
                    onMouseEnter={() =>
                      setHoveredCandle({
                        time: candle.time,
                        price: candle.close,
                        high: candle.high,
                        low: candle.low,
                        volume: candle.volume,
                      })
                    }
                    className="cursor-pointer group"
                  >
                    {/* Wick */}
                    <line
                      x1={x + candleWidth / 2}
                      y1={highY}
                      x2={x + candleWidth / 2}
                      y2={lowY}
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    {/* Body */}
                    <rect
                      x={x}
                      y={top}
                      width={candleWidth}
                      height={height}
                      fill={color}
                      rx="1"
                      className="transition-opacity group-hover:opacity-80"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Volume sub-strip */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono border-t border-neutral-100 dark:border-neutral-800/80 pt-2">
            <span>24h Liquidation Volume: $18.4M</span>
            <span>Pyth Conf Interval: ±$0.02</span>
            <span>Slot: 318,492,012</span>
          </div>
        </div>

        {/* Right Execution & Leverage Risk Simulator (Hyperliquid Style) */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#10141e] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Risk Margin Simulator
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              Cross Collateral
            </span>
          </div>

          {/* Collateral Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Position Size (USD)</span>
              <span className="font-mono text-neutral-900 dark:text-white font-bold">
                ${simCollateral.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={50000}
              step={500}
              value={simCollateral}
              onChange={(e) => setSimCollateral(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Leverage Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Target Leverage</span>
              <span className="font-mono text-neutral-900 dark:text-white font-bold">
                {simLeverage}x
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={simLeverage}
              onChange={(e) => setSimLeverage(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>1x (Safe)</span>
              <span>3x</span>
              <span>5x (Warning)</span>
              <span>10x (Extreme)</span>
            </div>
          </div>

          {/* Recomputed Risk Stats */}
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-500">Est. Liquidation Price:</span>
              <span className="font-bold text-rose-500">
                ${simulatedLiqPrice}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Distance to Liq:</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {(100 / simLeverage - 5).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Borrow Rate Carry:</span>
              <span className="text-neutral-700 dark:text-neutral-300">
                8.4% APY
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Kamino Margin Buffer:</span>
              <span className="text-emerald-500 font-semibold">
                ${(simCollateral * 0.25).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Mitigation Trigger Button */}
          <button
            type="button"
            className="w-full py-2.5 px-3 rounded bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Flash Loan Buffer</span>
          </button>
        </div>
      </div>

      {/* Bottom Terminal Tabbed Data Panel (Hyperliquid Style) */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#10141e] overflow-hidden">
        {/* Terminal Header Tabs */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-3 py-2 bg-neutral-50/50 dark:bg-[#0d1017]">
          <div className="flex items-center gap-2">
            {(
              [
                { id: 'positions', label: `Positions (${positions.length})` },
                { id: 'liquidations', label: 'Liquidation Orderbook Depth' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBottomTab(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                  bottomTab === tab.id
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-emerald-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time Risk Stream Active</span>
          </div>
        </div>

        {/* Tab Content: Positions */}
        {bottomTab === 'positions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-50 dark:bg-neutral-900/40 text-[11px] text-neutral-500 uppercase border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Position</th>
                  <th className="py-2.5 px-4 font-semibold">Protocol</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Supplied</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Borrowed</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Health Factor</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Liq Price</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Distance</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Risk Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {positions.map((pos) => (
                  <tr
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos)}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-white">
                      {pos.asset}
                    </td>
                    <td className="py-2.5 px-4 text-neutral-500">
                      {pos.protocolName}
                    </td>
                    <td className="py-2.5 px-4 text-right text-neutral-900 dark:text-white">
                      ${pos.suppliedUsd.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right text-neutral-600 dark:text-neutral-400">
                      ${pos.borrowedUsd.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`font-bold ${
                          pos.healthFactor < 1.15
                            ? 'text-rose-500'
                            : pos.healthFactor < 1.45
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {pos.healthFactor >= 9.99 ? '∞' : `${pos.healthFactor.toFixed(2)}x`}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-500">
                      ${pos.liquidationPrice.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-right text-neutral-500">
                      {pos.liquidationDistancePct < 100
                        ? `-${pos.liquidationDistancePct.toFixed(1)}%`
                        : 'Safe'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <RiskBadge tier={pos.riskTier} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Liquidation Clusters */}
        {bottomTab === 'liquidations' && (
          <div className="p-4 space-y-3">
            <div className="text-xs text-neutral-500">
              Aggregated liquidation walls across Kamino, Marginfi, and Drift on Solana Mainnet:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {liquidationClusters.map((cluster, i) => (
                <div
                  key={i}
                  className="p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      ${cluster.price.toFixed(2)} Trigger
                    </span>
                    <RiskBadge tier={cluster.severity as any} size="sm" />
                  </div>
                  <div className="text-lg font-bold text-rose-500">
                    {cluster.amount} Debt
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Protocols: {cluster.protocol}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
