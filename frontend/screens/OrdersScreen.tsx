import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@apollo/client';
import { theme } from '../theme';
import { MY_ORDERS, CANCEL_ORDER } from '../apollo/queries';
import { Order, OrderStatus } from '../apollo/types';

interface OrdersScreenProps {
  navigation: any;
}

export default function OrdersScreen({ navigation }: OrdersScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | OrderStatus>('ALL');
  
  const { data, loading, refetch } = useQuery<{myOrders: Order[]}>(MY_ORDERS);
  const [cancelOrder, { loading: cancelling }] = useMutation(CANCEL_ORDER);

  const orders = data?.myOrders || [];

  const filteredOrders = selectedFilter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder({ 
                variables: { orderId },
                refetchQueries: [{ query: MY_ORDERS }],
              });
              Alert.alert('Success', 'Order cancelled successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.OPEN:
        return theme.colors.accent.gamboge;
      case OrderStatus.FILLED:
        return theme.colors.accent.asparagus;
      case OrderStatus.CANCELLED:
        return theme.colors.accent.folly;
      case OrderStatus.PARTIAL:
        return theme.colors.accent.azure;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getSideColor = (side: string) => {
    return side === 'BUY' ? theme.colors.accent.avocado : theme.colors.accent.folly;
  };

  const filters = ['ALL', ...Object.values(OrderStatus)];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('Trading')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
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

      {/* Orders List */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderTitleContainer}>
                  <Text style={styles.orderTicker}>{order.ticker}</Text>
                  <View style={styles.orderBadges}>
                    <View style={[styles.sideBadge, { backgroundColor: getSideColor(order.side) }]}>
                      <Text style={styles.sideBadgeText}>{order.side}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status as OrderStatus) }]}>
                      <Text style={styles.statusBadgeText}>{order.status}</Text>
                    </View>
                  </View>
                </View>
                
                {order.status === OrderStatus.OPEN && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelOrder(order.id)}
                    disabled={cancelling}
                  >
                    <Ionicons name="close" size={20} color={theme.colors.accent.folly} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Order Details */}
              <View style={styles.orderDetails}>
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Type</Text>
                  <Text style={styles.orderDetailValue}>{order.type}</Text>
                </View>
                
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Quantity</Text>
                  <Text style={styles.orderDetailValue}>{order.quantity} shares</Text>
                </View>
                
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Price</Text>
                  <Text style={styles.orderDetailValue}>{formatCurrency(order.price)}</Text>
                </View>
                
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Time in Force</Text>
                  <Text style={styles.orderDetailValue}>{order.timeInForce}</Text>
                </View>
                
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderDetailLabel}>Created</Text>
                  <Text style={styles.orderDetailValue}>{formatDate(order.createdAt)}</Text>
                </View>
                
                {order.matchedAt && (
                  <View style={styles.orderDetailRow}>
                    <Text style={styles.orderDetailLabel}>Matched</Text>
                    <Text style={styles.orderDetailValue}>{formatDate(order.matchedAt)}</Text>
                  </View>
                )}
              </View>

              {/* Order Value */}
              <View style={styles.orderFooter}>
                <Text style={styles.orderValueLabel}>Total Value</Text>
                <Text style={styles.orderValue}>
                  {formatCurrency(order.quantity * order.price)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={theme.colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>
              {selectedFilter === 'ALL' ? 'No Orders Yet' : `No ${selectedFilter} Orders`}
            </Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'ALL' 
                ? 'Start trading to see your orders here'
                : `You don't have any ${selectedFilter.toLowerCase()} orders`
              }
            </Text>
            {selectedFilter === 'ALL' && (
              <TouchableOpacity 
                style={styles.startTradingButton}
                onPress={() => navigation.navigate('Trading')}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  orderCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTitleContainer: {
    flex: 1,
  },
  orderTicker: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  orderBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sideBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
    paddingTop: 12,
  },
  orderValueLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  orderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
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