import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { theme } from '../theme';
import { MY_TRANSACTIONS } from '../apollo/queries';
import { Transaction } from '../apollo/types';

interface TransactionsScreenProps {
  navigation: any;
}

export default function TransactionsScreen({ navigation }: TransactionsScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  
  const { data, loading, refetch } = useQuery<{myTransactions: Transaction[]}>(MY_TRANSACTIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const transactions = data?.myTransactions || [];

  const filteredTransactions = selectedFilter === 'ALL' 
    ? transactions 
    : transactions.filter(transaction => transaction.action === selectedFilter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    return action === 'BUY' ? theme.colors.accent.avocado : theme.colors.accent.folly;
  };

  const getActionIcon = (action: string) => {
    return action === 'BUY' ? 'arrow-down' : 'arrow-up';
  };

  const filters = ['ALL', 'BUY', 'SELL'];

  // Calculate totals for summary
  const totalBuyValue = transactions
    .filter(t => t.action === 'BUY')
    .reduce((sum, t) => sum + (t.shares * t.price), 0);
  
  const totalSellValue = transactions
    .filter(t => t.action === 'SELL')
    .reduce((sum, t) => sum + (t.shares * t.price), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Bought</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.accent.avocado }]}>
            {formatCurrency(totalBuyValue)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Sold</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.accent.folly }]}>
            {formatCurrency(totalSellValue)}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(filter as any)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.activeFilterText,
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              {/* Transaction Header */}
              <View style={styles.transactionHeader}>
                <View style={styles.transactionIcon}>
                  <Ionicons 
                    name={getActionIcon(transaction.action)} 
                    size={20} 
                    color={getActionColor(transaction.action)} 
                  />
                </View>
                
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTicker}>{transaction.ticker}</Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.timestamp)}
                  </Text>
                </View>
                
                <View style={styles.transactionBadge}>
                  <View style={[
                    styles.actionBadge, 
                    { backgroundColor: getActionColor(transaction.action) }
                  ]}>
                    <Text style={styles.actionBadgeText}>{transaction.action}</Text>
                  </View>
                </View>
              </View>

              {/* Transaction Details */}
              <View style={styles.transactionDetails}>
                <View style={styles.transactionDetailRow}>
                  <Text style={styles.transactionDetailLabel}>Shares</Text>
                  <Text style={styles.transactionDetailValue}>
                    {transaction.shares.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.transactionDetailRow}>
                  <Text style={styles.transactionDetailLabel}>Price per Share</Text>
                  <Text style={styles.transactionDetailValue}>
                    {formatCurrency(transaction.price)}
                  </Text>
                </View>
                
                <View style={[styles.transactionDetailRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Value</Text>
                  <Text style={[
                    styles.totalValue,
                    { color: getActionColor(transaction.action) }
                  ]}>
                    {formatCurrency(transaction.shares * transaction.price)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={theme.colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>
              {selectedFilter === 'ALL' ? 'No Transactions Yet' : `No ${selectedFilter} Transactions`}
            </Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'ALL' 
                ? 'Your transaction history will appear here'
                : `You don't have any ${selectedFilter.toLowerCase()} transactions`
              }
            </Text>
            {selectedFilter === 'ALL' && (
              <TouchableOpacity 
                style={styles.startTradingButton}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Trading' })}
              >
                <Text style={styles.startTradingButtonText}>Start Trading</Text>
              </TouchableOpacity>
            )}
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
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: theme.colors.background.secondary,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  activeFilterText: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  transactionCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTicker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  transactionBadge: {
    alignItems: 'flex-end',
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
    paddingTop: 12,
  },
  transactionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDetailLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  transactionDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
