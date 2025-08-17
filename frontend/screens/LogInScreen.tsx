import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

interface LogInScreenProps {
  navigation: any;
}

export default function LogInScreen({ navigation }: LogInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, error } = useAuth();
  const { showToast } = useToast();

  const handleLogIn = async () => {
    if (!email || !password) {
      showToast({
        type: 'error',
        message: 'Please fill in all fields',
      });
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      // Navigation will be handled by AuthContext
    } catch (err) {
      showToast({
        type: 'error',
        message: error || 'Please check your credentials',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with trading pattern background */}
      <View style={styles.header}>
        <View style={styles.patternBackground}>
          {/* Trading pattern icons */}
          <View style={styles.patternGrid}>
            {Array.from({ length: 20 }).map((_, index) => (
              <View key={index} style={styles.patternIcon}>
                <Ionicons 
                  name={['trending-up-outline', 'trending-down-outline', 'pie-chart-outline', 'bar-chart-outline'][index % 4] as any} 
                  size={24} 
                  color="rgba(255, 255, 255, 0.3)" 
                />
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Welcome to TomTrade</Text>
          <Text style={styles.subtitle}>Your gateway to smart trading</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Sign In</Text>
          <Text style={styles.formSubtitle}>Enter your credentials to access your account</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.text.secondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.text.secondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={theme.colors.text.secondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity 
            style={[styles.signInButton, loading && styles.disabledButton]} 
            onPress={handleLogIn}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo Login Button */}
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => {
              setEmail('demo@example.com');
              setPassword('password123');
            }}
          >
            <Ionicons name="play-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.demoButtonText}>Use Demo Account</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => {
              setEmail('buyer2@example.com');
              setPassword('123456');
            }}
          >
            <Ionicons name="play-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.demoButtonText}>Use Buỷe Account</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => {
              setEmail('admin@example.com');
              setPassword('admin123');
            }}
          >
            <Ionicons name="play-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.demoButtonText}>Use Admin Account</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
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
    overflow: 'hidden',
  },
  patternBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.3,
    transform: [{ rotate: '15deg' }],
    marginTop: -50,
    marginLeft: -50,
  },
  patternIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  formContainer: {
    padding: 24,
    paddingTop: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  eyeIcon: {
    padding: 4,
  },
  signInButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.primary,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: 24,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signUpText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  signUpLink: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});