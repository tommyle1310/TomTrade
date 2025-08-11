'use client' 
import {
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Crown,
  Users,
  AlertTriangle,
  RefreshCw,
  Lock,
  Download,
  Building2,
} from "lucide-react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import EquityDrawdownCombo from "@/components/admin/charts/EquityDrawdownCombo";
import MostTradedPie from "@/components/admin/charts/MostTradedPie";
import PnLBar from "@/components/admin/charts/PnLBar";
import { TweetCard } from "@/components/magicui/tweet-card";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { RippleButton } from "@/components/magicui/ripple-button";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";

type Kpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  icon: React.ReactNode;
};

const kpis: Kpi[] = [
  { id: "revenue", label: "Total Revenue", value: "$12,500", delta: "+5% vs yesterday", trend: "up", icon: <DollarSign className="size-4" /> },
  { id: "trades", label: "Total Trades Executed", value: "3,450", delta: "today", trend: "up", icon: <BarChart3 className="size-4" /> },
  { id: "winrate", label: "Win Rate", value: "62%", delta: "24h", trend: "up", icon: <TrendingUp className="size-4" /> },
  { id: "drawdown", label: "Max Drawdown", value: "8%", delta: "7d", trend: "up", icon: <Activity className="size-4" /> },
];

const metricsData = [
  { metric: "ARPU", value: "$45/user", period: "Last 30 days" },
  { metric: "Churn Rate", value: "4.5%", period: "Last month", color: "text-yellow-600" },
  { metric: "Average Trade Size", value: "$1,200", period: "Per trade" },
  { metric: "Margin Call Alerts", value: "12", period: "Today", color: "text-red-600" },
  { metric: "Service Uptime", value: "99.98%", period: "Last 30 days", color: "text-green-600" },
  { metric: "Top User", value: "+$5,000", period: "7d" },
];

const liveStatusData = [
  { service: "Matching Engine", icon: "⚡", status: "online", response: "120ms", uptime: "99.98%" },
  { service: "API Gateway", icon: "🌐", status: "online", response: "45ms", uptime: "99.99%" },
  { service: "Database", icon: "🗄️", status: "online", response: "89ms", uptime: "99.95%" },
  { service: "Cache (Redis)", icon: "⚡", status: "online", response: "12ms", uptime: "99.99%" },
  { service: "Notifications", icon: "🔔", status: "warning", response: "250ms", uptime: "98.5%" },
  { service: "Socket Server", icon: "🔌", status: "online", response: "23ms", uptime: "99.97%" },
];

// chart data moved to dedicated components

const quickActions = [
  {
    id: "send-alert",
    label: "Send Alert",
    icon: <AlertTriangle className="size-5" />,
    color: "blue",
    type: "ripple" as const,
    action: () => console.log("Send Alert clicked")
  },
  {
    id: "refresh-data",
    label: "Refresh Data",
    icon: <RefreshCw className="size-5" />,
    color: "green",
    type: "shadcn" as const,
    action: () => console.log("Refresh Data clicked")
  },
  {
    id: "lock-user",
    label: "Lock User",
    icon: <Lock className="size-5" />,
    color: "red",
    type: "ripple" as const,
    action: () => console.log("Lock User clicked")
  },
  {
    id: "export-csv",
    label: "Export CSV",
    icon: <Download className="size-5" />,
    color: "purple",
    type: "shadcn" as const,
    action: () => console.log("Export CSV clicked")
  },
  {
    id: "toggle-market",
    label: "Toggle Market",
    icon: <Building2 className="size-5" />,
    color: "orange",
    type: "animated" as const,
    action: () => console.log("Toggle Market clicked")
  },
  {
    id: "live-status",
    label: "Live Status",
    icon: <Activity className="size-5" />,
    color: "indigo",
    type: "dialog" as const,
    action: () => console.log("Live Status clicked")
  }
];

