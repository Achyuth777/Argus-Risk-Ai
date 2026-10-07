import React, { useState } from 'react';
import { useRisk } from '../../context/RiskContext';
import { RiskBadge } from '../common/RiskBadge';
import { RiskTier } from '../../types';
import { Modal } from '../common/Modal';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, addCustomAlert, positions, setSelectedPosition } = useRisk();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [isNewAlertModalOpen, setIsNewAlertModalOpen] = useState(false);

  // Form state for creating custom alert
  const [newAsset, setNewAsset] = useState('SOL-USDC Multiply');
  const [newSeverity, setNewSeverity] = useState<RiskTier>('WARNING');
  const [newMetric, setNewMetric] = useState('Health Factor < 1.25x');
  const [newTitle, setNewTitle] = useState('Custom Health Factor Threshold');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const handleCreateCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomAlert(newTitle, newSeverity, newAsset, newMetric);
    setIsNewAlertModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white uppercase font-mono">
            Autonomous Alert Center
          </h2>
          <p className="text-xs text-neutral-500">
            Real-time oracle liquidation triggers, health factor compression warnings, and borrow rate monitors
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewAlertModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Custom Trigger</span>
        </button>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-1.5 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] text-xs">
        <span className="text-[11px] font-semibold text-neutral-400 mr-2 uppercase">
          Severity:
        </span>
        {['all', 'CRITICAL', 'WARNING', 'WATCH'].map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1 rounded transition-colors ${
              filterSeverity === sev
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800/60'
            }`}
          >
            {sev === 'all' ? 'All Alerts' : sev}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const relatedPos = positions.find((p) => p.asset.includes(alert.positionAsset.split(' ')[0]));

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all ${
                  alert.acknowledged
                    ? 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] opacity-75'
                    : alert.severity === 'CRITICAL'
                    ? 'border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/20'
                    : alert.severity === 'WARNING'
                    ? 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2">
                  <div className="flex items-start gap-2.5">
                    <RiskBadge tier={alert.severity} size="sm" />
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5 font-mono">
                        <span>{alert.positionAsset}</span>
                        <span>·</span>
                        <span className="capitalize">{alert.protocol}</span>
                        <span>·</span>
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {relatedPos && (
                      <button
                        type="button"
                        onClick={() => setSelectedPosition(relatedPos)}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1"
                      >
                        Inspect Position <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {!alert.acknowledged ? (
                      <button
                        type="button"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5 text-xs">
                  <div>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Reason:
                    </span>{' '}
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {alert.reason}
                    </span>
                  </div>

                  <div className="font-mono text-neutral-700 dark:text-neutral-300">
                    <span className="font-semibold font-sans">Metric Change:</span>{' '}
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {alert.metricChange}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 font-medium">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px] mr-1">
                      Recommended Action:
                    </span>
                    {alert.recommendedAction}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] text-center text-xs text-neutral-500">
            No alerts found for the selected severity level.
          </div>
        )}
      </div>

      {/* Modal: Create Custom Trigger */}
      <Modal
        isOpen={isNewAlertModalOpen}
        onClose={() => setIsNewAlertModalOpen(false)}
        title="Create Autonomous Risk Trigger"
        subtitle="Set real-time watchdog threshold alerts for any DeFi position"
      >
        <form onSubmit={handleCreateCustomAlert} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Trigger Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Target Position
            </label>
            <select
              value={newAsset}
              onChange={(e) => setNewAsset(e.target.value)}
              className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="SOL-USDC Multiply">Kamino SOL-USDC Multiply</option>
              <option value="JitoSOL Leverage Loop">Kamino JitoSOL Leverage Loop</option>
              <option value="bSOL Core Supply">Marginfi bSOL Core Supply</option>
              <option value="SOL-PERP Cross Margin">Drift SOL-PERP Cross Margin</option>
              <option value="KMNO Leverage Loop">Kamino KMNO Leverage Loop</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Severity
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as RiskTier)}
                className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="WARNING">WARNING</option>
                <option value="WATCH">WATCH</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Threshold Rule
              </label>
              <input
                type="text"
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value)}
                placeholder="e.g. HF < 1.20x"
                className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewAlertModalOpen(false)}
              className="px-3 py-2 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold"
            >
              Arm Watchdog
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
