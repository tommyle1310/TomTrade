/* eslint-disable */
// scripts/test-utils.ts

import { request, GraphQLClient } from 'graphql-request';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
const gql = String.raw;
const endpoint = 'http://localhost:3000/graphql';
export const prisma = new PrismaClient();

export async function getTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  // Làm sạch database nếu cần
  const prisma = app.get(PrismaService);
  await prisma.$executeRawUnsafe(`DELETE FROM "Order";`);
  await prisma.$executeRawUnsafe(`DELETE FROM "Transaction";`);
  await prisma.$executeRawUnsafe(`DELETE FROM "Portfolio";`);

  return app;
}

export interface PlaceOrderInput {
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  ticker: string;
  quantity: number;
  price: number;
  status?: OrderStatus;
}

export async function login(email: string, password: string): Promise<string> {
  const mutation = gql`
    mutation Login($email: String!, $password: String!) {
      login(input: { email: $email, password: $password }) {
        accessToken
        user {
          id
          email
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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`User with email ${email} not found`);

  await prisma.portfolio.upsert({
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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`User with email ${email} not found`);

  await prisma.balance.upsert({
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
