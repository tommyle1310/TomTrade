import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';

interface OTPScreenProps {
  navigation: any;
  route: any;
}

export default function OTPScreen({ navigation, route }: OTPScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { phoneNumber } = route.params || {};
  const { login } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogIn = () => {
    // Authenticate the user
    login();
    // The navigation will be handled automatically by AppNavigator
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(['', '', '', '']);
    console.log('Resend OTP');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '0123456789';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1$2$3');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with pattern background */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.patternBackground}>
          {/* Food pattern icons */}
          <View style={styles.patternGrid}>
            {Array.from({ length: 20 }).map((_, index) => (
              <View key={index} style={styles.patternIcon}>
                <Ionicons 
                  name={['pizza-outline', 'ice-cream-outline', 'wine-outline', 'cafe-outline'][index % 4] as any} 
                  size={24} 
                  color="rgba(255, 255, 255, 0.3)" 
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>OTP</Text>

          {/* OTP Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>Enter OTP Sent to </Text>
            <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}.</Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          {/* Log In Button */}
          <TouchableOpacity 
            style={[
              styles.logInButton,
              otp.every(digit => digit) ? null : styles.buttonDisabled
            ]}
            onPress={handleLogIn}
            disabled={!otp.every(digit => digit)}
          >
            <Text style={styles.logInButtonText}>Log in</Text>
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't Recieve the OTP </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            )}
          </View>
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
    height: 200,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing[4],
    left: theme.spacing[4],
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternBackground: {
    flex: 1,
    backgroundColor: theme.colors.accent.gamboge,
    borderBottomLeftRadius: theme.borderRadius['3xl'],
    borderBottomRightRadius: theme.borderRadius['3xl'],
    overflow: 'hidden',
  },
  patternGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing[4],
    paddingTop: theme.spacing[16],
  },
  patternIcon: {
    width: '20%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginTop: -theme.spacing[8],
  },
  formContainer: {
    backgroundColor: theme.colors.surface.primary,
    marginHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[6],
    ...theme.shadows.lg,
  },
  title: {
    ...theme.typography.heading.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[8],
    textAlign: 'left',
  },
  descriptionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: theme.spacing[8],
  },
  descriptionText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  phoneNumber: {
    ...theme.typography.body.medium,
    color: theme.colors.accent.gamboge,
    fontWeight: theme.fontWeight.semiBold,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[8],
    paddingHorizontal: theme.spacing[4],
  },
  otpInput: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.secondary,
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.bold,
  },
  otpInputFilled: {
    backgroundColor: theme.colors.accent.gamboge,
    color: theme.colors.text.inverse,
  },
  logInButton: {
    backgroundColor: theme.colors.accent.gamboge,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
    marginBottom: theme.spacing[6],
    ...theme.shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  logInButtonText: {
    ...theme.typography.button.large,
    color: theme.colors.text.inverse,
    fontWeight: theme.fontWeight.semiBold,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resendText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
  },
  timerText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.tertiary,
  },
  resendLink: {
    ...theme.typography.body.medium,
    color: theme.colors.accent.gamboge,
    fontWeight: theme.fontWeight.semiBold,
  },
});