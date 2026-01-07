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

// Dashboard Analytics Types
export interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  side: string; // "profit" | "loss" | "neutral"
}

export interface HoldingPaginationResponse {
  data: Holding[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Activity {
  type: string; // "BUY" | "SELL"
  timestamp: string;
  ticker: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

export interface ActivityPaginationResponse {
  data: Activity[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MarketOverviewItem {
  key: string;
  label: string;
  value: number;
  unit: string;
  trend: string; // "up" | "down" | "neutral"
}

export interface MarketOverviewPaginationResponse {
  data: MarketOverviewItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TopMover {
  symbol: string;
  avatar: string | null;
  value: number; // percentage change
}

export interface TopMoversPaginationResponse {
  data: TopMover[];
  total: number;
  page: number;
  totalPages: number;
}

// Trading Order Types
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LIMIT = 'STOP_LIMIT',
  STOP_MARKET = 'STOP_MARKET',
}

export enum OrderStatus {
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  PARTIAL = 'PARTIAL',
}

export enum TimeInForce {
  GTC = 'GTC', // Good Till Cancelled
  IOC = 'IOC', // Immediate or Cancel
  FOK = 'FOK', // Fill or Kill
}

export interface PlaceOrderInput {
  ticker: string;
  price: number;
  quantity: number;
  side: OrderSide;
  type: OrderType;
  timeInForce: TimeInForce;
}

export interface Order {
  id: string;
  ticker: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  quantity: number;
  status: OrderStatus;
  timeInForce: TimeInForce;
  createdAt: string;
  matchedAt?: string;
}

export interface OrderBook {
  buyOrders: Order[];
  sellOrders: Order[];
}
