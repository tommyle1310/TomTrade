/* eslint-disable */
// scripts/test-realtime-events.script.ts

import { login, createClient, prisma } from './test-utils';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function printSection(title: string) {
  console.log(`\n==== ${title} ====`);
}

async function loginSmart(email: string, passwords: string[]): Promise<string> {
  let lastError: any;
  for (const pwd of passwords) {
    try {
      return await login(email, pwd);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError ?? new Error(`Unable to login for ${email}`);
}

async function main() {
  await printSection('REAL-TIME EVENTS TEST');

  // Login to get tokens
  console.log('🔐 Logging in users...');
  const demoToken = await loginSmart('demo@example.com', [
    'password123',
    '123456',
  ]);
  const buyer2Token = await loginSmart('buyer2@example.com', [
    '123456',
    'password123',
  ]);

  console.log('✅ Demo token:', demoToken.substring(0, 50) + '...');
  console.log('✅ Buyer2 token:', buyer2Token.substring(0, 50) + '...');

  // Create GraphQL clients
  const demoClient = createClient(demoToken);
  const buyer2Client = createClient(buyer2Token);

  await printSection('WEBSOCKET CONNECTION TEST');

  // Test WebSocket server connectivity
  try {
    const response = await fetch('http://127.0.0.1:3000/health');
    if (response.ok) {
      console.log('✅ GraphQL server is running and accessible');
    } else {
      console.log('⚠️ GraphQL server responded but not healthy');
    }
  } catch (error) {
    console.log('⚠️ Could not connect to GraphQL server:', error.message);
  }

  await printSection('TESTING REAL TRADES FOR NOTIFICATIONS');

  // Place a real order to trigger actual notifications
  console.log('🧪 Placing real order to trigger notifications...');
  try {
    const orderResult = await demoClient.request(
      `
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
    `,
      {
        input: {
          side: 'BUY',
          type: 'LIMIT',
          ticker: 'AAPL',
          quantity: 1,
          price: 150, // Low price to avoid matching
        },
      },
    );

    console.log('✅ Real order placed:', orderResult.placeOrder.id);

    // Wait for notifications
    await delay(2000);

    // Cancel the order
    console.log('🧪 Canceling order to trigger cancellation notification...');
    await demoClient.request(
      `
      mutation CancelOrder($orderId: String!) {
        cancelOrder(orderId: $orderId) {
          id
          status
        }
      }
    `,
      {
        orderId: orderResult.placeOrder.id,
      },
    );

    console.log('✅ Order cancelled');
    await delay(2000);
  } catch (error) {
    console.log('⚠️ Could not place real order:', error.message);
  }

  await printSection('TESTING MARKET DATA BROADCAST');

  // Test market data broadcast
  console.log('🧪 Testing market data broadcast...');
  try {
    const broadcastResult = await demoClient.request(
      `
        mutation BroadcastMarketData($ticker: String!, $price: Float!) {
          broadcastMarketData(ticker: $ticker, price: $price) {
            ticker
            close
            timestamp
          }
        }
      `,
      {
        ticker: 'AAPL',
        price: 185,
      },
    );

    console.log(
      '✅ Market data broadcast triggered:',
      broadcastResult.broadcastMarketData,
    );
    await delay(2000);
  } catch (error) {
    console.log('⚠️ Could not broadcast market data:', error.message);
  }

  await printSection('TESTING PRICE ALERTS');

  // Test price alerts
  console.log('🧪 Testing price alerts...');
  try {
    const alertResult = await demoClient.request(
      `
      mutation CreateAlertRule($input: CreateAlertRuleInput!) {
        createAlertRule(input: $input) {
          id
          ticker
          ruleType
          targetValue
          createdAt
        }
      }
    `,
      {
        input: {
          ticker: 'AAPL',
          ruleType: 'PRICE_BELOW',
          targetValue: 200,
        },
      },
    );

    console.log('✅ Price alert created:', alertResult.createAlertRule);

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
        price: 195,
      },
    );

    console.log('✅ Market data updated to trigger price alert');
    await delay(2000);
  } catch (error) {
    console.log('⚠️ Could not test price alerts:', error.message);
  }

  await printSection('SUMMARY');

  console.log('🎯 Real-time events test completed!');
  console.log('\n📡 To test in POSTMAN:');
  console.log('1. Connect to WebSocket: ws://127.0.0.1:4000');
  console.log('2. Send auth token in connection headers or auth object');
  console.log(
    '3. Listen for events: orderNotification, balanceUpdate, portfolioUpdate, priceAlert, marketDataUpdate',
  );
  console.log('4. Send test events using:');
  console.log('   - joinRoom: { "room": "demo@example.com" }');
  console.log(
    '   - testNotification: { "userId": "demo@example.com", "type": "orderNotification" }',
  );
  console.log('   - mockMarketData: { "ticker": "AAPL", "price": 185 }');
  console.log('\n🔔 Expected notifications from this test:');
  console.log('✅ ORDER_FILLED notifications (from trades)');
  console.log('✅ ORDER_CANCELLED notifications (from order cancellation)');
  console.log('✅ Portfolio updates (after trades)');
  console.log('✅ Balance updates (after trades)');
  console.log('✅ Price alerts (from alert creation and triggering)');
  console.log('✅ Market data broadcasts (from broadcast mutation)');
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
