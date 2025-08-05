import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apolloClient } from '../apollo/client';
import { LOGIN_MUTATION, SIGNUP_MUTATION, ME_QUERY } from '../apollo/queries';
import { User, LoginInput, SignUpInput } from '../apollo/types';

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignUpInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      // Actions
      login: async (input: LoginInput) => {
        try {
          set({ loading: true, error: null });

          const { data } = await apolloClient.mutate({
            mutation: LOGIN_MUTATION,
            variables: { input },
          });

          if (data?.login) {
            const { accessToken, user } = data.login;

            set({
              isAuthenticated: true,
              user,
              token: accessToken,
              loading: false,
              error: null,
            });

            // Store token in AsyncStorage for Apollo client
            await AsyncStorage.setItem('accessToken', accessToken);
          }
        } catch (error: any) {
          set({
            loading: false,
            error: error.message || 'Login failed',
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      signup: async (input: SignUpInput) => {
        try {
          set({ loading: true, error: null });

          const { data } = await apolloClient.mutate({
            mutation: SIGNUP_MUTATION,
            variables: { input },
          });

          if (data?.signUp) {
            const { accessToken, user } = data.signUp;

            set({
              isAuthenticated: true,
              user,
              token: accessToken,
              loading: false,
              error: null,
            });

            // Store token in AsyncStorage for Apollo client
            await AsyncStorage.setItem('accessToken', accessToken);
          }
        } catch (error: any) {
          set({
            loading: false,
            error: error.message || 'Signup failed',
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Clear token from AsyncStorage
          await AsyncStorage.removeItem('accessToken');

          // Clear Apollo cache
          await apolloClient.clearStore();

          set({
            isAuthenticated: false,
            user: null,
            token: null,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      checkAuthStatus: async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');

          if (token) {
            set({ loading: true });

            const { data } = await apolloClient.query({
              query: ME_QUERY,
              fetchPolicy: 'network-only',
            });

            if (data?.me) {
              set({
                isAuthenticated: true,
                user: data.me,
                token,
                loading: false,
                error: null,
              });
            } else {
              // Invalid token, clear it
              await AsyncStorage.removeItem('accessToken');
              set({
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
              });
            }
          } else {
            set({ loading: false });
          }
        } catch (error: any) {
          console.error('Auth check error:', error);
          // Clear invalid token
          await AsyncStorage.removeItem('accessToken');
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data, not loading/error states
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
