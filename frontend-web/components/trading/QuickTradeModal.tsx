'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { OrderSide, OrderType, TimeInForce } from '@/lib/types';
import { placeOrder } from '@/lib/graphqlClient';
import { useAuthStore } from '@/lib/authStore';
import { Loader2, TrendingUp, TrendingDown, ArrowRight, Search, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStockSearch } from '@/hooks/useStockSearch';
import Image from 'next/image';

const orderSchema = z.object({
    ticker: z.string().min(1, 'Ticker is required').toUpperCase(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
    side: z.nativeEnum(OrderSide),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface QuickTradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultSide?: OrderSide;
    defaultTicker?: string;
}

export default function QuickTradeModal({
    open,
    onOpenChange,
    defaultSide = OrderSide.BUY,
    defaultTicker = ''
}: QuickTradeModalProps) {
    const router = useRouter();
    const { token } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [tickerQuery, setTickerQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedStock, setSelectedStock] = useState<{ ticker: string; name: string; avatar?: string | null } | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const { results: searchResults, loading: searchLoading } = useStockSearch(tickerQuery);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            side: defaultSide,
            ticker: defaultTicker,
            quantity: 1,
            price: 0,
        },
    });

    const side = watch('side');
    const quantity = watch('quantity');
    const price = watch('price');
    const totalCost = quantity * price;

    // Update form when modal opens with new defaults
    useEffect(() => {
        if (open) {
            setValue('side', defaultSide);
            setValue('ticker', defaultTicker);
            setTickerQuery(defaultTicker);
            if (defaultTicker) {
                setSelectedStock({ ticker: defaultTicker, name: defaultTicker });
            } else {
                setSelectedStock(null);
            }
            setOrderSuccess(false);
            setShowSearchResults(false);
        }
    }, [open, defaultSide, defaultTicker, setValue]);

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

    const handleStockSelect = (stock: typeof searchResults[0]) => {
        setSelectedStock({
            ticker: stock.ticker,
            name: stock.companyName,
            avatar: stock.avatar,
        });
        setTickerQuery(stock.ticker);
        setValue('ticker', stock.ticker);
        setShowSearchResults(false);
    };

    const handleTickerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setTickerQuery(value);
        setValue('ticker', value);
        setShowSearchResults(true);

        // Clear selected stock if user modifies the input
        if (selectedStock && value !== selectedStock.ticker) {
            setSelectedStock(null);
        }
    };

    const onSubmit = async (data: OrderFormData) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const result = await placeOrder(
                {
                    ticker: data.ticker,
                    quantity: data.quantity,
                    price: data.price,
                    side: data.side,
                    type: OrderType.LIMIT,
                    timeInForce: TimeInForce.GTC,
                },
                token || undefined
            );

            if (result?.placeOrder) {
                setOrderSuccess(true);

                // Close modal after 1 second
                setTimeout(() => {
                    onOpenChange(false);
                    reset();
                }, 1000);
            }
        } catch (error: any) {
            setErrorMessage(error?.message || 'An error occurred while placing the order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdvancedTrading = () => {
        const ticker = watch('ticker');
        onOpenChange(false);
        router.push(ticker ? `/trade?ticker=${ticker}` : '/trade');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {side === OrderSide.BUY ? (
                            <TrendingUp className="size-5 text-success" />
                        ) : (
                            <TrendingDown className="size-5 text-danger" />
                        )}
                        Quick Trade
                    </DialogTitle>
                    <DialogDescription>
                        Place a quick {side === OrderSide.BUY ? 'buy' : 'sell'} order
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Buy/Sell Toggle */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={side === OrderSide.BUY ? 'default' : 'outline'}
                            className="flex-1"
                            onClick={() => setValue('side', OrderSide.BUY)}
                        >
                            <TrendingUp className="size-4 mr-2" />
                            Buy
                        </Button>
                        <Button
                            type="button"
                            variant={side === OrderSide.SELL ? 'default' : 'outline'}
                            className="flex-1"
                            onClick={() => setValue('side', OrderSide.SELL)}
                        >
                            <TrendingDown className="size-4 mr-2" />
                            Sell
                        </Button>
                    </div>

                    {/* Ticker Input with Search */}
                    <div className="space-y-2" ref={searchRef}>
                        <Label htmlFor="ticker">Ticker Symbol</Label>
                        <div className="relative">
                            <div className="relative">
                                {selectedStock?.avatar && (
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 size-5 rounded-full overflow-hidden bg-muted">
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
                                <Input
                                    id="ticker"
                                    placeholder="Search ticker or company..."
                                    value={tickerQuery}
                                    onChange={handleTickerInputChange}
                                    onFocus={() => setShowSearchResults(true)}
                                    disabled={isSubmitting || orderSuccess}
                                    className={cn("uppercase", selectedStock?.avatar && "pl-10")}
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
                        {errors.ticker && (
                            <p className="text-sm text-danger">{errors.ticker.message}</p>
                        )}
                        {selectedStock && (
                            <p className="text-xs text-muted-foreground">
                                {selectedStock.name}
                            </p>
                        )}
                    </div>

                    {/* Quantity Input */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            placeholder="1"
                            {...register('quantity', { valueAsNumber: true })}
                            disabled={isSubmitting || orderSuccess}
                        />
                        {errors.quantity && (
                            <p className="text-sm text-danger">{errors.quantity.message}</p>
                        )}
                    </div>

                    {/* Price Input */}
                    <div className="space-y-2">
                        <Label htmlFor="price">Limit Price</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('price', { valueAsNumber: true })}
                            disabled={isSubmitting || orderSuccess}
                        />
                        {errors.price && (
                            <p className="text-sm text-danger">{errors.price.message}</p>
                        )}
                    </div>

                    {/* Total Cost Preview */}
                    <div className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                                Total {side === OrderSide.BUY ? 'Cost' : 'Proceeds'}
                            </span>
                            <span className={cn(
                                "text-lg font-semibold",
                                side === OrderSide.BUY ? "text-danger" : "text-success"
                            )}>
                                ${totalCost.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                            <p className="text-sm text-destructive">{errorMessage}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {orderSuccess && (
                        <div className="p-3 bg-success/10 border border-success rounded-lg">
                            <p className="text-sm text-success">Order placed successfully!</p>
                        </div>
                    )}

                    <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleAdvancedTrading}
                            className="order-2 sm:order-1"
                        >
                            <ArrowRight className="size-4 mr-2" />
                            Advanced Trading
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || orderSuccess}
                            className={cn(
                                "order-1 sm:order-2",
                                side === OrderSide.BUY ? "bg-success hover:bg-success/90" : "bg-danger hover:bg-danger/90"
                            )}
                        >
                            {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                            {orderSuccess ? 'Order Placed!' : `Place ${side === OrderSide.BUY ? 'Buy' : 'Sell'} Order`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
