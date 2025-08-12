import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginMutation, signUpMutation } from './graphqlClient';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name?: string | null;
  email: string;
  role: UserRole;
  avatar?: string | null;
  createdAt: Date;
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;

  // Computed getters
  isAdmin: () => boolean;
  isUser: () => boolean;
  getUserDisplayName: () => string;
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
      initialized: false,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });

          const { login } = await loginMutation({ email, password });

          if (login?.accessToken && login.user) {
            const user: User = {
              id: login.user.id,
              name: login.user.name,
              email: login.user.email,
              role: login.user.role as UserRole,
              avatar: login.user.avatar,
              createdAt: new Date(login.user.createdAt || Date.now()),
            };

            set({
              isAuthenticated: true,
              user,
              token: login.accessToken,
              loading: false,
              error: null,
            });

            // Store token in localStorage
            localStorage.setItem('accessToken', login.accessToken);
          } else {
            throw new Error('Invalid login response');
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

      signup: async (name: string, email: string, password: string) => {
        try {
          set({ loading: true, error: null });

          const { signUp } = await signUpMutation({ name, email, password });

          if (signUp?.accessToken && signUp.user) {
            const user: User = {
              id: signUp.user.id,
              name: signUp.user.name,
              email: signUp.user.email,
              role: signUp.user.role as UserRole,
              avatar: signUp.user.avatar,
              createdAt: new Date(signUp.user.createdAt || Date.now()),
            };

            set({
              isAuthenticated: true,
              user,
              token: signUp.accessToken,
              loading: false,
              error: null,
            });

            // Store token in localStorage
            localStorage.setItem('accessToken', signUp.accessToken);
          } else {
            throw new Error('Invalid signup response');
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

      logout: () => {
        // Clear token from localStorage
        localStorage.removeItem('accessToken');

        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ loading }),

      initialize: () => {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          set({ token: storedToken, initialized: true });
        } else {
          set({ initialized: true });
        }
      },

      // Computed getters
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN';
      },

      isUser: () => {
        const { user } = get();
        return user?.role === 'USER';
      },

      getUserDisplayName: () => {
        const { user } = get();
        if (!user) return '';

        // Use name if available, otherwise extract from email
        if (user.name) {
          return user.name;
        }

        // Extract name from email (everything before @)
        const emailPrefix = user.email.split('@')[0];
        return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data, not loading/error states
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        initialized: state.initialized,
      }),
    }
  )
);
