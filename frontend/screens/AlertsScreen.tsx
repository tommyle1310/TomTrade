import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../components/Toast';
import { useModal } from '../components/Modal';


import { useQuery, useMutation } from '@apollo/client';
import { theme } from '../theme';
import { 
  GET_MY_ALERT_RULES, 
  CREATE_ALERT_RULE, 
  DELETE_ALERT_RULE 
} from '../apollo/queries';
import { AlertRule, CreateAlertRuleInput, AlertRuleType } from '../apollo/types';

interface AlertsScreenProps {
  navigation: any;
}

export default function AlertsScreen({ navigation }: AlertsScreenProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    ticker: '',
    ruleType: AlertRuleType.PRICE_ABOVE,
    targetValue: '',
  });
  
  const { showToast } = useToast();
  const { showModal } = useModal();

  const { data, loading, refetch } = useQuery<{getMyAlertRules: AlertRule[]}>(GET_MY_ALERT_RULES);
  const [createAlert, { loading: creating }] = useMutation(CREATE_ALERT_RULE);
  const [deleteAlert, { loading: deleting }] = useMutation(DELETE_ALERT_RULE);

  const alerts = data?.getMyAlertRules || [];

  const ruleTypes = [
    { value: AlertRuleType.PRICE_ABOVE, label: 'Price Above', icon: 'trending-up' },
    { value: AlertRuleType.PRICE_BELOW, label: 'Price Below', icon: 'trending-down' },
    { value: AlertRuleType.VOLUME_SPIKE, label: 'Volume Spike', icon: 'bar-chart' },
    { value: AlertRuleType.PERCENT_CHANGE, label: 'Percent Change', icon: 'analytics' },
  ];

  const handleCreateAlert = async () => {
    if (!newAlert.ticker || !newAlert.targetValue) {
      showToast({
        type: 'error',
        message: 'Please fill in all fields',
      });
      return;
    }

    try {
      const input: CreateAlertRuleInput = {
        ticker: newAlert.ticker.toUpperCase(),
        ruleType: newAlert.ruleType,
        targetValue: parseFloat(newAlert.targetValue),
      };

      await createAlert({
        variables: { input },
        refetchQueries: [{ query: GET_MY_ALERT_RULES }],
      });

      setNewAlert({ ticker: '', ruleType: AlertRuleType.PRICE_ABOVE, targetValue: '' });
      setShowCreateModal(false);
      showToast({
        type: 'success',
        message: 'Alert created successfully',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to create alert',
      });
    }
  };

  const handleDeleteAlert = async (alertId: string, ticker: string) => {
    showModal({
      title: 'Delete Alert',
      message: `Delete alert for ${ticker}?`,
      type: 'confirm',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        try {
          await deleteAlert({
            variables: { id: alertId },
            refetchQueries: [{ query: GET_MY_ALERT_RULES }],
          });
          showToast({
            type: 'success',
            message: 'Alert deleted successfully',
          });
        } catch (error: any) {
          showToast({
            type: 'error',
            message: error.message || 'Failed to delete alert',
          });
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRuleTypeInfo = (ruleType: string) => {
    return ruleTypes.find(type => type.value === ruleType) || ruleTypes[0];
  };

  const getRuleDescription = (alert: AlertRule) => {
    const ruleInfo = getRuleTypeInfo(alert.ruleType);
    switch (alert.ruleType) {
      case AlertRuleType.PRICE_ABOVE:
        return `Alert when price goes above ${formatCurrency(alert.targetValue)}`;
      case AlertRuleType.PRICE_BELOW:
        return `Alert when price goes below ${formatCurrency(alert.targetValue)}`;
      case AlertRuleType.VOLUME_SPIKE:
        return `Alert when volume spikes above ${alert.targetValue}x average`;
      case AlertRuleType.PERCENT_CHANGE:
        return `Alert when price changes by ${alert.targetValue}%`;
      default:
        return `Alert when ${ruleInfo.label.toLowerCase()} reaches ${alert.targetValue}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Alerts</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Alerts */}
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            const ruleInfo = getRuleTypeInfo(alert.ruleType);
            return (
              <View key={alert.id} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertTitleContainer}>
                      <View style={[styles.alertIcon, { backgroundColor: `${ruleInfo.value === AlertRuleType.PRICE_ABOVE ? '#4ECDC4' : ruleInfo.value === AlertRuleType.PRICE_BELOW ? '#FF6B6B' : '#FFD93D'}20` }]}>
                        <Ionicons 
                          name={ruleInfo.icon as any} 
                          size={24} 
                          color={ruleInfo.value === AlertRuleType.PRICE_ABOVE ? '#4ECDC4' : ruleInfo.value === AlertRuleType.PRICE_BELOW ? '#FF6B6B' : '#FFD93D'} 
                        />
                      </View>
                      <View style={styles.alertInfo}>
                        <Text style={styles.alertTicker}>{alert.ticker}</Text>
                        <Text style={styles.alertType}>{ruleInfo.label}</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAlert(alert.id, alert.ticker)}
                      disabled={deleting}
                    >
                      <View style={styles.deleteIconContainer}>
                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.alertDetails}>
                    <Text style={styles.alertDescription}>
                      {getRuleDescription(alert)}
                    </Text>
                    <Text style={styles.alertDate}>
                      Created {formatDate(alert.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.alertFooter}>
                    <View style={styles.alertStatus}>
                      <View style={styles.statusIndicator} />
                      <Text style={styles.statusText}>Active</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => navigation.navigate('StockDetail', { ticker: alert.ticker })}
                    >
                      <Text style={styles.editButtonText}>View Stock</Text>
                    </TouchableOpacity>
                  </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateCard}>
              <Ionicons name="notifications-outline" size={64} color={theme.colors.text.secondary} />
              <Text style={styles.emptyStateTitle}>No Alerts Set</Text>
              <Text style={styles.emptyStateText}>
                Create price alerts to get notified when your stocks hit target prices
              </Text>
              <TouchableOpacity 
                style={styles.createFirstButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createFirstButtonText}>Create Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Create Alert Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Alert</Text>
            <TouchableOpacity 
              onPress={handleCreateAlert}
              disabled={creating}
            >
              <Text style={[
                styles.modalSaveText,
                creating && styles.disabledText
              ]}>
                {creating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Stock Symbol */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Stock Symbol</Text>
              <View style={styles.stockInputContainer}>
                <TextInput
                  style={[styles.textInput, styles.stockInput]}
                  placeholder="e.g., AAPL"
                  placeholderTextColor={theme.colors.text.secondary}
                  value={newAlert.ticker}
                  onChangeText={(text) => setNewAlert({ ...newAlert, ticker: text.toUpperCase() })}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.stockPickerButton}
                  onPress={() => {
                    navigation.navigate('StockPicker', {
                      onSelect: (ticker: string) => {
                        setNewAlert({ ...newAlert, ticker });
                      },
                    });
                  }}
                >
                  <Ionicons name="search" size={20} color={theme.colors.primary} />
                  <Text style={styles.stockPickerButtonText}>Browse</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Alert Type */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Alert Type</Text>
              {ruleTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.ruleTypeOption,
                    newAlert.ruleType === type.value && styles.selectedRuleType
                  ]}
                  onPress={() => setNewAlert({ ...newAlert, ruleType: type.value })}
                >
                  <View style={styles.ruleTypeInfo}>
                    <Ionicons 
                      name={type.icon as any} 
                      size={20} 
                      color={newAlert.ruleType === type.value ? theme.colors.primary : theme.colors.text.secondary} 
                    />
                    <Text style={[
                      styles.ruleTypeLabel,
                      newAlert.ruleType === type.value && styles.selectedRuleTypeLabel
                    ]}>
                      {type.label}
                    </Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    newAlert.ruleType === type.value && styles.selectedRadioButton
                  ]}>
                    {newAlert.ruleType === type.value && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Target Value */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                Target Value {(newAlert.ruleType.includes('PRICE') || newAlert.ruleType === 'PERCENT_CHANGE') && '($)'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={newAlert.ruleType.includes('PRICE') ? '0.00' : '0'}
                placeholderTextColor={theme.colors.text.secondary}
                value={newAlert.targetValue}
                onChangeText={(text) => setNewAlert({ ...newAlert, targetValue: text })}
                keyboardType="numeric"
              />
            </View>

            {/* Preview */}
            {newAlert.ticker && newAlert.targetValue && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Alert Preview</Text>
                <Text style={styles.previewText}>
                  You'll be notified when {newAlert.ticker} {getRuleDescription({
                    ...newAlert,
                    targetValue: parseFloat(newAlert.targetValue),
                  } as AlertRule).toLowerCase()}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  alertCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  alertTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertInfo: {
    flex: 1,
  },
  alertTicker: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  alertType: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  deleteIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.accent.folly}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertDetails: {
    marginBottom: 16,
  },
  alertDescription: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  alertDate: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent.avocado,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.accent.avocado,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    maxWidth: '90%',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createFirstButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  bottomSpacing: {
    height: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  modalCancelText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  modalSaveText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.6,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  stockInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  stockInput: {
    flex: 1,
  },
  stockPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  stockPickerButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  ruleTypeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    padding: 16,
    marginBottom: 8,
  },
  selectedRuleType: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  ruleTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ruleTypeLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  selectedRuleTypeLabel: {
    color: theme.colors.primary,
    fontWeight: '600',
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
  previewCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});