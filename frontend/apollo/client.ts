import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';

// HTTP Link
const httpLink = createHttpLink({
  uri: 'http://172.30.160.1:3000/graphql', // Update with your backend URL
});

// Auth Link
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  } catch (error) {
    console.error('Error getting token:', error);
    return { headers };
  }
});

// Error Link
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }

    if (networkError) {
      console.error(`Network error: ${networkError}`);

      // Handle 401 errors by clearing token and redirecting to login
      if (networkError.statusCode === 401) {
        AsyncStorage.removeItem('accessToken');
        // You can add navigation logic here if needed
      }
    }
  }
);

// Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          myOrders: {
            merge: false, // Replace the array instead of merging
          },
          myTransactions: {
            merge: false,
          },
          myPortfolio: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Token management utilities
export const tokenManager = {
  async setToken(token: string) {
    try {
      await AsyncStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.removeItem('accessToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
};
