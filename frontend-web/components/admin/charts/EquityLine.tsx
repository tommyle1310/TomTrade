"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { day: "Day 1", equity: 100 },
  { day: "Day 2", equity: 103 },
  { day: "Day 3", equity: 105 },
  { day: "Day 4", equity: 108 },
  { day: "Day 5", equity: 112 },
  { day: "Day 6", equity: 118 },
  { day: "Day 7", equity: 115 },
  { day: "Day 8", equity: 110 },
  { day: "Day 9", equity: 113 },
  { day: "Day 10", equity: 117 },
  { day: "Day 11", equity: 120 },
  { day: "Day 12", equity: 118 },
  { day: "Day 13", equity: 119 },
  { day: "Day 14", equity: 121 },
];

const chartConfig: ChartConfig = {
  equity: {
    label: "Equity",
    color: "var(--chart-1)",
  },
};

export default function EquityLine() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equity Curve (Last 14 days)</CardTitle>
        <CardDescription>System-wide cumulative equity</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }} height={200}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line dataKey="desktop" type="monotone" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
            <Line dataKey="mobile" type="monotone" stroke="var(--color-mobile)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-1">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up overall <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">Showing total equity for the last 14 days</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}


