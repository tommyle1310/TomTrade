'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orderBook } from '@/lib/graphqlClient';
import { useAuthStore } from '@/lib/authStore';
import { Loader2, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderBookProps {
    ticker: string;
}

interface OrderBookEntry {
    id: string;
    price: number;
    quantity: number;
    status: string;
}

interface OrderBookData {
    buyOrders: OrderBookEntry[];
    sellOrders: OrderBookEntry[];
}

export default function OrderBookDisplay({ ticker }: OrderBookProps) {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<OrderBookData | null>(null);
    const [clickedPrice, setClickedPrice] = useState<number | null>(null);

    const fetchOrderBook = async () => {
        if (!ticker) return;

        setLoading(true);
        setError(null);

        try {
            const result = await orderBook(ticker, token || undefined);
            if (result?.orderBook) {
                setData(result.orderBook);
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to load order book');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderBook();

        // Auto-refresh every 2 seconds
        const interval = setInterval(fetchOrderBook, 2000);
        return () => clearInterval(interval);
    }, [ticker, token]);

    const handlePriceClick = (price: number) => {
        setClickedPrice(price);
        // Clear highlight after 2 seconds
        setTimeout(() => setClickedPrice(null), 2000);
    };

    // Group orders by price level
    const groupByPrice = (orders: OrderBookEntry[]) => {
        const grouped = new Map<number, number>();
        orders.forEach(order => {
            const current = grouped.get(order.price) || 0;
            grouped.set(order.price, current + order.quantity);
        });
        return Array.from(grouped.entries()).map(([price, quantity]) => ({ price, quantity }));
    };

    const bids = data ? groupByPrice(data.buyOrders).sort((a, b) => b.price - a.price) : [];
    const asks = data ? groupByPrice(data.sellOrders).sort((a, b) => a.price - b.price) : [];

    const maxBidQuantity = Math.max(...bids.map(b => b.quantity), 1);
    const maxAskQuantity = Math.max(...asks.map(a => a.quantity), 1);

    const bestBid = bids[0]?.price || 0;
    const bestAsk = asks[0]?.price || 0;
    const spread = bestAsk > bestBid ? bestAsk - bestBid : 0;
    const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="size-5" />
                        Order Book
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">{ticker}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading && !data ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-danger mb-2">{error}</p>
                        <p className="text-xs text-muted-foreground">
                            Order book may not be available for this ticker
                        </p>
                    </div>
                ) : !data || (bids.length === 0 && asks.length === 0) ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">
                            No order book data available for {ticker}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Spread Indicator */}
                        {spread > 0 && (
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Spread</span>
                                    <div className="text-right">
                                        <div className="font-semibold">${spread.toFixed(2)}</div>
                                        <div className="text-xs text-muted-foreground">{spreadPercent.toFixed(2)}%</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {/* Bids (Buy Orders) */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp className="size-4 text-success" />
                                    <h3 className="text-sm font-semibold text-success">Bids</h3>
                                </div>
                                <div className="space-y-1">
                                    {bids.slice(0, 15).map(({ price, quantity }) => {
                                        const depthPercent = (quantity / maxBidQuantity) * 100;
                                        const isClicked = clickedPrice === price;

                                        return (
                                            <div
                                                key={price}
                                                className={cn(
                                                    "relative p-2 rounded cursor-pointer transition-all hover:bg-success/10",
                                                    isClicked && "ring-2 ring-success bg-success/20"
                                                )}
                                                onClick={() => handlePriceClick(price)}
                                            >
                                                {/* Depth Bar */}
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-success/20 rounded-l transition-all"
                                                    style={{ width: `${depthPercent}%` }}
                                                />

                                                {/* Price and Quantity */}
                                                <div className="relative flex justify-between text-xs">
                                                    <span className="font-mono font-semibold text-success">
                                                        ${price.toFixed(2)}
                                                    </span>
                                                    <span className="text-muted-foreground">{quantity.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Asks (Sell Orders) */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingDown className="size-4 text-danger" />
                                    <h3 className="text-sm font-semibold text-danger">Asks</h3>
                                </div>
                                <div className="space-y-1">
                                    {asks.slice(0, 15).map(({ price, quantity }) => {
                                        const depthPercent = (quantity / maxAskQuantity) * 100;
                                        const isClicked = clickedPrice === price;

                                        return (
                                            <div
                                                key={price}
                                                className={cn(
                                                    "relative p-2 rounded cursor-pointer transition-all hover:bg-danger/10",
                                                    isClicked && "ring-2 ring-danger bg-danger/20"
                                                )}
                                                onClick={() => handlePriceClick(price)}
                                            >
                                                {/* Depth Bar */}
                                                <div
                                                    className="absolute inset-y-0 right-0 bg-danger/20 rounded-r transition-all"
                                                    style={{ width: `${depthPercent}%` }}
                                                />

                                                {/* Price and Quantity */}
                                                <div className="relative flex justify-between text-xs">
                                                    <span className="font-mono font-semibold text-danger">
                                                        ${price.toFixed(2)}
                                                    </span>
                                                    <span className="text-muted-foreground">{quantity.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="pt-4 border-t">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Price</span>
                                <span>Quantity</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
