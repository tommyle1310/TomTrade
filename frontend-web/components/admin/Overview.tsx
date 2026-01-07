'use client';
import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Users,
  AlertTriangle,
  RefreshCw,
  Lock,
  Download,
  Building2,
  LogIn,
  Play,
  Square,
  Database,
} from 'lucide-react';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EquityDrawdownCombo from '@/components/admin/charts/EquityDrawdownCombo';
import MostTradedPie from '@/components/admin/charts/MostTradedPie';
import PnLBar from '@/components/admin/charts/PnLBar';
import { useSystemDashboard } from '@/lib/hooks/useSystemDashboard';
import { useDashboardSeeder } from '@/lib/hooks/useDashboardSeeder';
import { useAuthStore } from '@/lib/authStore';
import { SystemDashboardInput } from '@/lib/types';
import DateRangePicker from '@/components/DateRangePicker';

type Kpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
  icon: React.ReactNode;
};

const liveStatusData = [
  {
    service: 'Matching Engine',
    icon: '⚡',
    status: 'online',
    response: '120ms',
    uptime: '99.98%',
  },
  {
    service: 'API Gateway',
    icon: '🌐',
    status: 'online',
    response: '45ms',
    uptime: '99.99%',
  },
  {
    service: 'Database',
    icon: '🗄️',
    status: 'online',
    response: '89ms',
    uptime: '99.95%',
  },
  {
    service: 'Cache (Redis)',
    icon: '⚡',
    status: 'online',
    response: '12ms',
    uptime: '99.99%',
  },
  {
    service: 'Notifications',
    icon: '🔔',
    status: 'warning',
    response: '250ms',
    uptime: '98.5%',
  },
  {
    service: 'Socket Server',
    icon: '🔌',
    status: 'online',
    response: '23ms',
    uptime: '99.97%',
  },
];

const quickActions = [
  {
    id: 'send-alert',
    label: 'Send Alert',
    icon: <AlertTriangle className="size-5" />,
    color: 'blue',
    type: 'ripple' as const,
    action: () => console.log('Send Alert clicked'),
  },
  {
    id: 'refresh-data',
    label: 'Refresh Data',
    icon: <RefreshCw className="size-5" />,
    color: 'green',
    type: 'shadcn' as const,
    action: () => console.log('Refresh Data clicked'),
  },
  {
    id: 'lock-user',
    label: 'Lock User',
    icon: <Lock className="size-5" />,
    color: 'red',
    type: 'ripple' as const,
    action: () => console.log('Lock User clicked'),
  },
  {
    id: 'export-csv',
    label: 'Export CSV',
    icon: <Download className="size-5" />,
    color: 'purple',
    type: 'shadcn' as const,
    action: () => console.log('Export CSV clicked'),
  },
  {
    id: 'toggle-market',
    label: 'Toggle Market',
    icon: <Building2 className="size-5" />,
    color: 'orange',
    type: 'animated' as const,
    action: () => console.log('Toggle Market clicked'),
  },
  {
    id: 'live-status',
    label: 'Live Status',
    icon: <Activity className="size-5" />,
    color: 'indigo',
    type: 'dialog' as const,
    action: () => console.log('Live Status clicked'),
  },
];

