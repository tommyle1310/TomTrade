import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal as RNModal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export type ModalType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

interface ModalContextValue {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);
  const [visible, setVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  const showModal = useCallback((options: ModalOptions) => {
    setModalOptions(options);
    setVisible(true);
    
    // Animate in
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scaleValue]);

  const hideModal = useCallback(() => {
    // Animate out
    Animated.spring(scaleValue, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setModalOptions(null);
    });
  }, [scaleValue]);

  const handleConfirm = useCallback(() => {
    modalOptions?.onConfirm?.();
    hideModal();
  }, [modalOptions, hideModal]);

  const handleCancel = useCallback(() => {
    modalOptions?.onCancel?.();
    hideModal();
  }, [modalOptions, hideModal]);

  const value = useMemo(() => ({ showModal, hideModal }), [showModal, hideModal]);

  const getIconConfig = (type: ModalType) => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: theme.colors.accent.avocado };
      case 'warning':
        return { name: 'alert-circle', color: theme.colors.accent.gamboge };
      case 'error':
        return { name: 'close-circle', color: theme.colors.accent.folly };
      case 'confirm':
        return { name: 'help-circle', color: theme.colors.primary };
      default:
        return { name: 'information-circle', color: theme.colors.primary };
    }
  };

  const getButtonStyle = (type: ModalType) => {
    switch (type) {
      case 'success':
        return styles.successButton;
      case 'warning':
        return styles.warningButton;
      case 'error':
        return styles.errorButton;
      case 'confirm':
        return styles.confirmButton;
      default:
        return styles.infoButton;
    }
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <RNModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} onPress={hideModal} />
          <Animated.View 
            style={[
              styles.modal,
              { transform: [{ scale: scaleValue }] }
            ]}
          >
            {modalOptions && (
              <>
                {/* Header */}
                <View style={styles.header}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: getIconConfig(modalOptions.type || 'info').color + '20' }
                  ]}>
                    <Ionicons
                      name={getIconConfig(modalOptions.type || 'info').name as any}
                      size={32}
                      color={getIconConfig(modalOptions.type || 'info').color}
                    />
                  </View>
                  <Text style={styles.title}>{modalOptions.title}</Text>
                </View>

                {/* Message */}
                <View style={styles.content}>
                  <Text style={styles.message}>{modalOptions.message}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  {modalOptions.showCancel && (
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={handleCancel}
                    >
                      <Text style={styles.cancelButtonText}>
                        {modalOptions.cancelText || 'Cancel'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      getButtonStyle(modalOptions.type || 'info'),
                      modalOptions.showCancel && styles.confirmButtonWithCancel
                    ]}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>
                      {modalOptions.confirmText || 'OK'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </RNModal>
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonWithCancel: {
    flex: 1,
  },
  infoButton: {
    backgroundColor: theme.colors.primary,
  },
  successButton: {
    backgroundColor: theme.colors.accent.avocado,
  },
  warningButton: {
    backgroundColor: theme.colors.accent.gamboge,
  },
  errorButton: {
    backgroundColor: theme.colors.accent.folly,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
