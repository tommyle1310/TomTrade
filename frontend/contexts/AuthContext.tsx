import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, LoginInput, SignUpInput } from '../apollo/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignUpInput) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    signup,
    logout,
    checkAuthStatus,
    clearError,
  } = useAuthStore();

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Alternative: Direct Zustand hook (can be used instead of useAuth)
export { useAuthStore };