export interface MetricWithDateRange {
  startDate: number;
  endDate: number;
}

export interface EquityDrawdownPoint {
  date: string;
  equity: number;
  maxDrawdown: number;
}

export interface PnLPoint {
  date: string;
  pnl: number;
}

export interface MostTradedStock {
  ticker: string;
  companyName: string;
  volume: number;
  shareOfVolume: number;
}

export interface TopUser {
  id: string;
  name: string;
  avatar?: string;
  pnl: number;
  totalValue: number;
}

export interface SystemDashboardResult {
  totalRevenue: MetricWithDateRange;
  totalTradesExecuted: MetricWithDateRange;
  winRate: MetricWithDateRange;
  maxDrawdown: MetricWithDateRange;
  equityAndDrawdown: EquityDrawdownPoint[];
  pnlOverTime: PnLPoint[];
  mostTradedStocks: MostTradedStock[];
  arpu: MetricWithDateRange;
  churnRate: MetricWithDateRange;
  averageTradeSize: MetricWithDateRange;
  marginCallAlerts: MetricWithDateRange;
  serviceUptime: MetricWithDateRange;
  topUsers: TopUser[];
}

export interface SystemDashboardInput {
  startDate: string;
  endDate: string;
  compareStartDate?: string;
  compareEndDate?: string;
}

// User Dashboard Types
export interface StockPosition {
  ticker: string;
  companyName: string;
  avatar: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface DashboardResult {
  totalPortfolioValue: number;
  stocksOnlyValue: number;
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  totalPnL: number;
  cashBalance: number;
  stockPositions: StockPosition[];
}

// User Metric Card Types
export interface MetricCard {
  title: string;
  value: string;
  valueUnit?: string | null;
  valueType?: string | null;
  change?: number | null;
  changeType?: string | null;
  changeExtraData?: string | null;
  extraData?: string | null;
}
