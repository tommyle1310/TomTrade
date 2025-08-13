import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@apollo/client';
import { theme } from '../theme';
import { 
  MY_WATCHLISTS, 
  CREATE_WATCHLIST, 
  ADD_STOCK_TO_WATCHLIST, 
  REMOVE_STOCK_FROM_WATCHLIST 
} from '../apollo/queries';
import { Watchlist, CreateWatchlistInput, AddStockToWatchlistInput } from '../apollo/types';
import Avatar from '../components/Avatar';
import { useToast } from '../components/Toast';
import { useModal } from '../components/Modal';

interface WatchlistScreenProps {
  navigation: any;
}

export default function WatchlistScreen({ navigation }: WatchlistScreenProps) {
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  
  const { showToast } = useToast();
  const { showModal } = useModal();

  const { data, loading, refetch } = useQuery<{myWatchlists: Watchlist[]}>(MY_WATCHLISTS);
  const [createWatchlist, { loading: creating }] = useMutation(CREATE_WATCHLIST);
  const [addStock, { loading: adding }] = useMutation(ADD_STOCK_TO_WATCHLIST);
  const [removeStock, { loading: removing }] = useMutation(REMOVE_STOCK_FROM_WATCHLIST);

  const watchlists = data?.myWatchlists || [];
  const currentWatchlist = watchlists.find(w => w.id === selectedWatchlist) || watchlists[0];

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      showToast({
        type: 'error',
        message: 'Please enter a watchlist name',
      });
      return;
    }

    try {
      const input: CreateWatchlistInput = {
        name: newWatchlistName.trim(),
      };

      await createWatchlist({
        variables: { input },
        refetchQueries: [{ query: MY_WATCHLISTS }],
      });

      setNewWatchlistName('');
      setShowCreateForm(false);
      showToast({
        type: 'success',
        message: 'Watchlist created successfully',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to create watchlist',
      });
    }
  };

  const handleAddStock = () => {
    if (!currentWatchlist) {
      showToast({
        type: 'error',
        message: 'Please select a watchlist first',
      });
      return;
    }

    navigation.navigate('StockPicker', {
      onSelect: async (ticker: string) => {
        try {
          const input: AddStockToWatchlistInput = {
            watchlistId: currentWatchlist.id,
            ticker,
          };

          await addStock({
            variables: { input },
            refetchQueries: [{ query: MY_WATCHLISTS }],
          });

          showToast({
            type: 'success',
            message: `${ticker} added to watchlist`,
          });
        } catch (error: any) {
          showToast({
            type: 'error',
            message: error.message || 'Failed to add stock',
          });
        }
      },
    });
  };

  const handleRemoveStock = async (ticker: string) => {
    if (!currentWatchlist) return;

    showModal({
      title: 'Remove Stock',
      message: `Remove ${ticker} from ${currentWatchlist.name}?`,
      type: 'confirm',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        try {
          const input: AddStockToWatchlistInput = {
            watchlistId: currentWatchlist.id,
            ticker,
          };

          await removeStock({
            variables: { input },
            refetchQueries: [{ query: MY_WATCHLISTS }],
          });

          showToast({
            type: 'success',
            message: `${ticker} removed from watchlist`,
          });
        } catch (error: any) {
          showToast({
            type: 'error',
            message: error.message || 'Failed to remove stock',
          });
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Watchlists</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowCreateForm(true)}
          >
            <Ionicons name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={refetch}
          >
            <Ionicons name="refresh" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Watchlist Form */}
      {showCreateForm && (
        <View style={styles.createForm}>
          <View style={styles.createFormHeader}>
            <Text style={styles.createFormTitle}>Create New Watchlist</Text>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.createFormInput}
            placeholder="Watchlist name"
            placeholderTextColor={theme.colors.text.secondary}
            value={newWatchlistName}
            onChangeText={setNewWatchlistName}
            autoFocus
          />
          
          <View style={styles.createFormActions}>
            <TouchableOpacity 
              style={styles.createFormButton}
              onPress={handleCreateWatchlist}
              disabled={creating}
            >
              <Text style={styles.createFormButtonText}>
                {creating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Watchlist Tabs */}
      {watchlists.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
          contentContainerStyle={styles.tabContent}
        >
          {watchlists.map((watchlist) => (
            <TouchableOpacity
              key={watchlist.id}
              style={[
                styles.tab,
                (selectedWatchlist === watchlist.id || (!selectedWatchlist && watchlist === watchlists[0])) && styles.activeTab,
              ]}
              onPress={() => setSelectedWatchlist(watchlist.id)}
            >
              <Text style={[
                styles.tabText,
                (selectedWatchlist === watchlist.id || (!selectedWatchlist && watchlist === watchlists[0])) && styles.activeTabText,
              ]}>
                {watchlist.name}
              </Text>
              <Text style={styles.tabCount}>
                {watchlist.stocks.length} stocks
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Watchlist Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {currentWatchlist ? (
          <>
            {/* Add Stock Button */}
            <TouchableOpacity 
              style={styles.addStockButton}
              onPress={handleAddStock}
              disabled={adding}
            >
              <Ionicons name="add" size={20} color={theme.colors.primary} />
              <Text style={styles.addStockButtonText}>
                {adding ? 'Adding...' : 'Add Stock'}
              </Text>
            </TouchableOpacity>

            {/* Stocks List */}
            {currentWatchlist.stocks.length > 0 ? (
              currentWatchlist.stocks.map((stock) => (
                <TouchableOpacity 
                  key={stock.ticker} 
                  style={styles.stockCard}
                  onPress={() => navigation.navigate('StockDetail', { ticker: stock.ticker })}
                >
                  <Avatar 
                    source={stock.avatar} 
                    fallback={stock.companyName} 
                    size={40} 
                    style={styles.stockAvatar}
                  />
                  <View style={styles.stockInfo}>
                    <Text style={styles.stockTicker}>{stock.ticker}</Text>
                    <Text style={styles.stockName}>{stock.companyName}</Text>
                    <Text style={styles.stockExchange}>{stock.exchange}</Text>
                  </View>
                  
                  <View style={styles.stockActions}>
                    <TouchableOpacity 
                      style={styles.tradeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('Trading', { ticker: stock.ticker });
                      }}
                    >
                      <Text style={styles.tradeButtonText}>Trade</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemoveStock(stock.ticker);
                      }}
                      disabled={removing}
                    >
                      <Ionicons name="trash-outline" size={20} color={theme.colors.accent.folly} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyWatchlist}>
                <Ionicons name="star-outline" size={48} color={theme.colors.text.secondary} />
                <Text style={styles.emptyWatchlistTitle}>No Stocks in Watchlist</Text>
                <Text style={styles.emptyWatchlistText}>
                  Add stocks to track your favorite investments
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={theme.colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>No Watchlists Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first watchlist to track stocks
            </Text>
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Text style={styles.createFirstButtonText}>Create Watchlist</Text>
            </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  createForm: {
    backgroundColor: theme.colors.background.secondary,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  createFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  createFormInput: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  createFormActions: {
    alignItems: 'flex-end',
  },
  createFormButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  createFormButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  tabContainer: {
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: theme.colors.background.secondary,
    minWidth: 120,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  activeTabText: {
    color: 'white',
  },
  tabCount: {
    fontSize: 12,
    color: theme.colors.text.disabled,
    textAlign: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addStockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    paddingVertical: 16,
    marginBottom: 16,
  },
  addStockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 8,
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
  stockTicker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  stockName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  stockExchange: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  stockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  tradeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  removeButton: {
    padding: 8,
  },
  emptyWatchlist: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyWatchlistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyWatchlistText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
  createFirstButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});