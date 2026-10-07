import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { Modal } from '../common/Modal';
import {
  Wallet,
  CheckCircle2,
  Copy,
  ExternalLink,
  LogOut,
  Sparkles,
  Search,
} from 'lucide-react';

export const WalletModal: React.FC = () => {
  const {
    isConnected,
    activeWallet,
    walletType,
    isWalletModalOpen,
    closeWalletModal,
    connectWallet,
    connectCustomAddress,
    disconnect,
    availableDemoWallets,
  } = useWallet();

  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (activeWallet) {
      navigator.clipboard?.writeText(activeWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      connectCustomAddress(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <Modal
      isOpen={isWalletModalOpen}
      onClose={closeWalletModal}
      title={isConnected ? 'Solana Wallet Account' : 'Connect Solana Wallet'}
      subtitle={
        isConnected
          ? 'Manage connected wallet, inspect positions, or switch portfolio'
          : 'Select a demo portfolio or enter any Solana public key'
      }
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Active Account Status if connected */}
        {isConnected && activeWallet && (
          <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs">
                  SOL
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {activeWallet.name}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                    {activeWallet.address.slice(0, 12)}...{activeWallet.address.slice(-6)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://solscan.io/account/${activeWallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  title="View on Solscan"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {copied && (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Public key copied to clipboard
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800/80 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500">Portfolio Value</span>
                <div className="font-mono font-semibold text-neutral-900 dark:text-white">
                  ${activeWallet.totalValueUsd.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500">Aggregate HF</span>
                <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {activeWallet.aggregateHealthFactor.toFixed(2)}x
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500">Positions</span>
                <div className="font-mono font-semibold text-neutral-900 dark:text-white">
                  {activeWallet.positionsCount} active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Wallets Selection */}
        <div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
            Switch Demo Portfolios
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {availableDemoWallets.map((wallet) => {
              const isSelected = walletType === wallet.id && isConnected;
              return (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => connectWallet(wallet.id as any)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                      {wallet.name}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 truncate mb-1">
                    {wallet.shortAddress}
                  </div>
                  <div className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                    ${(wallet.totalValueUsd / 1000).toFixed(0)}k
                  </div>
                </button>
              );
            })}
          </div>

          {/* Group consolidated button */}
          <button
            type="button"
            onClick={() => connectWallet('group')}
            className={`w-full mt-2 p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors ${
              walletType === 'group' && isConnected
                ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Consolidate all 3 demo wallets as a unified portfolio</span>
            </div>
            <span className="font-mono font-semibold">$2.36M TVL</span>
          </button>
        </div>

        {/* Enter Custom Solana Address */}
        <div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
            Monitor Any Address or .sol Domain
          </div>
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. toly.sol or base58 pubkey..."
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="px-4 py-2 text-xs font-semibold rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-40 transition-colors"
            >
              Load
            </button>
          </form>
        </div>

        {/* Browser Extension Simulation */}
        <div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
            Solana Wallets
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => connectWallet('phantom')}
              className="p-2.5 rounded border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium flex items-center gap-2 text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <div className="w-5 h-5 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                P
              </div>
              <span>Phantom</span>
            </button>
            <button
              type="button"
              onClick={() => connectWallet('phantom')}
              className="p-2.5 rounded border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium flex items-center gap-2 text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <div className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                S
              </div>
              <span>Solflare</span>
            </button>
          </div>
        </div>

        {/* Disconnect Action */}
        {isConnected && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
            <button
              type="button"
              onClick={() => {
                disconnect();
                closeWalletModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
