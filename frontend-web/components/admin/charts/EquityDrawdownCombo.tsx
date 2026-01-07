"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { EquityDrawdownPoint } from "@/lib/types";

interface EquityDrawdownComboProps {
  data: EquityDrawdownPoint[];
}

const chartConfig: ChartConfig = {
  equity: { label: "Equity", color: "var(--chart-1)" },
  drawdown: { label: "Max Drawdown", color: "var(--chart-2)" },
};

export default function EquityDrawdownCombo({ data }: EquityDrawdownComboProps) {
  // Transform API data to chart format
  const chartData = data.map((item) => ({
    day: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    equity: Math.round(item.equity),
    drawdown: Math.round(item.maxDrawdown)
  }));

  // Fallback data if no API data
  const fallbackData = chartData.length > 0 ? chartData : [
    { day: "Aug 1", equity: 80000, drawdown: 0 },
    { day: "Aug 15", equity: 85000, drawdown: 5 },
    { day: "Aug 31", equity: 90000, drawdown: 8 },
  ];

  const startDate = data.length > 0 ? new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Aug 1';
  const endDate = data.length > 0 ? new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Aug 31';

  return (
    <div className="h-full flex flex-col p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Equity & Drawdown</h3>
        <p className="text-sm text-muted-foreground">{startDate}–{endDate}</p>
      </div>
      <div className="flex-1">
        <ChartContainer config={chartConfig} className="h-[120px]">
          <LineChart accessibilityLayer data={fallbackData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis yAxisId="left" orientation="left" tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} width={30} tickFormatter={(v) => `${v}%`} domain={[0, 20]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line yAxisId="left" dataKey="equity" type="monotone" stroke="var(--color-equity)" strokeWidth={2} dot={false} />
            <Line yAxisId="right" dataKey="drawdown" type="monotone" stroke="var(--color-drawdown)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </div>
      <div className="mt-4">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-1">
            <div className="flex items-center gap-2 leading-none font-medium text-muted-foreground">
              Monitoring equity trend and peak-to-trough declines <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-xs text-muted-foreground leading-none">Left axis: $ equity • Right axis: % drawdown</div>
          </div>
        </div>
      </div>
    </div>
  );
}


