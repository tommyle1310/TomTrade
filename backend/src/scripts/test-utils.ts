/* eslint-disable */
// scripts/test-utils.ts

import { request, GraphQLClient } from 'graphql-request';
import { OrderStatus, PrismaClient } from '@prisma/client';

const gql = String.raw;
const endpoint = 'http://localhost:3000/graphql';
export const prisma = new PrismaClient();

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
