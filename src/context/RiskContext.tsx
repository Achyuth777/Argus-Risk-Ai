import React, { createContext, useContext, useState, useMemo } from 'react';
import { Position, AlertItem, RiskTier } from '../types';
import { POSITIONS_DATA, ALERT_ITEMS } from '../data/mockData';
import { useWallet } from './WalletContext';

interface RiskContextType {
  positions: Position[];
  selectedPosition: Position | null;
  setSelectedPosition: (pos: Position | null) => void;
  solCrashPct: number;
  setSolCrashPct: (pct: number) => void;
  stressedPositions: (Position & { stressedHf: number; stressedDistance: number; isLiquidated: boolean })[];
  totalLiquidatedCount: number;
  totalLiquidationCapitalAtRisk: number;
  alerts: AlertItem[];
  acknowledgeAlert: (alertId: string) => void;
  addCustomAlert: (title: string, severity: RiskTier, asset: string, metric: string) => void;
  simulateRepay: (positionId: string, amountUsd: number) => { newHf: number; newLiqPrice: number };
  simulateAddCollateral: (positionId: string, amountUsd: number) => { newHf: number; newLiqPrice: number };
}

const RiskContext = createContext<RiskContextType | undefined>(undefined);

export const RiskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { walletType } = useWallet();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [solCrashPct, setSolCrashPct] = useState<number>(0);
  const [alerts, setAlerts] = useState<AlertItem[]>(ALERT_ITEMS);

  // Active positions for the selected wallet profile
  const positions = useMemo(() => {
    if (walletType === 'group') {
      return POSITIONS_DATA;
    }
    if (walletType === 'custom' || walletType === 'phantom') {
      // Return a balanced subset
      return POSITIONS_DATA.filter((p) => p.walletId === 'whale' || p.walletId === 'airdrop-farmer');
    }
    return POSITIONS_DATA.filter((p) => p.walletId === walletType);
  }, [walletType]);

  // Compute stressed positions under what-if price crash scenario
  const stressedPositions = useMemo(() => {
    const crashFactor = (100 - solCrashPct) / 100;

    return positions.map((p) => {
      // If position has debt and SOL collateral, calculate stressed HF
      const isSolCollateral = p.collateralAssets.some((c) => c.symbol.includes('SOL'));
      const solCollateralPortion = isSolCollateral ? 0.9 : 0.3;

      // New stressed collateral value
      const stressedCollateral = p.suppliedUsd * (1 - (solCrashPct / 100) * solCollateralPortion);
      
      // Recompute HF
      let stressedHf = p.healthFactor;
      if (p.borrowedUsd > 0) {
        // HF = (Collateral * LTV) / Debt
        const impliedLtv = (p.healthFactor * p.borrowedUsd) / p.suppliedUsd;
        stressedHf = Number(((stressedCollateral * impliedLtv) / p.borrowedUsd).toFixed(2));
      }

      // Recompute distance
      const stressedDistance = Math.max(0, Number((p.liquidationDistancePct - solCrashPct).toFixed(1)));
      const isLiquidated = stressedHf <= 1.00 || (p.borrowedUsd > 0 && stressedDistance <= 0);

      return {
        ...p,
        stressedHf: Math.max(0.1, stressedHf),
        stressedDistance,
        isLiquidated,
      };
    });
  }, [positions, solCrashPct]);

  const totalLiquidatedCount = useMemo(() => {
    return stressedPositions.filter((p) => p.isLiquidated).length;
  }, [stressedPositions]);

  const totalLiquidationCapitalAtRisk = useMemo(() => {
    return stressedPositions
      .filter((p) => p.isLiquidated || p.stressedDistance < 10)
      .reduce((acc, curr) => acc + curr.borrowedUsd + curr.suppliedUsd, 0);
  }, [stressedPositions]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const addCustomAlert = (title: string, severity: RiskTier, asset: string, metric: string) => {
    const newAlert: AlertItem = {
      id: 'custom-alert-' + Date.now(),
      title,
      severity,
      protocol: 'kamino',
      positionId: 'custom-pos',
      positionAsset: asset,
      reason: `Custom risk threshold rule: ${metric}`,
      timestamp: 'Just now',
      metricChange: metric,
      recommendedAction: 'Check position parameters and rebalance margin buffer.',
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const simulateRepay = (positionId: string, amountUsd: number) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos || pos.borrowedUsd === 0) return { newHf: 9.99, newLiqPrice: 0 };
    const newDebt = Math.max(1, pos.borrowedUsd - amountUsd);
    const newHf = Number(((pos.healthFactor * pos.borrowedUsd) / newDebt).toFixed(2));
    const newLiqPrice = Number((pos.liquidationPrice * (newDebt / pos.borrowedUsd)).toFixed(2));
    return { newHf, newLiqPrice };
  };

  const simulateAddCollateral = (positionId: string, amountUsd: number) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return { newHf: 9.99, newLiqPrice: 0 };
    const ratio = (pos.suppliedUsd + amountUsd) / pos.suppliedUsd;
    const newHf = Number((pos.healthFactor * ratio).toFixed(2));
    const newLiqPrice = Number((pos.liquidationPrice / ratio).toFixed(2));
    return { newHf, newLiqPrice };
  };

  return (
    <RiskContext.Provider
      value={{
        positions,
        selectedPosition,
        setSelectedPosition,
        solCrashPct,
        setSolCrashPct,
        stressedPositions,
        totalLiquidatedCount,
        totalLiquidationCapitalAtRisk,
        alerts,
        acknowledgeAlert,
        addCustomAlert,
        simulateRepay,
        simulateAddCollateral,
      }}
    >
      {children}
    </RiskContext.Provider>
  );
};

export const useRisk = (): RiskContextType => {
  const context = useContext(RiskContext);
  if (!context) {
    throw new Error('useRisk must be used within a RiskProvider');
  }
  return context;
};
