/* eslint-disable */
// scripts/test-limit-matching.script.ts

// Using require for compatibility
const { request } = require('graphql-request');
const gql = String.raw;
const { PrismaClient } = require('@prisma/client');

// NOTE: We define the payload types based on the schema.gql file.
const endpoint = 'http://localhost:3000/graphql';

// Create a Prisma client for direct database operations
const prisma = new PrismaClient();

// --- TYPE DEFINITIONS FOR API RESPONSES ---

interface LoginPayload {
  login: {
    accessToken: string;
    user: { id: string; email: string };
  };
}

interface PlaceOrderInput {
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  ticker: string;
  quantity: number;
  price: number;
}

// --- API FUNCTIONS ---

async function login(email: string, password: string): Promise<string> {
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
  const data = await request(endpoint, mutation, {
    email,
    password,
  });
  return data.login.accessToken;
}

async function placeOrder(client: any, input: PlaceOrderInput): Promise<any> {
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
      }
    }
  `;
  return client.request(mutation, { input });
}

async function getPortfolio(client: any): Promise<any> {
  const query = gql`
    query GetMyPortfolio {
      myPortfolio {
        ticker
        quantity
        averagePrice
      }
    }
  `;
  return client.request(query);
}

async function getBalance(client: any): Promise<any> {
  const query = gql`
    query GetMyBalance {
      getMyBalance
    }
  `;
  return client.request(query);
}

async function getOrders(client: any): Promise<any> {
  const query = gql`
    query GetMyOrders {
      myOrders {
        id
        side
        quantity
        price
        status
        ticker
        createdAt
      }
    }
  `;
  return client.request(query);
}

async function getTransactions(client: any): Promise<any> {
  const query = gql`
    query GetMyTransactions {
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

async function clearOrders() {
  await prisma.order.deleteMany();
  console.log('All orders cleared.');
}

async function main() {
  try {
    // Clear existing orders
    await clearOrders();

    // Import GraphQLClient only when needed
    const { GraphQLClient } = require('graphql-request');

    console.log('🔐 Logging in...');
    const buyerToken = await login('buyer@example.com', '123456');
    const sellerToken = await login('seller@example.com', '123456');

    const buyerClient = new GraphQLClient(endpoint, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const sellerClient = new GraphQLClient(endpoint, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });

    console.log('\n💵 Checking balance BEFORE...');
    const buyerBalBefore = await getBalance(buyerClient);
    const sellerBalBefore = await getBalance(sellerClient);
    console.log('Buyer balance:', buyerBalBefore.getMyBalance);
    console.log('Seller balance:', sellerBalBefore.getMyBalance);

    console.log('\n📦 Checking portfolio BEFORE...');
    const buyerPortBefore = await getPortfolio(buyerClient);
    const sellerPortBefore = await getPortfolio(sellerClient);
    console.log(
      'Buyer portfolio:',
      JSON.stringify(buyerPortBefore.myPortfolio, null, 2),
    );
    console.log(
      'Seller portfolio:',
      JSON.stringify(sellerPortBefore.myPortfolio, null, 2),
    );

    console.log('\n🧾 Seller places LIMIT SELL 10 AAPL @ 300...');
    await placeOrder(sellerClient, {
      side: 'SELL',
      type: 'LIMIT',
      ticker: 'AAPL',
      quantity: 10,
      price: 300,
    });

    console.log('\n🛒 Buyer places LIMIT BUY 10 AAPL @ 300...');
    await placeOrder(buyerClient, {
      side: 'BUY',
      type: 'LIMIT',
      ticker: 'AAPL',
      quantity: 10,
      price: 300,
    });

    await new Promise((r) => setTimeout(r, 1000)); // chờ 1s cho server xử lý khớp

    console.log('\n🔍 Checking ORDERS after match...');
    const buyerOrders = await getOrders(buyerClient);
    const sellerOrders = await getOrders(sellerClient);
    console.log(
      '📥 Buyer orders:',
      JSON.stringify(buyerOrders.myOrders, null, 2),
    );
    console.log(
      '📤 Seller orders:',
      JSON.stringify(sellerOrders.myOrders, null, 2),
    );

    console.log('\n💰 Checking BALANCE after match...');
    const buyerBalAfter = await getBalance(buyerClient);
    const sellerBalAfter = await getBalance(sellerClient);
    console.log('Buyer balance:', buyerBalAfter.getMyBalance);
    console.log('Seller balance:', sellerBalAfter.getMyBalance);

    console.log('\n📈 Checking PORTFOLIO after match...');
    const buyerPortAfter = await getPortfolio(buyerClient);
    const sellerPortAfter = await getPortfolio(sellerClient);
    console.log(
      'Buyer portfolio:',
      JSON.stringify(buyerPortAfter.myPortfolio, null, 2),
    );
    console.log(
      'Seller portfolio:',
      JSON.stringify(sellerPortAfter.myPortfolio, null, 2),
    );

    console.log('\n🧾 Checking TRANSACTIONS after match...');
    const buyerTx = await getTransactions(buyerClient);
    const sellerTx = await getTransactions(sellerClient);
    console.log(
      'Buyer transactions:',
      JSON.stringify(buyerTx.myTransactions, null, 2),
    );
    console.log(
      'Seller transactions:',
      JSON.stringify(sellerTx.myTransactions, null, 2),
    );
  } catch (err: any) {
    if (err.response?.errors?.length) {
      console.error(`❌ GraphQL Error: ${err.response.errors[0].message}`);
    } else {
      console.error(`❌ Error: ${err.message || 'Unknown error'}`);
    }
  } finally {
    // Disconnect the Prisma client
    await prisma.$disconnect();
  }
}

// Run the test
main();
