"use client";

import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, CartesianGrid, Line, XAxis, Tooltip, ResponsiveContainer, YAxis } from "recharts";

interface IndicatorPoint {
  timestamp: number;
  value: number;
}

interface IndicatorSeries {
  name: string;
  values: IndicatorPoint[];
}

const GET_SMA = gql`
  query GetSMA($ticker: String!, $period: Float!, $interval: Interval!) {
    getSMA(ticker: $ticker, period: $period, interval: $interval)
  }
`;

const GET_RSI = gql`
  query GetRSI($ticker: String!, $period: Float!, $interval: Interval!) {
    getRSI(ticker: $ticker, period: $period, interval: $interval)
  }
`;

const GET_EMA = gql`
  query GetEMA($ticker: String!, $period: Float!, $interval: Interval!) {
    getEMA(ticker: $ticker, period: $period, interval: $interval)
  }
`;

export default function IndicatorsPage() {
  const [ticker, setTicker] = useState("AAPL");
  const [period, setPeriod] = useState(14);
  const [interval, setInterval] = useState("_1d");

  const { data: smaData, refetch: refetchSMA } = useQuery(GET_SMA, {
    variables: { ticker, period, interval },
    fetchPolicy: "cache-and-network",
  });

  const { data: rsiData, refetch: refetchRSI } = useQuery(GET_RSI, {
    variables: { ticker, period, interval },
    fetchPolicy: "cache-and-network",
  });

  const { data: emaData, refetch: refetchEMA } = useQuery(GET_EMA, {
    variables: { ticker, period, interval },
    fetchPolicy: "cache-and-network",
  });

  const smaSeries = (smaData?.getSMA || []).map((v: number, i: number) => ({ 
    index: i, 
    value: v,
    date: new Date(Date.now() - (smaData.getSMA.length - i) * 24 * 60 * 60 * 1000).toLocaleDateString()
  }));

  const rsiSeries = (rsiData?.getRSI || []).map((v: number, i: number) => ({ 
    index: i, 
    value: v,
    date: new Date(Date.now() - (rsiData.getRSI.length - i) * 24 * 60 * 60 * 1000).toLocaleDateString()
  }));

  const emaSeries = (emaData?.getEMA || []).map((v: number, i: number) => ({ 
    index: i, 
    value: v,
    date: new Date(Date.now() - (emaData.getEMA.length - i) * 24 * 60 * 60 * 1000).toLocaleDateString()
  }));

  const handleRefresh = () => {
    refetchSMA({ ticker, period, interval });
    refetchRSI({ ticker, period, interval });
    refetchEMA({ ticker, period, interval });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Technical Indicators - {ticker}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Symbol:</span>
              <Input 
                value={ticker} 
                onChange={(e) => setTicker(e.target.value.toUpperCase())} 
                className="w-24 h-9 text-center font-mono bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="AAPL"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Period:</span>
              <Input 
                type="number" 
                value={period} 
                onChange={(e) => setPeriod(parseInt(e.target.value || '14'))} 
                className="w-20 h-9 text-center font-mono bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Interval:</span>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="w-20 h-9 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_1d">1D</SelectItem>
                  <SelectItem value="_1h">1h</SelectItem>
                  <SelectItem value="_1m">1m</SelectItem>
                  <SelectItem value="_5m">5m</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleRefresh}
              className="h-9 px-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* SMA Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              Simple Moving Average (SMA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {smaSeries.length > 0 ? (
              <ChartContainer config={{}}>
                <LineChart data={smaSeries} height={300}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    content={<ChartTooltipContent />}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    dataKey="value" 
                    stroke="url(#smaGradient)" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#3b82f6" }}
                  />
                  <defs>
                    <linearGradient id="smaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="text-6xl">📈</div>
                <div className="text-xl font-medium">No SMA data</div>
                <div className="text-sm">Try changing parameters or symbol</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* EMA Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              Exponential Moving Average (EMA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emaSeries.length > 0 ? (
              <ChartContainer config={{}}>
                <LineChart data={emaSeries} height={300}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    content={<ChartTooltipContent />}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    dataKey="value" 
                    stroke="url(#emaGradient)" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#10b981" }}
                  />
                  <defs>
                    <linearGradient id="emaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="text-6xl">📊</div>
                <div className="text-xl font-medium">No EMA data</div>
                <div className="text-sm">Try changing parameters or symbol</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RSI Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            Relative Strength Index (RSI)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rsiSeries.length > 0 ? (
            <div className="space-y-4">
              <ChartContainer config={{}}>
                <LineChart data={rsiSeries} height={300}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    content={<ChartTooltipContent />}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    dataKey="value" 
                    stroke="url(#rsiGradient)" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#8b5cf6" }}
                  />
                  {/* Overbought line */}
                  <Line 
                    dataKey={() => 70} 
                    stroke="#ef4444" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  {/* Oversold line */}
                  <Line 
                    dataKey={() => 30} 
                    stroke="#ef4444" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <defs>
                    <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ChartContainer>
              
              {/* RSI Zones */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-red-600 font-semibold">Overbought</div>
                  <div className="text-red-500 text-sm">RSI > 70</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <div className="text-yellow-600 font-semibold">Neutral</div>
                  <div className="text-yellow-500 text-sm">30 ≤ RSI ≤ 70</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-green-600 font-semibold">Oversold</div>
                  <div className="text-green-500 text-sm">RSI < 30</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <div className="text-6xl">📉</div>
              <div className="text-xl font-medium">No RSI data</div>
              <div className="text-sm">Try changing parameters or symbol</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Indicator Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Indicator Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">SMA Points</div>
              <div className="text-2xl font-bold">{smaSeries.length}</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">EMA Points</div>
              <div className="text-2xl font-bold">{emaSeries.length}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">RSI Points</div>
              <div className="text-2xl font-bold">{rsiSeries.length}</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">Period</div>
              <div className="text-2xl font-bold">{period}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


