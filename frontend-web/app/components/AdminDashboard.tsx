'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Settings, 
  Bell, 
  Search,
  Grid,
  FileText,
  Star,
  Newspaper,
  Calendar,
  Monitor,
  Calculator,
  Trophy,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Activity,
  AlertCircle,
  Clock,
  Database,
  Globe,
  Lock,
  Zap
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ShinyButton } from '@/components/magicui/shiny-button';
import { RainbowButton } from '@/components/magicui/rainbow-button';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className = '' 
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="h-4 w-4 text-muted-foreground">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
      {trend && (
        <div className={`flex items-center text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span className="ml-1">{trend.value}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

interface SystemStatusProps {
  name: string;
  status: 'active' | 'pending' | 'inactive';
  uptime: string;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ name, status, uptime }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">{uptime}</div>
        <Badge variant={status === 'active' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}>
          {getStatusText(status)}
        </Badge>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for the dashboard
  const systemMetrics = {
    totalUsers: '12,847',
    activeTrades: '2,341',
    totalVolume: '$45.2M',
    systemUptime: '99.97%',
    pendingOrders: '156',
    completedTrades: '18,923'
  };

  const tradingMetrics = {
    averageWin: '$1,247.00',
    averageLoss: '$456.00',
    profitFactor: '8.2',
    bestTrade: '$12,450.99',
    winRatio: '78.5%',
    riskReward: '2.7:1'
  };

  const systemStatus = [
    { name: 'Order Matching Engine', status: 'active' as const, uptime: '99.99%' },
    { name: 'Market Data Feed', status: 'active' as const, uptime: '99.95%' },
    { name: 'User Authentication', status: 'active' as const, uptime: '99.98%' },
    { name: 'Risk Management', status: 'active' as const, uptime: '99.97%' },
    { name: 'Notification System', status: 'pending' as const, uptime: '98.5%' }
  ];

  const recentActivities = [
    { time: '2 minutes ago', type: 'SystemAlert', message: 'High volume detected on EURUSD pair', icon: <Activity size={16} /> },
    { time: '15 minutes ago', type: 'UserAction', message: 'Admin user updated risk parameters', icon: <Settings size={16} /> },
    { time: '1 hour ago', type: 'SystemAlert', message: 'New user registration limit reached', icon: <AlertCircle size={16} /> },
    { time: '2 hours ago', type: 'Maintenance', message: 'Scheduled database backup completed', icon: <Database size={16} /> }
  ];

  const topTradingPairs = [
    { pair: 'EURUSD', volume: '$12.4M', change: '+2.3%', isPositive: true },
    { pair: 'GBPUSD', volume: '$8.7M', change: '-1.1%', isPositive: false },
    { pair: 'USDJPY', volume: '$6.2M', change: '+0.8%', isPositive: true },
    { pair: 'AUDUSD', volume: '$4.1M', change: '+1.5%', isPositive: true }
  ];

  const navigationItems = [
    { id: 'overview', label: 'System Overview', icon: <Grid size={20} />, active: true },
    { id: 'users', label: 'User Management', icon: <Users size={20} />, active: false },
    { id: 'trading', label: 'Trading Analytics', icon: <BarChart3 size={20} />, active: false },
    { id: 'risk', label: 'Risk Management', icon: <Shield size={20} />, active: false },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} />, active: false }
  ];

  const systemTools = [
    { name: 'System Logs', icon: <Newspaper size={20} /> },
    { name: 'Maintenance', icon: <Calendar size={20} /> },
    { name: 'Performance', icon: <Monitor size={20} /> },
    { name: 'Calculators', icon: <Calculator size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">TomTrade</h1>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4 space-y-2">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">MENU</h3>
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">SYSTEM</h3>
            <div className="space-y-1">
              {systemTools.map((tool, index) => (
                <button
                  key={index}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  {tool.icon}
                  <span>{tool.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">SYSTEM STATUS</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <span className="text-sm text-green-700 dark:text-green-300">All Systems</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Admin:</span>
              <span className="ml-2 font-medium">System Admin</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="default" className="ml-2">Active</Badge>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Role:</span>
              <span className="ml-2 font-medium">Super Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold">System Dashboard</h2>
              <span className="text-muted-foreground">Welcome back, Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="flex items-center space-x-2">
                <Shield size={16} />
                <span>System Settings</span>
              </Button>
              <ShinyButton>Shiny Button</ShinyButton>
              <RainbowButton>Rainbow Button</RainbowButton>
              <Button variant="outline" className="flex items-center space-x-2">
                <Trophy size={16} />
                <span>Performance Report</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Bell size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Search size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Top Row - Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={systemMetrics.totalUsers}
              icon={<Users size={20} />}
              trend={{ value: '+12.5%', isPositive: true }}
            />
            <MetricCard
              title="Active Trades"
              value={systemMetrics.activeTrades}
              icon={<BarChart3 size={20} />}
              trend={{ value: '+8.2%', isPositive: true }}
            />
            <MetricCard
              title="Total Volume"
              value={systemMetrics.totalVolume}
              icon={<DollarSign size={20} />}
              trend={{ value: '+15.3%', isPositive: true }}
            />
            <MetricCard
              title="System Uptime"
              value={systemMetrics.systemUptime}
              icon={<CheckCircle size={20} />}
              trend={{ value: '+0.02%', isPositive: true }}
            />
          </div>

          {/* Middle Row - Charts and Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Performance Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time system health monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">99.97%</div>
                    <div className="text-sm text-muted-foreground">System Uptime</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">+0.02% from last week</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Metrics */}
            <div className="space-y-4">
              <MetricCard
                title="Win Ratio"
                value={tradingMetrics.winRatio}
                icon={<Trophy size={20} />}
                trend={{ value: '+2.1%', isPositive: true }}
              />
              <MetricCard
                title="Profit Factor"
                value={tradingMetrics.profitFactor}
                icon={<TrendingUp size={20} />}
                trend={{ value: '+0.3', isPositive: true }}
              />
            </div>
          </div>

          {/* Bottom Row - Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Average Win"
              value={tradingMetrics.averageWin}
              icon={<ArrowUpRight size={20} />}
              trend={{ value: '+7%', isPositive: true }}
            />
            <MetricCard
              title="Average Loss"
              value={tradingMetrics.averageLoss}
              icon={<ArrowDownRight size={20} />}
              trend={{ value: '-3%', isPositive: true }}
            />
            <MetricCard
              title="Best Trade"
              value={tradingMetrics.bestTrade}
              icon={<Star size={20} />}
              trend={{ value: '+12%', isPositive: true }}
            />
            <MetricCard
              title="Risk/Reward"
              value={tradingMetrics.riskReward}
              icon={<Shield size={20} />}
              trend={{ value: '+0.2', isPositive: true }}
            />
          </div>

          {/* System Status and Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system component health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemStatus.map((system, index) => (
                    <SystemStatus key={index} {...system} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system events and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="text-muted-foreground mt-0.5">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.message}</div>
                        <div className="text-xs text-muted-foreground">{activity.time} • {activity.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Trading Pairs */}
          <Card>
            <CardHeader>
              <CardTitle>Top Trading Pairs</CardTitle>
              <CardDescription>Most active currency pairs by volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {topTradingPairs.map((pair, index) => (
                  <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">{pair.pair}</div>
                    <div className="text-sm text-muted-foreground">{pair.volume}</div>
                    <Badge variant={pair.isPositive ? 'default' : 'destructive'} className="mt-1">
                      {pair.change}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
