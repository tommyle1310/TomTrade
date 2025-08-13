import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../theme';

// Utility function to calculate relative time
const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const created = new Date(timestamp);
  const diffMs = now.getTime() - created.getTime();
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  durationMs?: number;
  createdAt?: string;
}

interface ToastItem extends ToastOptions {
  id: string;
  animated: Animated.Value;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const animated = new Animated.Value(0);
    const toast: ToastItem = {
      id,
      animated,
      message: options.message,
      type: options.type ?? 'info',
      durationMs: options.durationMs ?? 2800,
      createdAt: options.createdAt,
    };

    setToasts((prev) => [toast, ...prev]);

    // slide in
    Animated.timing(animated, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // auto hide
    const hideAfter = (options.durationMs ?? 2800) - 200;
    setTimeout(() => {
      Animated.timing(animated, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) removeToast(id);
      });
    }, Math.max(hideAfter, 600));
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={styles.portal}>
        {toasts.map((t, index) => {
          const translateY = t.animated.interpolate({
            inputRange: [0, 1],
            outputRange: [-10, 0],
          });
          const opacity = t.animated;
          return (
            <Animated.View
              key={t.id}
              style={[
                styles.toast,
                styles[`variant_${t.type}` as keyof typeof styles],
                {
                  transform: [{ translateY }],
                  opacity,
                  top: index * 60,
                  backgroundColor: colors.background.secondary,
                },
              ]}
            >
              <View style={[
                  styles.iconWrap,
                  {
                    backgroundColor: t.type === 'success'
                      ? theme.colors.accent.avocado
                      : t.type === 'warning'
                      ? theme.colors.accent.gamboge
                      : t.type === 'error'
                      ? theme.colors.accent.folly
                      : theme.colors.primary,
                  }
                ]}>
                <Ionicons
                  name={
                    t.type === 'success'
                      ? 'checkmark-circle'
                      : t.type === 'warning'
                      ? 'alert-circle'
                      : t.type === 'error'
                      ? 'close-circle'
                      : 'information-circle'
                  }
                  size={18}
                  color={
                    colors.background.secondary
                  }
                />
              </View>
              <View style={styles.messageContainer}>
                <Text numberOfLines={2} style={styles.message}>
                  {t.message}
                </Text>
                {t.createdAt && (
                  <Text style={styles.timestamp}>
                    {getRelativeTime(t.createdAt)}
                  </Text>
                )}
              </View>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  portal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 60,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.background.secondary,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    borderColor: colors.accent.avocado,
    backgroundColor: theme.colors.background.primary,
    marginRight: 10,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  timestamp: {
    color: theme.colors.text.secondary,
    fontSize: 11,
    fontWeight: '400',
  } as any,
  variant_success: {
    borderWidth: 1,
    borderColor: theme.colors.accent.avocado + '40',
    backgroundColor: theme.colors.accent.avocado + '15',
  },
  variant_warning: {
    borderWidth: 1,
    borderColor: theme.colors.accent.gamboge + '40',
    backgroundColor: theme.colors.accent.gamboge + '12',
  },
  variant_error: {
    borderWidth: 1,
    borderColor: theme.colors.accent.folly + '40',
    backgroundColor: theme.colors.accent.folly + '12',
  },
  variant_info: {
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    backgroundColor: theme.colors.background.secondary,
  },
});