export default function AdminOverview() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Welcome back, Admin</h1>
          <p className="text-sm text-muted-foreground">Overview of platform performance and operations.</p>
        </div>
        <div className="flex gap-2">
          <InteractiveHoverButton>Invite User</InteractiveHoverButton>
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Row 1: 4 Main Cards - Compact flex row like image */}
      <section className="flex gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="flex-1 p-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-sm text-muted-foreground">{kpi.label}</div>
                <div className="text-xl font-semibold">{kpi.value}</div>
              </div>
              <div className="text-muted-foreground">{kpi.icon}</div>
            </div>
            {/* Absolute positioned trend arrow */}
            <div className="absolute top-2 right-2">
              <div
                className={
                  kpi.trend === "up"
                    ? "inline-flex items-center gap-1 rounded-full w-fit bg-green-50 text-green-700 px-1.5 py-0.5 text-xs"
                    : kpi.trend === "down"
                    ? "inline-flex items-center gap-1 rounded-full w-fit bg-red-50 text-red-700 px-1.5 py-0.5 text-xs"
                    : "inline-flex items-center gap-1 rounded-full w-fit bg-neutral-100 text-neutral-600 px-1.5 py-0.5 text-xs"
                }
              >
                {kpi.trend === "up" ? <ArrowUpRight className="size-3" /> : kpi.trend === "down" ? <ArrowDownRight className="size-3" /> : null}
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Row 2: Only 2 charts - P&L (8/12) and Pie (4/12) */}
      <section className="grid w-full  grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-5">
        <EquityDrawdownCombo />

        </div>
        <div className="xl:col-span-4">
        <PnLBar />

        </div>
        <div className="xl:col-span-3">
          <MostTradedPie />
        </div>
      </section>

      {/* Row 3: 2 sections - Data table (7/12) and P&L chart (5/12) */}
      <section className="grid grid-cols-1  xl:grid-cols-12 gap-3">
        {/* Section 1: Shadcn DataTable */}
        <div className="xl:col-span-7">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Platform Metrics</CardTitle>
            </CardHeader>
            <CardContent className="-mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-semibold">{item.metric}</TableCell>
                      <TableCell className={`font-semibold ${item.color}`}>{item.value}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.period}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        {/* Section 2: Quick Actions */}
        <div className="xl:col-span-5 flex-grow">
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action) => {
                      const getColorClasses = (color: string) => {
                        const colorMap = {
                          blue: "text-blue-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50",
                          green: "text-green-600 hover:text-green-700 hover:border-green-300 hover:bg-green-50",
                          red: "text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50",
                          purple: "text-purple-600 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50",
                          orange: "text-orange-600 hover:text-orange-700 hover:border-orange-300 hover:bg-orange-50",
                          indigo: "text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50"
                        };
                        return colorMap[color as keyof typeof colorMap] || "";
                      };

                      const baseClasses = "flex flex-row items-center cursor-pointer gap-3 p-3 rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 transform hover:scale-105";

                      if (action.type === "dialog") {
                        return (
                          <Dialog key={action.id}>
                            <DialogTrigger asChild>
                              <button className={`${baseClasses} py-0 ${getColorClasses(action.color)}`} onClick={action.action}>
                                <span>{action.icon}</span>
                                <span className="text-xs font-semibold">{action.label}</span>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-lg font-semibold">System Live Status</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {liveStatusData.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xl">{item.icon}</span>
                                      <div>
                                        <div className="font-medium text-slate-900">{item.service}</div>
                                        <div className="text-xs text-slate-500">Uptime: {item.uptime}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${
                                        item.status === 'online' ? 'bg-green-500' : 
                                        item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}></div>
                                      <span className="text-sm font-mono text-slate-600">{item.response}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        );
                      }
                      // Default Shadcn Button
                      return (
                        <Button
                          key={action.id}
                          variant="outline"
                          className={`${baseClasses} ${getColorClasses(action.color)}`}
                          onClick={action.action}
                        >
                          <span>{action.icon}</span>
                          <span className="text-xs font-semibold">{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

// Removed unused helpers to satisfy linter


