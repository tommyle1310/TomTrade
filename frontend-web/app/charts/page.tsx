"use client";

import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, XAxis, YAxis, Line, ComposedChart, Bar, Tooltip } from "recharts";

const GET_CANDLES = gql`
  query GetCandles($symbol: String!, $interval: String!, $limit: Int) {
    candles(symbol: $symbol, interval: $interval, limit: $limit) {
      timestamp
      open
      high
      low
      close
      volume
    }
  }
`;

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

export default function ChartsPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [interval, setInterval] = useState("1D");

  const { data: candleData, refetch: refetchCandles } = useQuery(GET_CANDLES, {
    variables: { symbol, interval, limit: 200 },
    fetchPolicy: "cache-and-network",
  });

  const { data: tradeData, refetch: refetchTrades } = useQuery(GET_TRADES, {
    variables: { symbol, limit: 100 },
    fetchPolicy: "cache-and-network",
  });

  const composed = (candleData?.candles || []).map((c: any) => ({
    ts: c.timestamp,
    price: c.close,
    volume: c.volume,
  }));

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Candlestick + Volume</CardTitle>
          <div className="flex items-center gap-2">
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="w-28"/>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Interval"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="1m">1m</SelectItem>
                <SelectItem value="5m">5m</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { refetchCandles({ symbol, interval, limit: 200 }); refetchTrades({ symbol, limit: 100 }); }}>Load</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ price: { label: "Price", color: "hsl(var(--primary))" }, volume: { label: "Volume", color: "hsl(var(--muted-foreground))" } }}>
            <ComposedChart data={composed} height={320}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ts" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<ChartTooltipContent />} />
              <Line yAxisId="left" type="monotone" dataKey="price" stroke="hsl(var(--primary))" dot={false} />
              <Bar yAxisId="right" dataKey="volume" fill="hsl(var(--muted-foreground))" opacity={0.3} />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {(tradeData?.trades || []).slice(-12).reverse().map((t: any) => (
              <div key={t.tradeId} className="flex items-center justify-between rounded border px-2 py-1">
                <div className="font-medium">{t.side}</div>
                <div className="text-muted-foreground">{t.quantity}</div>
                <div>${t.price.toFixed(2)}</div>
                <div className="text-muted-foreground">{new Date(t.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


