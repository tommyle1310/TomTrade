import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@apollo/client';
import { theme } from '../theme';
import { PLACE_ORDER, PLACE_STOP_ORDER, GET_MY_BALANCE, GET_STOCKS, MY_ORDERS } from '../apollo/queries';
import { OrderSide, OrderType, TimeInForce, PlaceOrderInput, PlaceStopOrderInput } from '../apollo/types';
import { usePortfolioStore } from '../stores';

interface TradingScreenProps {
  navigation: any;
}

export default function TradingScreen({ navigation }: TradingScreenProps) {
  const [selectedStock, setSelectedStock] = useState('');
  const [orderSide, setOrderSide] = useState<OrderSide>(OrderSide.BUY);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.LIMIT);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState<TimeInForce>(TimeInForce.GTC);

  const { data: balanceData } = useQuery(GET_MY_BALANCE);
  const { data: stocksData } = useQuery(GET_STOCKS);
  
  const [placeOrder, { loading: placingOrder }] = useMutation(PLACE_ORDER);
  const [placeStopOrder, { loading: placingStopOrder }] = useMutation(PLACE_STOP_ORDER);
  
  // Get portfolio store methods to update global state
  const { fetchBalance, fetchDashboard, fetchOrders } = usePortfolioStore();

  const balance = balanceData?.getMyBalance || 0;
  const stocks = stocksData?.stocks || [];

  const isStopOrder = orderType === OrderType.STOP_LIMIT || orderType === OrderType.STOP_MARKET;
  const isLoading = placingOrder || placingStopOrder;

  const handlePlaceOrder = async () => {
    if (!selectedStock || !quantity || !price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isStopOrder && !triggerPrice) {
      Alert.alert('Error', 'Please enter trigger price for stop orders');
      return;
    }

    try {
      if (isStopOrder) {
        const input: PlaceStopOrderInput = {
          ticker: selectedStock,
          side: orderSide,
          type: orderType as 'STOP_LIMIT' | 'STOP_MARKET',
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          triggerPrice: parseFloat(triggerPrice),
          timeInForce,
        };

        await placeStopOrder({ 
          variables: { input },
          refetchQueries: [
            { query: MY_ORDERS },
            'GetDashboard',
            'GetMyBalance',
          ],
        });
      } else {
        const input: PlaceOrderInput = {
          ticker: selectedStock,
          side: orderSide,
          type: orderType as 'LIMIT' | 'MARKET',
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          timeInForce,
        };

        await placeOrder({ 
          variables: { input },
          refetchQueries: [
            { query: MY_ORDERS },
            'GetDashboard',
            'GetMyBalance',
          ],
        });
      }

      Alert.alert('Success', 'Order placed successfully');
      
      // Update the global portfolio store state
      await fetchBalance();
      await fetchDashboard();
      await fetchOrders();
      
      // Reset form
      setSelectedStock('');
      setQuantity('');
      setPrice('');
      setTriggerPrice('');
      
      // Navigate to orders screen
      navigation.navigate('Orders');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    }
  };

  const calculateOrderValue = () => {
    const qty = parseFloat(quantity) || 0;
    const orderPrice = parseFloat(price) || 0;
    return qty * orderPrice;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trading</Text>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Side Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Side</Text>
          <View style={styles.orderSideContainer}>
            <TouchableOpacity
              style={[
                styles.orderSideButton,
                orderSide === OrderSide.BUY && styles.buyButton,
              ]}
              onPress={() => setOrderSide(OrderSide.BUY)}
            >
              <Text style={[
                styles.orderSideText,
                orderSide === OrderSide.BUY && styles.buyButtonText,
              ]}>
                BUY
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.orderSideButton,
                orderSide === OrderSide.SELL && styles.sellButton,
              ]}
              onPress={() => setOrderSide(OrderSide.SELL)}
            >
              <Text style={[
                styles.orderSideText,
                orderSide === OrderSide.SELL && styles.sellButtonText,
              ]}>
                SELL
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stock Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Stock</Text>
          <TouchableOpacity 
            style={styles.stockSelector}
            onPress={() => navigation.navigate('StockPicker', { 
              onSelect: (ticker: string) => setSelectedStock(ticker) 
            })}
          >
            <Text style={[
              styles.stockSelectorText,
              !selectedStock && styles.placeholderText
            ]}>
              {selectedStock || 'Choose a stock...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Order Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.orderTypeContainer}>
            {Object.values(OrderType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.orderTypeButton,
                  orderType === type && styles.selectedOrderType,
                ]}
                onPress={() => setOrderType(type)}
              >
                <Text style={[
                  styles.orderTypeText,
                  orderType === type && styles.selectedOrderTypeText,
                ]}>
                  {type.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Number of shares"
              placeholderTextColor={theme.colors.text.secondary}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Price Input */}
        {orderType !== OrderType.MARKET && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {orderType === OrderType.STOP_MARKET ? 'Limit Price (Optional)' : 'Price'}
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={theme.colors.text.secondary}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {/* Trigger Price Input for Stop Orders */}
        {isStopOrder && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trigger Price</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={theme.colors.text.secondary}
                value={triggerPrice}
                onChangeText={setTriggerPrice}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {/* Time in Force */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time in Force</Text>
          <View style={styles.timeInForceContainer}>
            {Object.values(TimeInForce).map((tif) => (
              <TouchableOpacity
                key={tif}
                style={[
                  styles.timeInForceButton,
                  timeInForce === tif && styles.selectedTimeInForce,
                ]}
                onPress={() => setTimeInForce(tif)}
              >
                <Text style={[
                  styles.timeInForceText,
                  timeInForce === tif && styles.selectedTimeInForceText,
                ]}>
                  {tif}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        {selectedStock && quantity && price && (
          <View style={styles.orderSummary}>
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Stock</Text>
              <Text style={styles.summaryValue}>{selectedStock}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Side</Text>
              <Text style={[
                styles.summaryValue,
                { color: orderSide === OrderSide.BUY ? theme.colors.accent.avocado : theme.colors.accent.folly }
              ]}>
                {orderSide}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity</Text>
              <Text style={styles.summaryValue}>{quantity} shares</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price</Text>
              <Text style={styles.summaryValue}>{formatCurrency(parseFloat(price))}</Text>
            </View>
            {isStopOrder && triggerPrice && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Trigger Price</Text>
                <Text style={styles.summaryValue}>{formatCurrency(parseFloat(triggerPrice))}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Value</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateOrderValue())}</Text>
            </View>
          </View>
        )}

        {/* Place Order Button */}
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            orderSide === OrderSide.BUY ? styles.buyOrderButton : styles.sellOrderButton,
            isLoading && styles.disabledButton,
          ]}
          onPress={handlePlaceOrder}
          disabled={isLoading || !selectedStock || !quantity || !price}
        >
          <Text style={styles.placeOrderButtonText}>
            {isLoading ? 'Placing Order...' : `${orderSide} ${selectedStock || 'Stock'}`}
          </Text>
        </TouchableOpacity>
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
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  orderSideContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  orderSideButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  buyButton: {
    backgroundColor: theme.colors.accent.avocado,
    borderColor: theme.colors.accent.avocado,
  },
  sellButton: {
    backgroundColor: theme.colors.accent.folly,
    borderColor: theme.colors.accent.folly,
  },
  orderSideText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  buyButtonText: {
    color: 'white',
  },
  sellButtonText: {
    color: 'white',
  },
  stockSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stockSelectorText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  placeholderText: {
    color: theme.colors.text.secondary,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  orderTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    backgroundColor: theme.colors.background.secondary,
  },
  selectedOrderType: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  orderTypeText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  selectedOrderTypeText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingHorizontal: 16,
  },
  inputPrefix: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  timeInForceContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  timeInForceButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    backgroundColor: theme.colors.background.secondary,
  },
  selectedTimeInForce: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeInForceText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  selectedTimeInForceText: {
    color: 'white',
  },
  orderSummary: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  placeOrderButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buyOrderButton: {
    backgroundColor: theme.colors.accent.avocado,
  },
  sellOrderButton: {
    backgroundColor: theme.colors.accent.folly,
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});