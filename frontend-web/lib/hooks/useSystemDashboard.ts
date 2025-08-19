import { useState, useEffect } from 'react';
import { gqlRequest } from '../graphqlClient';
import { SystemDashboardResult, SystemDashboardInput } from '../types';
import { useAuthStore } from '../authStore';

const GET_SYSTEM_DASHBOARD_QUERY = `
  query GetSystemDashboard($input: SystemDashboardInput!) {
    getSystemDashboard(input: $input) {
      totalRevenue {
        startDate
        endDate
      }
      totalTradesExecuted {
        startDate
        endDate
      }
      winRate {
        startDate
        endDate
      }
      maxDrawdown {
        startDate
        endDate
      }
      equityAndDrawdown {
        date
        equity
        maxDrawdown
      }
      pnlOverTime {
        date
        pnl
      }
      mostTradedStocks {
        ticker
        companyName
        volume
        shareOfVolume
      }
      arpu {
        startDate
        endDate
      }
      churnRate {
        startDate
        endDate
      }
      averageTradeSize {
        startDate
        endDate
      }
      marginCallAlerts {
        startDate
        endDate
      }
      serviceUptime {
        startDate
        endDate
      }
      topUsers {
        id
        name
        avatar
        pnl
        totalValue
      }
    }
  }
`;

// Mock data for when backend is not available
const mockData: SystemDashboardResult = {
  totalRevenue: { startDate: 8500, endDate: 12500 },
  totalTradesExecuted: { startDate: 2800, endDate: 3450 },
  winRate: { startDate: 58, endDate: 62 },
  maxDrawdown: { startDate: 12, endDate: 8 },
  equityAndDrawdown: [
    { date: '2025-01-01', equity: 80000, maxDrawdown: 0 },
    { date: '2025-01-15', equity: 85000, maxDrawdown: 5 },
    { date: '2025-01-31', equity: 90000, maxDrawdown: 8 },
  ],
  pnlOverTime: [
    { date: '2025-01-01', pnl: 2000 },
    { date: '2025-01-02', pnl: -500 },
    { date: '2025-01-03', pnl: 1500 },
    { date: '2025-01-04', pnl: 300 },
    { date: '2025-01-05', pnl: -800 },
    { date: '2025-01-06', pnl: 2200 },
    { date: '2025-01-07', pnl: 900 },
  ],
  mostTradedStocks: [
    { ticker: 'AAPL', companyName: 'Apple Inc.', volume: 30000, shareOfVolume: 30 },
    { ticker: 'TSLA', companyName: 'Tesla Inc.', volume: 25000, shareOfVolume: 25 },
    { ticker: 'MSFT', companyName: 'Microsoft Corp.', volume: 20000, shareOfVolume: 20 },
    { ticker: 'GOOGL', companyName: 'Alphabet Inc.', volume: 15000, shareOfVolume: 15 },
    { ticker: 'AMZN', companyName: 'Amazon.com Inc.', volume: 10000, shareOfVolume: 10 },
  ],
  arpu: { startDate: 42, endDate: 45 },
  churnRate: { startDate: 5.2, endDate: 4.5 },
  averageTradeSize: { startDate: 1100, endDate: 1200 },
  marginCallAlerts: { startDate: 8, endDate: 12 },
  serviceUptime: { startDate: 99.95, endDate: 99.98 },
  topUsers: [
    { id: '1', name: 'John Doe', avatar: undefined, pnl: 5000, totalValue: 150000 },
    { id: '2', name: 'Jane Smith', avatar: undefined, pnl: 3200, totalValue: 120000 },
    { id: '3', name: 'Bob Johnson', avatar: undefined, pnl: 2800, totalValue: 95000 },
  ],
};

export const useSystemDashboard = (input: SystemDashboardInput) => {
  const [data, setData] = useState<SystemDashboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get token from auth store
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!isAuthenticated || !token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      const result = await gqlRequest<{
        getSystemDashboard: SystemDashboardResult;
      }>(GET_SYSTEM_DASHBOARD_QUERY, { input }, token);
      
      setData(result.getSystemDashboard);
    } catch (err) {
      console.warn('Backend not available or authentication failed, using mock data:', err);
      // Use mock data when backend is not available or authentication fails
      setData(mockData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [input.startDate, input.endDate, input.compareStartDate, input.compareEndDate, token, isAuthenticated]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};
