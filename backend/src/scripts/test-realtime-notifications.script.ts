import { login, gqlRequest } from './test-utils';
import { io } from 'socket.io-client';

async function main() {
  try {
    console.log('🔐 Logging in as demo user...');
    const token = await login('demo@example.com', 'password123');
    console.log('✅ Login successful');

    // Connect to WebSocket
    console.log('🔌 Connecting to WebSocket...');
    const socket = io('http://localhost:3000', {
      auth: {
        token: `Bearer ${token}`,
      },
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    socket.on('orderNotification', (notification) => {
      console.log('📢 Order Notification received:', notification);
    });

    socket.on('portfolioUpdate', (portfolioData) => {
      console.log('📊 Portfolio Update received:', portfolioData);
    });

    socket.on('balanceUpdate', (balanceData) => {
      console.log('💰 Balance Update received:', balanceData);
    });

    socket.on('priceAlert', (alert) => {
      console.log('🚨 Price Alert received:', alert);
    });

    // Wait for connection
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('\n🧪 Testing Real-time Notifications...');

    // Test 1: Place an order that should trigger notifications
    console.log('\n📋 Test 1: Placing a BUY order...');
    const buyOrderRes = await gqlRequest(
      `
      mutation PlaceOrder($input: PlaceOrderInput!) {
        placeOrder(input: $input) {
          id
          side
          type
          price
          quantity
          status
          timeInForce
        }
      }
      `,
      {
        input: {
          ticker: 'AAPL',
          side: 'BUY',
          type: 'LIMIT',
          price: 300,
          quantity: 10,
          timeInForce: 'GTC',
        },
      },
      token,
    );
    console.log('✅ Buy order created:', buyOrderRes.placeOrder);

    // Test 2: Place a matching SELL order to trigger trade execution
    console.log('\n📋 Test 2: Placing a matching SELL order...');
    const sellOrderRes = await gqlRequest(
      `
      mutation PlaceOrder($input: PlaceOrderInput!) {
        placeOrder(input: $input) {
          id
          side
          type
          price
          quantity
          status
          timeInForce
        }
      }
      `,
      {
        input: {
          ticker: 'AAPL',
          side: 'SELL',
          type: 'LIMIT',
          price: 300,
          quantity: 10,
          timeInForce: 'GTC',
        },
      },
      token,
    );
    console.log('✅ Sell order created:', sellOrderRes.placeOrder);

    // Test 3: Create an alert rule
    console.log('\n📋 Test 3: Creating an alert rule...');
    const alertRes = await gqlRequest(
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
          ruleType: 'PRICE_ABOVE',
          targetValue: 250,
        },
      },
      token,
    );
    console.log('✅ Alert rule created:', alertRes.createAlertRule);

    // Test 4: Send mock market data to trigger alerts and portfolio updates
    console.log('\n📋 Test 4: Sending mock market data...');
    socket.emit('mockMarketData', {
      ticker: 'AAPL',
      price: 310, // Above alert threshold
    });

    // Wait for notifications
    console.log('\n⏳ Waiting for notifications...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Test 5: Query P&L data
    console.log('\n📋 Test 5: Querying P&L data...');
    const pnlRes = await gqlRequest(
      `
      query {
        getTotalPnL
      }
      `,
      {},
      token,
    );
    console.log('✅ P&L data:', JSON.parse(pnlRes.getTotalPnL));

    const portfolioRes = await gqlRequest(
      `
      query {
        getPortfolioSummary
      }
      `,
      {},
      token,
    );
    console.log(
      '✅ Portfolio summary:',
      JSON.parse(portfolioRes.getPortfolioSummary),
    );

    console.log('\n✅ Real-time notification test completed!');

    // Disconnect socket
    socket.disconnect();
  } catch (error) {
    console.error('❌ Error in real-time notification test:', error);
    throw error;
  }
}

main().catch(console.error);
