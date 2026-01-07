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

export async function getHoldings(page = 1, limit = 10, token?: string) {
  const query = `
    query GetHoldings($input: HoldingPaginationInput!) {
      getHoldings(input: $input) {
        data {
          symbol
          quantity
          avgPrice
          currentPrice
          pnl
          pnlPercent
          side
        }
        total
        page
        totalPages
      }
    }
  `;
  const variables = { input: { page, limit } };
  return gqlRequest<{
    getHoldings: {
      data: {
        symbol: string;
        quantity: number;
        avgPrice: number;
        currentPrice: number;
        pnl: number;
        pnlPercent: number;
        side: string;
      }[];
      total: number;
      page: number;
      totalPages: number;
    };
  }>(query, variables, token);
}

export async function getRecentActivities(page = 1, limit = 20, token?: string) {
  const query = `
    query GetRecentActivities($input: ActivityPaginationInput!) {
      getRecentActivities(input: $input) {
        data {
          type
          timestamp
          ticker
          shares
          avgPrice
          currentPrice
        }
        total
        page
        totalPages
      }
    }
  `;
  const variables = { input: { page, limit } };
  return gqlRequest<{
    getRecentActivities: {
      data: {
        type: string;
        timestamp: string;
        ticker: string;
        shares: number;
        avgPrice: number;
        currentPrice: number;
      }[];
      total: number;
      page: number;
      totalPages: number;
    };
  }>(query, variables, token);
}

export async function getMarketOverview(page = 1, limit = 10, token?: string) {
  const query = `
    query GetMarketOverview($input: MarketOverviewPaginationInput!) {
      getMarketOverview(input: $input) {
        data {
          key
          label
          value
          unit
          trend
        }
        total
        page
        totalPages
      }
    }
  `;
  const variables = { input: { page, limit } };
  return gqlRequest<{
    getMarketOverview: {
      data: {
        key: string;
        label: string;
        value: number;
        unit: string;
        trend: string;
      }[];
      total: number;
      page: number;
      totalPages: number;
    };
  }>(query, variables, token);
}

export async function getTopMovers(page = 1, limit = 10, filter = 'gainers', token?: string) {
  const query = `
    query GetTopMovers($input: TopMoversPaginationInput!) {
      getTopMovers(input: $input) {
        data {
          symbol
          avatar
          value
        }
        total
        page
        totalPages
      }
    }
  `;
  const variables = { input: { page, limit, filter } };
  return gqlRequest<{
    getTopMovers: {
      data: {
        symbol: string;
        avatar: string | null;
        value: number;
      }[];
      total: number;
      page: number;
      totalPages: number;
    };
  }>(query, variables, token);
}

// Trading Order Mutations and Queries

export async function placeOrder(input: {
  ticker: string;
  price: number;
  quantity: number;
  side: string;
  type: string;
  timeInForce: string;
}, token?: string) {
  const mutation = `
    mutation PlaceOrder($input: PlaceOrderInput!) {
      placeOrder(input: $input) {
        id
        ticker
        side
        type
        price
        quantity
        status
        timeInForce
        createdAt
        matchedAt
      }
    }
  `;
  const variables = { input };
  return gqlRequest<{
    placeOrder: {
      id: string;
      ticker: string;
      side: string;
      type: string;
      price: number;
      quantity: number;
      status: string;
      timeInForce: string;
      createdAt: string;
      matchedAt?: string;
    };
  }>(mutation, variables, token);
}

export async function orderBook(ticker: string, token?: string) {
  const query = `
    query OrderBook($ticker: String!) {
      orderBook(ticker: $ticker) {
        buyOrders {
          id
          ticker
          side
          type
          price
          quantity
          status
          timeInForce
          createdAt
        }
        sellOrders {
          id
          ticker
          side
          type
          price
          quantity
          status
          timeInForce
          createdAt
        }
      }
    }
  `;
  const variables = { ticker };
  return gqlRequest<{
    orderBook: {
      buyOrders: Array<{
        id: string;
        ticker: string;
        side: string;
        type: string;
        price: number;
        quantity: number;
        status: string;
        timeInForce: string;
        createdAt: string;
      }>;
      sellOrders: Array<{
        id: string;
        ticker: string;
        side: string;
        type: string;
        price: number;
        quantity: number;
        status: string;
        timeInForce: string;
        createdAt: string;
      }>;
    };
  }>(query, variables, token);
}

export async function myOrders(token?: string) {
  const query = `
    query MyOrders {
      myOrders {
        id
        ticker
        side
        type
        price
        quantity
        status
        timeInForce
        createdAt
        matchedAt
      }
    }
  `;
  return gqlRequest<{
    myOrders: Array<{
      id: string;
      ticker: string;
      side: string;
      type: string;
      price: number;
      quantity: number;
      status: string;
      timeInForce: string;
      createdAt: string;
      matchedAt?: string;
    }>;
  }>(query, {}, token);
}

export async function cancelOrder(orderId: string, token?: string) {
  const mutation = `
    mutation CancelOrder($orderId: String!) {
      cancelOrder(orderId: $orderId) {
        id
        ticker
        side
        type
        price
        quantity
        status
        timeInForce
        createdAt
        matchedAt
      }
    }
  `;
  const variables = { orderId };
  return gqlRequest<{
    cancelOrder: {
      id: string;
      ticker: string;
      side: string;
      type: string;
      price: number;
      quantity: number;
      status: string;
      timeInForce: string;
      createdAt: string;
      matchedAt?: string;
    };
  }>(mutation, variables, token);
}

// Search stocks
export async function searchStocks(query?: string, token?: string) {
  const gqlQuery = `
    query SearchStocks {
      stocks {
        ticker
        companyName
        avatar
        exchange
        sector
        industry
        isTradable
      }
    }
  `;

  const result = await gqlRequest<{
    stocks: Array<{
      ticker: string;
      companyName: string;
      avatar?: string | null;
      exchange: string;
      sector?: string;
      industry?: string;
      isTradable: boolean;
    }>;
  }>(gqlQuery, {}, token);

  // Client-side filtering if query provided
  if (query && result.stocks) {
    const lowerQuery = query.toLowerCase();
    return {
      stocks: result.stocks.filter(
        (stock) =>
          stock.ticker.toLowerCase().includes(lowerQuery) ||
          stock.companyName.toLowerCase().includes(lowerQuery)
      ),
    };
  }

  return result;
}
