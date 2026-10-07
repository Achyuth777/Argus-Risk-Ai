import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider } from './context/WalletContext';
import { RiskProvider } from './context/RiskContext';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/overview/OverviewView';
import { TerminalView } from './components/terminal/TerminalView';
import { PositionsView } from './components/positions/PositionsView';
import { RadarView } from './components/radar/RadarView';
import { AlertsView } from './components/alerts/AlertsView';
import { ActivityView } from './components/activity/ActivityView';
import { PositionDetailDrawer } from './components/positions/PositionDetailDrawer';
import { WalletModal } from './components/wallet/WalletModal';
import { ViewTab } from './types';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('overview');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-main)] transition-colors">
      {/* 3-Zone Global Navigation */}
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        {currentTab === 'overview' && (
          <OverviewView
            onNavigateToPositions={() => setCurrentTab('positions')}
            onNavigateToRadar={() => setCurrentTab('radar')}
          />
        )}
        {currentTab === 'terminal' && <TerminalView />}
        {currentTab === 'positions' && <PositionsView />}
        {currentTab === 'radar' && <RadarView />}
        {currentTab === 'alerts' && <AlertsView />}
        {currentTab === 'activity' && <ActivityView />}
      </main>

      {/* Global Slide-over Position Detail Drawer */}
      <PositionDetailDrawer />

      {/* Global Wallet Modal */}
      <WalletModal />

      {/* Financial Terminal Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-[#090b0f]/70 py-4 px-4 sm:px-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-white font-sans">
              ARGUS V2
            </span>
            <span>—</span>
            <span>Autonomous Solana DeFi Risk Intelligence Terminal</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Pyth / Switchboard Feeds Synced</span>
            </span>
            <span className="text-neutral-400">·</span>
            <span>Mainnet-beta: 2,140 TPS</span>
            <span className="text-neutral-400">·</span>
            <span>v2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <RiskProvider>
          <MainApp />
        </RiskProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
