import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { theme } from '../theme';
import { GET_STOCK, ORDER_BOOK, GET_SMA, GET_EMA, GET_RSI } from '../apollo/queries';
import { Stock, OrderBook, StockPosition } from '../apollo/types';

interface StockDetailScreenProps {
  navigation: any;
  route: {
    params: {
      ticker: string;
    };
  };
}

export default function StockDetailScreen({ navigation, route }: StockDetailScreenProps) {
  const { ticker } = route.params;
  const [selectedTab, setSelectedTab] = useState<'overview' | 'news' | 'technicals' | 'orders'>('overview');

  // Main stock data
  const { data: stockData, loading: stockLoading, refetch: refetchStock } = useQuery<{stock: Stock}>(GET_STOCK, {
    variables: { ticker },
    fetchPolicy: 'cache-first',
  });

  // Order book data
  const { data: orderBookData, loading: orderBookLoading, refetch: refetchOrderBook } = useQuery<{orderBook: OrderBook}>(ORDER_BOOK, {
    variables: { ticker },
    fetchPolicy: 'cache-first',
  });

  // Check if we have enough market data for technical indicators
  const hasEnoughDataForIndicators = stock?.marketData && stock.marketData.length >= 20;
  const hasEnoughDataForRSI = stock?.marketData && stock.marketData.length >= 15;

  // Technical indicators - only run if we have sufficient data
  const { data: smaData, error: smaError } = useQuery(GET_SMA, {
    variables: { ticker, period: 20, interval: '_1d' },
    fetchPolicy: 'cache-first',
    skip: !hasEnoughDataForIndicators, // Skip query if insufficient data
    errorPolicy: 'ignore',
  });

  const { data: emaData, error: emaError } = useQuery(GET_EMA, {
    variables: { ticker, period: 20, interval: '_1d' },
    fetchPolicy: 'cache-first',
    skip: !hasEnoughDataForIndicators, // Skip query if insufficient data
    errorPolicy: 'ignore',
  });

  const { data: rsiData, error: rsiError } = useQuery(GET_RSI, {
    variables: { ticker, period: 14, interval: '_1d' },
    fetchPolicy: 'cache-first',
    skip: !hasEnoughDataForRSI, // Skip query if insufficient data
    errorPolicy: 'ignore',
  });

  const stock = stockData?.stock;
  const orderBook = orderBookData?.orderBook;
  const isLoading = stockLoading || orderBookLoading;

  const handleRefresh = () => {
    refetchStock();
    refetchOrderBook();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentPrice = () => {
    if (!stock?.marketData || stock.marketData.length === 0) return 0;
    return stock.marketData[stock.marketData.length - 1]?.close || 0;
  };

  const getPriceChange = () => {
    if (!stock?.marketData || stock.marketData.length < 2) return { change: 0, percent: 0 };
    const current = stock.marketData[stock.marketData.length - 1]?.close || 0;
    const previous = stock.marketData[stock.marketData.length - 2]?.close || 0;
    const change = current - previous;
    const percent = previous !== 0 ? (change / previous) * 100 : 0;
    return { change, percent };
  };

  const priceChange = getPriceChange();
  const currentPrice = getCurrentPrice();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'information-circle' },
    { id: 'news', label: 'News', icon: 'newspaper' },
    { id: 'technicals', label: 'Technicals', icon: 'analytics' },
    { id: 'orders', label: 'Order Book', icon: 'list' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTicker}>{ticker}</Text>
          {stock && <Text style={styles.headerCompany}>{stock.companyName}</Text>}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Trading', params: { ticker } })}
          >
            <Ionicons name="trending-up" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Price Section */}
      {stock && (
        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>{formatCurrency(currentPrice)}</Text>
          <View style={styles.priceChangeContainer}>
            <Ionicons 
              name={priceChange.change >= 0 ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={priceChange.change >= 0 ? theme.colors.accent.avocado : theme.colors.accent.folly} 
            />
            <Text style={[
              styles.priceChange,
              { color: priceChange.change >= 0 ? theme.colors.accent.avocado : theme.colors.accent.folly }
            ]}>
              {priceChange.change >= 0 ? '+' : ''}{formatCurrency(priceChange.change)} ({priceChange.percent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      )}

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab.id as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={16} 
              color={selectedTab === tab.id ? theme.colors.primary : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.activeTabText,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {selectedTab === 'overview' && stock && (
          <View>
            {/* Stock Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Company Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Exchange</Text>
                  <Text style={styles.infoValue}>{stock.exchange}</Text>
                </View>
                {stock.sector && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Sector</Text>
                    <Text style={styles.infoValue}>{stock.sector}</Text>
                  </View>
                )}
                {stock.industry && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Industry</Text>
                    <Text style={styles.infoValue}>{stock.industry}</Text>
                  </View>
                )}
                {stock.currency && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Currency</Text>
                    <Text style={styles.infoValue}>{stock.currency}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Market Data */}
            {stock.marketData && stock.marketData.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today's Trading</Text>
                <View style={styles.marketDataGrid}>
                  {(() => {
                    const latestData = stock.marketData[stock.marketData.length - 1];
                    return (
                      <>
                        <View style={styles.marketDataItem}>
                          <Text style={styles.marketDataLabel}>Open</Text>
                          <Text style={styles.marketDataValue}>{formatCurrency(latestData.open)}</Text>
                        </View>
                        <View style={styles.marketDataItem}>
                          <Text style={styles.marketDataLabel}>High</Text>
                          <Text style={styles.marketDataValue}>{formatCurrency(latestData.high)}</Text>
                        </View>
                        <View style={styles.marketDataItem}>
                          <Text style={styles.marketDataLabel}>Low</Text>
                          <Text style={styles.marketDataValue}>{formatCurrency(latestData.low)}</Text>
                        </View>
                        <View style={styles.marketDataItem}>
                          <Text style={styles.marketDataLabel}>Volume</Text>
                          <Text style={styles.marketDataValue}>{formatNumber(parseInt(latestData.volume))}</Text>
                        </View>
                      </>
                    );
                  })()}
                </View>
              </View>
            )}
          </View>
        )}

        {selectedTab === 'news' && stock && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest News</Text>
            {stock.news && stock.news.length > 0 ? (
              stock.news.map((newsItem) => (
                <TouchableOpacity key={newsItem.id} style={styles.newsCard}>
                  <Text style={styles.newsHeadline}>{newsItem.headline}</Text>
                  {newsItem.summary && (
                    <Text style={styles.newsSummary}>{newsItem.summary}</Text>
                  )}
                  <View style={styles.newsFooter}>
                    <Text style={styles.newsSource}>{newsItem.source}</Text>
                    <Text style={styles.newsDate}>{formatDate(newsItem.publishedAt)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>No news available</Text>
            )}
          </View>
        )}

        {selectedTab === 'technicals' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Indicators</Text>
            <View style={styles.indicatorsGrid}>
              <View style={styles.indicatorCard}>
                <Text style={styles.indicatorLabel}>SMA (20)</Text>
                <Text style={styles.indicatorValue}>
                  {!hasEnoughDataForIndicators 
                    ? 'N/A'
                    : smaData?.getSMA && smaData.getSMA.length > 0 
                      ? formatCurrency(smaData.getSMA[smaData.getSMA.length - 1])
                      : 'Loading...'
                  }
                </Text>
                {!hasEnoughDataForIndicators && (
                  <Text style={styles.indicatorError}>Need 20+ data points</Text>
                )}
              </View>
              
              <View style={styles.indicatorCard}>
                <Text style={styles.indicatorLabel}>EMA (20)</Text>
                <Text style={styles.indicatorValue}>
                  {!hasEnoughDataForIndicators 
                    ? 'N/A'
                    : emaData?.getEMA && emaData.getEMA.length > 0 
                      ? formatCurrency(emaData.getEMA[emaData.getEMA.length - 1])
                      : 'Loading...'
                  }
                </Text>
                {!hasEnoughDataForIndicators && (
                  <Text style={styles.indicatorError}>Need 20+ data points</Text>
                )}
              </View>
              
              <View style={styles.indicatorCard}>
                <Text style={styles.indicatorLabel}>RSI (14)</Text>
                <Text style={styles.indicatorValue}>
                  {!hasEnoughDataForRSI 
                    ? 'N/A'
                    : rsiData?.getRSI && rsiData.getRSI.length > 0 
                      ? (rsiData.getRSI[rsiData.getRSI.length - 1]).toFixed(2)
                      : 'Loading...'
                  }
                </Text>
                {!hasEnoughDataForRSI && (
                  <Text style={styles.indicatorError}>Need 15+ data points</Text>
                )}
              </View>
            </View>
            
            {(!hasEnoughDataForIndicators || !hasEnoughDataForRSI) && (
              <View style={styles.indicatorNote}>
                <Ionicons name="information-circle" size={16} color={theme.colors.text.secondary} />
                <Text style={styles.indicatorNoteText}>
                  Technical indicators require sufficient historical market data to calculate. 
                  Current data points: {stock?.marketData?.length || 0}. 
                  SMA/EMA need 20+ points, RSI needs 15+ points.
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedTab === 'orders' && orderBook && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Book</Text>
            <View style={styles.orderBookContainer}>
              {/* Sell Orders */}
              <View style={styles.orderBookSection}>
                <Text style={styles.orderBookTitle}>Sell Orders</Text>
                {orderBook.sellOrders.slice(0, 5).map((order) => (
                  <View key={order.id} style={styles.orderRow}>
                    <Text style={styles.orderPrice}>{formatCurrency(order.price)}</Text>
                    <Text style={styles.orderQuantity}>{order.quantity}</Text>
                  </View>
                ))}
              </View>

              {/* Current Price */}
              <View style={styles.currentPriceRow}>
                <Text style={styles.currentPriceLabel}>Current Price</Text>
                <Text style={styles.currentPriceValue}>{formatCurrency(currentPrice)}</Text>
              </View>

              {/* Buy Orders */}
              <View style={styles.orderBookSection}>
                <Text style={styles.orderBookTitle}>Buy Orders</Text>
                {orderBook.buyOrders.slice(0, 5).map((order) => (
                  <View key={order.id} style={styles.orderRow}>
                    <Text style={styles.orderPrice}>{formatCurrency(order.price)}</Text>
                    <Text style={styles.orderQuantity}>{order.quantity}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.buyButton]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Trading', params: { ticker, side: 'BUY' } })}
        >
          <Text style={styles.actionButtonText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.sellButton]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Trading', params: { ticker, side: 'SELL' } })}
        >
          <Text style={styles.actionButtonText}>Sell</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTicker: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  headerCompany: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  priceSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background.secondary,
    gap: 6,
  },
  activeTab: {
    backgroundColor: `${theme.colors.primary}15`,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    width: '48%',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    padding: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  marketDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  marketDataItem: {
    width: '48%',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  marketDataLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  marketDataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  newsCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  newsHeadline: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  newsDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  indicatorCard: {
    width: '48%',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  indicatorLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  indicatorValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  indicatorError: {
    fontSize: 10,
    color: theme.colors.accent.folly,
    marginTop: 4,
    textAlign: 'center',
  },
  indicatorNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  indicatorNoteText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
  orderBookContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
  },
  orderBookSection: {
    marginBottom: 16,
  },
  orderBookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  orderPrice: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  orderQuantity: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  currentPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  currentPriceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  currentPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  noDataText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: theme.colors.accent.avocado,
  },
  sellButton: {
    backgroundColor: theme.colors.accent.folly,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});