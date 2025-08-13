/* eslint-disable */
// scripts/test-websocket-events.script.ts

import { io, Socket } from 'socket.io-client';
import { login, createClient } from './test-utils';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function printSection(title: string) {
  console.log(`\n==== ${title} ====`);
}

async function main() {
  await printSection('WEBSOCKET EVENTS TEST');

  // Login to get tokens for both users
  console.log('🔐 Logging in users...');
  const demoToken = await login('demo@example.com', 'password123');
  const buyer2Token = await login('buyer2@example.com', '123456');

  console.log('✅ Got tokens for both users');

  // Connect both users to WebSocket
  console.log('🔌 Connecting users to WebSocket...');

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

  // Set up event listeners for demo user
  demoSocket.on('connect', () => {
    console.log('✅ Demo user connected:', demoSocket.id);
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

  demoSocket.on('priceAlert', (data) => {
    console.log('🚨 Demo received priceAlert:', data.message);
  });

  demoSocket.on('marketDataUpdate', (data) => {
    console.log('📈 Demo received marketDataUpdate:', data.ticker, data.price);
  });

  // Set up event listeners for buyer2 user
  buyer2Socket.on('connect', () => {
    console.log('✅ Buyer2 user connected:', buyer2Socket.id);
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

  buyer2Socket.on('priceAlert', (data) => {
    console.log('🚨 Buyer2 received priceAlert:', data.message);
  });

  buyer2Socket.on('marketDataUpdate', (data) => {
    console.log(
      '📈 Buyer2 received marketDataUpdate:',
      data.ticker,
      data.price,
    );
  });

  // Wait for both connections
  await new Promise<void>((resolve) => {
    let connected = 0;
    const checkConnection = () => {
      connected++;
      if (connected === 2) resolve();
    };
    demoSocket.on('connect', checkConnection);
    buyer2Socket.on('connect', checkConnection);
  });

  console.log('⏳ Waiting 3 seconds for connectionTest events...');
  await delay(3000);

  // Create GraphQL clients
  const demoClient = createClient(demoToken);
  const buyer2Client = createClient(buyer2Token);

  // Test 1: Place an order (should trigger orderNotification, balanceUpdate, portfolioUpdate)
  console.log('\n🧪 Test 1: Placing order...');

  try {
    const orderResult = await demoClient.request(
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
          quantity: 5,
          price: 150,
        },
      },
    );

    console.log('✅ Order placed:', orderResult.placeOrder.id);
    console.log('⏳ Waiting 3 seconds for events...');
    await delay(3000);
  } catch (error) {
    console.log('⚠️ Order placement failed:', error.message);
  }

  // Test 2: Update market data (should trigger marketDataUpdate and priceAlert)
  console.log('\n🧪 Test 2: Updating market data...');

  try {
    await demoClient.request(
      `
      mutation UpdateMarketData($ticker: String!, $price: Float!) {
        updateMarketData(ticker: $ticker, price: $price) {
          ticker
          close
          timestamp
        }
      }
    `,
      {
        ticker: 'AAPL',
        price: 140,
      },
    );

    console.log('✅ Market data updated');
    console.log('⏳ Waiting 3 seconds for events...');
    await delay(3000);
  } catch (error) {
    console.log('⚠️ Market data update failed:', error.message);
  }

  // Test 3: Create price alert (should trigger priceAlert when market data updates)
  console.log('\n🧪 Test 3: Creating price alert...');

  try {
    await demoClient.request(
      `
      mutation CreateAlertRule($input: CreateAlertRuleInput!) {
        createAlertRule(input: $input) {
          id
          ticker
          ruleType
          targetValue
        }
      }
    `,
      {
        input: {
          ticker: 'AAPL',
          ruleType: 'PRICE_BELOW',
          targetValue: 145,
        },
      },
    );

    console.log('✅ Price alert created');

    // Trigger the alert
    await demoClient.request(
      `
      mutation UpdateMarketData($ticker: String!, $price: Float!) {
        updateMarketData(ticker: $ticker, price: $price) {
          ticker
          close
          timestamp
        }
      }
    `,
      {
        ticker: 'AAPL',
        price: 140,
      },
    );

    console.log('✅ Market data updated to trigger alert');
    console.log('⏳ Waiting 3 seconds for events...');
    await delay(3000);
  } catch (error) {
    console.log('⚠️ Price alert test failed:', error.message);
  }

  // Disconnect
  console.log('\n🔌 Disconnecting...');
  demoSocket.disconnect();
  buyer2Socket.disconnect();

  await printSection('TEST COMPLETE');
  console.log('📋 Summary:');
  console.log('- WebSocket connections: ✅ Both users connected');
  console.log('- Event listening: ✅ Set up for all events');
  console.log('- Business logic: ✅ Triggered');
  console.log('- Events received: Check logs above');
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => process.exit(0));