export default function AdminOverview() {
  // Use Date objects for better date handling
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ); // 30 days ago
  const [endDate, setEndDate] = useState<Date>(new Date()); // today
  const [compareStartDate, setCompareStartDate] = useState<Date>(
    new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  ); // 60 days ago
  const [compareEndDate, setCompareEndDate] = useState<Date>(
    new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
  ); // 31 days ago

  // Convert dates to API format
  const dateRange: SystemDashboardInput = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    compareStartDate: compareStartDate.toISOString().split('T')[0],
    compareEndDate: compareEndDate.toISOString().split('T')[0],
  };

  const { data, loading, error, refetch } = useSystemDashboard(dateRange);
  const {
    status: seederStatus,
    loading: seederLoading,
    error: seederError,
    toggleSeeding,
  } = useDashboardSeeder(dateRange.startDate, dateRange.endDate);

  // Get authentication state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const user = useAuthStore((state) => state.user);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrend = (
    startValue: number,
    endValue: number
  ): 'up' | 'down' | 'flat' => {
    if (endValue > startValue) return 'up';
    if (endValue < startValue) return 'down';
    return 'flat';
  };

  const getDeltaText = (
    startValue: number,
    endValue: number,
    format: 'currency' | 'number' | 'percentage' = 'number'
  ) => {
    const diff = endValue - startValue;
    const percentChange = startValue !== 0 ? (diff / startValue) * 100 : 0;

    let formattedDiff = '';
    if (format === 'currency') {
      formattedDiff = formatCurrency(Math.abs(diff));
    } else if (format === 'percentage') {
      formattedDiff = `${Math.abs(percentChange).toFixed(1)}%`;
    } else {
      formattedDiff = formatNumber(Math.abs(diff));
    }

    return `${diff >= 0 ? '+' : '-'}${formattedDiff}`;
  };

  const csvEscape = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return stringValue;
  };

  const buildCsvFromDashboard = (dash: any) => {
    const lines: string[] = [];

    // Summary section
    lines.push('Summary Metrics');
    lines.push('Metric,Start,End');
    lines.push(
      [
        'Total Revenue',
        dash.totalRevenue?.startDate,
        dash.totalRevenue?.endDate,
      ]
        .map(csvEscape)
        .join(',')
    );
    lines.push(
      [
        'Total Trades Executed',
        dash.totalTradesExecuted?.startDate,
        dash.totalTradesExecuted?.endDate,
      ]
        .map(csvEscape)
        .join(',')
    );
    lines.push(
      ['Win Rate (%)', dash.winRate?.startDate, dash.winRate?.endDate]
        .map(csvEscape)
        .join(',')
    );
    lines.push(
      [
        'Max Drawdown (%)',
        dash.maxDrawdown?.startDate,
        dash.maxDrawdown?.endDate,
      ]
        .map(csvEscape)
        .join(',')
    );
    lines.push(
      ['ARPU', dash.arpu?.startDate, dash.arpu?.endDate]
        .map(csvEscape)
        .join(',')
    );
    lines.push(
      ['Churn Rate (%)', dash.churnRate?.startDate, dash.churnRate?.endDate]
        .map(csvEscape)
        .join(',')
    );
    lines.push(
      [
        'Average Trade Size',
        dash.averageTradeSize?.startDate,
        dash.averageTradeSize?.endDate,
      ]
        .map(csvEscape)
        .join(',')
    );
    lines.push(
      [
        'Margin Call Alerts',
        dash.marginCallAlerts?.startDate,
        dash.marginCallAlerts?.endDate,
      ]
        .map(csvEscape)
        .join(',')
    );
    lines.push(
      [
        'Service Uptime (%)',
        dash.serviceUptime?.startDate,
        dash.serviceUptime?.endDate,
      ]
        .map(csvEscape)
        .join(',')
    );
    lines.push('');

    // Equity & Drawdown section
    lines.push('Equity And Drawdown');
    lines.push('Date,Equity,Max Drawdown (%)');
    (dash.equityAndDrawdown || []).forEach((row: any) => {
      lines.push(
        [row.date, row.equity, row.maxDrawdown].map(csvEscape).join(',')
      );
    });
    lines.push('');

    // PnL Over Time section
    lines.push('PnL Over Time');
    lines.push('Date,PnL');
    (dash.pnlOverTime || []).forEach((row: any) => {
      lines.push([row.date, row.pnl].map(csvEscape).join(','));
    });
    lines.push('');

    // Most Traded Stocks section
    lines.push('Most Traded Stocks');
    lines.push('Ticker,Company,Volume,Share Of Volume (%)');
    (dash.mostTradedStocks || []).forEach((row: any) => {
      lines.push(
        [row.ticker, row.companyName, row.volume, row.shareOfVolume]
          .map(csvEscape)
          .join(',')
      );
    });
    lines.push('');

    // Top Users section
    lines.push('Top Users');
    lines.push('User ID,Name,PNL,Total Value');
    (dash.topUsers || []).forEach((row: any) => {
      lines.push(
        [row.id, row.name, row.pnl, row.totalValue].map(csvEscape).join(',')
      );
    });

    return lines.join('\n');
  };

  const handleExportCsv = () => {
    if (!data) {
      console.warn('No dashboard data to export');
      return;
    }
    const csv = buildCsvFromDashboard(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeStart = dateRange.startDate?.replace(/[^0-9-]/g, '') || 'start';
    const safeEnd = dateRange.endDate?.replace(/[^0-9-]/g, '') || 'end';
    link.href = url;
    link.setAttribute(
      'download',
      `system-dashboard_${safeStart}_to_${safeEnd}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Check if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LogIn className="size-8 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">
              Authentication Required
            </p>
            <p className="text-muted-foreground mb-4">
              Please log in to access the admin dashboard.
            </p>
            <Button onClick={() => (window.location.href = '/login')}>
              <LogIn className="size-4 mr-2" />
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is not admin
  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Lock className="size-8 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Access Denied</p>
            <p className="text-muted-foreground mb-4">
              You need admin privileges to access this dashboard.
            </p>
            <p className="text-sm text-muted-foreground">
              Current role: {user?.role}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Create KPIs from API data
  const kpis: Kpi[] = data
    ? [
      {
        id: 'revenue',
        label: 'Total Revenue',
        value: formatCurrency(data.totalRevenue.endDate),
        delta: getDeltaText(
          data.totalRevenue.startDate,
          data.totalRevenue.endDate,
          'currency'
        ),
        trend: getTrend(
          data.totalRevenue.startDate,
          data.totalRevenue.endDate
        ),
        icon: <DollarSign className="size-4" />,
      },
      {
        id: 'trades',
        label: 'Total Trades Executed',
        value: formatNumber(data.totalTradesExecuted.endDate),
        delta: getDeltaText(
          data.totalTradesExecuted.startDate,
          data.totalTradesExecuted.endDate,
          'number'
        ),
        trend: getTrend(
          data.totalTradesExecuted.startDate,
          data.totalTradesExecuted.endDate
        ),
        icon: <BarChart3 className="size-4" />,
      },
      {
        id: 'winrate',
        label: 'Win Rate',
        value: formatPercentage(data.winRate.endDate),
        delta: getDeltaText(
          data.winRate.startDate,
          data.winRate.endDate,
          'percentage'
        ),
        trend: getTrend(data.winRate.startDate, data.winRate.endDate),
        icon: <TrendingUp className="size-4" />,
      },
      {
        id: 'drawdown',
        label: 'Max Drawdown',
        value: formatPercentage(data.maxDrawdown.endDate),
        delta: getDeltaText(
          data.maxDrawdown.startDate,
          data.maxDrawdown.endDate,
          'percentage'
        ),
        trend: getTrend(data.maxDrawdown.startDate, data.maxDrawdown.endDate),
        icon: <Activity className="size-4" />,
      },
    ]
    : [];

  // Create metrics data from API data
  const metricsData = data
    ? [
      {
        metric: 'ARPU',
        value: formatCurrency(data.arpu.endDate),
        color: 'text-blue-600',
      },
      {
        metric: 'Churn Rate',
        value: formatPercentage(data.churnRate.endDate),
        color: 'text-yellow-600',
      },
      {
        metric: 'Average Trade Size',
        value: formatCurrency(data.averageTradeSize.endDate),
        color: 'text-green-600',
      },
      {
        metric: 'Margin Call Alerts',
        value: data.marginCallAlerts.endDate.toString(),
        color: 'text-red-600',
      },
      {
        metric: 'Service Uptime',
        value: formatPercentage(data.serviceUptime.endDate),
        color: 'text-green-600',
      },
      {
        metric: 'Top Users',
        value: `${data.topUsers.length} users`,
        color: 'text-purple-600',
        isTopUsers: true,
        topUsers: data.topUsers,
      },
    ]
    : [];

  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="size-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="size-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-2">Error loading dashboard data</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="size-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Admin'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of platform performance and operations.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            onClick={toggleSeeding}
            disabled={seederLoading}
            variant={seederStatus.isSeeding ? 'destructive' : 'default'}
            className="flex items-center gap-2"
          >
            {seederLoading ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : seederStatus.isSeeding ? (
              <Square className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            {seederStatus.isSeeding ? 'Stop Seeding' : 'Start Seeding'}
          </Button>
          <InteractiveHoverButton>Invite User</InteractiveHoverButton>
          <Button onClick={handleRefresh}>
            <RefreshCw className="size-4 mr-2" />
            Refresh Data
          </Button>
          {/* Date Range Picker */}
          <DateRangePicker
            date1={startDate}
            setDate1={setStartDate}
            date2={endDate}
            setDate2={setEndDate}
          />
        </div>
      </div>
      <div className="flex justify-end"></div>

      {/* Seeder Status */}
      {seederStatus.isSeeding && (
        <div className="flex items-center gap-3 p-4 rounded-xl glass-strong border border-glass-border shadow-elevated">
          <Database className="size-5 text-success animate-pulse" />
          <span className="text-foreground font-semibold">
            Data Seeding Active
          </span>
          <span className="text-sm text-muted-foreground">
            Generating realistic dashboard data every 2 seconds
          </span>
        </div>
      )}

      {seederError && (
        <div className="flex items-center gap-3 p-4 rounded-xl glass-strong border border-destructive/30 shadow-elevated">
          <AlertTriangle className="size-5 text-destructive" />
          <span className="text-destructive font-medium">{seederError}</span>
        </div>
      )}

      {/* Row 1: 4 Main Cards - Compact flex row like image */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="glass-strong border-glass-border shadow-elevated hover:shadow-elevated-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/15 group-hover:to-accent/15 transition-colors">
                  <div className="text-primary">{kpi.icon}</div>
                </div>
                <div
                  className={
                    kpi.trend === 'up'
                      ? 'inline-flex items-center gap-1 rounded-full bg-success/10 text-success px-2.5 py-1 text-xs font-medium border border-success/20'
                      : kpi.trend === 'down'
                        ? 'inline-flex items-center gap-1 rounded-full bg-danger/10 text-danger px-2.5 py-1 text-xs font-medium border border-danger/20'
                        : 'inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2.5 py-1 text-xs font-medium'
                  }
                >
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : kpi.trend === 'down' ? (
                    <ArrowDownRight className="size-3.5" />
                  ) : null}
                  <span>{kpi.delta}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Row 2: Only 2 charts - P&L (8/12) and Pie (4/12) */}
      <section className="grid w-full grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5">
          <div className="glass-strong border border-glass-border rounded-xl shadow-elevated">
            <EquityDrawdownCombo data={data?.equityAndDrawdown || []} />
          </div>
        </div>
        <div className="xl:col-span-4">
          <div className="glass-strong border border-glass-border rounded-xl shadow-elevated">
            <PnLBar data={data?.pnlOverTime || []} />
          </div>
        </div>
        <div className="xl:col-span-3">
          <div className="glass-strong border border-glass-border rounded-xl shadow-elevated">
            <MostTradedPie data={data?.mostTradedStocks || []} />
          </div>
        </div>
      </section>

      {/* Row 3: 2 sections - Data table (7/12) and P&L chart (5/12) */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Section 1: Shadcn DataTable */}
        <div className="xl:col-span-7">
          <Card className="glass-strong border-glass-border shadow-elevated">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Platform Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-glass-border hover:bg-transparent">
                    <TableHead className="font-semibold">Metric</TableHead>
                    <TableHead className="font-semibold">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsData.map((item, index) => (
                    <TableRow key={index} className="border-glass-border hover:bg-primary/5 transition-colors">
                      <TableCell className="font-medium">
                        {item.metric}
                      </TableCell>
                      <TableCell className={`font-semibold ${item.color}`}>
                        {item.isTopUsers ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="link"
                                className="p-0 h-auto font-semibold text-purple-600 hover:text-purple-700"
                              >
                                {item.value}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Users className="size-4" />
                                  <span className="font-semibold">
                                    Top Users
                                  </span>
                                </div>
                                <div className="space-y-2 overflow-y-auto max-h-[200px]">
                                  {item.topUsers?.map((user, userIndex) => (
                                    <div
                                      key={user.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Avatar className="size-8">
                                          <AvatarImage
                                            src={user.avatar || undefined}
                                          />
                                          <AvatarFallback>
                                            {user.name
                                              ?.charAt(0)
                                              .toUpperCase() || 'U'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium text-sm">
                                            {user.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            ID: {user.id.substring(0, 8)}...
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div
                                          className={`text-sm font-semibold ${user.pnl >= 0
                                              ? 'text-green-600'
                                              : 'text-red-600'
                                            }`}
                                        >
                                          {formatCurrency(user.pnl)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {formatCurrency(user.totalValue)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          item.value
                        )}
                      </TableCell>
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
            <Card className="bg-gradient-to-br px-2 from-slate-50 to-slate-100 border-0 shadow-sm">
              <CardHeader className="pb-3 px-2">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => {
                    const getColorClasses = (color: string) => {
                      const colorMap = {
                        blue: 'text-blue-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50',
                        green:
                          'text-green-600 hover:text-green-700 hover:border-green-300 hover:bg-green-50',
                        red: 'text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50',
                        purple:
                          'text-purple-600 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50',
                        orange:
                          'text-orange-600 hover:text-orange-700 hover:border-orange-300 hover:bg-orange-50',
                        indigo:
                          'text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50',
                      };
                      return colorMap[color as keyof typeof colorMap] || '';
                    };

                    const baseClasses =
                      'flex flex-row items-center cursor-pointer gap-3 p-3 rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 transform hover:scale-105';

                    if (action.type === 'dialog') {
                      return (
                        <Dialog key={action.id}>
                          <DialogTrigger asChild>
                            <button
                              className={`${baseClasses} items-center justify-center py-0 ${getColorClasses(
                                action.color
                              )}`}
                              onClick={action.action}
                            >
                              <span>{action.icon}</span>
                              <span className="text-xs font-semibold">
                                {action.label}
                              </span>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold">
                                System Live Status
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {liveStatusData.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                      <div className="font-medium text-slate-900">
                                        {item.service}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        Uptime: {item.uptime}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-3 h-3 rounded-full ${item.status === 'online'
                                          ? 'bg-green-500'
                                          : item.status === 'warning'
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                        }`}
                                    ></div>
                                    <span className="text-sm font-mono text-slate-600">
                                      {item.response}
                                    </span>
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
                        className={`${baseClasses} ${getColorClasses(
                          action.color
                        )}`}
                        onClick={
                          action.id === 'export-csv'
                            ? handleExportCsv
                            : action.action
                        }
                      >
                        <span>{action.icon}</span>
                        <span className="text-xs font-semibold">
                          {action.label}
                        </span>
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
