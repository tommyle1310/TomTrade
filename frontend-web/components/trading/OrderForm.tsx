'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { OrderSide, OrderType, TimeInForce } from '@/lib/types';
import { placeOrder, myOrders, cancelOrder } from '@/lib/graphqlClient';
import { useAuthStore } from '@/lib/authStore';
import { Loader2, TrendingUp, TrendingDown, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const limitOrderSchema = z.object({
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
    side: z.nativeEnum(OrderSide),
    timeInForce: z.nativeEnum(TimeInForce),
});

const marketOrderSchema = z.object({
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    side: z.nativeEnum(OrderSide),
});

const stopOrderSchema = z.object({
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    stopPrice: z.number().min(0.01, 'Stop price must be greater than 0'),
    limitPrice: z.number().min(0.01, 'Limit price must be greater than 0').optional(),
    side: z.nativeEnum(OrderSide),
    timeInForce: z.nativeEnum(TimeInForce),
});

type LimitOrderData = z.infer<typeof limitOrderSchema>;
type MarketOrderData = z.infer<typeof marketOrderSchema>;
type StopOrderData = z.infer<typeof stopOrderSchema>;

interface OrderFormProps {
    ticker: string;
}

interface UserOrder {
    id: string;
    ticker: string;
    side: string;
    type: string;
    price: number;
    quantity: number;
    status: string;
    timeInForce: string;
    createdAt: string;
    matchedAt?: string;
}

export default function OrderForm({ ticker }: OrderFormProps) {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'limit' | 'market' | 'stop'>('limit');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingOrderData, setPendingOrderData] = useState<any>(null);
    const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const limitForm = useForm<LimitOrderData>({
        resolver: zodResolver(limitOrderSchema),
        defaultValues: {
            side: OrderSide.BUY,
            quantity: 1,
            price: 0,
            timeInForce: TimeInForce.GTC,
        },
    });

    const marketForm = useForm<MarketOrderData>({
        resolver: zodResolver(marketOrderSchema),
        defaultValues: {
            side: OrderSide.BUY,
            quantity: 1,
        },
    });

    const stopForm = useForm<StopOrderData>({
        resolver: zodResolver(stopOrderSchema),
        defaultValues: {
            side: OrderSide.BUY,
            quantity: 1,
            stopPrice: 0,
            limitPrice: 0,
            timeInForce: TimeInForce.GTC,
        },
    });

    // Fetch user orders
    const fetchUserOrders = async () => {
        setLoadingOrders(true);
        try {
            const result = await myOrders(token || undefined);
            if (result?.myOrders) {
                setUserOrders(result.myOrders);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchUserOrders();
    }, [token]);

    const handleLimitSubmit = (data: LimitOrderData) => {
        setPendingOrderData({
            type: OrderType.LIMIT,
            ...data,
        });
        setShowConfirmDialog(true);
    };

    const handleMarketSubmit = (data: MarketOrderData) => {
        setPendingOrderData({
            type: OrderType.MARKET,
            ...data,
            price: 0, // Market orders don't have a price
            timeInForce: TimeInForce.IOC, // Market orders are typically IOC
        });
        setShowConfirmDialog(true);
    };

    const handleStopSubmit = (data: StopOrderData) => {
        setPendingOrderData({
            type: data.limitPrice ? OrderType.STOP_LIMIT : OrderType.STOP_MARKET,
            quantity: data.quantity,
            price: data.limitPrice || data.stopPrice,
            side: data.side,
            timeInForce: data.timeInForce,
        });
        setShowConfirmDialog(true);
    };

    const confirmOrder = async () => {
        if (!pendingOrderData) return;

        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        setShowConfirmDialog(false);

        try {
            const result = await placeOrder(
                {
                    ticker,
                    ...pendingOrderData,
                },
                token || undefined
            );

            if (result?.placeOrder) {
                setSuccessMessage(`Order placed successfully!`);
                limitForm.reset();
                marketForm.reset();
                stopForm.reset();
                fetchUserOrders(); // Refresh order list

                setTimeout(() => setSuccessMessage(null), 5000);
            }
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to place order');
        } finally {
            setIsSubmitting(false);
            setPendingOrderData(null);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        try {
            await cancelOrder(orderId, token || undefined);
            setSuccessMessage('Order cancelled successfully');
            fetchUserOrders();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to cancel order');
        }
    };

    const limitSide = limitForm.watch('side');
    const marketSide = marketForm.watch('side');
    const stopSide = stopForm.watch('side');

    const limitQuantity = limitForm.watch('quantity');
    const limitPrice = limitForm.watch('price');
    const limitTotal = limitQuantity * limitPrice;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Place Order</span>
                        <span className="text-lg font-mono">{ticker}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="limit">Limit</TabsTrigger>
                            <TabsTrigger value="market">Market</TabsTrigger>
                            <TabsTrigger value="stop">Stop</TabsTrigger>
                        </TabsList>

                        {/* LIMIT Order Tab */}
                        <TabsContent value="limit" className="space-y-4">
                            <form onSubmit={limitForm.handleSubmit(handleLimitSubmit)} className="space-y-4">
                                {/* Buy/Sell Toggle */}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={limitSide === OrderSide.BUY ? 'default' : 'outline'}
                                        className={cn(
                                            "flex-1",
                                            limitSide === OrderSide.BUY && "bg-success hover:bg-success/90"
                                        )}
                                        onClick={() => limitForm.setValue('side', OrderSide.BUY)}
                                    >
                                        <TrendingUp className="size-4 mr-2" />
                                        Buy
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={limitSide === OrderSide.SELL ? 'default' : 'outline'}
                                        className={cn(
                                            "flex-1",
                                            limitSide === OrderSide.SELL && "bg-danger hover:bg-danger/90"
                                        )}
                                        onClick={() => limitForm.setValue('side', OrderSide.SELL)}
                                    >
                                        <TrendingDown className="size-4 mr-2" />
                                        Sell
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="limit-quantity">Quantity</Label>
                                    <Input
                                        id="limit-quantity"
                                        type="number"
                                        {...limitForm.register('quantity', { valueAsNumber: true })}
                                    />
                                    {limitForm.formState.errors.quantity && (
                                        <p className="text-sm text-danger">{limitForm.formState.errors.quantity.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="limit-price">Limit Price</Label>
                                    <Input
                                        id="limit-price"
                                        type="number"
                                        step="0.01"
                                        {...limitForm.register('price', { valueAsNumber: true })}
                                    />
                                    {limitForm.formState.errors.price && (
                                        <p className="text-sm text-danger">{limitForm.formState.errors.price.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="limit-tif">Time in Force</Label>
                                    <Select
                                        value={limitForm.watch('timeInForce')}
                                        onValueChange={(value) => limitForm.setValue('timeInForce', value as TimeInForce)}
                                    >
                                        <SelectTrigger id="limit-tif">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={TimeInForce.GTC}>GTC (Good Till Cancelled)</SelectItem>
                                            <SelectItem value={TimeInForce.IOC}>IOC (Immediate or Cancel)</SelectItem>
                                            <SelectItem value={TimeInForce.FOK}>FOK (Fill or Kill)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Total {limitSide === OrderSide.BUY ? 'Cost' : 'Proceeds'}
                                        </span>
                                        <span className="text-lg font-semibold">${limitTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                                    Place {limitSide} Order
                                </Button>
                            </form>
                        </TabsContent>

                        {/* MARKET Order Tab */}
                        <TabsContent value="market" className="space-y-4">
                            <form onSubmit={marketForm.handleSubmit(handleMarketSubmit)} className="space-y-4">
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        Market orders execute immediately at the current market price
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={marketSide === OrderSide.BUY ? 'default' : 'outline'}
                                        className={cn(
                                            "flex-1",
                                            marketSide === OrderSide.BUY && "bg-success hover:bg-success/90"
                                        )}
                                        onClick={() => marketForm.setValue('side', OrderSide.BUY)}
                                    >
                                        <TrendingUp className="size-4 mr-2" />
                                        Buy
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={marketSide === OrderSide.SELL ? 'default' : 'outline'}
                                        className={cn(
                                            "flex-1",
                                            marketSide === OrderSide.SELL && "bg-danger hover:bg-danger/90"
                                        )}
                                        onClick={() => marketForm.setValue('side', OrderSide.SELL)}
                                    >
                                        <TrendingDown className="size-4 mr-2" />
                                        Sell
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="market-quantity">Quantity</Label>
                                    <Input
                                        id="market-quantity"
                                        type="number"
                                        {...marketForm.register('quantity', { valueAsNumber: true })}
                                    />
                                    {marketForm.formState.errors.quantity && (
                                        <p className="text-sm text-danger">{marketForm.formState.errors.quantity.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                                    Place Market {marketSide} Order
                                </Button>
                            </form>
                        </TabsContent>

                        {/* STOP Order Tab */}
                        <TabsContent value="stop" className="space-y-4">
                            <form onSubmit={stopForm.handleSubmit(handleStopSubmit)} className="space-y-4">
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                    <p className="text-sm text-amber-600 dark:text-amber-400">
                                        Stop orders trigger when price reaches stop price
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={stopSide === OrderSide.BUY ? 'default' : 'outline'}
                                        className={cn(
                                            "flex-1",
                                            stopSide === OrderSide.BUY && "bg-success hover:bg-success/90"
                                        )}
                                        onClick={() => stopForm.setValue('side', OrderSide.BUY)}
                                    >
                                        <TrendingUp className="size-4 mr-2" />
                                        Buy
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={stopSide === OrderSide.SELL ? 'default' : 'outline'}
                                        className={cn(
                                            "flex-1",
                                            stopSide === OrderSide.SELL && "bg-danger hover:bg-danger/90"
                                        )}
                                        onClick={() => stopForm.setValue('side', OrderSide.SELL)}
                                    >
                                        <TrendingDown className="size-4 mr-2" />
                                        Sell
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stop-quantity">Quantity</Label>
                                    <Input
                                        id="stop-quantity"
                                        type="number"
                                        {...stopForm.register('quantity', { valueAsNumber: true })}
                                    />
                                    {stopForm.formState.errors.quantity && (
                                        <p className="text-sm text-danger">{stopForm.formState.errors.quantity.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stop-price">Stop Price</Label>
                                    <Input
                                        id="stop-price"
                                        type="number"
                                        step="0.01"
                                        {...stopForm.register('stopPrice', { valueAsNumber: true })}
                                    />
                                    {stopForm.formState.errors.stopPrice && (
                                        <p className="text-sm text-danger">{stopForm.formState.errors.stopPrice.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="limit-price-stop">Limit Price (Optional)</Label>
                                    <Input
                                        id="limit-price-stop"
                                        type="number"
                                        step="0.01"
                                        {...stopForm.register('limitPrice', { valueAsNumber: true })}
                                    />
                                    {stopForm.formState.errors.limitPrice && (
                                        <p className="text-sm text-danger">{stopForm.formState.errors.limitPrice.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stop-tif">Time in Force</Label>
                                    <Select
                                        value={stopForm.watch('timeInForce')}
                                        onValueChange={(value) => stopForm.setValue('timeInForce', value as TimeInForce)}
                                    >
                                        <SelectTrigger id="stop-tif">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={TimeInForce.GTC}>GTC (Good Till Cancelled)</SelectItem>
                                            <SelectItem value={TimeInForce.IOC}>IOC (Immediate or Cancel)</SelectItem>
                                            <SelectItem value={TimeInForce.FOK}>FOK (Fill or Kill)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                                    Place Stop Order
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* Success/Error Messages */}
                    {errorMessage && (
                        <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
                            <p className="text-sm text-destructive">{errorMessage}</p>
                        </div>
                    )}
                    {successMessage && (
                        <div className="mt-4 p-3 bg-success/10 border border-success rounded-lg">
                            <p className="text-sm text-success">{successMessage}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* My Orders Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="size-5" />
                        My Orders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingOrders ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : userOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No orders yet
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {userOrders.slice(0, 10).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{order.ticker}</span>
                                            <Badge variant={order.side === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                                                {order.side}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {order.type}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {order.quantity} @ ${order.price.toFixed(2)} • {order.status}
                                        </div>
                                    </div>
                                    {order.status === 'OPEN' && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleCancelOrder(order.id)}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Order</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingOrderData && (
                                <div className="space-y-2 mt-4">
                                    <div className="flex justify-between">
                                        <span>Ticker:</span>
                                        <span className="font-medium">{ticker}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Side:</span>
                                        <span className="font-medium">{pendingOrderData.side}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="font-medium">{pendingOrderData.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Quantity:</span>
                                        <span className="font-medium">{pendingOrderData.quantity}</span>
                                    </div>
                                    {pendingOrderData.price > 0 && (
                                        <div className="flex justify-between">
                                            <span>Price:</span>
                                            <span className="font-medium">${pendingOrderData.price.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {pendingOrderData.price > 0 && (
                                        <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                                            <span>Total:</span>
                                            <span>${(pendingOrderData.quantity * pendingOrderData.price).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmOrder}>Confirm Order</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
