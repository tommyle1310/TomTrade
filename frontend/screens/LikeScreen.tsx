import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function LikeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', count: 24 },
    { id: 'stocks', name: 'Stocks', count: 12 },
    { id: 'crypto', name: 'Crypto', count: 8 },
    { id: 'etf', name: 'ETFs', count: 4 },
  ];

  const favoriteItems = [
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: '$175.43', change: '+2.34%', type: 'stocks', trending: true },
    { id: 2, symbol: 'BTC', name: 'Bitcoin', price: '$43,250', change: '+5.67%', type: 'crypto', trending: true },
    { id: 3, symbol: 'TSLA', name: 'Tesla Inc.', price: '$248.50', change: '-1.23%', type: 'stocks', trending: false },
    { id: 4, symbol: 'ETH', name: 'Ethereum', price: '$2,650', change: '+3.45%', type: 'crypto', trending: true },
    { id: 5, symbol: 'SPY', name: 'SPDR S&P 500', price: '$445.20', change: '+0.89%', type: 'etf', trending: false },
    { id: 6, symbol: 'NVDA', name: 'NVIDIA Corp.', price: '$875.30', change: '+4.12%', type: 'stocks', trending: true },
  ];

  const filteredItems = favoriteItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerSubtitle}>Your watchlist & liked items</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search favorites..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        <View style={styles.categories}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name} ({category.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Favorites List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredItems.length > 0 ? (
          <View style={styles.favoritesList}>
            {filteredItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.favoriteItem}>
                <View style={styles.itemLeft}>
                  <View style={styles.symbolContainer}>
                    <Text style={styles.symbol}>{item.symbol}</Text>
                    {item.trending && (
                      <View style={styles.trendingBadge}>
                        <Ionicons name="trending-up" size={12} color={theme.colors.accent.asparagus} />
                      </View>
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemType}>{item.type.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  <Text style={[
                    styles.itemChange,
                    { color: item.change.startsWith('+') ? theme.colors.accent.asparagus : theme.colors.accent.folly }
                  ]}>
                    {item.change}
                  </Text>
                </View>
                <TouchableOpacity style={styles.heartButton}>
                  <Ionicons name="heart" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={64} color={theme.colors.text.tertiary} />
            </View>
            <Text style={styles.emptyTitle}>No favorites found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Start adding items to your favorites'}
            </Text>
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
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[6],
  },
  headerTitle: {
    ...theme.typography.heading.h2,
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  },
  searchContainer: {
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  searchBar: {
    ...theme.components.input.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body.medium,
    color: theme.colors.text.primary,
    padding: 0,
  },
  categoriesContainer: {
    marginBottom: theme.spacing[4],
    maxHeight: 32,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  categoryChip: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    ...theme.typography.label.small,
    color: theme.colors.text.secondary,
  },
  categoryTextActive: {
    color: theme.colors.text.inverse,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
  },
  favoritesList: {
    gap: theme.spacing[2],
    paddingBottom: theme.spacing[20],
  },
  favoriteItem: {
    ...theme.components.card.base,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolContainer: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
    position: 'relative',
  },
  symbol: {
    ...theme.typography.label.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.bold,
  },
  trendingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...theme.typography.body.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  itemType: {
    ...theme.typography.caption.medium,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing[0.5],
  },
  itemRight: {
    alignItems: 'flex-end',
    marginRight: theme.spacing[3],
  },
  itemPrice: {
    ...theme.typography.label.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.semiBold,
  },
  itemChange: {
    ...theme.typography.caption.medium,
    fontWeight: theme.fontWeight.medium,
    marginTop: theme.spacing[0.5],
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[20],
  },
  emptyIcon: {
    marginBottom: theme.spacing[6],
  },
  emptyTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  emptySubtitle: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});