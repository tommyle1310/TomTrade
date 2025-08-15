/* eslint-disable */
// scripts/test-utils.ts

import { request, GraphQLClient } from 'graphql-request';
import { PrismaClient } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
const gql = String.raw;
const endpoint = `http://127.0.0.1:${process.env.PORT || 4000}/graphql`;
export const prisma = new PrismaClient();

export async function getTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  // Làm sạch database nếu cần
  const prisma = app.get(PrismaClient);
  await prisma.order.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.portfolio.deleteMany();

  return app;
}

export interface PlaceOrderInput {
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  ticker: string;
  quantity: number;
  price: number;
  status?: string;
}

export async function login(email: string, password: string): Promise<string> {
  const mutation = gql`
    mutation Login($email: String!, $password: String!) {
      login(input: { email: $email, password: $password }) {
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
  const data = await request(endpoint, mutation, { email, password });
  return data.login.accessToken;
}

export async function placeOrder(client: any, input: PlaceOrderInput) {
  const mutation = gql`
    mutation PlaceOrder($input: PlaceOrderInput!) {
      placeOrder(input: $input) {
        id
        side
        type
        ticker
        quantity
        status
        price
        createdAt
      }
    }
  `;
  return client.request(mutation, { input });
}

export async function cancelOrder(client: any, orderId: string) {
  const mutation = gql`
    mutation CancelOrder($orderId: String!) {
      cancelOrder(orderId: $orderId) {
        id
        status
      }
    }
  `;
  return client.request(mutation, { orderId });
}

export async function getOrders(client: any) {
  const query = gql`
    query {
      myOrders {
        id
        side
        ticker
        price
        quantity
        status
        createdAt
      }
    }
  `;
  return client.request(query);
}

export async function getBalance(client: any) {
  const query = gql`
    query {
      getMyBalance
    }
  `;
  return client.request(query);
}

export async function getPortfolio(client: any) {
  const query = gql`
    query {
      myPortfolio {
        ticker
        quantity
        averagePrice
      }
    }
  `;
  return client.request(query);
}

export async function getDashboard(client: any) {
  console.log('🔍 test-utils.getDashboard called');
  console.log('🔍 test-utils.getDashboard client:', client ? 'exists' : 'null');

  const query = gql`
    query {
      getDashboard {
        totalPortfolioValue
        stocksOnlyValue
        cashBalance
        totalPnL
        totalRealizedPnL
        totalUnrealizedPnL
        stockPositions {
          ticker
          quantity
          averageBuyPrice
          currentPrice
          marketValue
          unrealizedPnL
        }
      }
    }
  `;

  try {
    console.log('🔍 test-utils.getDashboard sending GraphQL request...');
    const result = await client.request(query);
    console.log('🔍 test-utils.getDashboard result:', result);
    return result;
  } catch (error) {
    console.error('❌ test-utils.getDashboard error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function getCurrentMarketPrice(
  client: any,
  ticker: string,
): Promise<number> {
  const query = gql`
    query GetStock($ticker: String!) {
      stock(ticker: $ticker) {
        marketData(interval: _1d) {
          close
          timestamp
        }
      }
    }
  `;

  try {
    const result = await client.request(query, { ticker });
    const marketData = result.stock?.marketData;
    if (marketData && marketData.length > 0) {
      // Get the most recent price
      return marketData[0].close;
    }
  } catch (error) {
    console.log(`⚠️ Could not get market price for ${ticker}:`, error.message);
  }

  // Fallback to a default price if market data is not available
  return 0;
}

export async function getDetailedTransactions(client: any) {
  const query = gql`
    query {
      myTransactions {
        id
        action
        shares
        price
        ticker
        timestamp
      }
    }
  `;
  return client.request(query);
}

export async function getTransactions(client: any) {
  const query = gql`
    query {
      myTransactions {
        id
        action
        shares
        price
        ticker
        timestamp
      }
    }
  `;
  return client.request(query);
}

export async function clearOrders() {
  await prisma.order.deleteMany();
  console.log('🧹 Cleared all orders');
}

export async function clearAllTestData() {
  console.log('🧹 Starting comprehensive cleanup...');

  // Clear all test-related data
  await prisma.order.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.balance.deleteMany();
  await prisma.alertSent.deleteMany();
  await prisma.alertRule.deleteMany();

  console.log('✅ Comprehensive cleanup completed');
}

export function createClient(token: string) {
  return new GraphQLClient(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Additional utility functions
export async function seedPortfolio(
  email: string,
  ticker: string,
  quantity: number,
  averagePrice: number,
) {
  const user = await (prisma as any).user.findUnique({ where: { email } });
  if (!user) throw new Error(`User with email ${email} not found`);

  await (prisma as any).portfolio.upsert({
    where: {
      userId_ticker: {
        userId: user.id,
        ticker,
      },
    },
    update: {
      quantity,
      averagePrice,
    },
    create: {
      userId: user.id,
      ticker,
      quantity,
      averagePrice,
      positionType: 'LONG',
    },
  });
  console.log(
    `✅ Seeded portfolio for ${email}: ${quantity} ${ticker} @ ${averagePrice}`,
  );
}

export async function updateBalance(email: string, amount: number) {
  const user = await (prisma as any).user.findUnique({ where: { email } });
  if (!user) throw new Error(`User with email ${email} not found`);

  await (prisma as any).balance.upsert({
    where: { userId: user.id },
    update: { amount },
    create: {
      userId: user.id,
      amount,
    },
  });
  console.log(`✅ Updated balance for ${email}: $${amount}`);
}

export async function getOrderBook(client: any, ticker: string) {
  const query = gql`
    query OrderBook($ticker: String!) {
      orderBook(ticker: $ticker) {
        buyOrders {
          id
          price
          quantity
          createdAt
        }
        sellOrders {
          id
          price
          quantity
          createdAt
        }
      }
    }
  `;
  const result = await client.request(query, { ticker });
  return result.orderBook;
}

export async function resetOrderBook() {
  await prisma.order.deleteMany();
  console.log('🧹 Reset order book (deleted all orders)');
}

export async function gqlRequest(
  query: string,
  variables: any = {},
  token?: string,
) {
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const client = new GraphQLClient(endpoint, { headers });
  return client.request(query, variables);
}

export function calculateExpectedPortfolioValue(
  initialCash: number,
  initialPositions: Array<{
    ticker: string;
    quantity: number;
    averagePrice: number;
  }>,
  trades: Array<{
    side: 'BUY' | 'SELL';
    ticker: string;
    quantity: number;
    price: number;
  }>,
): {
  finalCash: number;
  finalPositions: Array<{
    ticker: string;
    quantity: number;
    averagePrice: number;
  }>;
  totalValue: number;
} {
  let cash = initialCash;
  const positions = new Map<string, { quantity: number; totalCost: number }>();

  // Initialize positions
  for (const pos of initialPositions) {
    positions.set(pos.ticker, {
      quantity: pos.quantity,
      totalCost: pos.quantity * pos.averagePrice,
    });
  }

  // Process trades
  for (const trade of trades) {
    if (trade.side === 'BUY') {
      const cost = trade.quantity * trade.price;
      cash -= cost;

      const existing = positions.get(trade.ticker);
      if (existing) {
        existing.quantity += trade.quantity;
        existing.totalCost += cost;
      } else {
        positions.set(trade.ticker, {
          quantity: trade.quantity,
          totalCost: cost,
        });
      }
    } else {
      // SELL
      const proceeds = trade.quantity * trade.price;
      cash += proceeds;

      const existing = positions.get(trade.ticker);
      if (existing) {
        existing.quantity -= trade.quantity;
        if (existing.quantity <= 0) {
          positions.delete(trade.ticker);
        }
      }
    }
  }

  // Calculate final positions with average prices
  const finalPositions = Array.from(positions.entries()).map(
    ([ticker, pos]) => ({
      ticker,
      quantity: pos.quantity,
      averagePrice: pos.totalCost / pos.quantity,
    }),
  );

  // Calculate total value (assuming current prices = last trade prices)
  let totalValue = cash;
  for (const pos of finalPositions) {
    const lastTrade = trades.filter((t) => t.ticker === pos.ticker).pop();
    const currentPrice = lastTrade ? lastTrade.price : pos.averagePrice;
    totalValue += pos.quantity * currentPrice;
  }

  return { finalCash: cash, finalPositions, totalValue };
}
