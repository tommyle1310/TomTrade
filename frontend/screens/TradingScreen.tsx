import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@apollo/client';
import { spacing, theme } from '../theme';
import { PLACE_ORDER, PLACE_STOP_ORDER, GET_MY_BALANCE, GET_STOCKS_WITH_MARKET, MY_ORDERS, MY_WATCHLISTS, GET_DASHBOARD } from '../apollo/queries';
import { OrderSide, OrderType, TimeInForce, PlaceOrderInput, PlaceStopOrderInput } from '../apollo/types';
import { usePortfolioStore } from '../stores';

interface TradingScreenProps {
  navigation: any;
  route?: {
    params?: {
      prefilledData?: {
        ticker?: string;
        side?: 'BUY' | 'SELL';
        price?: string;
      };
    };
  };
}

export default function TradingScreen({ navigation, route }: TradingScreenProps) {
  // Top-level tabs
  const [activeTab, setActiveTab] = useState<'Markets' | 'PlaceOrder'>('Markets');

  // Order form state
  const [selectedStock, setSelectedStock] = useState('');
  const [orderSide, setOrderSide] = useState<OrderSide>(OrderSide.BUY);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.LIMIT);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState<TimeInForce>(TimeInForce.GTC);

  const { data: balanceData } = useQuery(GET_MY_BALANCE);
  const { data: marketData } = useQuery(GET_STOCKS_WITH_MARKET);
  const { data: watchlistsData } = useQuery(MY_WATCHLISTS);
  
  const [placeOrder, { loading: placingOrder }] = useMutation(PLACE_ORDER);
  const [placeStopOrder, { loading: placingStopOrder }] = useMutation(PLACE_STOP_ORDER);
  
  // Get portfolio store methods to update global state
  const { fetchBalance, fetchDashboard, fetchOrders } = usePortfolioStore();

  const balance = balanceData?.getMyBalance || 0;

  // Handle prefilled data from navigation
  React.useEffect(() => {
    const prefilledData = route?.params?.prefilledData;
    if (prefilledData) {
      setActiveTab('PlaceOrder'); // Switch to place order tab
      
      if (prefilledData.ticker) {
        setSelectedStock(prefilledData.ticker);
      }
      if (prefilledData.side) {
        setOrderSide(prefilledData.side === 'BUY' ? OrderSide.BUY : OrderSide.SELL);
      }
      if (prefilledData.price) {
        setPrice(prefilledData.price);
      }
      
      // Clear the params to prevent re-triggering
      navigation.setParams({ prefilledData: undefined });
    }
  }, [route?.params?.prefilledData, navigation]);
  const stocksWithMarket = marketData?.stocks || [];

  const isStopOrder = orderType === OrderType.STOP_LIMIT || orderType === OrderType.STOP_MARKET;
  const isLoading = placingOrder || placingStopOrder;

  // Markets sub-filter
  const [marketFilter, setMarketFilter] = useState<'All' | 'Favorites' | 'Major'>('All');

  const favoriteTickers: string[] = useMemo(() => {
    const lists = watchlistsData?.myWatchlists || [];
    const set = new Set<string>();
    lists.forEach((w: any) => w.stocks?.forEach((s: any) => set.add(s.ticker)));
    return Array.from(set);
  }, [watchlistsData]);

  const filteredStocks = useMemo(() => {
    let list = [...stocksWithMarket];
    if (marketFilter === 'Favorites') {
      list = list.filter((s: any) => favoriteTickers.includes(s.ticker));
    } else if (marketFilter === 'Major') {
      list = list.filter((s: any) => ['NYSE', 'NASDAQ'].includes(s.exchange));
    }
    // compute change and sort by abs change desc
    const withChange = list.map((s: any) => {
      const md = s.marketData || [];
      const last = md[md.length - 1]?.close ?? 0;
      const prev = md[md.length - 2]?.close ?? last;
      const changePct = last && prev ? ((last - prev) / prev) * 100 : 0;
      return { ...s, last, changePct };
    });
    return withChange.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
  }, [stocksWithMarket, marketFilter, favoriteTickers]);

  const handlePlaceOrder = async () => {
    console.log('check here')
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
            { query: GET_DASHBOARD },
            { query: GET_MY_BALANCE },
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
            { query: GET_DASHBOARD },
            { query: GET_MY_BALANCE },
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

      {/* Top Tabs */}
      <View style={styles.tabsContainer}>
        {(['Markets', 'PlaceOrder'] as const).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'PlaceOrder' ? 'Place Order' : 'Markets'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'Markets' ? (
          <>
            {/* Filter Chips */}
            <View style={styles.filtersRow}>
              {(['All', 'Favorites', 'Major'] as const).map((f) => (
                <TouchableOpacity key={f} style={[styles.filterChip, marketFilter === f && styles.filterChipActive]} onPress={() => setMarketFilter(f)}>
                  <Ionicons name={f === 'All' ? 'cube-outline' : f === 'Favorites' ? 'star' : 'star-outline'} size={18} color={marketFilter === f ? 'white' : theme.colors.text.secondary} />
                  <Text style={[styles.filterText, marketFilter === f && styles.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Top Market</Text>

            <View>
              {filteredStocks.map((s: any) => (
                <TouchableOpacity key={s.ticker} style={styles.marketRow} onPress={() => navigation.navigate('StockDetail', { ticker: s.ticker })}>
                  <View style={styles.marketLeft}>
                    {s.avatar ? (
                      <Image source={{ uri: s.avatar }} style={styles.marketAvatar} />
                    ) : (
                      <View style={[styles.marketAvatar, styles.marketAvatarFallback]} />
                    )}
                    <View>
                      <Text style={styles.marketTicker}>{s.ticker}</Text>
                      <Text style={styles.marketCompany}>{s.companyName}</Text>
                    </View>
                  </View>

                  <View style={styles.marketSparkline}>{renderBars(s.marketData || [])}</View>

                  <View style={styles.marketRight}>
                    <Text style={styles.marketPrice}>{formatCurrency(s.last || 0)}</Text>
                    <Text style={[styles.marketChange, { color: s.changePct >= 0 ? theme.colors.accent.avocado : theme.colors.accent.folly }]}>
                      {`${s.changePct >= 0 ? '+' : ''}${(s.changePct || 0).toFixed(2)}%`}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Order Side Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Side</Text>
              <View style={styles.orderSideContainer}>
                <TouchableOpacity style={[styles.orderSideButton, orderSide === OrderSide.BUY && styles.buyButton]} onPress={() => setOrderSide(OrderSide.BUY)}>
                  <Text style={[styles.orderSideText, orderSide === OrderSide.BUY && styles.buyButtonText]}>BUY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.orderSideButton, orderSide === OrderSide.SELL && styles.sellButton]} onPress={() => setOrderSide(OrderSide.SELL)}>
                  <Text style={[styles.orderSideText, orderSide === OrderSide.SELL && styles.sellButtonText]}>SELL</Text>
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
          
          {/* Order Book Button */}
          {selectedStock && (
            <TouchableOpacity
              style={styles.orderBookButton}
              onPress={() => navigation.navigate('OrderBook', { 
                ticker: selectedStock,
                companyName: stocksWithMarket.find((s: any) => s.ticker === selectedStock)?.companyName 
              })}
            >
              <Ionicons name="bar-chart" size={18} color={theme.colors.primary} />
              <Text style={styles.orderBookButtonText}>View Order Book</Text>
            </TouchableOpacity>
          )}
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
          </>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    margin: 16,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  // Markets styles
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  marketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  marketLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  marketAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  marketAvatarFallback: {
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  marketSparkline: {
    width: 80,
    height: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginRight: 12,
  },
  sparkBar: {
    width: 5,
    borderRadius: 2,
  },
  marketRight: {
    width: 90,
    alignItems: 'flex-end',
  },
  marketPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  marketChange: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  marketTicker: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  marketCompany: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  // Order styles
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
  orderBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  orderBookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
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
    marginBottom: spacing[32],
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

// Lightweight sparkline bars from marketData without external deps
function renderBars(marketData: any[]) {
  const closes = (marketData || []).slice(-12).map((d) => d.close);
  if (closes.length === 0) return <View style={{ width: 80 }} />;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  return (
    <>
      {closes.map((c, idx) => {
        const h = 6 + ((c - min) / range) * 18; // 6..24
        const isUp = idx > 0 ? c >= closes[idx - 1] : true;
        return <View key={idx} style={[styles.sparkBar, { height: h, backgroundColor: isUp ? theme.colors.accent.avocado : theme.colors.accent.folly }]} />;
      })}
    </>
  );
}