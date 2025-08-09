import { create } from 'zustand';
import { apolloClient } from '../apollo/client';
import { ME_QUERY } from '../apollo/queries';
import { User } from '../apollo/types';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async () => {
    try {
      set({ loading: true, error: null });

      const { data } = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'no-cache', // Always fetch fresh data
      });

      set({
        user: data?.me || null,
        loading: false,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch user details',
      });
    }
  },

  clearUser: () => {
    set({ user: null, error: null });
  },
}));
