import { login, gqlRequest } from './test-utils';
import { io } from 'socket.io-client';

async function main() {
  try {
    console.log('🔐 Logging in as demo user...');
    const token = await login('demo@example.com', 'password123');
    console.log('✅ Login successful');

    // Connect demo user to WebSocket
    console.log('🔌 Connecting demo user to WebSocket...');
    const demoSocket = io('http://localhost:3000', {
      auth: {
        token: `Bearer ${token}`,
      },
    });

    demoSocket.on('connect', () => {
      console.log('✅ Demo user WebSocket connected');
    });

    demoSocket.on('orderNotification', (notification) => {
      console.log('📢 Demo user Order Notification received:', notification);
    });

    demoSocket.on('portfolioUpdate', (portfolioData) => {
      console.log('📊 Demo user Portfolio Update received:', portfolioData);
    });

    demoSocket.on('balanceUpdate', (balanceData) => {
      console.log('💰 Demo user Balance Update received:', balanceData);
    });

    // Login as buyer user
    console.log('\n🔐 Logging in as buyer user...');
    const buyerToken = await login('buyer@example.com', '123456');
    console.log('✅ Buyer login successful');

    // Connect buyer user to WebSocket
    console.log('🔌 Connecting buyer user to WebSocket...');
    const buyerSocket = io('http://localhost:3000', {
      auth: {
        token: `Bearer ${buyerToken}`,
      },
    });

    buyerSocket.on('connect', () => {
      console.log('✅ Buyer user WebSocket connected');
    });

    buyerSocket.on('orderNotification', (notification) => {
      console.log('📢 Buyer user Order Notification received:', notification);
    });

    buyerSocket.on('portfolioUpdate', (portfolioData) => {
      console.log('📊 Buyer user Portfolio Update received:', portfolioData);
    });

    buyerSocket.on('balanceUpdate', (balanceData) => {
      console.log('💰 Buyer user Balance Update received:', balanceData);
    });

    // Wait for connections
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('\n🧪 Testing Notification Fix...');

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

    // Test 2: Place a matching SELL order as buyer user
    console.log('\n📋 Test 2: Placing a matching SELL order as buyer user...');
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
    demoSocket.emit('mockMarketData', {
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

    // Test 5: Query P&L data for both users
    console.log('\n📋 Test 5: Querying P&L data for demo user...');
    const pnlRes = await gqlRequest(
      `
      query {
        getTotalPnL
      }
      `,
      {},
      token,
    );
    console.log('✅ Demo user P&L data:', JSON.parse(pnlRes.getTotalPnL));

    console.log('\n📋 Test 6: Querying P&L data for buyer user...');
    const buyerPnlRes = await gqlRequest(
      `
      query {
        getTotalPnL
      }
      `,
      {},
      buyerToken,
    );
    console.log('✅ Buyer user P&L data:', JSON.parse(buyerPnlRes.getTotalPnL));

    console.log('\n✅ Notification fix test completed!');
    console.log('\n📝 Expected Results:');
    console.log('1. Orders should be FILLED (matched between different users)');
    console.log('2. No duplicate notifications should be sent');
    console.log('3. Both users should receive order notifications');
    console.log('4. Both users should receive portfolio and balance updates');
    console.log('5. P&L should reflect the executed trades');

    // Disconnect sockets
    demoSocket.disconnect();
    buyerSocket.disconnect();
  } catch (error) {
    console.error('❌ Error in notification fix test:', error);
    throw error;
  }
}

main().catch(console.error);
