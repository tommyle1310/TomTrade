import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useRiskStore } from '../stores';
import { UpdateRiskConfigInput } from '../apollo/types';
import { useToast } from '../components/Toast';



interface RiskManagementScreenProps {
  navigation: any;
}

export default function RiskManagementScreen({ navigation }: RiskManagementScreenProps) {
  const {
    riskConfig,
    riskReport,
    configLoading,
    reportLoading,
    updateLoading,
    error,
    fetchRiskConfig,
    fetchRiskReport,
    updateRiskConfig,
    refreshAll,
    clearError,
  } = useRiskStore();
  
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editedConfig, setEditedConfig] = useState<UpdateRiskConfigInput>({});

  const isLoading = configLoading || reportLoading;

  // Fetch data on component mount
  useEffect(() => {
    fetchRiskConfig();
    fetchRiskReport();
  }, [fetchRiskConfig, fetchRiskReport]);

  // Initialize edited config when risk config is loaded
  useEffect(() => {
    if (riskConfig && !isEditing) {
      setEditedConfig({
        maxPositionSizePercent: riskConfig.maxPositionSizePercent,
        maxRiskPerTrade: riskConfig.maxRiskPerTrade,
        maxPortfolioRisk: riskConfig.maxPortfolioRisk,
        stopLossPercent: riskConfig.stopLossPercent,
        maxLeverage: riskConfig.maxLeverage,
      });
    }
  }, [riskConfig, isEditing]);

  const handleRefresh = () => {
    refreshAll();
  };

  const handleEdit = () => {
    setIsEditing(true);
    clearError();
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (riskConfig) {
      setEditedConfig({
        maxPositionSizePercent: riskConfig.maxPositionSizePercent,
        maxRiskPerTrade: riskConfig.maxRiskPerTrade,
        maxPortfolioRisk: riskConfig.maxPortfolioRisk,
        stopLossPercent: riskConfig.stopLossPercent,
        maxLeverage: riskConfig.maxLeverage,
      });
    }
    clearError();
  };

  const handleSave = async () => {
    try {
      await updateRiskConfig(editedConfig);
      setIsEditing(false);
      showToast({
        type: 'success',
        message: 'Risk configuration updated successfully',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to update risk configuration',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getRiskColor = (risk: number, maxRisk: number) => {
    const percentage = (risk / maxRisk) * 100;
    if (percentage >= 80) return theme.colors.accent.folly;
    if (percentage >= 60) return theme.colors.accent.asparagus;
    return theme.colors.accent.asparagus;
  };

  const renderConfigItem = (
    label: string,
    value: number | undefined,
    key: keyof UpdateRiskConfigInput,
    suffix: string = '%',
    iconName: string = 'settings-outline'
  ) => (
    <View style={styles.configItem}>
      <View style={styles.configLeft}>
        <View style={styles.configIcon}>
          <Ionicons name={iconName as any} size={20} color="#667eea" />
        </View>
        <View style={styles.configInfo}>
          <Text style={styles.configLabel}>{label}</Text>
          <Text style={styles.configDescription}>
            {key === 'maxPositionSizePercent' && 'Maximum % of portfolio per position'}
            {key === 'maxRiskPerTrade' && 'Maximum risk per single trade'}
            {key === 'maxPortfolioRisk' && 'Total portfolio risk limit'}
            {key === 'stopLossPercent' && 'Default stop loss percentage'}
            {key === 'maxLeverage' && 'Maximum leverage multiplier'}
          </Text>
        </View>
      </View>
      
      <View style={styles.configRight}>
        {isEditing ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.configInput}
              value={editedConfig[key]?.toString() || ''}
              onChangeText={(text) => {
                const numValue = parseFloat(text) || 0;
                setEditedConfig(prev => ({ ...prev, [key]: numValue }));
              }}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <Text style={styles.inputSuffix}>{suffix}</Text>
          </View>
        ) : (
          <View style={styles.valueContainer}>
            <Text style={styles.configValue}>
              {value?.toFixed(2)}
            </Text>
            <Text style={styles.valueSuffix}>{suffix}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Risk Management</Text>
        <TouchableOpacity
          onPress={isEditing ? handleCancel : handleEdit}
          disabled={updateLoading}
        >
          <Ionicons 
            name={isEditing ? "close" : "create-outline"} 
            size={24} 
            color={theme.colors.text.primary} 
          />
        </TouchableOpacity>
      </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isLoading} 
              onRefresh={handleRefresh}
              tintColor="#FFFFFF"
              colors={['#667eea']}
            />
          }
        >
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <View style={styles.errorCard}>
                <Ionicons name="warning" size={24} color={theme.colors.accent.folly} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </View>
          )}

          {/* Risk Overview Cards */}
          {riskReport && (
            <View style={styles.overviewSection}>
              <Text style={styles.sectionTitle}>Portfolio Overview</Text>
              
              <View style={styles.overviewGrid}>
                <View style={styles.overviewCard}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="wallet" size={28} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.cardLabel}>Portfolio Value</Text>
                  <Text style={styles.cardValue}>
                    {formatCurrency(riskReport.portfolioValue)}
                  </Text>
                </View>
                
                <View style={styles.overviewCard}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="speedometer" size={28} color={getRiskColor(riskReport.portfolioRisk, riskReport.riskConfig.maxPortfolioRisk)} />
                  </View>
                  <Text style={styles.cardLabel}>Current Risk</Text>
                  <Text style={[
                    styles.cardValue,
                    { color: getRiskColor(riskReport.portfolioRisk, riskReport.riskConfig.maxPortfolioRisk) }
                  ]}>
                    {formatPercentage(riskReport.portfolioRisk)}
                  </Text>
                </View>
                
                <View style={styles.overviewCard}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="resize" size={28} color={theme.colors.accent.gamboge} />
                  </View>
                  <Text style={styles.cardLabel}>Max Position</Text>
                  <Text style={styles.cardValue}>
                    {formatCurrency(riskReport.maxPositionSize)}
                  </Text>
                </View>
                
                <View style={styles.overviewCard}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="analytics" size={28} color={theme.colors.accent.folly} />
                  </View>
                  <Text style={styles.cardLabel}>Risk Usage</Text>
                  <Text style={[
                    styles.cardValue,
                    { color: getRiskColor(riskReport.portfolioRisk, riskReport.riskConfig.maxPortfolioRisk) }
                  ]}>
                    {formatPercentage((riskReport.portfolioRisk / riskReport.riskConfig.maxPortfolioRisk) * 100)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Risk Configuration */}
          {riskConfig && (
            <View style={styles.configSection}>
              <View style={styles.configHeader}>
                <Text style={styles.sectionTitle}>Risk Settings</Text>
                {isEditing && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={18} color="white" />
                        <Text style={styles.saveButtonText}>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.configContainer}>
                {renderConfigItem(
                  'Max Position Size',
                  riskConfig.maxPositionSizePercent,
                  'maxPositionSizePercent',
                  '%',
                  'resize-outline'
                )}
                
                {renderConfigItem(
                  'Max Risk Per Trade',
                  riskConfig.maxRiskPerTrade,
                  'maxRiskPerTrade',
                  '%',
                  'trending-down-outline'
                )}
                
                {renderConfigItem(
                  'Max Portfolio Risk',
                  riskConfig.maxPortfolioRisk,
                  'maxPortfolioRisk',
                  '%',
                  'speedometer-outline'
                )}
                
                {renderConfigItem(
                  'Default Stop Loss',
                  riskConfig.stopLossPercent,
                  'stopLossPercent',
                  '%',
                  'shield-outline'
                )}
                
                {renderConfigItem(
                  'Max Leverage',
                  riskConfig.maxLeverage,
                  'maxLeverage',
                  'x',
                  'layers-outline'
                )}
              </View>
            </View>
          )}

          {/* Risk Guidelines */}
          <View style={styles.guidelinesSection}>
            <Text style={styles.sectionTitle}>Risk Guidelines</Text>
            <View style={styles.guidelinesContainer}>
              {[
                { icon: 'shield-checkmark', color: '#4ECDC4', text: `Keep portfolio risk below ${riskConfig?.maxPortfolioRisk || 20}%` },
                { icon: 'trending-down', color: '#FFD93D', text: 'Use stop losses to limit downside risk' },
                { icon: 'pie-chart', color: '#667eea', text: 'Diversify positions to reduce concentration risk' },
                { icon: 'calculator', color: '#FF6B6B', text: `Never risk more than ${riskConfig?.maxRiskPerTrade || 2}% per trade` },
              ].map((guideline, index) => (
                <View key={index} style={styles.guidelineItem}>
                  <View style={[styles.guidelineIcon, { backgroundColor: `${guideline.color}20` }]}>
                    <Ionicons name={guideline.icon as any} size={20} color={guideline.color} />
                  </View>
                  <Text style={styles.guidelineText}>{guideline.text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
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
  errorContainer: {
    marginBottom: 16,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.accent.folly,
  },
  errorText: {
    color: theme.colors.accent.folly,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  configSection: {
    marginBottom: 24,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  configContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    gap: 20,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  configLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  configIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configInfo: {
    flex: 1,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  configDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  configRight: {
    alignItems: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  configInput: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'right',
    minWidth: 40,
  },
  inputSuffix: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  configValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  valueSuffix: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  guidelinesSection: {
    marginBottom: 20,
  },
  guidelinesContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    gap: 16,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  guidelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelineText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
