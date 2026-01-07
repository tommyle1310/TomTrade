'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Check } from 'lucide-react';
import OrderForm from '@/components/trading/OrderForm';
import OrderBookDisplay from '@/components/trading/OrderBookDisplay';
import MarketDataPanel from '@/components/trading/MarketDataPanel';
import { useStockSearch } from '@/hooks/useStockSearch';
import { cn } from '@/lib/utils';
import Image from 'next/image';

function TradePageContent() {
    const searchParams = useSearchParams();
    const [selectedTicker, setSelectedTicker] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedStock, setSelectedStock] = useState<{ ticker: string; name: string; avatar?: string | null } | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const { results: searchResults, loading: searchLoading } = useStockSearch(searchQuery);

    useEffect(() => {
        const tickerParam = searchParams.get('ticker');
        if (tickerParam) {
            setSelectedTicker(tickerParam.toUpperCase());
            setSearchQuery(tickerParam.toUpperCase());
            setSelectedStock({ ticker: tickerParam.toUpperCase(), name: tickerParam.toUpperCase() });
        } else {
            // Default ticker
            setSelectedTicker('AAPL');
            setSearchQuery('AAPL');
            setSelectedStock({ ticker: 'AAPL', name: 'Apple Inc.' });
        }
    }, [searchParams]);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTickerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setSearchQuery(value);
        setShowSearchResults(true);

        // Clear selected stock if user modifies the input
        if (selectedStock && value !== selectedStock.ticker) {
            setSelectedStock(null);
        }
    };

    const handleTickerSelect = (ticker: string) => {
        setSelectedTicker(ticker);
        setSearchQuery(ticker);
        setShowSearchResults(false);
    };

    const handleStockSelect = (stock: typeof searchResults[0]) => {
        setSelectedStock({
            ticker: stock.ticker,
            name: stock.companyName,
            avatar: stock.avatar,
        });
        setSelectedTicker(stock.ticker);
        setSearchQuery(stock.ticker);
        setShowSearchResults(false);
    };

    return (
        <div className="space-y-6">
            {/* Header with Ticker Search */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Advanced Trading</h1>
                    <p className="text-sm text-muted-foreground">
                        Trade with advanced tools and real-time market data
                    </p>
                </div>

                {/* Ticker Search */}
                <div className="relative w-full md:w-80" ref={searchRef}>
                    <div className="relative">
                        {selectedStock?.avatar && (
                            <div className="absolute left-10 top-1/2 -translate-y-1/2 size-5 rounded-full overflow-hidden bg-muted">
                                <Image
                                    src={selectedStock.avatar}
                                    alt={selectedStock.ticker}
                                    width={20}
                                    height={20}
                                    className="object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        <Search className={cn(
                            "absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground",
                            selectedStock?.avatar ? "left-3" : "left-3"
                        )} />
                        <Input
                            placeholder="Search ticker or company..."
                            value={searchQuery}
                            onChange={handleTickerSearch}
                            onFocus={() => setShowSearchResults(true)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery) {
                                    handleTickerSelect(searchQuery);
                                    setShowSearchResults(false);
                                }
                            }}
                            className={cn("uppercase", selectedStock?.avatar ? "pl-16" : "pl-10")}
                        />
                        {searchLoading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((stock) => (
                                <button
                                    key={stock.ticker}
                                    type="button"
                                    onClick={() => handleStockSelect(stock)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
                                >
                                    <div className="size-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                        {stock.avatar && (
                                            <Image
                                                src={stock.avatar}
                                                alt={stock.ticker}
                                                width={32}
                                                height={32}
                                                className="object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm">{stock.ticker}</div>
                                        <div className="text-xs text-muted-foreground truncate">{stock.companyName}</div>
                                    </div>
                                    {selectedStock?.ticker === stock.ticker && (
                                        <Check className="size-4 text-primary flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Trading Layout */}
            {selectedTicker ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Order Form (4 columns) */}
                    <div className="lg:col-span-4">
                        <OrderForm ticker={selectedTicker} />
                    </div>

                    {/* Center: Order Book (4 columns) */}
                    <div className="lg:col-span-4">
                        <OrderBookDisplay ticker={selectedTicker} />
                    </div>

                    {/* Right: Market Data (4 columns) */}
                    <div className="lg:col-span-4">
                        <MarketDataPanel ticker={selectedTicker} />
                    </div>
                </div>
            ) : (
                <Card className="p-12">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <Search className="size-12 text-muted-foreground" />
                        <div>
                            <h3 className="text-lg font-semibold">No Ticker Selected</h3>
                            <p className="text-sm text-muted-foreground">
                                Search for a ticker symbol to start trading
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

export default function TradePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <TradePageContent />
        </Suspense>
    );
}
