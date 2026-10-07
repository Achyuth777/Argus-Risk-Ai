import React from 'react';
import { RiskTier } from '../../types';

interface RiskBadgeProps {
  tier: RiskTier;
  size?: 'sm' | 'md' | 'lg';
  showIndicatorDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  tier,
  size = 'md',
  showIndicatorDot = true,
}) => {
  // Styles based on risk tier
  const tierConfig: Record<
    RiskTier,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    SAFE: {
      label: 'SAFE',
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30 dark:border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    WATCH: {
      label: 'WATCH',
      bg: 'bg-sky-500/10 dark:bg-sky-950/40',
      text: 'text-sky-700 dark:text-sky-400',
      border: 'border-sky-500/30 dark:border-sky-500/20',
      dot: 'bg-sky-500',
    },
    WARNING: {
      label: 'WARNING',
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30 dark:border-amber-500/20',
      dot: 'bg-amber-500',
    },
    'HIGH RISK': {
      label: 'HIGH RISK',
      bg: 'bg-orange-500/10 dark:bg-orange-950/40',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-500/30 dark:border-orange-500/20',
      dot: 'bg-orange-500',
    },
    CRITICAL: {
      label: 'CRITICAL',
      bg: 'bg-rose-500/15 dark:bg-rose-950/50',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/40 dark:border-rose-500/30',
      dot: 'bg-rose-500 animate-pulse',
    },
  };

  const config = tierConfig[tier] || tierConfig.SAFE;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 font-medium tracking-tight',
    md: 'text-xs px-2 py-0.5 gap-1.5 font-semibold tracking-wide',
    lg: 'text-sm px-2.5 py-1 gap-2 font-bold tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center rounded border tabular-nums select-none ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Risk level: ${config.label}`}
    >
      {showIndicatorDot && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
