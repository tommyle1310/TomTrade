"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Simulated last 30 days for Aug 2025
const days = Array.from({ length: 30 }, (_, i) => `Aug ${i + 1}`);
const chartData = days.map((d, i) => {
  const base = 80000; // $80k
  const equity = base + i * 1200 - Math.max(0, (i - 18) * 1600) + (i % 5) * 500;
  const peak = Math.max(...Array.from({ length: i + 1 }, (_, j) => base + j * 1200 + (j % 5) * 500));
  const drawdown = Math.min(0, ((equity - peak) / peak) * 100); // negative percent
  return { day: d, equity: Math.round(equity), drawdown: Math.round(Math.abs(drawdown)) };
});

const chartConfig: ChartConfig = {
  equity: { label: "Equity", color: "var(--chart-1)" },
  drawdown: { label: "Max Drawdown", color: "var(--chart-2)" },
};

export default function EquityDrawdownCombo() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Equity & Drawdown</CardTitle>
        <CardDescription>Aug 1–Aug 31, 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[120px]">
          <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis yAxisId="left" orientation="left" tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} width={30} tickFormatter={(v) => `${v}%`} domain={[0, 20]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line yAxisId="left" dataKey="equity" type="monotone" stroke="var(--color-equity)" strokeWidth={2} dot={false} />
            <Line yAxisId="right" dataKey="drawdown" type="monotone" stroke="var(--color-drawdown)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-1">
            <div className="flex items-center gap-2 leading-none font-medium">
              Monitoring equity trend and peak-to-trough declines <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">Left axis: $ equity • Right axis: % drawdown</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}


