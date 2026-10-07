import React, { useState } from 'react';
import { ViewTab } from '../../types';
import { useWallet } from '../../context/WalletContext';
import { useRisk } from '../../context/RiskContext';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  Bell,
  Wallet,
  Activity,
  Layers,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const { isConnected, activeWallet, openWalletModal, walletType, connectWallet } = useWallet();
  const { alerts } = useRisk();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);

  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  const navLinks: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'terminal', label: 'Terminal', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'positions', label: 'Positions', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'radar', label: 'Risk Radar', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#0c0f16]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 items-center justify-between px-3 sm:px-5 lg:px-6">
        {/* Zone 1: Brand element */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-sm tracking-tighter group-hover:border-emerald-500 transition-colors">
              <span className="font-mono text-xs">▲</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white uppercase font-mono">
                ARGUS
              </span>
              <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                V2
              </span>
            </div>
          </button>

          {/* Quick status ticker */}
          <div className="hidden xl:flex items-center gap-2 pl-3 ml-2 border-l border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono">Solana Mainnet</span>
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
              2,140 TPS
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
              410ms
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5" aria-label="Main Navigation">
          {navLinks.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`relative px-2.5 sm:px-3 py-1.5 text-xs sm:text-[13px] font-medium transition-colors whitespace-nowrap rounded ${
                  isActive
                    ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800/80 font-semibold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {tab.label}
                  {tab.id === 'alerts' && unreadAlertsCount > 0 && (
                    <span className="px-1 py-0.2 text-[10px] font-bold font-mono bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded">
                      {unreadAlertsCount}
                    </span>
                  )}
                </div>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Utilities & Wallet Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Demo Switcher Dropdown */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-medium truncate max-w-[110px]">
                {activeWallet ? activeWallet.name : 'Select Wallet'}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isWalletMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-60 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] shadow-xl py-1 z-50 text-xs"
                onMouseLeave={() => setIsWalletMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                  Switch Demo Portfolio
                </div>
                <button
                  type="button"
                  onClick={() => {
                    connectWallet('whale');
                    setIsWalletMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/60 ${
                    walletType === 'whale' ? 'text-emerald-500 font-semibold' : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div>
                    <div className="font-medium">DeFi whale</div>
                    <div className="text-[10px] text-neutral-400 font-mono">Demo...3tKG · $1.84M</div>
                  </div>
                  {walletType === 'whale' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    connectWallet('jup-staker');
                    setIsWalletMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/60 ${
                    walletType === 'jup-staker' ? 'text-emerald-500 font-semibold' : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div>
                    <div className="font-medium">JUP staker</div>
                    <div className="text-[10px] text-neutral-400 font-mono">jupE...BH5H · $438K</div>
                  </div>
                  {walletType === 'jup-staker' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    connectWallet('airdrop-farmer');
                    setIsWalletMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/60 ${
                    walletType === 'airdrop-farmer' ? 'text-emerald-500 font-semibold' : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div>
                    <div className="font-medium">Airdrop farmer</div>
                    <div className="text-[10px] text-rose-400 font-mono">teSt...51nd · 1.07x CRITICAL</div>
                  </div>
                  {walletType === 'airdrop-farmer' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    connectWallet('group');
                    setIsWalletMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/60 ${
                    walletType === 'group' ? 'text-emerald-500 font-semibold' : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div>
                    <div className="font-medium">View all 3 as a group</div>
                    <div className="text-[10px] text-neutral-400 font-mono">3 Wallets · $2.36M</div>
                  </div>
                  {walletType === 'group' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Alert Popover Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              aria-label="Alerts"
              title="Recent Risk Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-neutral-950" />
              )}
            </button>

            {isAlertsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121622] shadow-2xl p-3 z-50 text-xs"
                onMouseLeave={() => setIsAlertsOpen(false)}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    Risk Alerts ({unreadAlertsCount} active)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAlertsOpen(false);
                      onTabChange('alerts');
                    }}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    View All <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-2.5 rounded border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/60 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                              : alert.severity === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-500 border-sky-500/30'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {alert.timestamp}
                        </span>
                      </div>
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {alert.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {alert.metricChange}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Connect / Wallet Button */}
          {isConnected && activeWallet ? (
            <button
              type="button"
              onClick={openWalletModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#161c28] text-neutral-800 dark:text-neutral-200 hover:border-emerald-500/50 hover:text-emerald-500 dark:hover:text-emerald-400 text-xs font-mono transition-colors shadow-xs"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold">{activeWallet.shortAddress}</span>
              <span className="hidden sm:inline text-neutral-400 dark:text-neutral-500 font-normal">
                ${(activeWallet.totalValueUsd / 1000).toFixed(0)}k
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openWalletModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-semibold text-xs transition-colors shadow-xs"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
