"use client";

import { gql, useQuery } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translations";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/theme";

interface Holding {
  symbol: string;
  value: number;
  percentage: number;
}

interface EquityPoint {
  timestamp: number;
  value: number;
}

interface PortfolioData {
  totalValue: number;
  holdings: Holding[];
  equityCurve: EquityPoint[];
}

const GET_PORTFOLIO = gql`
  query GetPortfolio {
    portfolio {
      totalValue
      holdings { symbol value percentage }
      equityCurve { timestamp value }
    }
  }
`;

const COLORS = [
  ...CHART_COLORS, // Use first 5 colors from theme
  "#06b6d4", "#f97316", "#84cc16",
  "#ec4899", "#6366f1", "#14b8a6", "#f43f5e"
];

export default function PortfolioPage() {
  const { t } = useTranslation();
  const { data, loading } = useQuery(GET_PORTFOLIO, { fetchPolicy: "cache-and-network" });
  const portfolio: PortfolioData = data?.portfolio;

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="text-muted-foreground">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-6">
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-4">
          <div className="text-6xl">💼</div>
          <div className="text-xl font-medium">{t('common.noData')}</div>
          <div className="text-sm">{t('dashboard.portfolioValue')}</div>
        </div>
      </div>
    );
  }

  const pieData = portfolio.holdings.map((holding, index) => ({
    ...holding,
    color: COLORS[index % COLORS.length],
  }));

  const lineData = portfolio.equityCurve.map(point => ({
    ...point,
    date: new Date(point.timestamp).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="glass-strong border-glass-border shadow-elevated-lg bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('portfolio.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold mb-2">
            ${portfolio.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {t('dashboard.portfolioValue')}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Holdings Allocation */}
        <Card className="glass-strong border-glass-border shadow-elevated">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t('portfolio.allocation')}</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolio.holdings.length > 0 ? (
              <div className="space-y-4">
                <ChartContainer config={{}} className="h-[320px]">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={pieData}
                      nameKey="symbol"
                      outerRadius={120}
                      label={({ symbol, percentage }) => `${symbol} ${percentage.toFixed(1)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>

                {/* Holdings List */}
                <div className="space-y-2">
                  {portfolio.holdings.map((holding, index) => (
                    <div key={holding.symbol} className="flex items-center justify-between p-3 rounded-lg glass-subtle border-glass-border hover:bg-primary/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="font-semibold">{holding.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${holding.value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{holding.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="text-6xl">📈</div>
                <div className="text-xl font-medium">{t('common.noData')}</div>
                <div className="text-sm">{t('portfolio.holdings')}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Equity Curve */}
        <Card className="glass-strong border-glass-border shadow-elevated">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t('dashboard.portfolioPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolio.equityCurve.length > 0 ? (
              <ChartContainer config={{}}>
                <LineChart data={lineData} height={320}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line
                    dataKey="value"
                    stroke="url(#equityGradient)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="text-6xl">📊</div>
                <div className="text-xl font-medium">{t('common.noData')}</div>
                <div className="text-sm">{t('dashboard.portfolioChart')}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t('dashboard.overview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">{t('portfolio.holdings')}</div>
              <div className="text-2xl font-bold">{portfolio.holdings.length}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">Largest Position</div>
              <div className="text-2xl font-bold">
                {portfolio.holdings.length > 0
                  ? portfolio.holdings.reduce((max, h) => h.value > max.value ? h : max).symbol
                  : 'N/A'
                }
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">Data Points</div>
              <div className="text-2xl font-bold">{portfolio.equityCurve.length}</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="text-sm opacity-90">Avg Position</div>
              <div className="text-2xl font-bold">
                ${portfolio.holdings.length > 0
                  ? (portfolio.totalValue / portfolio.holdings.length).toFixed(0)
                  : '0'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


