export type RiskTier = 'SAFE' | 'WATCH' | 'WARNING' | 'HIGH RISK' | 'CRITICAL';

export type ProtocolId = 'kamino' | 'marginfi' | 'drift' | 'jupiter' | 'raydium' | 'meteora';

export interface CollateralItem {
  symbol: string;
  amount: number;
  valueUsd: number;
  weight: number;
}

export interface DebtItem {
  symbol: string;
  amount: number;
  valueUsd: number;
  rate: number;
}

export interface RiskAnalysis {
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}

export interface Position {
  id: string;
  walletId: string;
  asset: string;
  protocol: ProtocolId;
  protocolName: string;
  strategyType: 'Multiply' | 'Borrow/Lend' | 'Liquidity Vault' | 'Perp Margin';
  suppliedAmount: number;
  suppliedAsset: string;
  suppliedUsd: number;
  borrowedAmount: number;
  borrowedAsset: string;
  borrowedUsd: number;
  netApy: number;
  supplyApy: number;
  borrowApy: number;
  healthFactor: number;
  liquidationPrice: number;
  currentPrice: number;
  liquidationDistancePct: number;
  riskTier: RiskTier;
  change24h: number;
  historicalHealth: { time: string; hf: number }[];
  collateralAssets: CollateralItem[];
  debtAssets: DebtItem[];
  analysis: RiskAnalysis;
}

export interface WalletProfile {
  id: string;
  name: string;
  address: string;
  shortAddress: string;
  badge: string;
  avatarPattern: string;
  totalValueUsd: number;
  totalCollateralUsd: number;
  totalDebtUsd: number;
  netWorthUsd: number;
  aggregateHealthFactor: number;
  pnl24hUsd: number;
  pnl24hPct: number;
  positionsCount: number;
  criticalCount: number;
  warningCount: number;
}

export interface AlertItem {
  id: string;
  title: string;
  severity: RiskTier;
  protocol: ProtocolId;
  positionId: string;
  positionAsset: string;
  reason: string;
  timestamp: string;
  metricChange: string;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface MarketTicker {
  symbol: string;
  name: string;
  pair: string;
  price: number;
  oraclePrice: number;
  change24h: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  openInterestUsd: number;
  fundingRate: number;
  nextFundingCountdown: string;
}

export interface ActivityEvent {
  id: string;
  type: 'health_drop' | 'rebalance' | 'borrow_rate_spike' | 'collateral_deposit' | 'liquidation_warning';
  title: string;
  protocol: string;
  asset: string;
  description: string;
  timestamp: string;
  impact: string;
  severity: RiskTier;
  txHash?: string;
}

export type ViewTab = 'overview' | 'terminal' | 'positions' | 'radar' | 'alerts' | 'activity';
