import React, { createContext, useContext, useState, useMemo } from 'react';
import { WalletProfile } from '../types';
import { DEMO_WALLETS, GROUP_WALLET } from '../data/mockData';

interface WalletContextType {
  isConnected: boolean;
  activeWallet: WalletProfile | null;
  walletType: 'whale' | 'jup-staker' | 'airdrop-farmer' | 'group' | 'custom' | 'phantom';
  isConnecting: boolean;
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connectWallet: (walletId: 'whale' | 'jup-staker' | 'airdrop-farmer' | 'group' | 'phantom') => void;
  connectCustomAddress: (address: string) => void;
  disconnect: () => void;
  availableDemoWallets: WalletProfile[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [walletType, setWalletType] = useState<'whale' | 'jup-staker' | 'airdrop-farmer' | 'group' | 'custom' | 'phantom'>('whale');
  const [customProfile, setCustomProfile] = useState<WalletProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  const activeWallet = useMemo(() => {
    if (!isConnected) return null;
    if (walletType === 'group') return GROUP_WALLET;
    if (walletType === 'custom' && customProfile) return customProfile;
    if (walletType === 'phantom') {
      return {
        id: 'phantom',
        name: 'Phantom Wallet',
        address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        shortAddress: '7xKX...gAsU',
        badge: 'Connected · Phantom',
        avatarPattern: 'phantom-purple',
        totalValueUsd: 1145200,
        totalCollateralUsd: 890000,
        totalDebtUsd: 342000,
        netWorthUsd: 803200,
        aggregateHealthFactor: 1.54,
        pnl24hUsd: -18400,
        pnl24hPct: -2.85,
        positionsCount: 5,
        criticalCount: 0,
        warningCount: 1,
      };
    }
    const found = DEMO_WALLETS.find((w) => w.id === walletType);
    return found || DEMO_WALLETS[0];
  }, [isConnected, walletType, customProfile]);

  const connectWallet = (type: 'whale' | 'jup-staker' | 'airdrop-farmer' | 'group' | 'phantom') => {
    setIsConnecting(true);
    setTimeout(() => {
      setWalletType(type);
      setIsConnected(true);
      setIsConnecting(false);
      setIsWalletModalOpen(false);
    }, 250);
  };

  const connectCustomAddress = (address: string) => {
    setIsConnecting(true);
    const cleanAddr = address.trim();
    const short = cleanAddr.length > 8 ? `${cleanAddr.slice(0, 4)}...${cleanAddr.slice(-4)}` : cleanAddr;

    setTimeout(() => {
      const generatedProfile: WalletProfile = {
        id: 'custom-' + Date.now(),
        name: cleanAddr.endsWith('.sol') ? cleanAddr : 'Custom Wallet',
        address: cleanAddr,
        shortAddress: short,
        badge: 'Live Monitored',
        avatarPattern: 'cyan-purple',
        totalValueUsd: 642800,
        totalCollateralUsd: 520000,
        totalDebtUsd: 182000,
        netWorthUsd: 460800,
        aggregateHealthFactor: 1.62,
        pnl24hUsd: -12400,
        pnl24hPct: -2.62,
        positionsCount: 4,
        criticalCount: 0,
        warningCount: 1,
      };
      setCustomProfile(generatedProfile);
      setWalletType('custom');
      setIsConnected(true);
      setIsConnecting(false);
      setIsWalletModalOpen(false);
    }, 350);
  };

  const disconnect = () => {
    setIsConnected(false);
  };

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        activeWallet,
        walletType,
        isConnecting,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        connectWallet,
        connectCustomAddress,
        disconnect,
        availableDemoWallets: DEMO_WALLETS,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
