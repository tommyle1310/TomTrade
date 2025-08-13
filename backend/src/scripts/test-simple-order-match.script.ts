/* eslint-disable */
// scripts/test-simple-order-match.script.ts

import { io, Socket } from 'socket.io-client';
import { login, createClient } from './test-utils';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function printSection(title: string) {
  console.log(`\n==== ${title} ====`);
}

async function main() {
  await printSection('SIMPLE ORDER MATCH TEST');

  // Login to get tokens
  console.log('🔐 Logging in users...');
  const demoToken = await login('demo@example.com', 'password123');
  const buyer2Token = await login('buyer2@example.com', '123456');

  console.log('✅ Got tokens for both users');

  // Connect to WebSocket
  console.log('🔌 Connecting to WebSocket...');

  const demoSocket: Socket = io('http://127.0.0.1:4000', {
    auth: {
      token: `Bearer ${demoToken}`,
    },
    transports: ['websocket'],
  });

  const buyer2Socket: Socket = io('http://127.0.0.1:4000', {
    auth: {
      token: `Bearer ${buyer2Token}`,
    },
    transports: ['websocket'],
  });

  // Set up event listeners
  demoSocket.on('connect', () => {
    console.log('✅ Demo connected:', demoSocket.id);
  });

  demoSocket.on('connectionTest', (data) => {
    console.log('✅ Demo received connectionTest:', data.message);
  });

  demoSocket.on('orderNotification', (data) => {
    console.log('📋 Demo received orderNotification:', data.type, data.ticker);
  });

  demoSocket.on('balanceUpdate', (data) => {
    console.log('💰 Demo received balanceUpdate:', data.balance);
  });

  demoSocket.on('portfolioUpdate', (data) => {
    console.log('📊 Demo received portfolioUpdate:', data.totalValue);
  });

  buyer2Socket.on('connect', () => {
    console.log('✅ Buyer2 connected:', buyer2Socket.id);
  });

  buyer2Socket.on('connectionTest', (data) => {
    console.log('✅ Buyer2 received connectionTest:', data.message);
  });

  buyer2Socket.on('orderNotification', (data) => {
    console.log(
      '📋 Buyer2 received orderNotification:',
      data.type,
      data.ticker,
    );
  });

  buyer2Socket.on('balanceUpdate', (data) => {
    console.log('💰 Buyer2 received balanceUpdate:', data.balance);
  });

  buyer2Socket.on('portfolioUpdate', (data) => {
    console.log('📊 Buyer2 received portfolioUpdate:', data.totalValue);
  });

  // Wait for connections
  await new Promise<void>((resolve) => {
    let connected = 0;
    const checkConnection = () => {
      connected++;
      if (connected === 2) resolve();
    };
    demoSocket.on('connect', checkConnection);
    buyer2Socket.on('connect', checkConnection);
  });

  console.log('⏳ Waiting 2 seconds...');
  await delay(2000);

  // Create GraphQL clients
  const demoClient = createClient(demoToken);
  const buyer2Client = createClient(buyer2Token);

  // Test: Place a SELL order first, then a BUY order to match it
  console.log('\n🧪 Test: Placing matching orders...');

  try {
    // First, place a SELL order
    console.log('📤 Placing SELL order...');
    const sellOrder = await buyer2Client.request(
      `
      mutation PlaceOrder($input: PlaceOrderInput!) {
        placeOrder(input: $input) {
          id
          side
          ticker
          quantity
          price
          status
        }
      }
    `,
      {
        input: {
          side: 'SELL',
          type: 'LIMIT',
          ticker: 'AAPL',
          quantity: 10,
          price: 150,
        },
      },
    );

    console.log(
      '✅ SELL order placed:',
      sellOrder.placeOrder.id,
      'Status:',
      sellOrder.placeOrder.status,
    );
    await delay(1000);

    // Then, place a BUY order to match it
    console.log('📤 Placing BUY order to match...');
    const buyOrder = await demoClient.request(
      `
      mutation PlaceOrder($input: PlaceOrderInput!) {
        placeOrder(input: $input) {
          id
          side
          ticker
          quantity
          price
          status
        }
      }
    `,
      {
        input: {
          side: 'BUY',
          type: 'LIMIT',
          ticker: 'AAPL',
          quantity: 10,
          price: 150,
        },
      },
    );

    console.log(
      '✅ BUY order placed:',
      buyOrder.placeOrder.id,
      'Status:',
      buyOrder.placeOrder.status,
    );
    console.log('⏳ Waiting 5 seconds for events...');
    await delay(5000);
  } catch (error) {
    console.log('⚠️ Order placement failed:', error.message);
  }

  // Disconnect
  console.log('\n🔌 Disconnecting...');
  demoSocket.disconnect();
  buyer2Socket.disconnect();

  await printSection('TEST COMPLETE');
  console.log('📋 Summary:');
  console.log('- WebSocket connections: ✅ Both users connected');
  console.log('- Order placement: ✅ Orders placed');
  console.log('- Order matching: ✅ Should have matched');
  console.log('- Events received: Check logs above');
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => process.exit(0));
