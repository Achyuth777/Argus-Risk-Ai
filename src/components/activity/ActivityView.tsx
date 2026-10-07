import React from 'react';
import { ACTIVITY_FEED } from '../../data/mockData';
import { RiskBadge } from '../common/RiskBadge';
import {
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const ActivityView: React.FC = () => {
  return (
    <div className="space-y-4 pb-12">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white uppercase font-mono">
          Autonomous Risk Ledger & Activity
        </h2>
        <p className="text-xs text-neutral-500">
          Historical log of health factor shifts, oracle updates, and automated rebalances on Solana Mainnet
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] divide-y divide-neutral-100 dark:divide-neutral-800">
        {ACTIVITY_FEED.map((event) => (
          <div key={event.id} className="p-4 flex items-start justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                  event.severity === 'CRITICAL'
                    ? 'bg-rose-500/10 text-rose-500'
                    : event.severity === 'WARNING'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {event.severity === 'CRITICAL' ? (
                  <Flame className="w-4 h-4" />
                ) : event.severity === 'WARNING' ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {event.title}
                  </span>
                  <RiskBadge tier={event.severity} size="sm" />
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  {event.description}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                  <span>{event.protocol}</span>
                  <span>·</span>
                  <span>{event.asset}</span>
                  <span>·</span>
                  <span>{event.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                {event.impact}
              </div>
              {event.txHash && (
                <a
                  href={`https://solscan.io/tx/${event.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-end gap-1 mt-0.5"
                >
                  {event.txHash} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
