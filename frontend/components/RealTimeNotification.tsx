import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface RealTimeNotificationProps {
  isConnected: boolean;
  lastUpdate?: string;
  type?: 'success' | 'warning' | 'error';
  message?: string;
}

export default function RealTimeNotification({ 
  isConnected, 
  lastUpdate, 
  type = 'success',
  message 
}: RealTimeNotificationProps) {
  if (!isConnected) {
    return (
      <View style={[styles.container, styles.disconnected]}>
        <Ionicons name="wifi-outline" size={16} color={theme.colors.text.secondary} />
        <Text style={styles.disconnectedText}>Not connected to real-time updates</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles[type]]}>
      <Ionicons 
        name="wifi" 
        size={16} 
        color={type === 'success' ? theme.colors.accent.avocado : 
               type === 'warning' ? theme.colors.accent.gamboge : 
               theme.colors.accent.folly} 
      />
      <View style={styles.content}>
        <Text style={[styles.text, styles[`${type}Text`]]}>
          {message || 'Real-time updates enabled'}
        </Text>
        {lastUpdate && (
          <Text style={styles.lastUpdate}>Last update: {lastUpdate}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastUpdate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  success: {
    backgroundColor: theme.colors.accent.avocado + '15',
    borderWidth: 1,
    borderColor: theme.colors.accent.avocado + '30',
  },
  successText: {
    color: theme.colors.accent.avocado,
  },
  warning: {
    backgroundColor: theme.colors.accent.gamboge + '15',
    borderWidth: 1,
    borderColor: theme.colors.accent.gamboge + '30',
  },
  warningText: {
    color: theme.colors.accent.gamboge,
  },
  error: {
    backgroundColor: theme.colors.accent.folly + '15',
    borderWidth: 1,
    borderColor: theme.colors.accent.folly + '30',
  },
  errorText: {
    color: theme.colors.accent.folly,
  },
  disconnected: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  disconnectedText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});
