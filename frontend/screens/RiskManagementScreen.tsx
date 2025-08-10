import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../theme';
import { useRiskStore } from '../stores';
import { UpdateRiskConfigInput } from '../apollo/types';

const { width, height } = Dimensions.get('window');

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
      Alert.alert('Success', 'Risk configuration updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update risk configuration');
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Gradient Background */}
      {/* <LinearGradient
        colors={[theme.colors.surface.primary, theme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      /> */}

      <SafeAreaView style={styles.safeArea}>
        {/* Modern Header */}
        <BlurView intensity={20} tint="light" style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Risk Management</Text>
            <Text style={styles.headerSubtitle}>Protect your portfolio</Text>
          </View>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={isEditing ? handleCancel : handleEdit}
            disabled={updateLoading}
          >
            <View style={[styles.iconContainer, isEditing && styles.editingIcon]}>
              <Ionicons 
                name={isEditing ? "close" : "create-outline"} 
                size={24} 
                color="#FFFFFF" 
              />
            </View>
          </TouchableOpacity>
        </BlurView>

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
              <BlurView intensity={40} tint="light" style={styles.errorBlur}>
                <Ionicons name="warning" size={24} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
              </BlurView>
            </View>
          )}

          {/* Risk Overview Cards */}
          {riskReport && (
            <View style={styles.overviewSection}>
              <Text style={styles.sectionTitle}>Portfolio Overview</Text>
              
              <View style={styles.overviewGrid}>
                <View style={styles.overviewCard}>
                  <BlurView intensity={40} tint="light" style={styles.cardBlur}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="wallet" size={28} color="#4ECDC4" />
                    </View>
                    <Text style={styles.cardLabel}>Portfolio Value</Text>
                    <Text style={styles.cardValue}>
                      {formatCurrency(riskReport.portfolioValue)}
                    </Text>
                  </BlurView>
                </View>
                
                <View style={styles.overviewCard}>
                  <BlurView intensity={40} tint="light" style={styles.cardBlur}>
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
                  </BlurView>
                </View>
                
                <View style={styles.overviewCard}>
                  <BlurView intensity={40} tint="light" style={styles.cardBlur}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="resize" size={28} color="#FFD93D" />
                    </View>
                    <Text style={styles.cardLabel}>Max Position</Text>
                    <Text style={styles.cardValue}>
                      {formatCurrency(riskReport.maxPositionSize)}
                    </Text>
                  </BlurView>
                </View>
                
                <View style={styles.overviewCard}>
                  <BlurView intensity={40} tint="light" style={styles.cardBlur}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="analytics" size={28} color="#FF6B6B" />
                    </View>
                    <Text style={styles.cardLabel}>Risk Usage</Text>
                    <Text style={[
                      styles.cardValue,
                      { color: getRiskColor(riskReport.portfolioRisk, riskReport.riskConfig.maxPortfolioRisk) }
                    ]}>
                      {formatPercentage((riskReport.portfolioRisk / riskReport.riskConfig.maxPortfolioRisk) * 100)}
                    </Text>
                  </BlurView>
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
                    <LinearGradient
                      colors={['#4ECDC4', '#44A08D']}
                      style={styles.saveGradient}
                    >
                      {updateLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                          <Text style={styles.saveButtonText}>Save</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>

              <BlurView intensity={40} tint="light" style={styles.configContainer}>
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
              </BlurView>
            </View>
          )}

          {/* Risk Guidelines */}
          <View style={styles.guidelinesSection}>
            <Text style={styles.sectionTitle}>Risk Guidelines</Text>
            <BlurView intensity={40} tint="light" style={styles.guidelinesContainer}>
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
            </BlurView>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 0,
    overflow: 'hidden',
  },
  backButton: {
    zIndex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  editingIcon: {
    backgroundColor: 'rgba(255,107,107,0.3)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  editButton: {
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorContainer: {
    marginVertical: 16,
  },
  errorBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    overflow: 'hidden',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  overviewSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  overviewCard: {
    width: (width - 52) / 2,
    height: 120,
  },
  cardBlur: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  cardLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  configSection: {
    marginTop: 32,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  configContainer: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(102,126,234,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  configInfo: {
    flex: 1,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  configDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  configRight: {
    alignItems: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  configInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'right',
    minWidth: 40,
  },
  inputSuffix: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  configValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  valueSuffix: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  guidelinesSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  guidelinesContainer: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
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
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
