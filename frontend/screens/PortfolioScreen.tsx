import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { usePortfolioStore } from '../stores';
import { DashboardResult, Portfolio, Transaction } from '../apollo/types';

interface PortfolioScreenProps {
  navigation: any;
}

export default function PortfolioScreen({ navigation }: PortfolioScreenProps) {
  const { 
    dashboard, 
    portfolio, 
    transactions,
    dashboardLoading,
    portfolioLoading,
    transactionsLoading,
    fetchDashboard,
    fetchPortfolio,
    fetchTransactions,
    refreshAll
  } = usePortfolioStore();

  const isLoading = dashboardLoading || portfolioLoading || transactionsLoading;

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboard();
    fetchPortfolio();
    fetchTransactions();
  }, [fetchDashboard, fetchPortfolio, fetchTransactions]);

  const handleRefresh = () => {
    refreshAll();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getPercentColor = (percent: number) => {
    return percent >= 0 ? theme.colors.success : theme.colors.error;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Portfolio Summary */}
        {dashboard && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Portfolio Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Value</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(dashboard.totalPortfolioValue)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cash Balance</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(dashboard.cashBalance)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total P&L</Text>
              <Text style={[
                styles.summaryValue,
                { color: getPercentColor(dashboard.totalPnL) }
              ]}>
                {formatCurrency(dashboard.totalPnL)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Unrealized P&L</Text>
              <Text style={[
                styles.summaryValue,
                { color: getPercentColor(dashboard.totalUnrealizedPnL) }
              ]}>
                {formatCurrency(dashboard.totalUnrealizedPnL)}
              </Text>
            </View>
          </View>
        )}

        {/* Stock Positions */}
        {dashboard?.stockPositions && dashboard.stockPositions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Positions</Text>
            {dashboard.stockPositions.map((position, index) => (
              <TouchableOpacity 
                key={position.ticker} 
                style={styles.positionCard}
                onPress={() => navigation.navigate('StockDetail', { ticker: position.ticker })}
              >
                <View style={styles.positionHeader}>
                  <View>
                    <Text style={styles.positionTicker}>{position.ticker}</Text>
                    <Text style={styles.positionCompany}>{position.companyName}</Text>
                  </View>
                  <View style={styles.positionValues}>
                    <Text style={styles.positionPrice}>
                      {formatCurrency(position.currentPrice)}
                    </Text>
                    <Text style={[
                      styles.positionPnL,
                      { color: getPercentColor(position.unrealizedPnLPercent) }
                    ]}>
                      {formatPercent(position.unrealizedPnLPercent)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.positionDetails}>
                  <View style={styles.positionDetailItem}>
                    <Text style={styles.positionDetailLabel}>Shares</Text>
                    <Text style={styles.positionDetailValue}>{position.quantity}</Text>
                  </View>
                  <View style={styles.positionDetailItem}>
                    <Text style={styles.positionDetailLabel}>Avg Cost</Text>
                    <Text style={styles.positionDetailValue}>
                      {formatCurrency(position.averageBuyPrice)}
                    </Text>
                  </View>
                  <View style={styles.positionDetailItem}>
                    <Text style={styles.positionDetailLabel}>Market Value</Text>
                    <Text style={styles.positionDetailValue}>
                      {formatCurrency(position.marketValue)}
                    </Text>
                  </View>
                  <View style={styles.positionDetailItem}>
                    <Text style={styles.positionDetailLabel}>P&L</Text>
                    <Text style={[
                      styles.positionDetailValue,
                      { color: getPercentColor(position.unrealizedPnL) }
                    ]}>
                      {formatCurrency(position.unrealizedPnL)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {transactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionIcon}>
                  <Ionicons 
                    name={transaction.action === 'BUY' ? 'arrow-down' : 'arrow-up'} 
                    size={16} 
                    color={transaction.action === 'BUY' ? theme.colors.success : theme.colors.error} 
                  />
                </View>
                
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionAction}>
                    {transaction.action} {transaction.ticker}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.transactionValues}>
                  <Text style={styles.transactionShares}>
                    {transaction.shares} shares
                  </Text>
                  <Text style={styles.transactionPrice}>
                    {formatCurrency(transaction.price)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && (!dashboard?.stockPositions || dashboard.stockPositions.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="pie-chart-outline" size={64} color={theme.colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>No Positions Yet</Text>
            <Text style={styles.emptyStateText}>
              Start trading to build your portfolio
            </Text>
            <TouchableOpacity 
              style={styles.startTradingButton}
              onPress={() => navigation.navigate('Trading')}
            >
              <Text style={styles.startTradingButtonText}>Start Trading</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  positionCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  positionTicker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  positionCompany: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  positionValues: {
    alignItems: 'flex-end',
  },
  positionPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  positionPnL: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionDetailItem: {
    alignItems: 'center',
  },
  positionDetailLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  positionDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionAction: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  transactionValues: {
    alignItems: 'flex-end',
  },
  transactionShares: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  transactionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  startTradingButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  startTradingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});