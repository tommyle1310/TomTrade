"use client";

import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

const chartData = [
  { symbol: "AAPL", volume: 30, fill: "var(--color-aapl)" },
  { symbol: "TSLA", volume: 25, fill: "var(--color-tsla)" },
  { symbol: "MSFT", volume: 20, fill: "var(--color-msft)" },
  { symbol: "Other", volume: 25, fill: "var(--color-other)" },
];

const chartConfig: ChartConfig = {
  volume: { label: "Volume" },
  aapl: { label: "AAPL", color: "var(--chart-1)" },
  tsla: { label: "TSLA", color: "var(--chart-2)" },
  msft: { label: "MSFT", color: "var(--chart-3)" },
  other: { label: "Other", color: "var(--chart-4)" },
};

export default function MostTradedPie() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Most Traded Stocks</CardTitle>
        <CardDescription>By share of volume</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto h-[120px] w-[120px] ">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="volume"
              nameKey="symbol"
              innerRadius={36}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => <Sector {...props} outerRadius={outerRadius + 10} />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up for AAPL <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Distribution of trades across symbols</div>
      </CardFooter>
    </Card>
  );
}


