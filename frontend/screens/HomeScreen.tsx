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
    console.log('📊 HomeScreen: Current dashboard before update:', dashboard);
    
    // CRITICAL FIX: Create dashboard object even if it doesn't exist
    const updatedDashboard = {
      totalPortfolioValue: data.totalValue,
      totalPnL: data.totalPnL,
      cashBalance: dashboard?.cashBalance || 0, // Preserve cash balance if available
      stockPositions: data.positions.map(pos => ({
        ticker: pos.ticker,
        companyName: `${pos.ticker} Company`, // You might want to store this properly
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
    console.log('📊 HomeScreen: Updated dashboard after socket update:', updatedDashboard);
    setDashboard(updatedDashboard);
    
    Animated.sequence([
      Animated.timing(portfolioPulse, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(portfolioPulse, { toValue: 0, duration: 450, useNativeDriver: false }),
    ]).start();
  }, [dashboard, setDashboard]);

  const handleBalanceUpdate = useCallback((data: BalanceUpdate) => {
    console.log('💰 HomeScreen: Balance update received:', data);
    console.log('💰 HomeScreen: Current balance before update:', balance);
    console.log('💰 HomeScreen: Current dashboard before update:', dashboard);
    
    setBalance(data.balance);
    
    // CRITICAL FIX: Update dashboard cash balance even if dashboard doesn't exist
    const updatedDashboard = dashboard ? {
      ...dashboard,
      cashBalance: data.balance,
    } : {
      totalPortfolioValue: data.totalAssets,
      totalPnL: 0,
      cashBalance: data.balance,
      stockPositions: [],
      totalRealizedPnL: 0,
      totalUnrealizedPnL: 0,
    };
    console.log('💰 HomeScreen: Updated dashboard after balance update:', updatedDashboard);
    setDashboard(updatedDashboard);
    
    Animated.sequence([
      Animated.timing(balancePulse, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(balancePulse, { toValue: 0, duration: 450, useNativeDriver: false }),
    ]).start();
  }, [dashboard, setBalance, setDashboard]);

  const handleConnectionTest = useCallback((data: any) => {
    console.log('✅ HomeScreen: Socket connection test successful:', data);
    setSocketConnected(true);
  }, []);

  // Initialize socket connection
  const { isConnected, connectionStatus, requestPortfolioUpdate } = useSocket({
    onPriceAlert: handlePriceAlert,
    onOrderNotification: handleOrderNotification,
    onPortfolioUpdate: handlePortfolioUpdate,
    onBalanceUpdate: handleBalanceUpdate,
    onConnectionTest: handleConnectionTest,
    autoConnect: true,
  });

  // CRITICAL FIX: Update socket connected state when connection status changes
  useEffect(() => {
    setSocketConnected(isConnected);
    console.log(`🔍 HomeScreen: Socket connection status changed to: ${connectionStatus}`);
  }, [isConnected, connectionStatus]);

  // Fetch data on component mount
  useEffect(() => {
    // CRITICAL FIX: Always fetch initial data, but prioritize socket updates
    console.log('🔄 Initial fetch: Fetching data via GraphQL...');
    fetchDashboard();
    fetchBalance();
  }, [fetchDashboard, fetchBalance]);

  // Request real-time portfolio update when connected
  useEffect(() => {
    if (isConnected && user?.id) {
      console.log('🔄 Requesting portfolio update via socket...');
      requestPortfolioUpdate();
    }
  }, [isConnected, user?.id, requestPortfolioUpdate]);

  // Refresh data when screen comes into focus (e.g., after navigating back from other screens)
  useFocusEffect(
    useCallback(() => {
      // CRITICAL FIX: Always fetch fresh data on focus, but socket updates will override if more recent
      console.log('🔄 Screen focused, fetching fresh data...');
      fetchDashboard();
      fetchBalance();
      
      // Also request real-time update if socket is connected
      if (isConnected && user?.id) {
        console.log('🔄 Also requesting real-time update via socket...');
        requestPortfolioUpdate();
      }
    }, [fetchDashboard, fetchBalance, isConnected, user?.id, requestPortfolioUpdate])
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
    await refreshAll();
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
              isConnected && { backgroundColor: theme.colors.accent.avocado + '20' }
            ]}
            onPress={() => {
              if (isConnected && user?.id) {
                requestPortfolioUpdate();
                showToast({
                  type: 'info',
                  message: 'Requesting real-time portfolio update...',
                  durationMs: 2000,
                });
              } else {
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
          <Text style={styles.portfolioValue}>
            {dashboard
              ? formatCurrency(dashboard.totalPortfolioValue)
              : formatCurrency(balance)}
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
          <Text style={styles.balanceValue}>
            {dashboard
              ? formatCurrency(dashboard.cashBalance)
              : formatCurrency(balance)}
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
});
