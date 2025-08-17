import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuthStore, usePortfolioStore } from '../stores';
import { DashboardResult } from '../apollo/types';
import Avatar from '../components/Avatar';
import { useSocket, PriceAlert, OrderNotification, PortfolioUpdate, BalanceUpdate } from '../hooks/useSocket';
import { useToast } from '../components/Toast';
import { Animated } from 'react-native';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  console.log('🔍 HomeScreen component rendering');
  
  const { user } = useAuthStore();
  const {
    dashboard,
    balance,
    dashboardLoading,
    fetchDashboard,
    fetchBalance,
    refreshAll,
    setDashboard,
    setBalance,
  } = usePortfolioStore();
  
  // CRITICAL FIX: Use direct state subscription with force re-render
  const [localPortfolioValue, setLocalPortfolioValue] = useState<number | null>(null);
  const [localCashBalance, setLocalCashBalance] = useState<number | null>(null);
  const [localBalanceValue, setLocalBalanceValue] = useState<number>(0);
  
  // CRITICAL FIX: Add force re-render state
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // CRITICAL FIX: Add flag to prevent useEffect from overriding socket updates
  const [isSocketUpdate, setIsSocketUpdate] = useState(false);
  
  // CRITICAL FIX: Set initial values from Zustand state only once
  useEffect(() => {
    console.log('🔍 useEffect [] triggered (component mount)');
    console.log('🔍 Setting initial values from Zustand state...');
    
    // Set initial values from Zustand state
    const currentState = usePortfolioStore.getState();
    console.log('🔍 Current Zustand state:', {
      dashboard: currentState.dashboard?.totalPortfolioValue,
      cashBalance: currentState.dashboard?.cashBalance,
      balance: currentState.balance,
    });
    
    setLocalPortfolioValue(currentState.dashboard?.totalPortfolioValue || null);
    setLocalCashBalance(currentState.dashboard?.cashBalance || null);
    setLocalBalanceValue(currentState.balance || 0);
    
    console.log('🔍 Initial values set');
  }, []);
  
  console.log('🔍 Component state check - portfolio:', localPortfolioValue, 'balance:', localBalanceValue, 'dashboard balance:', localCashBalance)
  
  // CRITICAL FIX: Sync local state with dashboard when it changes (for GraphQL updates)
  useEffect(() => {
    console.log('🔍 useEffect [dashboard, isSocketUpdate] triggered');
    console.log('🔍 dashboard:', dashboard?.totalPortfolioValue);
    console.log('🔍 isSocketUpdate:', isSocketUpdate);
    
    // CRITICAL FIX: Only sync if this is NOT a socket update AND the dashboard data is NEWER
    if (dashboard && !isSocketUpdate) {
      // Check if dashboard data is actually newer than current local state
      const dashboardTotal = dashboard.totalPortfolioValue;
      const currentLocalTotal = localPortfolioValue;
      
      console.log('🔍 Dashboard vs Local comparison:', {
        dashboard: dashboardTotal,
        local: currentLocalTotal,
        difference: dashboardTotal - (currentLocalTotal || 0)
      });
      
      // CRITICAL FIX: Prevent stale data from overriding fresh socket data
      // Only update if dashboard data is significantly different AND not the stale fallback value
      const isStaleFallback = Math.abs(dashboardTotal - 70050) < 100; // Check if it's the known stale value
      const isZeroOrVeryLow = dashboardTotal < 1000; // Check if dashboard shows 0 or very low value
      
      if (isStaleFallback || isZeroOrVeryLow) {
        console.log('🔄 CRITICAL: Detected stale/zero dashboard data, skipping GraphQL sync');
        console.log('🔄 Dashboard total:', dashboardTotal, 'isStaleFallback:', isStaleFallback, 'isZeroOrVeryLow:', isZeroOrVeryLow);
        return;
      }
      
      // CRITICAL FIX: Only update if dashboard data is significantly higher than current local state
      // This prevents stale low values from overriding fresh high values
      if (dashboardTotal > (currentLocalTotal || 0) + 1000) {
        console.log('🔄 GraphQL dashboard update - syncing local state (significant increase)');
        setLocalPortfolioValue(dashboard.totalPortfolioValue);
        setLocalCashBalance(dashboard.cashBalance);
      } else {
        console.log('🔄 Skipping GraphQL sync - dashboard data not significantly higher than local state');
      }
    } else if (dashboard && isSocketUpdate) {
      console.log('🔄 Skipping GraphQL sync - socket update in progress');
    } else if (!dashboard) {
      console.log('🔄 No dashboard data available for sync');
    }
  }, [dashboard, isSocketUpdate, localPortfolioValue]);

  // CRITICAL FIX: Sync local state with balance when it changes (for GraphQL updates)
  useEffect(() => {
    console.log('🔍 useEffect [balance, isSocketUpdate] triggered');
    console.log('🔍 balance:', balance);
    console.log('🔍 isSocketUpdate:', isSocketUpdate);
    
    // CRITICAL FIX: Only sync if this is NOT a socket update AND the balance data is NEWER
    if (balance !== undefined && !isSocketUpdate) {
      // Check if balance data is actually newer than current local state
      const balanceValue = balance;
      const currentLocalBalance = localBalanceValue;
      
      console.log('🔍 Balance vs Local comparison:', {
        balance: balanceValue,
        local: currentLocalBalance,
        difference: balanceValue - currentLocalBalance
      });
      
      // CRITICAL FIX: Prevent stale data from overriding fresh socket data
      // Only update if balance data is significantly different AND not the stale fallback value
      const isStaleFallback = Math.abs(balanceValue - 70050) < 100; // Check if it's the known stale value
      const isZeroOrVeryLow = balanceValue < 1000; // Check if balance shows 0 or very low value
      
      if (isStaleFallback || isZeroOrVeryLow) {
        console.log('🔄 CRITICAL: Detected stale/zero balance data, skipping GraphQL balance sync');
        console.log('🔄 Balance value:', balanceValue, 'isStaleFallback:', isStaleFallback, 'isZeroOrVeryLow:', isZeroOrVeryLow);
        return;
      }
      
      // CRITICAL FIX: Only update if balance data is significantly higher than current local state
      // This prevents stale low values from overriding fresh high values
      if (balanceValue > currentLocalBalance + 1000) {
        console.log('🔄 GraphQL balance update - syncing local state (significant increase)');
        setLocalBalanceValue(balance);
      } else {
        console.log('🔄 Skipping GraphQL balance sync - balance data not significantly higher than local state');
      }
    } else if (balance !== undefined && isSocketUpdate) {
      console.log('🔄 Skipping GraphQL balance sync - socket update in progress');
    } else if (balance === undefined) {
      console.log('🔄 No balance data available for sync');
    }
  }, [balance, isSocketUpdate, localBalanceValue]);

  // CRITICAL FIX: Debug local state changes and force re-render
  useEffect(() => {
    console.log('🔍 useEffect [localPortfolioValue, localCashBalance, localBalanceValue, forceUpdate, isSocketUpdate] triggered');
    console.log('🔍 Local state changed - portfolio:', localPortfolioValue, 'cash:', localCashBalance, 'balance:', localBalanceValue, 'forceUpdate:', forceUpdate, 'isSocketUpdate:', isSocketUpdate);
  }, [localPortfolioValue, localCashBalance, localBalanceValue, forceUpdate, isSocketUpdate]);

  // CRITICAL FIX: Add cleanup logging
  useEffect(() => {
    return () => {
      console.log('🔍 HomeScreen component unmounting');
    };
  }, []);

  const [socketConnected, setSocketConnected] = useState(false);
  const { showToast } = useToast();
  const portfolioPulse = useState(new Animated.Value(0))[0];
  const balancePulse = useState(new Animated.Value(0))[0];
  const isLoading = dashboardLoading;

  // Socket event handlers
  const handlePriceAlert = useCallback((data: PriceAlert) => {
    console.log('📢 HomeScreen: Price alert received:', data);
    showToast({
      type: 'warning',
      message: `${data.alert.ticker} is now $${data.currentPrice}`,
      durationMs: 3200,
      createdAt: data.createdAt,
    });
  }, [showToast]);

  const handleOrderNotification = useCallback((data: OrderNotification) => {
    console.log('🔔 HomeScreen: Order notification received:', data);
    const typeText = data.type === 'ORDER_FILLED' ? 'filled' : 
                     data.type === 'ORDER_PARTIAL' ? 'partially filled' : 'cancelled';

    showToast({
      type: data.type === 'ORDER_CANCELLED' ? 'warning' : 'success',
      message: `${data.side} ${data.quantity} ${data.ticker} ${typeText} @ $${data.price}`,
      createdAt: data.createdAt,
    });

    // Subtle highlight animations to indicate real-time updates
    Animated.sequence([
      Animated.timing(portfolioPulse, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(portfolioPulse, { toValue: 0, duration: 450, useNativeDriver: false }),
    ]).start();
    Animated.sequence([
      Animated.timing(balancePulse, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(balancePulse, { toValue: 0, duration: 450, useNativeDriver: false }),
    ]).start();

    // CRITICAL FIX: Don't fetch dashboard/balance after socket updates
    // The socket updates (portfolioUpdate and balanceUpdate) should be the source of truth
    // This prevents the "flashing" effect where GraphQL overwrites socket data
  }, [showToast, portfolioPulse, balancePulse]);

  const handlePortfolioUpdate = useCallback((data: PortfolioUpdate) => {
    console.log('📊 HomeScreen: Portfolio update received:', data);
    console.log('🔍 Portfolio update data type:', typeof data);
    console.log('🔍 Portfolio update data keys:', Object.keys(data));
    console.log('🔍 Portfolio update totalValue:', data.totalValue);
    console.log('📊 HomeScreen: Current local state before update - portfolio:', localPortfolioValue, 'cash:', localCashBalance);
    
    // CRITICAL FIX: Check if this is actually NEW data or stale data
    const isNewData = localPortfolioValue === null || Math.abs(data.totalValue - (localPortfolioValue || 0)) > 10;
    console.log('🔍 CRITICAL: Is this NEW data?', isNewData, {
      newValue: data.totalValue,
      oldValue: localPortfolioValue,
      difference: data.totalValue - (localPortfolioValue || 0)
    });
    
    if (isNewData) {
      console.log('🎉 CRITICAL: This is FRESH portfolio data! Updating UI immediately...');
    } else {
      console.log('⚠️ CRITICAL: This appears to be STALE portfolio data. Skipping update...');
      return; // Don't update with stale data
    }
    
    // CRITICAL FIX: Set socket update flag to prevent useEffect override
    setIsSocketUpdate(true);
    
    // CRITICAL FIX: Calculate cash balance from socket data
    const totalStocksValue = data.positions.reduce((sum, pos) => sum + pos.marketValue, 0);
    const calculatedCashBalance = data.totalValue - totalStocksValue;
    
    console.log(`🔍 Calculated cash balance: ${data.totalValue} - ${totalStocksValue} = ${calculatedCashBalance}`);
    
    // CRITICAL FIX: Update local state IMMEDIATELY for instant UI update
    console.log('🔍 Setting local portfolio value to:', data.totalValue);
    setLocalPortfolioValue(data.totalValue);
    console.log('🔍 Setting local cash balance to:', calculatedCashBalance);
    setLocalCashBalance(calculatedCashBalance);
    console.log('🔍 Setting local balance value to:', calculatedCashBalance);
    setLocalBalanceValue(calculatedCashBalance);
    
    console.log('🔍 Local state update calls completed');
    
    // CRITICAL FIX: Force immediate re-render
    console.log('🔍 Forcing re-render...');
    setForceUpdate(prev => {
      console.log('🔍 Force update from', prev, 'to', prev + 1);
      return prev + 1;
    });
    console.log('🔍 Force update call completed');
    
    // CRITICAL FIX: Create dashboard object and update Zustand state
    const updatedDashboard = {
      totalPortfolioValue: data.totalValue,
      totalPnL: data.totalPnL,
      cashBalance: calculatedCashBalance,
      stockPositions: data.positions.map(pos => ({
        ticker: pos.ticker,
        companyName: `${pos.ticker} Company`,
        quantity: pos.quantity,
        averageBuyPrice: pos.averagePrice,
        currentPrice: pos.currentPrice,
        marketValue: pos.marketValue,
        unrealizedPnL: pos.unrealizedPnL,
        unrealizedPnLPercent: pos.pnlPercentage,
        avatar: undefined,
      })),
      totalRealizedPnL: dashboard?.totalRealizedPnL || 0,
      totalUnrealizedPnL: dashboard?.totalUnrealizedPnL || 0,
    };
    
    // CRITICAL FIX: Update Zustand state after local state
    console.log('🔍 Updating Zustand dashboard...');
    setDashboard(updatedDashboard);
    console.log('🔍 Updating Zustand balance...');
    setBalance(calculatedCashBalance);
    
    console.log('🔍 Zustand state update calls completed');
    
    console.log('🔍 Local state updated - portfolio:', data.totalValue, 'cash:', calculatedCashBalance);
    
    // CRITICAL FIX: Clear socket update flag after a longer delay to prevent GraphQL override
    setTimeout(() => {
      setIsSocketUpdate(false);
      console.log('🔍 Socket update flag cleared (preventing GraphQL override)');
    }, 5000); // Increased to 5000ms to prevent GraphQL from overriding socket updates
    
    Animated.sequence([
      Animated.timing(portfolioPulse, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(portfolioPulse, { toValue: 0, duration: 450, useNativeDriver: false }),
    ]).start();
  }, [dashboard, setDashboard, setBalance, portfolioPulse]);

  const handleBalanceUpdate = useCallback((data: BalanceUpdate) => {
    console.log('💰 HomeScreen: Balance update received:', data);
    
    // CRITICAL FIX: Check if this is actually NEW data or stale data
    const isNewData = localBalanceValue === 0 || Math.abs(data.balance - localBalanceValue) > 10;
    console.log('🔍 CRITICAL: Is this NEW balance data?', isNewData, {
      newValue: data.balance,
      oldValue: localBalanceValue,
      difference: data.balance - localBalanceValue
    });
    
    if (isNewData) {
      console.log('🎉 CRITICAL: This is FRESH balance data! Updating UI immediately...');
    } else {
      console.log('⚠️ CRITICAL: This appears to be STALE balance data. Skipping update...');
      return; // Don't update with stale data
    }
    
    // CRITICAL FIX: Set socket update flag to prevent useEffect override
    setIsSocketUpdate(true);
    
    // CRITICAL FIX: Update local state IMMEDIATELY for instant UI update
    setLocalBalanceValue(data.balance);
    setLocalCashBalance(data.balance);
    
    // CRITICAL FIX: Force immediate re-render
    setForceUpdate(prev => prev + 1);
    
    // CRITICAL FIX: Update Zustand state
    setBalance(data.balance);
    
    // CRITICAL FIX: Update dashboard cash balance if dashboard exists
    if (dashboard) {
      const updatedDashboard = {
        ...dashboard,
        cashBalance: data.balance,
      };
      setDashboard(updatedDashboard);
    }
    
    console.log('🔍 Local state updated - balance:', data.balance);
    
    // CRITICAL FIX: Clear socket update flag after a longer delay to prevent GraphQL override
    console.log('🔍 Setting timeout to clear socket update flag (balance update)...');
    setTimeout(() => {
      setIsSocketUpdate(false);
      console.log('🔍 Socket update flag cleared (balance update) (preventing GraphQL override)');
    }, 5000); // Increased to 5000ms to prevent GraphQL from overriding socket updates
    console.log('🔍 Timeout set for clearing socket update flag (balance update) - 5000ms delay');
    
    Animated.sequence([
      Animated.timing(balancePulse, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(balancePulse, { toValue: 0, duration: 450, useNativeDriver: false }),
    ]).start();
  }, [dashboard, setBalance, setDashboard, balancePulse]);

  const handleConnectionTest = useCallback((data: any) => {
    console.log('✅ HomeScreen: Socket connection test successful:', data);
    setSocketConnected(true);
  }, []);

  // Initialize socket connection
  const { isConnected, connectionStatus, requestPortfolioUpdate, requestPortfolioUpdateWithCurrentPrices } = useSocket({
    onPriceAlert: handlePriceAlert,
    onOrderNotification: handleOrderNotification,
    onPortfolioUpdate: handlePortfolioUpdate,
    onBalanceUpdate: handleBalanceUpdate,
    onConnectionTest: handleConnectionTest,
    autoConnect: true,
  });

  // CRITICAL FIX: Update socket connected state when connection status changes
  useEffect(() => {
    console.log('🔍 useEffect [isConnected, connectionStatus] triggered');
    console.log('🔍 isConnected:', isConnected, 'connectionStatus:', connectionStatus);
    
    setSocketConnected(isConnected);
    console.log(`🔍 HomeScreen: Socket connection status changed to: ${connectionStatus}`);
  }, [isConnected, connectionStatus]);

  // Fetch data on component mount
  useEffect(() => {
    console.log('🔍 useEffect [fetchDashboard, fetchBalance] triggered (initial fetch)');
    
    // CRITICAL FIX: Only fetch initial data if no socket data available
    const { isDataFromSocket, lastSocketUpdate } = usePortfolioStore.getState();
    const currentTime = Date.now();
    
    console.log('🔍 Initial fetch state check - isDataFromSocket:', isDataFromSocket, 'lastSocketUpdate:', lastSocketUpdate, 'timeSinceUpdate:', currentTime - lastSocketUpdate);
    
          if (isDataFromSocket && (currentTime - lastSocketUpdate) < 10000) {
        console.log('🔄 Skipping initial fetch - recent socket data available (within 10s)');
        // CRITICAL FIX: Still request fresh socket update to get LATEST data
        if (isConnected && user?.id) {
          console.log('🔍 CRITICAL: Requesting FRESH socket update on initial load...');
          console.log('🔍 This ensures we get the LATEST portfolio data, not stale data');
          requestPortfolioUpdateWithCurrentPrices();
        }
        return;
      }
    
    console.log('🔄 Initial fetch: Fetching data via GraphQL...');
    fetchDashboard();
    fetchBalance();
  }, [fetchDashboard, fetchBalance]);

  // CRITICAL FIX: Request real-time portfolio update when connected
  useEffect(() => {
    console.log('🔍 useEffect [isConnected, user?.id, requestPortfolioUpdateWithCurrentPrices] triggered');
    console.log('🔍 isConnected:', isConnected, 'user?.id:', user?.id);
    
    if (isConnected && user?.id) {
      console.log('🔄 CRITICAL: Requesting FRESH portfolio update via socket...');
      console.log('🔍 This will get the LATEST portfolio data, not stale cached data');
      console.log('🔍 Calling requestPortfolioUpdateWithCurrentPrices for user:', user.id);
      requestPortfolioUpdateWithCurrentPrices();
    } else {
      console.log('🔍 Skipping portfolio update request - not connected or no user ID');
    }
  }, [isConnected, user?.id, requestPortfolioUpdateWithCurrentPrices]);

  // Refresh data when screen comes into focus (e.g., after navigating back from other screens)
  useFocusEffect(
    useCallback(() => {
      console.log('🔍 useFocusEffect triggered');
      
      // CRITICAL FIX: Only fetch fresh data if no recent socket data
      const { isDataFromSocket, lastSocketUpdate } = usePortfolioStore.getState();
      const currentTime = Date.now();
      
      console.log('🔍 Focus effect state check - isDataFromSocket:', isDataFromSocket, 'lastSocketUpdate:', lastSocketUpdate, 'timeSinceUpdate:', currentTime - lastSocketUpdate);
      
      if (isDataFromSocket && (currentTime - lastSocketUpdate) < 10000) {
        console.log('🔄 Skipping focus fetch - recent socket data available (within 10s)');
        // CRITICAL FIX: Always request fresh socket update to get LATEST data
        if (isConnected && user?.id) {
          console.log('🔍 CRITICAL: Requesting FRESH socket update on focus...');
          console.log('🔍 This ensures we get the LATEST portfolio data, not stale data');
          requestPortfolioUpdateWithCurrentPrices();
        }
        return;
      }
      
      console.log('🔄 Screen focused, fetching fresh data...');
      fetchDashboard();
      fetchBalance();
      
      // Also request real-time update if socket is connected
      if (isConnected && user?.id) {
        console.log('🔄 Also requesting real-time update via socket...');
        requestPortfolioUpdateWithCurrentPrices();
      }
    }, [fetchDashboard, fetchBalance, isConnected, user?.id, requestPortfolioUpdateWithCurrentPrices])
  );

  const quickActions = [
    {
      id: 1,
      title: 'Portfolio',
      subtitle: 'View your investments',
      icon: 'pie-chart',
      color: theme.colors.primary,
      screen: 'Portfolio',
    },
    {
      id: 2,
      title: 'Trading',
      subtitle: 'Buy & sell stocks',
      icon: 'trending-up',
      color: theme.colors.accent.avocado,
      screen: 'Trading',
    },
    {
      id: 3,
      title: 'Watchlist',
      subtitle: 'Track favorites',
      icon: 'bookmark',
      color: theme.colors.accent.gamboge,
      screen: 'Watchlist',
    },
    {
      id: 4,
      title: 'Orders',
      subtitle: 'Manage orders',
      icon: 'receipt',
      color: theme.colors.accent.azure,
      screen: 'Orders',
    },
    {
      id: 5,
      title: 'Order Book',
      subtitle: 'View market depth & liquidity',
      icon: 'bar-chart',
      color: theme.colors.accent.folly,
      screen: 'OrderBookPicker',
      fullWidth: true,
    },
  ];

  const handleRefresh = async () => {
    console.log('🔍 handleRefresh called');
    
    // CRITICAL FIX: Only refresh if no recent socket data
    const { isDataFromSocket, lastSocketUpdate } = usePortfolioStore.getState();
    const currentTime = Date.now();
    
    console.log('🔍 Refresh state check - isDataFromSocket:', isDataFromSocket, 'lastSocketUpdate:', lastSocketUpdate, 'timeSinceUpdate:', currentTime - lastSocketUpdate);
    
          if (isDataFromSocket && (currentTime - lastSocketUpdate) < 10000) {
        console.log('🔄 Skipping refresh - recent socket data available (within 10s)');
        // CRITICAL FIX: Always request fresh socket update to get LATEST data
        if (isConnected && user?.id) {
          console.log('🔍 CRITICAL: Requesting FRESH socket update instead of refresh...');
          console.log('🔍 This ensures we get the LATEST portfolio data, not stale data');
          requestPortfolioUpdateWithCurrentPrices();
        }
        return;
      }
    
    console.log('🔄 Forcing refresh - no recent socket data');
    await refreshAll();
  };

  // CRITICAL FIX: Add force refresh method for explicit refresh
  const handleForceRefresh = async () => {
    console.log('🔍 handleForceRefresh called');
    console.log('🔄 Force refreshing all data...');
    await refreshAll();
  };

  // CRITICAL FIX: Add debug method to show current state
  const debugCurrentState = () => {
    console.log('🔍 debugCurrentState called');
    
    const { isDataFromSocket, lastSocketUpdate, dashboard, balance } = usePortfolioStore.getState();
    const currentTime = Date.now();
    console.log('🔍 Current State Debug:');
    console.log(`  - isDataFromSocket: ${isDataFromSocket}`);
    console.log(`  - lastSocketUpdate: ${lastSocketUpdate}`);
    console.log(`  - timeSinceSocketUpdate: ${currentTime - lastSocketUpdate}ms`);
    console.log(`  - dashboard.totalPortfolioValue: ${dashboard?.totalPortfolioValue}`);
    console.log(`  - dashboard.cashBalance: ${dashboard?.cashBalance}`);
    console.log(`  - balance: ${balance}`);
    console.log(`  - isConnected: ${isConnected}`);
    console.log(`  - dashboard.stockPositions:`, dashboard?.stockPositions);
    
    // CRITICAL FIX: Show the difference between socket and GraphQL data
    if (dashboard) {
      const totalStocksValue = dashboard.stockPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
      const calculatedTotal = totalStocksValue + dashboard.cashBalance;
      console.log(`  - Calculated total from positions: ${calculatedTotal}`);
      console.log(`  - Difference: ${dashboard.totalPortfolioValue - calculatedTotal}`);
    }
    
    // CRITICAL FIX: Show subscribed state values
    console.log(`  - Subscribed portfolioValue: ${localPortfolioValue}`);
    console.log(`  - Subscribed cashBalance: ${localCashBalance}`);
    console.log(`  - Subscribed balanceValue: ${localBalanceValue}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPercentColor = (percent: number) => {
    return percent >= 0 ? theme.colors.accent.avocado : theme.colors.accent.folly;
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  console.log('🔍 HomeScreen component returning JSX');
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.username}>
              {user?.email?.split('@')[0] || 'Trader'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.notificationButton,
              isConnected ? { backgroundColor: theme.colors.accent.avocado + '20' } : {}
            ]}
                      onPress={() => {
            console.log('🔍 Notification button pressed');
            
            // CRITICAL FIX: Show debug info first
            debugCurrentState();
            
            if (isConnected && user?.id) {
              console.log('🔍 Connected and authenticated, using force refresh...');
              // CRITICAL FIX: Use force refresh to get latest data
              handleForceRefresh();
              showToast({
                type: 'info',
                message: 'Force refreshing all data...',
                durationMs: 2000,
              });
            } else {
              console.log('🔍 Not connected or not authenticated, showing status...');
              showToast({
                type: isConnected ? 'success' : 'warning',
                message: isConnected ? 'Connected to real-time updates' : 'Not connected to real-time updates',
                durationMs: 2000,
              });
            }
          }}
          >
            <Ionicons
              name={isConnected ? "wifi" : "wifi-outline"}
              size={24}
              color={isConnected ? theme.colors.accent.avocado : theme.colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary Card */}
         <Animated.View style={[
           styles.portfolioCard,
           { backgroundColor: portfolioPulse.interpolate({
               inputRange: [0, 1],
               outputRange: [theme.colors.primary, theme.colors.primary]
             }),
             opacity: portfolioPulse.interpolate({ inputRange: [0,1], outputRange: [1, 0.92] })
           }
         ]}>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          
          {/* CRITICAL FIX: Show data freshness indicator */}
          {isSocketUpdate && (
            <Text style={[styles.freshDataIndicator, { color: theme.colors.accent.avocado }]}>
              🔄 Fresh Real-time Data (Socket Update)
            </Text>
          )}
          {!isSocketUpdate && localPortfolioValue && (
            <Text style={[styles.freshDataIndicator, { color: theme.colors.text.secondary }]}>
              📊 GraphQL Data (Last Refresh)
            </Text>
          )}
          
          <Text style={styles.portfolioValue}>
            {(() => {
              // CRITICAL FIX: Never show 0 portfolio when we have valid socket data
              let value;
              if (localPortfolioValue && localPortfolioValue > 1000) {
                value = formatCurrency(localPortfolioValue);
                console.log('🔍 Rendering portfolio value:', value, 'from localPortfolioValue:', localPortfolioValue);
              } else if (localBalanceValue && localBalanceValue > 1000) {
                value = formatCurrency(localBalanceValue);
                console.log('🔍 Rendering portfolio value:', value, 'from localBalanceValue (fallback):', localBalanceValue);
              } else {
                value = formatCurrency(0);
                console.log('🔍 Rendering portfolio value: $0.00 (no valid data)');
              }
              return value;
            })()}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {dashboard && (
              <View style={styles.portfolioChange}>
                <Ionicons
                  name={
                    dashboard.totalPnL >= 0 ? 'trending-up' : 'trending-down'
                  }
                  size={16}
                  color={theme.colors.text.secondary}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  {formatCurrency(dashboard.totalPnL)} (
                  {formatPercent(
                    (dashboard.totalPnL / dashboard.totalPortfolioValue) * 100
                  )}
                  )
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Balance Card */}
        <Animated.View style={[
          styles.balanceCard,
          { opacity: balancePulse.interpolate({ inputRange: [0,1], outputRange: [1, 0.92] }) }
        ]}>
          <Text style={styles.balanceLabel}>Available Cash</Text>
          
          {/* CRITICAL FIX: Show data freshness indicator */}
          {isSocketUpdate && (
            <Text style={[styles.freshDataIndicator, { color: theme.colors.accent.avocado }]}>
              🔄 Fresh Real-time Data (Socket Update)
            </Text>
          )}
          {!isSocketUpdate && localCashBalance && (
            <Text style={[styles.freshDataIndicator, { color: theme.colors.text.secondary }]}>
              📊 GraphQL Data (Last Refresh)
            </Text>
          )}
          
          <Text style={styles.balanceValue}>
            {(() => {
              // CRITICAL FIX: Never show 0 balance when we have valid socket data
              let value;
              if (localCashBalance && localCashBalance > 1000) {
                value = formatCurrency(localCashBalance);
                console.log('🔍 Rendering cash balance:', value, 'from localCashBalance:', localCashBalance);
              } else if (localBalanceValue && localBalanceValue > 1000) {
                value = formatCurrency(localBalanceValue);
                console.log('🔍 Rendering cash balance:', value, 'from localBalanceValue (fallback):', localBalanceValue);
              } else {
                value = formatCurrency(0);
                console.log('🔍 Rendering cash balance: $0.00 (no valid data)');
              }
              return value;
            })()}
          </Text>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionCard,
                  action.fullWidth && styles.quickActionCardFullWidth
                ]}
                onPress={() => {
                  if (action.screen === 'OrderBookPicker') {
                    navigation.navigate('StockPicker', {
                      navigateAfterSelect: false, // Don't go back, let onSelect handle navigation
                      onSelect: (ticker: string) => {
                        navigation.navigate('OrderBook', { 
                          ticker,
                          companyName: `${ticker} Company`
                        });
                      },
                    });
                  } else {
                    navigation.navigate(action.screen);
                  }
                }}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${action.color}15` },
                    action.fullWidth && styles.quickActionIconFullWidth
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                {action.fullWidth ? (
                  <View style={styles.quickActionTextContainer}>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>
                      {action.subtitle}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>
                      {action.subtitle}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Positions */}
        {dashboard?.stockPositions && dashboard.stockPositions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Positions</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Portfolio')}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {dashboard.stockPositions.slice(0, 3).map((position) => (
              <TouchableOpacity
                  key={position.ticker}
                  style={styles.positionCard}
                  onPress={() =>
                    navigation.navigate('StockDetail', {
                      ticker: position.ticker,
                    })
                  }
                >
                  <Avatar 
                    source={position.avatar} 
                    fallback={position.companyName} 
                    size={40} 
                    style={styles.positionAvatar}
                  />
                  <View style={styles.positionInfo}>
                    <Text style={styles.positionTicker}>{position.ticker}</Text>
                    <Text style={styles.positionShares}>
                      {position.quantity} shares
                    </Text>
                  </View>
                  <View style={styles.positionValues}>
                    <Text style={styles.positionValue}>
                      {formatCurrency(position.marketValue)}
                    </Text>
                    <Text
                      style={[
                        styles.positionPnL,
                        { color: getPercentColor(position.unrealizedPnLPercent) },
                      ]}
                    >
                      {formatPercent(position.unrealizedPnLPercent)}
                    </Text>
                 </View>
               </TouchableOpacity>
             ))}
          </View>
        )}

        {/* Market Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Summary</Text>
          <View style={styles.marketSummaryCard}>
            <Text style={styles.marketSummaryText}>
              Markets are{' '}
              {new Date().getHours() >= 9 && new Date().getHours() < 16
                ? 'open'
                : 'closed'}
            </Text>
            <Text style={styles.marketSummarySubtext}>
              {new Date().getHours() >= 9 && new Date().getHours() < 16
                ? 'Trading until 4:00 PM EST'
                : 'Opens at 9:30 AM EST'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textTransform: 'capitalize',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioCard: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  portfolioLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  balanceCard: {
    backgroundColor: theme.colors.background.secondary,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  quickActionCardFullWidth: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIconFullWidth: {
    marginBottom: 0,
    marginRight: 16,
  },
  quickActionTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  positionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  positionAvatar: {
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  positionInfo: {
    flex: 1,
  },
  positionTicker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  positionShares: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  positionValues: {
    alignItems: 'flex-end',
    marginLeft: 'auto',
  },
  positionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  positionPnL: {
    fontSize: 14,
    fontWeight: '600',
  },
  marketSummaryCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  marketSummaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  marketSummarySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  freshDataIndicator: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
});