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
import { useHoldings } from "@/lib/hooks/useHoldings";
import { useRecentActivities } from "@/lib/hooks/useRecentActivities";
import { useMarketOverview } from "@/lib/hooks/useMarketOverview";
import { useTopMovers } from "@/lib/hooks/useTopMovers";
import QuickTradeModal from "@/components/trading/QuickTradeModal";
import { OrderSide } from "@/lib/types";

const mockWatchlist = [
  { ticker: "GOOGL", price: 142.50, change: 2.5, changePercent: 1.78 },
  { ticker: "AMZN", price: 135.20, change: -1.8, changePercent: -1.31 },
  { ticker: "NVDA", price: 485.00, change: 15.2, changePercent: 3.23 },
];

export default function UserDashboard() {
  const { user, getUserDisplayName } = useAuthStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist'>('portfolio');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedSide, setSelectedSide] = useState<OrderSide>(OrderSide.BUY);
  const [selectedTicker, setSelectedTicker] = useState('');
  const { data: metricCards, loading: metricsLoading, error: metricsError } = useUserMetricCards();
  const { data: holdings, loading: holdingsLoading, error: holdingsError } = useHoldings(1, 10);
  const { data: activities, loading: activitiesLoading, error: activitiesError } = useRecentActivities(1, 3);
  const { data: marketOverview, loading: marketLoading, error: marketError } = useMarketOverview(1, 6);
  const { data: topMovers, loading: moversLoading, error: moversError } = useTopMovers(1, 5, 'gainers');

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
          <Button
            variant="outline"
            className="glass-subtle border-glass-border shadow-md hover:shadow-lg transition-shadow font-medium"
            onClick={() => {
              setSelectedSide(OrderSide.BUY);
              setSelectedTicker('');
              setTradeModalOpen(true);
            }}
          >
            <Plus className="size-4 mr-2" />
            {t('trading.buy')}
          </Button>
          <Button
            variant="outline"
            className="glass-subtle border-glass-border shadow-md hover:shadow-lg transition-shadow font-medium"
            onClick={() => {
              setSelectedSide(OrderSide.SELL);
              setSelectedTicker('');
              setTradeModalOpen(true);
            }}
          >
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
          <Card className="glass-strong border-glass-border shadow-elevated hover:shadow-elevated-lg transition-all duration-200 cursor-pointer group">
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
          <Card className="glass-strong border-glass-border shadow-elevated hover:shadow-elevated-lg transition-all duration-200 cursor-pointer group">
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
          <Card className="glass-strong border-glass-border shadow-elevated hover:shadow-elevated-lg transition-all duration-200 cursor-pointer group">
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
          <Card className="glass-strong border-glass-border shadow-elevated hover:shadow-elevated-lg transition-all duration-200 cursor-pointer group">
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
                  {holdingsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : holdingsError ? (
                    <p className="text-sm text-danger py-4 text-center">Failed to load holdings</p>
                  ) : !holdings?.data || holdings.data.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No positions yet. Start trading to build your portfolio.</p>
                  ) : (
                    <div className="space-y-3">
                      {holdings.data.map((item) => (
                        <motion.div
                          key={item.symbol}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-semibold">{item.symbol}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.quantity} {t('portfolio.quantity').toLowerCase()} @ ${item.avgPrice.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${item.currentPrice.toFixed(2)}</div>
                            <div className="flex items-center gap-1">
                              <Badge variant={item.side === 'profit' ? 'default' : 'destructive'} className="text-xs">
                                {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)} ({item.pnlPercent >= 0 ? '+' : ''}{item.pnlPercent.toFixed(2)}%)
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setSelectedSide(OrderSide.BUY);
                                setSelectedTicker(item.symbol);
                                setTradeModalOpen(true);
                              }}
                            >
                              <Plus className="size-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setSelectedSide(OrderSide.SELL);
                                setSelectedTicker(item.symbol);
                                setTradeModalOpen(true);
                              }}
                            >
                              <Minus className="size-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
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
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : activitiesError ? (
                <p className="text-sm text-danger py-4 text-center">Failed to load activities</p>
              ) : !activities?.data || activities.data.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent activities</p>
              ) : (
                <div className="space-y-3">
                  {activities.data.map((activity, idx) => (
                    <motion.div
                      key={`${activity.ticker}-${activity.timestamp}`}
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          activity.type === 'BUY' ? "bg-success" : "bg-danger"
                        )}></div>
                        <div>
                          <div className="font-medium text-sm">
                            {activity.type === 'BUY' ? t('trading.buy') : t('trading.sell')} {activity.shares} {activity.ticker}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">${(activity.avgPrice * activity.shares).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">@ ${activity.avgPrice.toFixed(2)}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market Overview */}
          <Card className="gap-2">
            <CardHeader>
              <CardTitle>{t('dashboard.marketOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              {marketLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : marketError ? (
                <p className="text-sm text-danger py-4 text-center">Failed to load market data</p>
              ) : !marketOverview?.data || marketOverview.data.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Market data unavailable</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {marketOverview.data.map((item) => (
                    <div key={item.key} className="flex justify-between items-center text-sm">
                      <span>{item.label}</span>
                      <span className={cn(
                        "flex items-center gap-1 font-medium",
                        item.trend === 'up' ? "text-success" :
                          item.trend === 'down' ? "text-danger" :
                            "text-muted-foreground"
                      )}>
                        {item.trend === 'up' && <ArrowUpRight className="size-3" />}
                        {item.trend === 'down' && <ArrowDownRight className="size-3" />}
                        {item.value > 0 && item.unit === '%' ? '+' : ''}{item.value}{item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
              {moversLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : moversError ? (
                <p className="text-sm text-danger py-4 text-center">Failed to load top movers</p>
              ) : !topMovers?.data || topMovers.data.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No data available</p>
              ) : (
                <div className="space-y-3">
                  {topMovers.data.map((mover) => (
                    <div key={mover.symbol} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {mover.avatar ? (
                          <img
                            src={mover.avatar}
                            alt={mover.symbol}
                            className="size-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="size-6 rounded-full bg-muted flex items-center justify-center">
                            <BarChart3 className="size-3" />
                          </div>
                        )}
                        <span className="text-sm font-medium">{mover.symbol}</span>
                      </div>
                      <Badge variant={mover.value > 0 ? 'default' : 'destructive'} className="text-xs">
                        {mover.value > 0 ? '+' : ''}{mover.value.toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedSide(OrderSide.BUY);
                    setSelectedTicker('');
                    setTradeModalOpen(true);
                  }}
                >
                  <Plus className="size-4 mr-2" />
                  {t('trading.buy')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedSide(OrderSide.SELL);
                    setSelectedTicker('');
                    setTradeModalOpen(true);
                  }}
                >
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

      {/* Quick Trade Modal */}
      <QuickTradeModal
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
        defaultSide={selectedSide}
        defaultTicker={selectedTicker}
      />
    </div>
  );
}
