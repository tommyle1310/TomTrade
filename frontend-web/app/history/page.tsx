"use client";

import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translations";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Trade {
  tradeId: number;
  price: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
}

const GET_TRADES = gql`
  query GetTrades($symbol: String!, $limit: Int) {
    trades(symbol: $symbol, limit: $limit) {
      tradeId
      price
      quantity
      side
      timestamp
    }
  }
`;

export default function TradeHistoryPage() {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState("AAPL");
  const [limit, setLimit] = useState(100);
  
  const { data, refetch } = useQuery(GET_TRADES, { 
    variables: { symbol, limit },
    fetchPolicy: "cache-and-network",
  });
  
  const trades: Trade[] = data?.trades || [];

  const totalVolume = trades.reduce((sum, t) => sum + t.quantity, 0);
  const avgPrice = trades.length > 0 ? trades.reduce((sum, t) => sum + t.price, 0) / trades.length : 0;
  const buyCount = trades.filter(t => t.side === 'BUY').length;
  const sellCount = trades.filter(t => t.side === 'SELL').length;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('history.title')} - {symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('portfolio.symbol')}:</span>
              <Input 
                value={symbol} 
                onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
                className="w-24 h-9 text-center font-mono"
                placeholder="AAPL"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Limit:</span>
              <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                <SelectTrigger className="w-20 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => refetch({ symbol, limit })}
              className="h-9 px-4"
            >
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">{t('history.transactions')}</div>
              <div className="text-2xl font-bold">{trades.length}</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">{t('trading.buy')}</div>
              <div className="text-2xl font-bold">{buyCount}</div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">{t('trading.sell')}</div>
              <div className="text-2xl font-bold">{sellCount}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">{t('trading.price')}</div>
              <div className="text-2xl font-bold">${avgPrice.toFixed(2)}</div>
            </div>
          </div>

          {/* Trades List */}
          {trades.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {trades.map((trade: Trade) => (
                <div 
                  key={trade.tradeId} 
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/30 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={trade.side === 'BUY' ? 'default' : 'secondary'}
                      className={`px-3 py-1 text-sm font-semibold ${
                        trade.side === 'BUY' 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {trade.side}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleString([], { 
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('trading.quantity')}</div>
                      <div className="font-mono font-semibold text-lg">
                        {trade.quantity.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('trading.price')}</div>
                      <div className="font-mono font-bold text-xl">
                        ${trade.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('trading.total')}</div>
                      <div className="font-mono font-bold text-lg">
                        ${(trade.price * trade.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <div className="text-6xl">📊</div>
              <div className="text-xl font-medium">{t('table.noResults')}</div>
              <div className="text-sm">{t('common.filter')}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


