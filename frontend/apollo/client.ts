import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// HTTP Link
// console.log('process.env', process.env);
// console.log('Constants.expoConfig?.extra', Constants.expoConfig?.extra);

// Try both methods: process.env (for web) and Constants.expoConfig.extra (for native)
const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
  'localhost';
const backendPort =
  process.env.EXPO_PUBLIC_BACKEND_PORT ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_PORT ||
  '4000';
const graphqlUri = `http://${backendUrl}:${backendPort}/graphql`;
console.log('ehck graphqlUri', graphqlUri);
// console.log('Apollo Client Configuration:', {
//   backendUrl,
//   backendPort,
//   graphqlUri,
//   'process.env.EXPO_PUBLIC_BACKEND_URL': process.env.EXPO_PUBLIC_BACKEND_URL,
//   'Constants.expoConfig?.extra': Constants.expoConfig?.extra,
// });

const httpLink = createHttpLink({
  uri: graphqlUri,
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
      if ('statusCode' in networkError && networkError.statusCode === 401) {
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
