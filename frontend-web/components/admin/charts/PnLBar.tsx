"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { day: "Mon", pnl: 2000, fill: "var(--color-profit)" },
  { day: "Tue", pnl: -500, fill: "var(--color-loss)" },
  { day: "Wed", pnl: 1500, fill: "var(--color-profit)" },
  { day: "Thu", pnl: 300, fill: "var(--color-profit)" },
  { day: "Fri", pnl: -800, fill: "var(--color-loss)" },
  { day: "Sat", pnl: 2200, fill: "var(--color-profit)" },
  { day: "Sun", pnl: 900, fill: "var(--color-profit)" },
];

const chartConfig: ChartConfig = {
  pnl: { label: "P&L" },
  profit: { label: "Profit", color: "#16a34a" },
  loss: { label: "Loss", color: "#dc2626" },
};

export default function PnLBar() {
  return (
    <Card className="h-full py-3 gap-2">
      <CardHeader className="px-3">
        <CardTitle>P&amp;L Over Time</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        <ChartContainer config={chartConfig} className="h-[120px]">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="pnl"
              strokeWidth={2}
              radius={8}
              activeIndex={2}
              activeBar={({ ...props }) => (
                <Rectangle {...props} fillOpacity={0.9} stroke={props.payload.pnl >= 0 ? "#16a34a" : "#dc2626"} />
              )}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="px-3 flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up overall <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Realized P&amp;L from closed trades</div>
      </CardFooter>
    </Card>
  );
}


