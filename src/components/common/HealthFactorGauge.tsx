import React from 'react';

interface HealthFactorGaugeProps {
  healthFactor: number;
  liquidationDistancePct: number;
  showBar?: boolean;
  compact?: boolean;
}

export const HealthFactorGauge: React.FC<HealthFactorGaugeProps> = ({
  healthFactor,
  liquidationDistancePct,
  showBar = true,
  compact = false,
}) => {
  const isInfinite = healthFactor >= 9.99;
  const displayHf = isInfinite ? '∞' : `${healthFactor.toFixed(2)}x`;

  // Color logic
  let textColor = 'text-emerald-600 dark:text-emerald-400';
  let barColor = 'bg-emerald-500';
  if (healthFactor < 1.10) {
    textColor = 'text-rose-600 dark:text-rose-400 font-bold';
    barColor = 'bg-rose-500';
  } else if (healthFactor < 1.25) {
    textColor = 'text-orange-600 dark:text-orange-400 font-bold';
    barColor = 'bg-orange-500';
  } else if (healthFactor < 1.50) {
    textColor = 'text-amber-600 dark:text-amber-400 font-semibold';
    barColor = 'bg-amber-500';
  } else if (healthFactor < 1.80) {
    textColor = 'text-sky-600 dark:text-sky-400';
    barColor = 'bg-sky-500';
  }

  // Calculate percentage width (1.00x = 0%, 3.00x = 100%)
  const percentage = isInfinite
    ? 100
    : Math.min(100, Math.max(0, ((healthFactor - 1.0) / (2.5 - 1.0)) * 100));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono font-semibold tabular-nums ${textColor}`}>
          {displayHf}
        </span>
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
          ({liquidationDistancePct.toFixed(1)}%)
        </span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500 dark:text-neutral-400 font-medium">Health Factor</span>
        <div className="flex items-center gap-1.5">
          <span className={`font-mono tabular-nums ${textColor}`}>
            {displayHf}
          </span>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
            ({liquidationDistancePct > 0 ? `-${liquidationDistancePct.toFixed(1)}%` : 'Liquidated'})
          </span>
        </div>
      </div>

      {showBar && (
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          {/* Liquidation threshold marker at start */}
          <div
            className={`h-full transition-all duration-300 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};
