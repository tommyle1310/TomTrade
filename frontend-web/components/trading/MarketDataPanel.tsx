'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketDataPanelProps {
    ticker: string;
}

// Mock data for demonstration - in production, this would come from a real API
interface MarketData {
    currentPrice: number;
    change: number;
    changePercent: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    marketCap: number;
}

interface RecentTrade {
    id: string;
    price: number;
    quantity: number;
    timestamp: string;
    side: 'BUY' | 'SELL';
}

export default function MarketDataPanel({ ticker }: MarketDataPanelProps) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);

    // Mock data fetching - replace with real API calls
    useEffect(() => {
        const fetchMarketData = async () => {
            // Only show loading spinner on initial load
            if (!marketData) {
                setIsInitialLoad(true);
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock data based on ticker
            const basePrice = ticker === 'AAPL' ? 150 : ticker === 'TSLA' ? 250 : ticker === 'NVDA' ? 500 : 100;
            const change = (Math.random() - 0.5) * 10;
            const changePercent = (change / basePrice) * 100;

            setMarketData({
                currentPrice: basePrice + change,
                change,
                changePercent,
                high24h: basePrice + Math.random() * 5,
                low24h: basePrice - Math.random() * 5,
                volume24h: Math.floor(Math.random() * 10000000),
                marketCap: Math.floor(Math.random() * 1000000000),
            });

            // Mock recent trades
            const trades: RecentTrade[] = [];
            for (let i = 0; i < 10; i++) {
                trades.push({
                    id: `trade-${i}`,
                    price: basePrice + (Math.random() - 0.5) * 2,
                    quantity: Math.floor(Math.random() * 100) + 1,
                    timestamp: new Date(Date.now() - i * 60000).toISOString(),
                    side: Math.random() > 0.5 ? 'BUY' : 'SELL',
                });
            }
            setRecentTrades(trades);

            setIsInitialLoad(false);
        };

        fetchMarketData();

        // Refresh every 5 seconds
        const interval = setInterval(fetchMarketData, 5000);
        return () => clearInterval(interval);
    }, [ticker]);

    const formatNumber = (num: number) => {
        if (num >= 1_000_000_000) {
            return `$${(num / 1_000_000_000).toFixed(2)}B`;
        } else if (num >= 1_000_000) {
            return `$${(num / 1_000_000).toFixed(2)}M`;
        } else if (num >= 1_000) {
            return `${(num / 1_000).toFixed(2)}K`;
        }
        return num.toLocaleString();
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (isInitialLoad && !marketData) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="size-5" />
                        Market Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!marketData) return null;

    const isPositive = marketData.change >= 0;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="size-5" />
                        Market Data
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">{ticker}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Price */}
                <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold">
                            ${marketData.currentPrice.toFixed(2)}
                        </span>
                        <Badge
                            variant={isPositive ? 'default' : 'destructive'}
                            className="text-sm"
                        >
                            <span className="flex items-center gap-1">
                                {isPositive ? (
                                    <TrendingUp className="size-3" />
                                ) : (
                                    <TrendingDown className="size-3" />
                                )}
                                {isPositive ? '+' : ''}{marketData.change.toFixed(2)} (
                                {isPositive ? '+' : ''}{marketData.changePercent.toFixed(2)}%)
                            </span>
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</p>
                </div>

                {/* 24h Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">24h High</p>
                        <p className="text-lg font-semibold">${marketData.high24h.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">24h Low</p>
                        <p className="text-lg font-semibold">${marketData.low24h.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">24h Volume</p>
                        <p className="text-lg font-semibold">{formatNumber(marketData.volume24h)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Market Cap</p>
                        <p className="text-lg font-semibold">{formatNumber(marketData.marketCap)}</p>
                    </div>
                </div>

                {/* Mini Chart Placeholder */}
                <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-center h-32">
                        <div className="text-center text-muted-foreground">
                            <BarChart3 className="size-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Chart coming soon</p>
                        </div>
                    </div>
                </div>

                {/* Recent Trades */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Recent Trades</h3>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        {recentTrades.map((trade) => (
                            <div
                                key={trade.id}
                                className="flex justify-between items-center text-xs p-2 rounded hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={trade.side === 'BUY' ? 'default' : 'destructive'}
                                        className="text-xs h-5 px-1.5"
                                    >
                                        {trade.side === 'BUY' ? '↑' : '↓'}
                                    </Badge>
                                    <span className="font-mono font-semibold">
                                        ${trade.price.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground">{trade.quantity}</span>
                                    <span className="text-muted-foreground w-20 text-right">
                                        {formatTime(trade.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
