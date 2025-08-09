import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { theme } from '../theme';
import { GET_STOCKS } from '../apollo/queries';
import { Stock } from '../apollo/types';
import Avatar from '../components/Avatar';

interface StockPickerScreenProps {
  navigation: any;
  route: {
    params: {
      onSelect: (ticker: string) => void;
    };
  };
}

export default function StockPickerScreen({ navigation, route }: StockPickerScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<{stocks: Stock[]}>(GET_STOCKS);
  const { onSelect } = route.params;

  const stocks = data?.stocks || [];

  // Get unique sectors for filtering
  const sectors = useMemo(() => {
    const uniqueSectors = [...new Set(stocks.map(stock => stock.sector).filter(Boolean))];
    return uniqueSectors.sort();
  }, [stocks]);

  // Filter stocks based on search query and selected sector
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch = !searchQuery || 
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSector = !selectedSector || stock.sector === selectedSector;
      
      return matchesSearch && matchesSector;
    });
  }, [stocks, searchQuery, selectedSector]);

  const handleSelectStock = (ticker: string) => {
    onSelect(ticker);
    navigation.goBack();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSector(null);
  };

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
        <Text style={styles.headerTitle}>Select Stock</Text>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearFilters}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks by ticker or company name..."
            placeholderTextColor={theme.colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sector Filter */}
      {sectors.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sectorContainer}
          contentContainerStyle={styles.sectorContent}
        >
          <TouchableOpacity
            style={[
              styles.sectorChip,
              !selectedSector && styles.selectedSectorChip,
            ]}
            onPress={() => setSelectedSector(null)}
          >
            <Text style={[
              styles.sectorChipText,
              !selectedSector && styles.selectedSectorChipText,
            ]}>
              All Sectors
            </Text>
          </TouchableOpacity>
          
          {sectors.map((sector) => (
            <TouchableOpacity
              key={sector}
              style={[
                styles.sectorChip,
                selectedSector === sector && styles.selectedSectorChip,
              ]}
              onPress={() => setSelectedSector(sector)}
            >
              <Text style={[
                styles.sectorChipText,
                selectedSector === sector && styles.selectedSectorChipText,
              ]}>
                {sector}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Stocks List */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {filteredStocks.length > 0 ? (
          filteredStocks.map((stock) => (
            <TouchableOpacity
              key={stock.ticker}
              style={styles.stockCard}
              onPress={() => handleSelectStock(stock.ticker)}
            >
              <Avatar 
                source={stock.avatar} 
                fallback={stock.companyName} 
                size={48} 
                style={styles.stockAvatar}
              />
              <View style={styles.stockInfo}>
                <View style={styles.stockHeader}>
                  <Text style={styles.stockTicker}>{stock.ticker}</Text>
                  <Text style={styles.stockExchange}>{stock.exchange}</Text>
                </View>
                <Text style={styles.stockName}>{stock.companyName}</Text>
                {stock.sector && (
                  <Text style={styles.stockSector}>{stock.sector}</Text>
                )}
                {stock.industry && (
                  <Text style={styles.stockIndustry}>{stock.industry}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={theme.colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>No Stocks Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedSector 
                ? 'Try adjusting your search or filter criteria'
                : 'No stocks available at the moment'
              }
            </Text>
            {(searchQuery || selectedSector) && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  sectorContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  sectorContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  sectorChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  selectedSectorChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sectorChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  selectedSectorChipText: {
    color: 'white',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.background.secondary,
  },
  resultsText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  stockAvatar: {
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  stockInfo: {
    flex: 1,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockTicker: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginRight: 12,
  },
  stockExchange: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockName: {
    fontSize: 14,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  stockSector: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 1,
  },
  stockIndustry: {
    fontSize: 12,
    color: theme.colors.text.secondary,
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
  clearFiltersButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  clearFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});