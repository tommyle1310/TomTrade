"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PnLPoint } from "@/lib/types";

interface PnLBarProps {
  data: PnLPoint[];
}

const chartConfig: ChartConfig = {
  pnl: { label: "P&L" },
  profit: { label: "Profit", color: "#16a34a" },
  loss: { label: "Loss", color: "#dc2626" },
};

export default function PnLBar({ data }: PnLBarProps) {
  // Transform API data to chart format with actual dates
  const chartData = data.map((item) => ({
    day: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    date: item.date, // Keep original date for tooltip
    pnl: Math.round(item.pnl),
    fill: item.pnl >= 0 ? "#16a34a" : "#dc2626"
  }));

  // Fallback data if no API data
  const fallbackData = chartData.length > 0 ? chartData : [
    { day: "Jul 20", date: "2025-07-20", pnl: 2000, fill: "#16a34a" },
    { day: "Jul 21", date: "2025-07-21", pnl: -500, fill: "#dc2626" },
    { day: "Jul 22", date: "2025-07-22", pnl: 1500, fill: "#16a34a" },
    { day: "Jul 23", date: "2025-07-23", pnl: 300, fill: "#16a34a" },
    { day: "Jul 24", date: "2025-07-24", pnl: -800, fill: "#dc2626" },
    { day: "Jul 25", date: "2025-07-25", pnl: 2200, fill: "#16a34a" },
    { day: "Jul 26", date: "2025-07-26", pnl: 900, fill: "#16a34a" },
  ];

  const period = data.length > 0 ? `Last ${data.length} days` : 'Last 7 days';

  // Custom tooltip content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.date}</p>
          <p className={`font-bold ${data.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            P&L: ${data.pnl.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">P&amp;L Over Time</h3>
        <p className="text-sm text-muted-foreground">{period}</p>
      </div>
      <div className="flex-1">
        <ChartContainer config={chartConfig} className="h-[120px]">
          <BarChart accessibilityLayer data={fallbackData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip content={<CustomTooltip />} />
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
      </div>
      <div className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium text-muted-foreground">
          Trending up overall <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-xs text-muted-foreground leading-none">Realized P&amp;L from closed trades</div>
      </div>
    </div>
  );
}


