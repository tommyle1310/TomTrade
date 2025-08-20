"use client";

import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, CartesianGrid, Line, XAxis, Tooltip } from "recharts";

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

export default function IndicatorsPage() {
  const [ticker, setTicker] = useState("AAPL");
  const [period, setPeriod] = useState(14);
  const [interval, setInterval] = useState("_1d");

  const { data: smaData, refetch: refetchSMA } = useQuery(GET_SMA, {
    variables: { ticker, period, interval },
  });
  const { data: rsiData, refetch: refetchRSI } = useQuery(GET_RSI, {
    variables: { ticker, period, interval },
  });

  const series = (smaData?.getSMA || []).map((v: number, i: number) => ({ idx: i, value: v }));
  const rsiSeries = (rsiData?.getRSI || []).map((v: number, i: number) => ({ idx: i, value: v }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} className="w-28"/>
        <Input type="number" value={period} onChange={(e) => setPeriod(parseInt(e.target.value || '14'))} className="w-24"/>
        <Select value={interval} onValueChange={setInterval}>
          <SelectTrigger className="w-28"><SelectValue placeholder="Interval"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="_1d">1D</SelectItem>
            <SelectItem value="_1h">1h</SelectItem>
            <SelectItem value="_1m">1m</SelectItem>
            <SelectItem value="_5m">5m</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => { refetchSMA({ ticker, period, interval }); refetchRSI({ ticker, period, interval }); }}>Load</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>SMA</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <LineChart data={series} height={300}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="idx" />
              <Tooltip content={<ChartTooltipContent />} />
              <Line dataKey="value" stroke="hsl(var(--primary))" dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>RSI</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <LineChart data={rsiSeries} height={300}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="idx" />
              <Tooltip content={<ChartTooltipContent />} />
              <Line dataKey="value" stroke="hsl(var(--muted-foreground))" dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}


