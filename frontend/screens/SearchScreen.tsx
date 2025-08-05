import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState(['AAPL', 'Bitcoin', 'Tesla', 'S&P 500']);

  const filters = [
    { id: 'all', name: 'All', icon: 'search' },
    { id: 'stocks', name: 'Stocks', icon: 'trending-up' },
    { id: 'crypto', name: 'Crypto', icon: 'logo-bitcoin' },
    { id: 'news', name: 'News', icon: 'newspaper' },
  ];

  const trendingSearches = [
    { id: 1, term: 'NVIDIA', category: 'Stock', trend: 'up', change: '+12.5%' },
    { id: 2, term: 'Bitcoin ETF', category: 'Crypto', trend: 'up', change: '+8.3%' },
    { id: 3, term: 'Apple Earnings', category: 'News', trend: 'neutral', change: '' },
    { id: 4, term: 'Tesla Model Y', category: 'Stock', trend: 'down', change: '-3.2%' },
    { id: 5, term: 'Ethereum 2.0', category: 'Crypto', trend: 'up', change: '+15.7%' },
  ];

  const searchResults = [
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: '$175.43', change: '+2.34%', type: 'stock' },
    { id: 2, symbol: 'TSLA', name: 'Tesla Inc.', price: '$248.50', change: '-1.23%', type: 'stock' },
    { id: 3, symbol: 'BTC', name: 'Bitcoin', price: '$43,250', change: '+5.67%', type: 'crypto' },
  ];

  const filteredResults = searchQuery.length > 0 ? searchResults.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0 && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const clearRecentSearch = (term: string) => {
    setRecentSearches(prev => prev.filter(item => item !== term));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <Text style={styles.headerSubtitle}>Discover stocks, crypto & news</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks, crypto, news..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <View style={styles.filters}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={16} 
                color={selectedFilter === filter.id ? theme.colors.text.inverse : theme.colors.text.secondary} 
              />
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {searchQuery.length > 0 ? (
          /* Search Results */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Results ({filteredResults.length})</Text>
            {filteredResults.length > 0 ? (
              <View style={styles.resultsList}>
                {filteredResults.map((result) => (
                  <TouchableOpacity key={result.id} style={styles.resultItem}>
                    <View style={styles.resultLeft}>
                      <View style={styles.resultIcon}>
                        <Text style={styles.resultSymbol}>{result.symbol}</Text>
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{result.name}</Text>
                        <Text style={styles.resultType}>{result.type.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.resultRight}>
                      <Text style={styles.resultPrice}>{result.price}</Text>
                                        <Text style={[
                    styles.resultChange,
                    { color: result.change.startsWith('+') ? theme.colors.accent.asparagus : theme.colors.accent.folly }
                  ]}>
                    {result.change}
                  </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color={theme.colors.text.tertiary} />
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>Try adjusting your search terms</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={() => setRecentSearches([])}>
                    <Text style={styles.clearButton}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentSearches}>
                  {recentSearches.map((term, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.recentSearchItem}
                      onPress={() => setSearchQuery(term)}
                    >
                      <Ionicons name="time-outline" size={16} color={theme.colors.text.tertiary} />
                      <Text style={styles.recentSearchText}>{term}</Text>
                      <TouchableOpacity onPress={() => clearRecentSearch(term)}>
                        <Ionicons name="close" size={16} color={theme.colors.text.tertiary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Trending Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              <View style={styles.trendingList}>
                {trendingSearches.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.trendingItem}
                    onPress={() => setSearchQuery(item.term)}
                  >
                    <View style={styles.trendingLeft}>
                      <View style={styles.trendingIcon}>
                        <Ionicons 
                          name="trending-up" 
                          size={16} 
                          color={item.trend === 'up' ? theme.colors.accent.asparagus : 
                                 item.trend === 'down' ? theme.colors.accent.folly : 
                                 theme.colors.text.tertiary} 
                        />
                      </View>
                      <View style={styles.trendingInfo}>
                        <Text style={styles.trendingTerm}>{item.term}</Text>
                        <Text style={styles.trendingCategory}>{item.category}</Text>
                      </View>
                    </View>
                    {item.change && (
                      <Text style={[
                        styles.trendingChange,
                        { color: item.change.startsWith('+') ? theme.colors.accent.asparagus : theme.colors.accent.folly }
                      ]}>
                        {item.change}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
  filtersContainer: {
    marginBottom: theme.spacing[4],
    maxHeight: 32,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    gap: theme.spacing[1],
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    ...theme.typography.label.small,
    color: theme.colors.text.secondary,
  },
  filterTextActive: {
    color: theme.colors.text.inverse,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
  },
  section: {
    marginBottom: theme.spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
  },
  clearButton: {
    ...theme.typography.label.small,
    color: theme.colors.primary,
  },
  recentSearches: {
    gap: theme.spacing[2],
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[3],
    backgroundColor: theme.colors.surface.secondary,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing[2],
  },
  recentSearchText: {
    flex: 1,
    ...theme.typography.body.medium,
    color: theme.colors.text.primary,
  },
  trendingList: {
    ...theme.components.card.base,
    padding: 0,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  trendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trendingIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTerm: {
    ...theme.typography.body.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  trendingCategory: {
    ...theme.typography.caption.medium,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[0.5],
  },
  trendingChange: {
    ...theme.typography.label.small,
    fontWeight: theme.fontWeight.semiBold,
  },
  resultsList: {
    gap: theme.spacing[2],
  },
  resultItem: {
    ...theme.components.card.base,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultIcon: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  resultSymbol: {
    ...theme.typography.label.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.bold,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    ...theme.typography.body.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  resultType: {
    ...theme.typography.caption.medium,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing[0.5],
  },
  resultRight: {
    alignItems: 'flex-end',
  },
  resultPrice: {
    ...theme.typography.label.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.semiBold,
  },
  resultChange: {
    ...theme.typography.caption.medium,
    fontWeight: theme.fontWeight.medium,
    marginTop: theme.spacing[0.5],
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: theme.spacing[12],
  },
  noResultsText: {
    ...theme.typography.heading.h5,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[4],
  },
  noResultsSubtext: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[2],
  },
});