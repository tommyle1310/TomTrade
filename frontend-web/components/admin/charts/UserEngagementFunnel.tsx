"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Funnel, FunnelChart, LabelList } from "recharts";
import { TrendingUp } from "lucide-react";

type Stage = { name: string; value: number; fill?: string };

const baseStages: Stage[] = [
  { name: "Active Users", value: 1000 },
  { name: "Trades Placed", value: 600 },
  { name: "Revenue Generated", value: 400 },
];

const stages: Stage[] = baseStages.map((s, i, arr) => {
  if (i === 0) return { ...s, fill: "var(--chart-1)" };
  const prev = arr[i - 1].value;
  const dropRatio = prev > 0 ? 1 - s.value / prev : 0;
  const severeDrop = dropRatio > 0.3; // >30% => red
  const fill = severeDrop ? danger[500] : i === 1 ? primary[500] : success[500];
  return { ...s, fill };
});

const chartConfig: ChartConfig = {
  funnel: { label: "Users" },
};

export default function UserEngagementFunnel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>User Engagement Funnel</CardTitle>
        <CardDescription>Active Users → Trades Placed → Revenue Generated</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[120px]">
          <FunnelChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Funnel dataKey="value" data={stages} isAnimationActive>
              <LabelList position="right" fill="#6b7280" stroke="none" dataKey="name" />
            </Funnel>
          </FunnelChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Click a stage to drill down <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Red indicates a severe drop (&gt;30%).</div>
      </CardFooter>
    </Card>
  );
}


