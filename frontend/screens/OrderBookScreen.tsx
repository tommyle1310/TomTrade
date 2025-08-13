import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { theme } from '../theme';
import { GET_ORDER_BOOK } from '../apollo/queries';
import { useToast } from '../components/Toast';

interface OrderBookScreenProps {
  navigation: any;
  route: {
    params: {
      ticker: string;
      companyName?: string;
    };
  };
}

interface Order {
  id: string;
  price: number;
  quantity: number;
  createdAt: string;
  side: 'BUY' | 'SELL';
  status: string;
  type: string;
  timeInForce: string;
}

interface OrderBookData {
  orderBook: {
    buyOrders: Order[];
    sellOrders: Order[];
  };
}

export default function OrderBookScreen({ navigation, route }: OrderBookScreenProps) {
  const { ticker, companyName } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  
  const { showToast } = useToast();

  const { data, loading, refetch, error } = useQuery<OrderBookData>(GET_ORDER_BOOK, {
    variables: { ticker },
    pollInterval: 5000, // Refresh every 5 seconds
    fetchPolicy: 'cache-and-network',
  });

  const orderBook = data?.orderBook;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to refresh order book',
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Aggregate orders by price level for depth chart
  const aggregateOrders = (orders: Order[]) => {
    const priceMap = new Map<number, { price: number; totalQuantity: number; orderCount: number }>();
    
    orders.forEach(order => {
      const existing = priceMap.get(order.price);
      if (existing) {
        existing.totalQuantity += order.quantity;
        existing.orderCount += 1;
      } else {
        priceMap.set(order.price, {
          price: order.price,
          totalQuantity: order.quantity,
          orderCount: 1,
        });
      }
    });

    return Array.from(priceMap.values()).sort((a, b) => b.price - a.price);
  };

  const aggregatedBuyOrders = orderBook ? aggregateOrders(orderBook.buyOrders) : [];
  const aggregatedSellOrders = orderBook ? aggregateOrders(orderBook.sellOrders) : [];

  // Calculate spread
  const bestBid = aggregatedBuyOrders[0]?.price || 0;
  const bestAsk = aggregatedSellOrders[aggregatedSellOrders.length - 1]?.price || 0;
  const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;
  const spreadPercent = bestBid ? (spread / bestBid) * 100 : 0;

  const navigateToTrading = (side: 'BUY' | 'SELL', price?: number) => {
    navigation.navigate('MainTabs', {
      screen: 'Trading',
      params: {
        prefilledData: {
          ticker,
          side,
          price: price?.toString(),
        },
      },
    });
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Book</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.accent.folly} />
          <Text style={styles.errorTitle}>Failed to Load Order Book</Text>
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{ticker}</Text>
          {companyName && <Text style={styles.headerSubtitle}>{companyName}</Text>}
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Market Info */}
      <View style={styles.marketInfo}>
        <View style={styles.marketInfoCard}>
          <Text style={styles.marketInfoLabel}>Best Bid</Text>
          <Text style={[styles.marketInfoValue, { color: theme.colors.accent.avocado }]}>
            {bestBid ? formatCurrency(bestBid) : '--'}
          </Text>
        </View>
        <View style={styles.marketInfoCard}>
          <Text style={styles.marketInfoLabel}>Spread</Text>
          <Text style={styles.marketInfoValue}>
            {spread ? `${formatCurrency(spread)} (${spreadPercent.toFixed(2)}%)` : '--'}
          </Text>
        </View>
        <View style={styles.marketInfoCard}>
          <Text style={styles.marketInfoLabel}>Best Ask</Text>
          <Text style={[styles.marketInfoValue, { color: theme.colors.accent.folly }]}>
            {bestAsk ? formatCurrency(bestAsk) : '--'}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />
        }
      >
        {/* Depth Chart */}
        <View style={styles.depthChartContainer}>
          <Text style={styles.depthChartTitle}>Depth Chart</Text>
          <View style={styles.depthChart}>
            {/* Sell Orders (Red) - Top */}
            <View style={styles.sellDepthSection}>
              {aggregatedSellOrders.slice().reverse().map((order, index) => {
                const maxQuantity = Math.max(
                  ...aggregatedBuyOrders.map(o => o.totalQuantity),
                  ...aggregatedSellOrders.map(o => o.totalQuantity)
                );
                const widthPercent = (order.totalQuantity / maxQuantity) * 100;
                
                return (
                  <TouchableOpacity
                    key={`depth-sell-${order.price}`}
                    style={styles.depthRow}
                    onPress={() => navigateToTrading('BUY', order.price)}
                  >
                    <View style={styles.depthRowContent}>
                      <Text style={[styles.depthPrice, { color: theme.colors.accent.folly }]}>
                        {formatCurrency(order.price)}
                      </Text>
                      <Text style={styles.depthQuantity}>
                        {order.totalQuantity.toLocaleString()}
                      </Text>
                    </View>
                    <View 
                      style={[
                        styles.depthBar, 
                        styles.sellDepthBar,
                        { width: `${widthPercent}%` }
                      ]} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Spread Line */}
            {spread > 0 && (
              <View style={styles.depthSpreadLine}>
                <Text style={styles.depthSpreadText}>
                  Spread: {formatCurrency(spread)}
                </Text>
              </View>
            )}

            {/* Buy Orders (Green) - Bottom */}
            <View style={styles.buyDepthSection}>
              {aggregatedBuyOrders.map((order, index) => {
                const maxQuantity = Math.max(
                  ...aggregatedBuyOrders.map(o => o.totalQuantity),
                  ...aggregatedSellOrders.map(o => o.totalQuantity)
                );
                const widthPercent = (order.totalQuantity / maxQuantity) * 100;
                
                return (
                  <TouchableOpacity
                    key={`depth-buy-${order.price}`}
                    style={styles.depthRow}
                    onPress={() => navigateToTrading('SELL', order.price)}
                  >
                    <View style={styles.depthRowContent}>
                      <Text style={[styles.depthPrice, { color: theme.colors.accent.avocado }]}>
                        {formatCurrency(order.price)}
                      </Text>
                      <Text style={styles.depthQuantity}>
                        {order.totalQuantity.toLocaleString()}
                      </Text>
                    </View>
                    <View 
                      style={[
                        styles.depthBar, 
                        styles.buyDepthBar,
                        { width: `${widthPercent}%` }
                      ]} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Order Book Table */}
        <View style={styles.orderBookContainer}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Price</Text>
            <Text style={styles.tableHeaderText}>Quantity</Text>
            <Text style={styles.tableHeaderText}>Orders</Text>
            <Text style={styles.tableHeaderText}>Action</Text>
          </View>

          {/* SELL Orders (Asks) - Top half */}
          <View style={styles.sellOrdersSection}>
            <Text style={styles.sectionTitle}>SELL Orders (Asks)</Text>
            {aggregatedSellOrders.length > 0 ? (
              aggregatedSellOrders.slice().reverse().map((order, index) => (
                <TouchableOpacity
                  key={`sell-${order.price}`}
                  style={[styles.orderRow, styles.sellOrderRow]}
                  onPress={() => navigateToTrading('BUY', order.price)}
                >
                  <Text style={[styles.orderPrice, { color: theme.colors.accent.folly }]}>
                    {formatCurrency(order.price)}
                  </Text>
                  <Text style={styles.orderQuantity}>
                    {order.totalQuantity.toLocaleString()}
                  </Text>
                  <Text style={styles.orderCount}>
                    {order.orderCount}
                  </Text>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>BUY</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No sell orders</Text>
              </View>
            )}
          </View>

          {/* Spread Indicator */}
          {spread > 0 && (
            <View style={styles.spreadIndicator}>
              <Text style={styles.spreadText}>
                Spread: {formatCurrency(spread)} ({spreadPercent.toFixed(2)}%)
              </Text>
            </View>
          )}

          {/* BUY Orders (Bids) - Bottom half */}
          <View style={styles.buyOrdersSection}>
            <Text style={styles.sectionTitle}>BUY Orders (Bids)</Text>
            {aggregatedBuyOrders.length > 0 ? (
              aggregatedBuyOrders.map((order, index) => (
                <TouchableOpacity
                  key={`buy-${order.price}`}
                  style={[styles.orderRow, styles.buyOrderRow]}
                  onPress={() => navigateToTrading('SELL', order.price)}
                >
                  <Text style={[styles.orderPrice, { color: theme.colors.accent.avocado }]}>
                    {formatCurrency(order.price)}
                  </Text>
                  <Text style={styles.orderQuantity}>
                    {order.totalQuantity.toLocaleString()}
                  </Text>
                  <Text style={styles.orderCount}>
                    {order.orderCount}
                  </Text>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>SELL</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No buy orders</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.buyButton]}
            onPress={() => navigateToTrading('BUY')}
          >
            <Ionicons name="arrow-up" size={20} color="white" />
            <Text style={styles.quickActionText}>Place Buy Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.sellButton]}
            onPress={() => navigateToTrading('SELL')}
          >
            <Ionicons name="arrow-down" size={20} color="white" />
            <Text style={styles.quickActionText}>Place Sell Order</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  marketInfo: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  marketInfoCard: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  marketInfoLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  marketInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  orderBookContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  sellOrdersSection: {
    backgroundColor: theme.colors.background.secondary,
  },
  buyOrdersSection: {
    backgroundColor: theme.colors.background.secondary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    padding: 12,
    backgroundColor: theme.colors.background.primary,
    textAlign: 'center',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  sellOrderRow: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  buyOrderRow: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  orderPrice: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  orderQuantity: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  orderCount: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  spreadIndicator: {
    backgroundColor: theme.colors.background.primary,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  spreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buyButton: {
    backgroundColor: theme.colors.accent.avocado,
  },
  sellButton: {
    backgroundColor: theme.colors.accent.folly,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Depth Chart Styles
  depthChartContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  depthChartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  depthChart: {
    minHeight: 300,
  },
  sellDepthSection: {
    marginBottom: 8,
  },
  buyDepthSection: {
    marginTop: 8,
  },
  depthRow: {
    position: 'relative',
    marginVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  depthRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 2,
    position: 'relative',
  },
  depthPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  depthQuantity: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  depthBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    borderRadius: 4,
  },
  sellDepthBar: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  buyDepthBar: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  depthSpreadLine: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  depthSpreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
});
