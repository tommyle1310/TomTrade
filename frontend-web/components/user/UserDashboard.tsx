'use client';

import { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Eye,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/authStore";
import { useTranslation } from "@/lib/translations";
import { staggerContainer, staggerItem, cardHover } from "@/lib/motionVariants";
import { cn } from "@/lib/utils";
import { useUserMetricCards } from "@/lib/hooks/useUserMetricCards";

type PortfolioItem = {
  ticker: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
};

const mockPortfolio: PortfolioItem[] = [
  { ticker: "AAPL", quantity: 10, avgPrice: 150.00, currentPrice: 165.50, pnl: 155.00, pnlPercent: 10.33 },
  { ticker: "TSLA", quantity: 5, avgPrice: 200.00, currentPrice: 185.00, pnl: -75.00, pnlPercent: -7.5 },
  { ticker: "MSFT", quantity: 8, avgPrice: 300.00, currentPrice: 325.00, pnl: 200.00, pnlPercent: 8.33 },
];

const mockWatchlist = [
  { ticker: "GOOGL", price: 142.50, change: 2.5, changePercent: 1.78 },
  { ticker: "AMZN", price: 135.20, change: -1.8, changePercent: -1.31 },
  { ticker: "NVDA", price: 485.00, change: 15.2, changePercent: 3.23 },
];

export default function UserDashboard() {
  const { user, getUserDisplayName } = useAuthStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist'>('portfolio');
  const { data: metricCards, loading: metricsLoading, error: metricsError } = useUserMetricCards();

  // Find specific metric cards by title
  const portfolioValueCard = metricCards?.find(card => card.title === 'Portfolio Value');
  const totalPnLCard = metricCards?.find(card => card.title === 'Total P&L');
  const openPositionsCard = metricCards?.find(card => card.title === 'Open Position');
  const accountStatusCard = metricCards?.find(card => card.title === 'Account Status');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('dashboard.welcome')}, {getUserDisplayName()}
          </h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.overview')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="shadow-sm hover:shadow transition-shadow">
            <Plus className="size-4 mr-2" />
            {t('trading.buy')}
          </Button>
          <Button variant="outline" className="shadow-sm hover:shadow transition-shadow">
            <Minus className="size-4 mr-2" />
            {t('trading.sell')}
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Portfolio Value Card */}
        <motion.div variants={staggerItem}>
          <Card className="gap-0 py-4 card-interactive border-0 shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row px-4 items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.portfolioValue')}</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <DollarSign className="size-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="px-4">
              {metricsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : metricsError ? (
                <p className="text-sm text-danger">Error loading data</p>
              ) : portfolioValueCard ? (
                <>
                  <div className="text-2xl font-bold">${parseFloat(portfolioValueCard.value).toLocaleString()}</div>
                  <p className={cn(
                    "text-xs font-medium",
                    (portfolioValueCard.change ?? 0) >= 0 ? "text-success" : "text-danger"
                  )}>
                    {(portfolioValueCard.change ?? 0) >= 0 ? '+' : ''}${portfolioValueCard.change?.toFixed(2)} ({portfolioValueCard.changeExtraData || '0%'})
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Total P&L Card */}
        <motion.div variants={staggerItem}>
          <Card className="gap-0 py-4 card-interactive border-0 shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row px-4 items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.totalPnL')}</CardTitle>
              <div className={cn(
                "p-2 rounded-full",
                (totalPnLCard?.change ?? 0) >= 0 ? "bg-success/10" : "bg-danger/10"
              )}>
                {(totalPnLCard?.change ?? 0) >= 0 ? (
                  <TrendingUp className="size-4 text-success" />
                ) : (
                  <TrendingDown className="size-4 text-danger" />
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4">
              {metricsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : metricsError ? (
                <p className="text-sm text-danger">Error loading data</p>
              ) : totalPnLCard ? (
                <>
                  <div className={cn(
                    "text-2xl font-bold",
                    parseFloat(totalPnLCard.value) >= 0 ? "text-success" : "text-danger"
                  )}>
                    {parseFloat(totalPnLCard.value) >= 0 ? '+' : ''}${parseFloat(totalPnLCard.value).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(totalPnLCard.change ?? 0) >= 0 ? '+' : ''}{totalPnLCard.change?.toFixed(2)}% {totalPnLCard.changeExtraData || ''}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Open Positions Card */}
        <motion.div variants={staggerItem}>
          <Card className="gap-0 py-4 card-interactive border-0 shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row px-4 items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.openPositions')}</CardTitle>
              <div className="p-2 rounded-full bg-chart-1/10">
                <BarChart3 className="size-4 text-chart-1" />
              </div>
            </CardHeader>
            <CardContent className="px-4">
              {metricsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : metricsError ? (
                <p className="text-sm text-danger">Error loading data</p>
              ) : openPositionsCard ? (
                <>
                  <div className="text-2xl font-bold">{openPositionsCard.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {openPositionsCard.change || 0} {openPositionsCard.changeExtraData || ''}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Status Card */}
        <motion.div variants={staggerItem}>
          <Card className="gap-0 py-4 card-interactive border-0 shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row px-4 items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
              <div className={cn(
                "p-2 rounded-full",
                accountStatusCard?.value === 'Active' ? "bg-success/10" : "bg-danger/10"
              )}>
                <Activity className={cn(
                  "size-4",
                  accountStatusCard?.value === 'Active' ? "text-success" : "text-danger"
                )} />
              </div>
            </CardHeader>
            <CardContent className="px-4">
              {metricsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : metricsError ? (
                <p className="text-sm text-danger">Error loading data</p>
              ) : accountStatusCard ? (
                <>
                  <div className={cn(
                    "text-2xl font-bold",
                    accountStatusCard.value === 'Active' ? "text-success" : "text-danger"
                  )}>
                    {accountStatusCard.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {accountStatusCard.extraData || `${t('user.joinedOn')} ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Row 2: Portfolio/Watchlist Tabs + Recent Activity & Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Section 1: Portfolio/Watchlist Tabs (7/12) */}
        <div className="lg:col-span-7 h-full">
          <div className="h-full flex flex-col justify-center space-y-6">
            <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
              <Button
                variant={activeTab === 'portfolio' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('portfolio')}
                className="flex-1 transition-all"
              >
                {t('nav.portfolio')}
              </Button>
              <Button
                variant={activeTab === 'watchlist' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('watchlist')}
                className="flex-1 transition-all"
              >
                {t('nav.watchlist')}
              </Button>
            </div>

            {activeTab === 'portfolio' ? (
              <Card className="justify-end gap-2 h-full border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>{t('portfolio.holdings')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPortfolio.map((item) => (
                      <motion.div
                        key={item.ticker}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold">{item.ticker}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} {t('portfolio.quantity').toLowerCase()} @ ${item.avgPrice}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${item.currentPrice}</div>
                          <div className={cn(
                            "text-sm font-medium",
                            item.pnl >= 0 ? "text-success" : "text-danger"
                          )}>
                            {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)} ({item.pnlPercent >= 0 ? '+' : ''}{item.pnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Plus className="size-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Minus className="size-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-grow border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>{t('nav.watchlist')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockWatchlist.map((item) => (
                      <motion.div
                        key={item.ticker}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div>
                          <div className="font-semibold">{item.ticker}</div>
                          <div className="text-sm text-muted-foreground">
                            ${item.price}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            'font-semibold',
                            item.change >= 0 ? 'text-success' : 'text-danger'
                          )}>
                            {item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}
                          </div>
                          <div className={cn(
                            'text-sm',
                            item.changePercent >= 0 ? 'text-success' : 'text-danger'
                          )}>
                            {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Eye className="size-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Section 2: Recent Activity & Market Overview (5/12) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recent Activity */}
          <Card className="gap-2">
            <CardHeader>
              <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">{t('trading.buy')} 5 AAPL</div>
                      <div className="text-xs text-muted-foreground">{t('time.hoursAgo', { count: '2' })}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">$825.00</div>
                    <div className="text-xs text-muted-foreground">@ $165.00</div>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-danger rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">{t('trading.sell')} 3 TSLA</div>
                      <div className="text-xs text-muted-foreground">{t('time.daysAgo', { count: '1' })}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">$555.00</div>
                    <div className="text-xs text-muted-foreground">@ $185.00</div>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">{t('common.add')} GOOGL {t('nav.watchlist').toLowerCase()}</div>
                      <div className="text-xs text-muted-foreground">{t('time.daysAgo', { count: '3' })}</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Market Overview */}
          <Card className="gap-2">
            <CardHeader>
              <CardTitle>{t('dashboard.marketOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>S&P 500</span>
                    <span className="text-success">+1.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>NASDAQ</span>
                    <span className="text-danger">-0.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>DOW</span>
                    <span className="text-success">+0.5%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>VIX</span>
                    <span className="text-muted-foreground">18.5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>10Y Treasury</span>
                    <span className="text-muted-foreground">4.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>USD Index</span>
                    <span className="text-success">+0.3%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Portfolio Chart + Top Movers + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Portfolio Chart (5/12) */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.portfolioPerformance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="size-12 mx-auto mb-3" />
                  <p className="text-sm font-medium">{t('dashboard.portfolioChart')}</p>
                  <p className="text-xs">{t('dashboard.performanceOverTime')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Movers (3/12) */}
        <div className="lg:col-span-3 h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t('dashboard.topMovers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">NVDA</span>
                  <span className="text-sm text-success">+15.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">TSLA</span>
                  <span className="text-sm text-danger">-8.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">META</span>
                  <span className="text-sm text-success">+6.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">AAPL</span>
                  <span className="text-sm text-success">+3.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">GOOGL</span>
                  <span className="text-sm text-danger">-2.4%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (4/12) */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Plus className="size-4 mr-2" />
                  {t('trading.buy')}
                </Button>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Minus className="size-4 mr-2" />
                  {t('trading.sell')}
                </Button>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Eye className="size-4 mr-2" />
                  {t('nav.watchlist')}
                </Button>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <BarChart3 className="size-4 mr-2" />
                  {t('common.viewChart')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
