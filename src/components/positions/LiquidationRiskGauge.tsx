import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Position } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, ArrowDownRight } from 'lucide-react';

interface LiquidationRiskGaugeProps {
  position: Position;
}

export const LiquidationRiskGauge: React.FC<LiquidationRiskGaugeProps> = ({ position }) => {
  const isZeroDebt = position.borrowedUsd === 0;

  // Calculate values
  const currentCollateral = position.suppliedUsd;
  const distancePct = Math.max(0, Math.min(100, position.liquidationDistancePct));
  const safetyBufferUsd = isZeroDebt
    ? currentCollateral
    : Math.round(currentCollateral * (distancePct / 100));
  const liquidationThresholdUsd = isZeroDebt
    ? 0
    : Math.max(0, Math.round(currentCollateral - safetyBufferUsd));

  // Determine color and severity
  let bufferColor = '#10b981'; // Emerald
  let riskStatus = 'SAFE CUSHION';
  let statusText = 'Low liquidation risk';

  if (distancePct < 8) {
    bufferColor = '#ef4444'; // Red
    riskStatus = 'CRITICAL ZONE';
    statusText = 'Liquidation imminent (<8% drop)';
  } else if (distancePct < 15) {
    bufferColor = '#f97316'; // Orange
    riskStatus = 'HIGH RISK';
    statusText = 'Narrow liquidation buffer';
  } else if (distancePct < 25) {
    bufferColor = '#f59e0b'; // Amber
    riskStatus = 'WARNING';
    statusText = 'Moderate safety buffer';
  } else if (distancePct < 35) {
    bufferColor = '#06b6d4'; // Cyan
    riskStatus = 'WATCH';
    statusText = 'Adequate buffer';
  }

  // Semi-circle gauge data for Recharts
  // Left side is liquidation threshold, right side is the safety buffer to current collateral
  const gaugeData = isZeroDebt
    ? [
        {
          name: 'Zero Debt Cushion',
          value: 100,
          fill: '#10b981',
          usd: currentCollateral,
          description: 'Fully unleveraged collateral',
        },
      ]
    : [
        {
          name: 'Liquidation Threshold Floor',
          value: Math.max(1, liquidationThresholdUsd),
          fill: '#ef4444',
          usd: liquidationThresholdUsd,
          description: 'Minimum collateral required before liquidation',
        },
        {
          name: 'Current Safety Distance',
          value: Math.max(1, safetyBufferUsd),
          fill: bufferColor,
          usd: safetyBufferUsd,
          description: 'Available margin cushion before liquidation',
        },
      ];

  // Custom Recharts Tooltip
  const CustomGaugeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] p-2.5 shadow-xl text-xs font-mono">
          <div className="font-bold text-neutral-900 dark:text-white mb-0.5">
            {data.name}
          </div>
          <div className="text-[11px] text-neutral-500 font-sans mb-1">
            {data.description}
          </div>
          <div className="text-sm font-bold" style={{ color: data.fill }}>
            ${data.usd?.toLocaleString()}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            LiquidationRiskGauge
          </h4>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
          style={{
            color: bufferColor,
            borderColor: `${bufferColor}40`,
            backgroundColor: `${bufferColor}15`,
          }}
        >
          {riskStatus}
        </span>
      </div>

      {/* Recharts Semi-Circle Gauge */}
      <div className="relative h-44 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomGaugeTooltip />} />
            <Pie
              data={gaugeData}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={68}
              outerRadius={92}
              paddingAngle={isZeroDebt ? 0 : 3}
              dataKey="value"
              stroke="#0f131a"
              strokeWidth={2}
            >
              {gaugeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Readout inside Semi-Circle */}
        <div className="absolute bottom-3 text-center pointer-events-none select-none">
          <div className="text-2xl font-mono font-bold tabular-nums text-neutral-900 dark:text-white">
            {isZeroDebt ? '100%' : `${distancePct.toFixed(1)}%`}
          </div>
          <div className="text-[10px] font-mono font-semibold" style={{ color: bufferColor }}>
            {isZeroDebt ? 'NO DEBT RISK' : `+$${safetyBufferUsd.toLocaleString()} BUFFER`}
          </div>
          <div className="text-[10px] text-neutral-400 font-sans mt-0.5">
            Distance to Liquidation Threshold
          </div>
        </div>
      </div>

      {/* Visual Linear Spectrum Bar: Threshold vs Current Collateral */}
      <div className="space-y-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-800 text-xs font-mono">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-neutral-500 font-sans">
            Liquidation Threshold Floor:
          </span>
          <span className="font-bold text-rose-500">
            ${liquidationThresholdUsd.toLocaleString()}
          </span>
        </div>

        {/* Gradient Progress Spectrum */}
        <div className="relative h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 rounded-l-full"
            style={{
              width: `${Math.min(100, (liquidationThresholdUsd / currentCollateral) * 100)}%`,
            }}
          />
          <div
            className="h-full absolute top-0"
            style={{
              left: `${Math.min(100, (liquidationThresholdUsd / currentCollateral) * 100)}%`,
              right: 0,
              backgroundColor: bufferColor,
            }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] pt-0.5">
          <span className="text-neutral-500 font-sans">
            Current Collateral Value:
          </span>
          <span className="font-bold text-neutral-900 dark:text-white">
            ${currentCollateral.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Oracle Threshold Price vs Current Price */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 text-[11px] font-mono">
        <div>
          <span className="text-neutral-400 font-sans block text-[10px]">
            Liquidation Oracle Price
          </span>
          <span className="font-bold text-rose-500">
            ${position.liquidationPrice.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-neutral-400 font-sans block text-[10px]">
            Current Index Price
          </span>
          <span className="font-bold text-neutral-900 dark:text-white">
            ${position.currentPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
