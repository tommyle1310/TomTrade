'use client';

import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/authStore";

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
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist'>('portfolio');

  const totalPortfolioValue = mockPortfolio.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  const totalPnL = mockPortfolio.reduce((sum, item) => sum + item.pnl, 0);
  const totalPnLPercent = (totalPnL / (totalPortfolioValue - totalPnL)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {getUserDisplayName()}</h1>
          <p className="text-sm text-muted-foreground">Your trading dashboard and portfolio overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="size-4 mr-2" />
            Buy
          </Button>
          <Button variant="outline">
            <Minus className="size-4 mr-2" />
            Sell
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gap-0 py-4">
          <CardHeader className="flex flex-row px-4 items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)} ({totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-4">
          <CardHeader className="flex flex-row px-4 items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="size-4 text-green-600" />
            ) : (
              <TrendingDown className="size-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent className="px-4">
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}% today
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-4">
          <CardHeader className="flex flex-row px-4 items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <BarChart3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold">{mockPortfolio.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockPortfolio.filter(item => item.pnl > 0).length} profitable
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-4">
          <CardHeader className="flex flex-row px-4 items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Portfolio/Watchlist Tabs + Recent Activity & Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Section 1: Portfolio/Watchlist Tabs (7/12) */}
        <div className="lg:col-span-7 h-full">
          <div className="h-full flex flex-col justify-center space-y-6">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button
                variant={activeTab === 'portfolio' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('portfolio')}
                className="flex-1"
              >
                Portfolio
              </Button>
              <Button
                variant={activeTab === 'watchlist' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('watchlist')}
                className="flex-1"
              >
                Watchlist
              </Button>
            </div>

            {activeTab === 'portfolio' ? (
              <Card className=" justify-end gap-2 h-full">
                <CardHeader>
                  <CardTitle>Your Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPortfolio.map((item) => (
                      <div key={item.ticker} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold">{item.ticker}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} shares @ ${item.avgPrice}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${item.currentPrice}</div>
                          <div className={`text-sm ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)} ({item.pnlPercent >= 0 ? '+' : ''}{item.pnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Plus className="size-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Minus className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-grow bg-red-300">
                <CardHeader>
                  <CardTitle>Watchlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockWatchlist.map((item) => (
                      <div key={item.ticker} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold">{item.ticker}</div>
                            <div className="text-sm text-muted-foreground">
                              ${item.price}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}
                          </div>
                          <div className={`text-sm ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                      </div>
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
          <Card className="gap-2 ">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Bought 5 AAPL shares</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">$825.00</div>
                    <div className="text-xs text-muted-foreground">@ $165.00</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Sold 3 TSLA shares</div>
                      <div className="text-xs text-muted-foreground">1 day ago</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">$555.00</div>
                    <div className="text-xs text-muted-foreground">@ $185.00</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">Added GOOGL to watchlist</div>
                      <div className="text-xs text-muted-foreground">3 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Overview */}
          <Card className="gap-2 ">
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>S&P 500</span>
                    <span className="text-green-600">+1.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>NASDAQ</span>
                    <span className="text-red-600">-0.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>DOW</span>
                    <span className="text-green-600">+0.5%</span>
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
                    <span className="text-green-600">+0.3%</span>
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
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="size-12 mx-auto mb-3" />
                  <p className="text-sm font-medium">Portfolio Chart</p>
                  <p className="text-xs">Performance over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Movers (3/12) */}
        <div className="lg:col-span-3 h-full ">
          <Card className=" h-full">
            <CardHeader>
              <CardTitle>Top Movers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">NVDA</span>
                  <span className="text-sm text-green-600">+15.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">TSLA</span>
                  <span className="text-sm text-red-600">-8.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">META</span>
                  <span className="text-sm text-green-600">+6.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">AAPL</span>
                  <span className="text-sm text-green-600">+3.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">GOOGL</span>
                  <span className="text-sm text-red-600">-2.4%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (4/12) */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className=" cursor-pointer">
                  <Plus className="size-4 mr-2" />
                  Buy Stock
                </Button>
                <Button variant="outline" size="sm" className=" cursor-pointer">
                  <Minus className="size-4 mr-2" />
                  Sell Stock
                </Button>
                <Button variant="outline" size="sm" className=" cursor-pointer">
                  <Eye className="size-4 mr-2" />
                  Watchlist
                </Button>
                <Button variant="outline" size="sm" className=" cursor-pointer">
                  <BarChart3 className="size-4 mr-2" />
                  View Charts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
