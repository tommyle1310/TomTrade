import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';

// Load Apollo Client error messages in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  loadDevMessages();
  loadErrorMessages();
}

const backendHost = process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost';
const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || '4000';
export const GRAPHQL_URL = `http://${backendHost}:${backendPort}/graphql`;

// Create HTTP link
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include',
});

// Create auth link to add token to headers
const authLink = setContext((_, { headers }) => {
  // Get token from localStorage if available
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create error link for better error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

// Create Apollo Client
export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Legacy gqlRequest function for backward compatibility
export type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string
): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const rawText = await res.text();
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Expected JSON from ${GRAPHQL_URL} but received '${contentType}'. Status ${
        res.status
      }. Body starts with: ${rawText.slice(
        0,
        80
      )}... Check NEXT_PUBLIC_BACKEND_URL/PORT and that /graphql is reachable.`
    );
  }
  const json = JSON.parse(rawText) as GraphQLResponse<T>;
  if (!res.ok || json.errors) {
    const message =
      json.errors?.map((e) => e.message).join('; ') || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return json.data as T;
}

export async function loginMutation(input: {
  email: string;
  password: string;
}) {
  const query = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
        user { 
          id 
          name
          email 
          role 
          avatar 
          createdAt 
        }
      }
    }
  `;
  return gqlRequest<{
    login: {
      accessToken: string;
      user: {
        id: string;
        name?: string | null;
        email: string;
        role: string;
        avatar?: string | null;
        createdAt: string;
      };
    };
  }>(query, { input });
}

export async function signUpMutation(input: {
  name?: string;
  email: string;
  password: string;
}) {
  const query = `
    mutation SignUp($input: SignUpInput!) {
      signUp(input: $input) {
        accessToken
        user { 
          id 
          name
          email 
          role 
          avatar 
          createdAt 
        }
      }
    }
  `;
  return gqlRequest<{
    signUp: {
      accessToken: string;
      user: {
        id: string;
        name?: string | null;
        email: string;
        role: string;
        avatar?: string | null;
        createdAt: string;
      };
    };
  }>(query, { input });
}

export async function getUserMetricCards(token?: string) {
  const query = `
    query GetUserMetricCards {
      getUserMetricCards {
        title
        value
        valueUnit
        valueType
        change
        changeType
        changeExtraData
        extraData
      }
    }
  `;
  return gqlRequest<{
    getUserMetricCards: {
      title: string;
      value: string;
      valueUnit?: string | null;
      valueType?: string | null;
      change?: number | null;
      changeType?: string | null;
      changeExtraData?: string | null;
      extraData?: string | null;
    }[];
  }>(query, {}, token);
}
