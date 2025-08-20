"use client";

import { gql, useQuery } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, Tooltip } from "recharts";

const GET_PORTFOLIO = gql`
  query GetPortfolio {
    portfolio {
      totalValue
      holdings { symbol value percentage }
      equityCurve { timestamp value }
    }
  }
`;

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1", "#a4de6c", "#d0ed57", "#ffc0cb"];

export default function PortfolioPage() {
  const { data } = useQuery(GET_PORTFOLIO, { fetchPolicy: "cache-and-network" });
  const holdings = data?.portfolio?.holdings || [];
  const equity = data?.portfolio?.equityCurve || [];

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Holdings Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[320px]">
            <PieChart>
              <Pie dataKey="value" data={holdings} nameKey="symbol" outerRadius={120} label>
                {holdings.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <LineChart data={equity} height={320}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
              <Tooltip content={<ChartTooltipContent />} />
              <Line dataKey="value" stroke="hsl(var(--primary))" dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}


