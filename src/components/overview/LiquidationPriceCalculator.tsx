import React, { useState, useMemo } from 'react';
import { useRisk } from '../../context/RiskContext';
import { Position } from '../../types';
import {
  Calculator,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Zap,
  Info,
} from 'lucide-react';

export const LiquidationPriceCalculator: React.FC = () => {
  const { positions } = useRisk();

  // Selected position for the calculator (defaults to first position with debt)
  const debtPositions = useMemo(
    () => positions.filter((p) => p.borrowedUsd > 0),
    [positions]
  );

  const [selectedPosId, setSelectedPosId] = useState<string>(
    debtPositions.length > 0 ? debtPositions[0].id : positions[0]?.id || ''
  );

  const currentPos = useMemo(() => {
    return positions.find((p) => p.id === selectedPosId) || positions[0];
  }, [positions, selectedPosId]);

  // Spot price baseline
  const spotPrice = currentPos ? currentPos.currentPrice : 148.82;
  const initialLiqPrice = currentPos ? currentPos.liquidationPrice : 118.40;

  // Custom user input price state
  const [customPriceInput, setCustomPriceInput] = useState<number>(spotPrice);

  // When selected position changes, reset input price to its spot price
  const handleSelectPosition = (id: string) => {
    setSelectedPosId(id);
    const found = positions.find((p) => p.id === id);
    if (found) {
      setCustomPriceInput(found.currentPrice);
    }
  };

  // Calculations
  const calcResults = useMemo(() => {
    if (!currentPos || currentPos.borrowedUsd === 0) {
      return {
        collateralValueAtInput: currentPos ? currentPos.suppliedUsd : 0,
        projectedLtv: 0,
        projectedHf: 9.99,
        exactLiqPrice: 0,
        isLiquidated: false,
        distanceToLiqPct: 100,
        shortfallUsd: 0,
      };
    }

    const collateralAmount = currentPos.suppliedAmount;
    const debtUsd = currentPos.borrowedUsd;
    // Protocol Liquidation LTV from position (e.g. 85%)
    const liqLtv = currentPos.collateralAssets[0]?.weight || 0.85;

    // Projected collateral value at input price
    const collateralValueAtInput = collateralAmount * customPriceInput;

    // Projected LTV
    const projectedLtv = Number(
      ((debtUsd / Math.max(1, collateralValueAtInput)) * 100).toFixed(1)
    );

    // Projected Health Factor: (Collateral Value * Liq LTV) / Debt
    const projectedHf = Number(
      ((collateralValueAtInput * liqLtv) / debtUsd).toFixed(2)
    );

    // Exact liquidation price where HF = 1.00: Debt / (Collateral Amount * Liq LTV)
    const exactLiqPrice = Number((debtUsd / (collateralAmount * liqLtv)).toFixed(2));

    const isLiquidated = customPriceInput <= exactLiqPrice || projectedHf <= 1.00;

    const distanceToLiqPct = Number(
      (((customPriceInput - exactLiqPrice) / customPriceInput) * 100).toFixed(1)
    );

    // If liquidated or in shortfall, amount needed to restore HF to 1.25x
    const requiredCollateralValue = (debtUsd * 1.25) / liqLtv;
    const shortfallUsd = Math.max(
      0,
      Math.round(requiredCollateralValue - collateralValueAtInput)
    );

    return {
      collateralValueAtInput,
      projectedLtv,
      projectedHf,
      exactLiqPrice,
      isLiquidated,
      distanceToLiqPct,
      shortfallUsd,
    };
  }, [currentPos, customPriceInput]);

  if (!currentPos) return null;

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Liquidation Price Calculator
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Input specific asset prices to test when your collateral ratio hits the protocol liquidation threshold
            </p>
          </div>
        </div>

        {/* Position Selector Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-neutral-500 text-[11px]">Position:</span>
          <select
            value={selectedPosId}
            onChange={(e) => handleSelectPosition(e.target.value)}
            className="px-2.5 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 font-semibold text-neutral-900 dark:text-white focus:outline-none"
          >
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.asset} ({p.protocolName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Input Column & Projection Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Price Input & Presets */}
        <div className="space-y-3.5 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-neutral-700 dark:text-neutral-300">
              Test Asset Price (USD)
            </label>
            <span className="font-mono text-[11px] text-neutral-400">
              Current Spot: ${spotPrice.toFixed(2)}
            </span>
          </div>

          {/* Numeric Input */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-neutral-400">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={customPriceInput}
              onChange={(e) => setCustomPriceInput(Math.max(0.01, Number(e.target.value)))}
              className="w-full pl-8 pr-4 py-2 font-mono font-bold text-base rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Price Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={Math.max(1, Math.round(calcResults.exactLiqPrice * 0.6))}
              max={Math.round(spotPrice * 1.3)}
              step={0.5}
              value={customPriceInput}
              onChange={(e) => setCustomPriceInput(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
              <span>Min Price</span>
              <span>Exact Liq: ${calcResults.exactLiqPrice.toFixed(2)}</span>
              <span>Spot: ${spotPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick Price Presets */}
          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-tight">
              Quick Price Scenarios:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCustomPriceInput(spotPrice)}
                className="px-2 py-1 text-[11px] font-mono rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-emerald-500 transition-colors"
              >
                Spot (${spotPrice.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => setCustomPriceInput(Number((spotPrice * 0.9).toFixed(2)))}
                className="px-2 py-1 text-[11px] font-mono rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 transition-colors"
              >
                -10% (${(spotPrice * 0.9).toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => setCustomPriceInput(Number((spotPrice * 0.8).toFixed(2)))}
                className="px-2 py-1 text-[11px] font-mono rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-rose-500 transition-colors"
              >
                -20% (${(spotPrice * 0.8).toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => setCustomPriceInput(calcResults.exactLiqPrice)}
                className="px-2 py-1 text-[11px] font-mono rounded border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-500/20 transition-colors"
              >
                Exact Liq (${calcResults.exactLiqPrice.toFixed(2)})
              </button>
            </div>
          </div>
        </div>

        {/* Right: Projected Risk Impact */}
        <div className="space-y-3 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Projected Health & LTV at ${customPriceInput.toFixed(2)}
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                calcResults.isLiquidated
                  ? 'bg-rose-500/20 text-rose-500 border-rose-500/40 animate-pulse'
                  : calcResults.projectedHf < 1.25
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
              }`}
            >
              {calcResults.isLiquidated
                ? 'LIQUIDATION TRIGGERED'
                : calcResults.projectedHf < 1.25
                ? 'CRITICAL BUFFER'
                : 'SAFE RATIO'}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 space-y-0.5">
              <span className="text-[10px] text-neutral-500 font-sans">
                Projected Health Factor
              </span>
              <div
                className={`text-lg font-bold ${
                  calcResults.isLiquidated
                    ? 'text-rose-500'
                    : calcResults.projectedHf < 1.25
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }`}
              >
                {calcResults.isLiquidated
                  ? `≤ 1.00x (${calcResults.projectedHf}x)`
                  : `${calcResults.projectedHf}x`}
              </div>
            </div>

            <div className="p-2.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 space-y-0.5">
              <span className="text-[10px] text-neutral-500 font-sans">
                Projected Borrow LTV
              </span>
              <div className="text-lg font-bold text-neutral-900 dark:text-white">
                {calcResults.projectedLtv}%
                <span className="text-[10px] text-neutral-400 font-normal ml-1">
                  (Max {((currentPos.collateralAssets[0]?.weight || 0.85) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 space-y-0.5">
              <span className="text-[10px] text-neutral-500 font-sans">
                Distance to Liquidation Price
              </span>
              <div
                className={`text-base font-bold ${
                  calcResults.distanceToLiqPct <= 0
                    ? 'text-rose-500'
                    : calcResults.distanceToLiqPct < 12
                    ? 'text-amber-500'
                    : 'text-neutral-900 dark:text-white'
                }`}
              >
                {calcResults.distanceToLiqPct <= 0
                  ? '0.0% (Liquidated)'
                  : `${calcResults.distanceToLiqPct}%`}
              </div>
            </div>

            <div className="p-2.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 space-y-0.5">
              <span className="text-[10px] text-neutral-500 font-sans">
                Exact Liquidation Threshold
              </span>
              <div className="text-base font-bold text-rose-500">
                ${calcResults.exactLiqPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Diagnosis & Action Advice */}
          <div
            className={`p-2.5 rounded text-xs border ${
              calcResults.isLiquidated
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                : calcResults.projectedHf < 1.25
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            <div className="flex items-start gap-1.5">
              {calcResults.isLiquidated ? (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold">
                  {calcResults.isLiquidated
                    ? 'Liquidation Threshold Exceeded:'
                    : calcResults.projectedHf < 1.25
                    ? 'Elevated Liquidation Threat:'
                    : 'Solvent Margin Cushion:'}
                </span>{' '}
                {calcResults.isLiquidated ? (
                  <span>
                    At ${customPriceInput.toFixed(2)}, collateral ratio exceeds protocol liquidation threshold. Deposit ${calcResults.shortfallUsd.toLocaleString()} collateral or repay debt to cure default.
                  </span>
                ) : calcResults.projectedHf < 1.25 ? (
                  <span>
                    At ${customPriceInput.toFixed(2)}, health factor deteriorates to {calcResults.projectedHf}x (within {calcResults.distanceToLiqPct}% of liquidation bot execution).
                  </span>
                ) : (
                  <span>
                    At ${customPriceInput.toFixed(2)}, position remains over-collateralized with {calcResults.distanceToLiqPct}% safety margin above the ${calcResults.exactLiqPrice.toFixed(2)} liquidation floor.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
