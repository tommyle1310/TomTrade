import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';

interface SettingsScreenProps {
  navigation?: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const { logout } = useAuth();

  const settingSections = [
    {
      title: 'Account',
      items: [
        { id: 'profile', title: 'Profile Settings', subtitle: 'Manage your personal information', icon: 'person-outline', type: 'navigation' },
        { id: 'security', title: 'Security', subtitle: 'Password and authentication', icon: 'shield-outline', type: 'navigation' },
        { id: 'privacy', title: 'Privacy', subtitle: 'Data and privacy controls', icon: 'lock-closed-outline', type: 'navigation' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { id: 'notifications', title: 'Push Notifications', subtitle: 'Receive alerts and updates', icon: 'notifications-outline', type: 'toggle', value: notifications, onToggle: setNotifications },
        { id: 'darkMode', title: 'Dark Mode', subtitle: 'Switch to dark theme', icon: 'moon-outline', type: 'toggle', value: darkMode, onToggle: setDarkMode },
        { id: 'biometric', title: 'Biometric Login', subtitle: 'Use fingerprint or face ID', icon: 'finger-print-outline', type: 'toggle', value: biometric, onToggle: setBiometric },
        { id: 'autoSync', title: 'Auto Sync', subtitle: 'Automatically sync data', icon: 'sync-outline', type: 'toggle', value: autoSync, onToggle: setAutoSync },
      ]
    },
    {
      title: 'Trading',
      items: [
        { id: 'portfolio', title: 'Portfolio', subtitle: 'View your investments', icon: 'pie-chart-outline', type: 'navigation', screen: 'Portfolio' },
        { id: 'orders', title: 'Orders', subtitle: 'Manage your orders', icon: 'receipt-outline', type: 'navigation', screen: 'Orders' },
        { id: 'alerts', title: 'Price Alerts', subtitle: 'Manage price notifications', icon: 'alarm-outline', type: 'navigation', screen: 'Alerts' },
        { id: 'balance', title: 'Balance', subtitle: 'Deposit and withdraw funds', icon: 'wallet-outline', type: 'navigation', screen: 'Balance' },
      ]
    },
    {
      title: 'Support',
      items: [
        { id: 'help', title: 'Help Center', subtitle: 'FAQs and support articles', icon: 'help-circle-outline', type: 'navigation' },
        { id: 'contact', title: 'Contact Support', subtitle: 'Get help from our team', icon: 'chatbubble-outline', type: 'navigation' },
        { id: 'feedback', title: 'Send Feedback', subtitle: 'Help us improve the app', icon: 'star-outline', type: 'navigation' },
      ]
    },
    {
      title: 'About',
      items: [
        { id: 'version', title: 'App Version', subtitle: '1.2.3 (Build 456)', icon: 'information-circle-outline', type: 'info' },
        { id: 'terms', title: 'Terms of Service', subtitle: 'Legal terms and conditions', icon: 'document-text-outline', type: 'navigation' },
        { id: 'privacy-policy', title: 'Privacy Policy', subtitle: 'How we handle your data', icon: 'shield-checkmark-outline', type: 'navigation' },
      ]
    }
  ];

  const handleNavigation = (item: any) => {
    if (item.screen && navigation) {
      navigation.navigate(item.screen);
    }
  };

  const renderSettingItem = (item: any) => {
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.settingItem}
        disabled={item.type === 'info'}
        onPress={() => item.type === 'navigation' && handleNavigation(item)}
      >
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <View style={styles.settingRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: theme.colors.border.primary, true: `${theme.colors.primary}40` }}
              thumbColor={item.value ? theme.colors.primary : theme.colors.surface.primary}
            />
          )}
          {item.type === 'navigation' && (
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <TouchableOpacity style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
            <View style={styles.profileBadge}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent.asparagus} />
              <Text style={styles.profileBadgeText}>Verified</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
        </TouchableOpacity>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            // Navigate to auth screen
            logout()
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.accent.folly} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
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
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
  },
  profileCard: {
    ...theme.components.card.base,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[4],
  },
  profileInitials: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.inverse,
    fontWeight: theme.fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...theme.typography.heading.h5,
    color: theme.colors.text.primary,
  },
  profileEmail: {
    ...theme.typography.body.small,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[0.5],
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing[2],
    gap: theme.spacing[1],
  },
  profileBadgeText: {
    ...theme.typography.caption.medium,
    color: theme.colors.accent.asparagus,
    fontWeight: theme.fontWeight.medium,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    ...theme.typography.label.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
    marginLeft: theme.spacing[2],
    textTransform: 'uppercase',
  },
  sectionCard: {
    ...theme.components.card.base,
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[4],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...theme.typography.body.medium,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  settingSubtitle: {
    ...theme.typography.caption.medium,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[0.5],
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border.primary,
    marginLeft: theme.spacing[14],
  },
  logoutButton: {
    ...theme.components.card.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[4],
    backgroundColor: `rgb(249, 244, 245)`,
    borderColor: theme.colors.accent.folly,
    borderWidth: 1,
    gap: theme.spacing[2],
  },
  logoutText: {
    ...theme.typography.button.medium,
    color: theme.colors.accent.folly,
    fontWeight: theme.fontWeight.semiBold,
  },
  bottomSpacer: {
    height: theme.spacing[20],
  },
});