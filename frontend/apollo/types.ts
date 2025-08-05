// GraphQL Types
export interface User {
  id: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
}

export interface AuthPayload {
  accessToken: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
}

export interface StockPosition {
  ticker: string;
  companyName: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface DashboardResult {
  cashBalance: number;
  totalPortfolioValue: number;
  totalPnL: number;
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  stockPositions: StockPosition[];
}

export interface Portfolio {
  ticker: string;
  quantity: number;
  averagePrice: number;
}

export interface Transaction {
  id: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  timestamp: string;
}

export interface Order {
  id: string;
  ticker: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP_LIMIT' | 'STOP_MARKET';
  quantity: number;
  price: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'PARTIAL';
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  createdAt: string;
  matchedAt?: string;
}

export interface OrderBook {
  buyOrders: Order[];
  sellOrders: Order[];
}

export interface PlaceOrderInput {
  ticker: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  quantity: number;
  price: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

export interface PlaceStopOrderInput {
  ticker: string;
  side: 'BUY' | 'SELL';
  type: 'STOP_LIMIT' | 'STOP_MARKET';
  quantity: number;
  price: number;
  triggerPrice: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

export interface Stock {
  ticker: string;
  companyName: string;
  exchange: string;
  sector?: string;
  industry?: string;
  marketCap?: string;
  currency?: string;
  marketData?: MarketData[];
  news?: News[];
}

export interface MarketData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: string;
  timestamp: string;
}

export interface News {
  id: string;
  headline: string;
  summary?: string;
  publishedAt: string;
  source?: string;
  url?: string;
}

export interface Watchlist {
  id: string;
  name: string;
  createdAt: string;
  stocks: Stock[];
}

export interface CreateWatchlistInput {
  name: string;
}

export interface AddStockToWatchlistInput {
  watchlistId: string;
  ticker: string;
}

export interface AlertRule {
  id: string;
  ticker: string;
  ruleType: string;
  targetValue: number;
  createdAt: string;
}

export interface CreateAlertRuleInput {
  ticker: string;
  ruleType: string;
  targetValue: number;
}

// Enums
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
  GTC = 'GTC',
  IOC = 'IOC',
  FOK = 'FOK',
}

export enum Interval {
  _1m = '_1m',
  _5m = '_5m',
  _1h = '_1h',
  _1d = '_1d',
}

export enum TransactionAction {
  BUY = 'BUY',
  SELL = 'SELL',
}
