"use client";

import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { MostTradedStock } from "@/lib/types";
import { CHART_COLORS } from "@/lib/theme";

interface MostTradedPieProps {
  data: MostTradedStock[];
}

const chartConfig: ChartConfig = {
  volume: { label: "Volume" },
  aapl: { label: "AAPL", color: CHART_COLORS[0] },
  tsla: { label: "TSLA", color: CHART_COLORS[2] },
  msft: { label: "MSFT", color: CHART_COLORS[1] },
  googl: { label: "GOOGL", color: CHART_COLORS[3] },
  amzn: { label: "AMZN", color: CHART_COLORS[4] },
  nvda: { label: "NVDA", color: "#06b6d4" },
  meta: { label: "META", color: "#84cc16" },
  other: { label: "Other", color: "#6b7280" },
};

// Color palette for different stocks
const stockColors = [
  CHART_COLORS[0], // blue
  CHART_COLORS[2], // red
  CHART_COLORS[1], // green
  CHART_COLORS[3], // amber
  CHART_COLORS[4], // purple
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#6366f1", // indigo
];

export default function MostTradedPie({ data }: MostTradedPieProps) {
  // Transform API data to chart format with proper colors
  const chartData = data.map((item, index) => ({
    symbol: item.ticker,
    volume: Math.round(item.shareOfVolume),
    fill: stockColors[index % stockColors.length] || stockColors[0]
  }));

  // Fallback data if no API data
  const fallbackData = chartData.length > 0 ? chartData : [
    { symbol: "AAPL", volume: 30, fill: "#3b82f6" },
    { symbol: "TSLA", volume: 25, fill: "#ef4444" },
    { symbol: "MSFT", volume: 20, fill: "#10b981" },
    { symbol: "Other", volume: 25, fill: "#6b7280" },
  ];

  const topStock = data.length > 0 ? data[0].ticker : 'AAPL';

  return (
    <Card className="flex flex-col py-3 gap-2">
      <CardHeader className="items-center pb-0 px-3">
        <CardTitle>Most Traded Stocks</CardTitle>
        <CardDescription>By share of volume</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-3">
        <ChartContainer config={chartConfig} className="mx-auto h-[120px] w-[120px] ">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={fallbackData}
              dataKey="volume"
              nameKey="symbol"
              innerRadius={0}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => <Sector {...props} outerRadius={outerRadius + 10} />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm px-3">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up for {topStock} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Distribution of trades across symbols</div>
      </CardFooter>
    </Card>
  );
}


