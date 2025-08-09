import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@apollo/client';
import { theme } from '../theme';
import { GET_MY_BALANCE, DEPOSIT, DEDUCT, GET_DASHBOARD } from '../apollo/queries';
import { usePortfolioStore } from '../stores';

interface BalanceScreenProps {
  navigation: any;
}

export default function BalanceScreen({ navigation }: BalanceScreenProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');

  const { data, loading, refetch } = useQuery(GET_MY_BALANCE);
  const [deposit, { loading: depositing }] = useMutation(DEPOSIT);
  const [withdraw, { loading: withdrawing }] = useMutation(DEDUCT);
  
  // Get portfolio store methods to update global state
  const { fetchBalance, fetchDashboard } = usePortfolioStore();

  const balance = data?.getMyBalance || 0;
  const isProcessing = depositing || withdrawing;

  const quickAmounts = [100, 500, 1000, 5000];

  const handleTransaction = async () => {
    const transactionAmount = parseFloat(amount);
    
    if (!transactionAmount || transactionAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (activeTab === 'withdraw' && transactionAmount > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      if (activeTab === 'deposit') {
        await deposit({
          variables: { amount: transactionAmount },
          refetchQueries: [
            { query: GET_MY_BALANCE },
            { query: GET_DASHBOARD }, // Refetch dashboard to update home screen
          ],
        });
        Alert.alert('Success', `$${transactionAmount} deposited successfully`);
      } else {
        await withdraw({
          variables: { amount: transactionAmount },
          refetchQueries: [
            { query: GET_MY_BALANCE },
            { query: GET_DASHBOARD }, // Refetch dashboard to update home screen
          ],
        });
        Alert.alert('Success', `$${transactionAmount} withdrawn successfully`);
      }
      
      // Force refetch the balance data immediately
      await refetch();
      
      // Update the global portfolio store state
      await fetchBalance();
      await fetchDashboard();
      
      setAmount('');
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to ${activeTab}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const paymentMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: 'card-outline', description: '1-3 business days' },
    { id: 'card', name: 'Debit Card', icon: 'card', description: 'Instant' },
    { id: 'wire', name: 'Wire Transfer', icon: 'swap-horizontal', description: 'Same day' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Balance</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['deposit','withdraw'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}>
            <Ionicons name={t === 'deposit' ? 'add-circle-outline' : 'remove-circle-outline'} size={18} color={activeTab === t ? 'white' : theme.colors.text.secondary} />
            <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>{t === 'deposit' ? 'Deposit' : 'Withdraw'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={refetch}
            disabled={loading}
          >
            <Ionicons name="refresh" size={16} color={theme.colors.primary} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selection */}

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          
          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountsContainer}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  amount === quickAmount.toString() && styles.selectedQuickAmount
                ]}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={[
                  styles.quickAmountText,
                  amount === quickAmount.toString() && styles.selectedQuickAmountText
                ]}>
                  ${quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount Input */}
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={theme.colors.text.secondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'deposit' ? 'Deposit Method' : 'Withdrawal Method'}
          </Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                paymentMethod === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodInfo}>
                <View style={styles.paymentMethodIcon}>
                  <Ionicons name={method.icon as any} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  <Text style={styles.paymentMethodDescription}>{method.description}</Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                paymentMethod === method.id && styles.selectedRadioButton
              ]}>
                {paymentMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction Summary */}
        {amount && parseFloat(amount) > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Transaction Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.summaryValue}>{formatCurrency(parseFloat(amount))}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Method</Text>
              <Text style={styles.summaryValue}>
                {paymentMethods.find(m => m.id === paymentMethod)?.name}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processing Time</Text>
              <Text style={styles.summaryValue}>
                {paymentMethods.find(m => m.id === paymentMethod)?.description}
              </Text>
            </View>
            
            {activeTab === 'withdraw' && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remaining Balance</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(balance - parseFloat(amount))}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            activeTab === 'deposit' ? styles.depositButton : styles.withdrawButton,
            (!amount || parseFloat(amount) <= 0 || isProcessing) && styles.disabledButton
          ]}
          onPress={handleTransaction}
          disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
        >
          <Text style={styles.actionButtonText}>
            {isProcessing 
              ? `Processing...` 
              : `${activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} ${amount ? formatCurrency(parseFloat(amount)) : 'Funds'}`
            }
          </Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.disclaimerText}>
            {activeTab === 'deposit' 
              ? 'Deposits are processed securely and may take 1-3 business days to reflect in your account.'
              : 'Withdrawals are subject to verification and may take 1-5 business days to process.'
            }
          </Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refreshText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
    gap: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
  activeTabText: {
    color: 'white',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    alignItems: 'center',
  },
  selectedQuickAmount: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  selectedQuickAmountText: {
    color: 'white',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.secondary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    paddingVertical: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    padding: 16,
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  summaryCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
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
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  depositButton: {
    backgroundColor: theme.colors.accent.avocado,
  },
  withdrawButton: {
    backgroundColor: theme.colors.accent.gamboge,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 80,
  },
  disclaimerText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 16,
    marginLeft: 8,
    flex: 1,
  },
});