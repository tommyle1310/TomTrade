import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuthStore, usePortfolioStore } from '../stores';
import { DashboardResult } from '../apollo/types';

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
    refreshAll 
  } = usePortfolioStore();

  const isLoading = dashboardLoading;

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboard();
    fetchBalance();
  }, [fetchDashboard, fetchBalance]);

  const quickActions = [
    { 
      id: 1, 
      title: 'Portfolio', 
      subtitle: 'View your investments', 
      icon: 'pie-chart', 
      color: theme.colors.primary,
      screen: 'Portfolio'
    },
    { 
      id: 2, 
      title: 'Trading', 
      subtitle: 'Buy & sell stocks', 
      icon: 'trending-up', 
      color: theme.colors.success,
      screen: 'Trading'
    },
    { 
      id: 3, 
      title: 'Watchlist', 
      subtitle: 'Track favorites', 
      icon: 'bookmark', 
      color: theme.colors.info,
      screen: 'Watchlist'
    },
    { 
      id: 4, 
      title: 'Orders', 
      subtitle: 'Manage orders', 
      icon: 'receipt', 
      color: theme.colors.warning,
      screen: 'Orders'
    },
  ];

  const handleRefresh = () => {
    refreshAll();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPercentColor = (percent: number) => {
    return percent >= 0 ? theme.colors.success : theme.colors.error;
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
            <Text style={styles.username}>{user?.email?.split('@')[0] || 'Trader'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary Card */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>
            {dashboard ? formatCurrency(dashboard.totalPortfolioValue) : formatCurrency(balance)}
          </Text>
          {dashboard && (
            <View style={styles.portfolioChange}>
              <Ionicons 
                name={dashboard.totalPnL >= 0 ? "trending-up" : "trending-down"} 
                size={16} 
                color={getPercentColor(dashboard.totalPnL)} 
              />
              <Text style={[styles.changeText, { color: getPercentColor(dashboard.totalPnL) }]}>
                {formatCurrency(dashboard.totalPnL)} ({formatPercent(dashboard.totalPnL / dashboard.totalPortfolioValue * 100)})
              </Text>
            </View>
          )}
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Cash</Text>
          <Text style={styles.balanceValue}>
            {dashboard ? formatCurrency(dashboard.cashBalance) : formatCurrency(balance)}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={styles.quickActionCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Positions */}
        {dashboard?.stockPositions && dashboard.stockPositions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Positions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Portfolio')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {dashboard.stockPositions.slice(0, 3).map((position) => (
              <TouchableOpacity 
                key={position.ticker} 
                style={styles.positionCard}
                onPress={() => navigation.navigate('StockDetail', { ticker: position.ticker })}
              >
                <View style={styles.positionInfo}>
                  <Text style={styles.positionTicker}>{position.ticker}</Text>
                  <Text style={styles.positionShares}>{position.quantity} shares</Text>
                </View>
                <View style={styles.positionValues}>
                  <Text style={styles.positionValue}>{formatCurrency(position.marketValue)}</Text>
                  <Text style={[
                    styles.positionPnL,
                    { color: getPercentColor(position.unrealizedPnLPercent) }
                  ]}>
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
              Markets are {new Date().getHours() >= 9 && new Date().getHours() < 16 ? 'open' : 'closed'}
            </Text>
            <Text style={styles.marketSummarySubtext}>
              {new Date().getHours() >= 9 && new Date().getHours() < 16 
                ? 'Trading until 4:00 PM EST' 
                : 'Opens at 9:30 AM EST'
              }
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
  },
  changeText: {
    fontSize: 16,
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
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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