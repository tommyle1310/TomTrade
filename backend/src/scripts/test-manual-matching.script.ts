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

    console.log('\n🧪 Testing Manual Order Matching...');

    // Test 1: Place a BUY order as demo user
    console.log('\n📋 Test 1: Placing a BUY order as demo user...');
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

    // Test 2: Login as a different user and place a matching SELL order
    console.log('\n📋 Test 2: Logging in as buyer user...');
    const buyerToken = await login('buyer@example.com', '123456');
    console.log('✅ Buyer login successful');

    console.log(
      '\n📋 Test 2.1: Placing a matching SELL order as buyer user...',
    );
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
      buyerToken,
    );
    console.log('✅ Sell order created:', sellOrderRes.placeOrder);

    // Test 3: Send market data to trigger matching
    console.log('\n📋 Test 3: Sending market data to trigger matching...');
    socket.emit('mockMarketData', {
      ticker: 'AAPL',
      price: 300, // Exact match price
    });

    // Wait for matching and notifications
    console.log('\n⏳ Waiting for matching and notifications...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Test 4: Check order statuses
    console.log('\n🔍 Checking demo user orders...');
    const demoOrdersRes = await gqlRequest(
      `
      query {
        myOrders {
          id
          side
          type
          price
          quantity
          status
          timeInForce
          createdAt
        }
      }
      `,
      {},
      token,
    );

    console.log('\n📊 Demo User Order Statuses:');
    demoOrdersRes.myOrders.forEach((order: any) => {
      console.log(
        `Order ${order.id}: ${order.status} (${order.timeInForce}) - ${order.side} ${order.quantity} @ ${order.price}`,
      );
    });

    console.log('\n🔍 Checking buyer user orders...');
    const buyerOrdersRes = await gqlRequest(
      `
      query {
        myOrders {
          id
          side
          type
          price
          quantity
          status
          timeInForce
          createdAt
        }
      }
      `,
      {},
      buyerToken,
    );

    console.log('\n📊 Buyer User Order Statuses:');
    buyerOrdersRes.myOrders.forEach((order: any) => {
      console.log(
        `Order ${order.id}: ${order.status} (${order.timeInForce}) - ${order.side} ${order.quantity} @ ${order.price}`,
      );
    });

    console.log('\n✅ Manual matching test completed!');
    console.log('\n📝 Expected Results:');
    console.log(
      '1. Orders should be FILLED after market data triggers matching',
    );
    console.log('2. WebSocket notifications should be received');
    console.log('3. Portfolio updates should be sent');

    // Disconnect socket
    socket.disconnect();
  } catch (error) {
    console.error('❌ Error in manual matching test:', error);
    throw error;
  }
}

main().catch(console.error);
