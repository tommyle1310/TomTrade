import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { usePortfolioStore } from '../stores';
import { Transaction } from '../apollo/types';
import Avatar from '../components/Avatar';

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

  const [activeTab, setActiveTab] = useState<'Overview' | 'Positions' | 'Transactions'>('Overview');

  const isLoading = dashboardLoading || portfolioLoading || transactionsLoading;

  const totalPositions = dashboard?.stockPositions?.length || 0;
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions]);

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
    return percent >= 0 ? theme.colors.accent.avocado : theme.colors.accent.folly;
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

      {/* Top Tabs */}
      <View style={styles.tabsContainer}>
        {(['Overview', 'Positions', 'Transactions'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Overview */}
        {activeTab === 'Overview' && (
          <>
            {dashboard && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryMain}>
                  <Text style={styles.summaryMainLabel}>Holding value</Text>
                  <Text style={styles.summaryMainValue}>{formatCurrency(dashboard.totalPortfolioValue)}</Text>
                </View>
                
                <View style={styles.summaryBottom}>
                  <View style={styles.summaryBottomItem}>
                    <Text style={styles.summaryBottomLabel}>Cash Balance</Text>
                    <Text style={styles.summaryBottomValue}>{formatCurrency(dashboard.cashBalance)}</Text>
                  </View>
                  <View style={styles.summaryBottomItem}>
                    <Text style={styles.summaryBottomLabel}>Total P&L</Text>
                    <Text style={[styles.summaryBottomValue, { color: getPercentColor(dashboard.totalPnL) }]}>{formatCurrency(dashboard.totalPnL)}</Text>
                  </View>
                  <View style={styles.summaryBottomItem}>
                    <Text style={styles.summaryBottomLabel}>Unrealized P&L</Text>
                    <Text style={[styles.summaryBottomValue, { color: getPercentColor(dashboard.totalUnrealizedPnL) }]}>{formatCurrency(dashboard.totalUnrealizedPnL)}</Text>
                  </View>
                  <View style={styles.summaryBottomItem}>
                    <Text style={styles.summaryBottomLabel}>Realized P&L</Text>
                    <Text style={[styles.summaryBottomValue, { color: getPercentColor(dashboard.totalRealizedPnL || 0) }]}>{formatCurrency(dashboard.totalRealizedPnL || 0)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Highlight positions */}
            {dashboard?.stockPositions?.length ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Positions ({totalPositions})</Text>
                  <TouchableOpacity onPress={() => setActiveTab('Positions')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                {dashboard.stockPositions.slice(0, 5).map((position) => renderPositionCard(position))}
              </View>
            ) : null}

            {/* Recent Transactions */}
            {sortedTransactions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Transactions</Text>
                  <TouchableOpacity onPress={() => setActiveTab('Transactions')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                {sortedTransactions.slice(0, 5).map((transaction) => renderTransactionRow(transaction))}
              </View>
            )}
          </>
        )}

        {/* Positions Tab */}
        {activeTab === 'Positions' && dashboard?.stockPositions?.length ? (
          <View style={styles.section}>
            {dashboard.stockPositions.map((position) => renderPositionCard(position))}
          </View>
        ) : null}

        {/* Transactions Tab */}
        {activeTab === 'Transactions' && sortedTransactions.length > 0 ? (
          <View style={styles.section}>
            {sortedTransactions.map((t) => renderTransactionRow(t))}
          </View>
        ) : null}

        {/* Empty State */}
        {!isLoading && (!dashboard?.stockPositions || dashboard.stockPositions.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="pie-chart-outline" size={64} color={theme.colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>No Positions Yet</Text>
            <Text style={styles.emptyStateText}>Start trading to build your portfolio</Text>
            <TouchableOpacity style={styles.startTradingButton} onPress={() => navigation.navigate('Trading')}>
              <Text style={styles.startTradingButtonText}>Start Trading</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function renderPositionCard(position: any) {
  return (
    <TouchableOpacity
      key={position.ticker}
      style={styles.positionCard}
    >
      <View style={styles.positionHeader}>
        <Avatar
          source={position.avatar}
          fallback={position.companyName}
          size={40}
          style={styles.positionAvatar}
        />
        <View style={styles.positionInfo}>
          <Text style={styles.positionTicker}>{position.ticker}</Text>
          <Text style={styles.positionCompany}>{position.companyName}</Text>
        </View>
        <View style={styles.positionValues}>
          <Text style={styles.positionPrice}>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(position.currentPrice)}</Text>
          <Text style={[styles.positionPnL, { color: position.unrealizedPnLPercent >= 0 ? theme.colors.accent.avocado : theme.colors.accent.folly }]}>
            {`${position.unrealizedPnLPercent >= 0 ? '+' : ''}${position.unrealizedPnLPercent.toFixed(2)}%`}
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
          <Text style={styles.positionDetailValue}>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(position.averageBuyPrice)}</Text>
        </View>
        <View style={styles.positionDetailItem}>
          <Text style={styles.positionDetailLabel}>Market Value</Text>
          <Text style={styles.positionDetailValue}>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(position.marketValue)}</Text>
        </View>
        <View style={styles.positionDetailItem}>
          <Text style={styles.positionDetailLabel}>P&L</Text>
          <Text style={[styles.positionDetailValue, { color: position.unrealizedPnL >= 0 ? theme.colors.accent.avocado : theme.colors.accent.folly }]}>
            {new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(position.unrealizedPnL)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function renderTransactionRow(transaction: Transaction) {
  return (
    <View key={transaction.id} style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={transaction.action === 'BUY' ? 'arrow-down' : 'arrow-up'}
          size={16}
          color={transaction.action === 'BUY' ? theme.colors.accent.avocado : theme.colors.accent.folly}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionAction}>{transaction.action} {transaction.ticker}</Text>
        <Text style={styles.transactionDate}>{new Date(transaction.timestamp).toLocaleDateString()}</Text>
      </View>
      <View style={styles.transactionValues}>
        <Text style={styles.transactionShares}>{transaction.shares} shares</Text>
        <Text style={styles.transactionPrice}>{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(transaction.price)}</Text>
      </View>
    </View>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
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
  summaryMain: {
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryMainLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryMainValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  summaryBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  summaryBottomItem: {
    width: '44%',
    alignItems: 'center',
  },
  summaryBottomLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryBottomValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryGridItem: {
    flexBasis: '48%',
    backgroundColor: theme.colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    padding: 12,
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
    marginBottom: 12,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  positionAvatar: {
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  positionInfo: {
    flex: 1,
  },
  positionValues: {
    alignItems: 'flex-end',
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