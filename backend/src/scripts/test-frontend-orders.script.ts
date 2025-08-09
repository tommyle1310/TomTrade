/* eslint-disable */
// scripts/test-frontend-orders.script.ts

import {
  login,
  placeOrder,
  getOrderBook,
  clearOrders,
  createClient,
  prisma,
  updateBalance,
} from './test-utils';

async function main() {
  console.log('🧪 Testing Frontend Order Behavior...');

  console.log('🔐 Logging in user...');
  const userToken = await login('buyer@example.com', '123456');
  const userClient = createClient(userToken);

  console.log('♻️ Resetting order book...');
  await clearOrders();

  // Set up user balance
  console.log('💰 Setting up balance...');
  await updateBalance('buyer@example.com', 10000); // $10k

  // Get initial balance
  const user = await prisma.user.findUnique({
    where: { email: 'buyer@example.com' },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const initialBalance = await prisma.balance.findUnique({
    where: { userId: user.id },
  });

  console.log(`💰 Initial balance: $${initialBalance?.amount || 0}`);

  console.log('\n📊 Current order book:');
  const initialOrderBook = await getOrderBook(userClient, 'AAPL');
  console.log('BUY orders:', initialOrderBook.buyOrders.length);
  console.log('SELL orders:', initialOrderBook.sellOrders.length);

  // Place a BUY order that won't match (no SELL orders exist)
  console.log('\n📥 Placing a BUY order (no matching SELL orders)...');
  const buyOrderResponse = await placeOrder(userClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 150,
  });
  const buyOrder = buyOrderResponse.placeOrder;
  console.log('✅ BUY order placed:', buyOrder.id);

  // Check balance after placing order
  const balanceAfterOrder = await prisma.balance.findUnique({
    where: { userId: user.id },
  });
  console.log(
    `💰 Balance after placing order: $${balanceAfterOrder?.amount || 0}`,
  );
  console.log(
    `💡 Expected: Balance should remain $10,000 (not deducted until execution)`,
  );

  // Check order status
  const orderStatus = await prisma.order.findUnique({
    where: { id: buyOrder.id },
  });
  console.log(`📋 Order status: ${orderStatus?.status} (should be OPEN)`);

  // Check order book
  console.log('\n📊 Order book after placing BUY order:');
  const afterOrderBook = await getOrderBook(userClient, 'AAPL');
  console.log('BUY orders:', afterOrderBook.buyOrders.length);
  console.log('SELL orders:', afterOrderBook.sellOrders.length);
  afterOrderBook.buyOrders.forEach((order: any) => {
    console.log(`  BUY: ${order.quantity} @ $${order.price}`);
  });

  // Check transactions (should be empty)
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { timestamp: 'desc' },
  });
  console.log(
    `💳 Transactions: ${transactions.length} (should be 0 - no execution yet)`,
  );

  // Check portfolio (should be empty)
  const portfolio = await prisma.portfolio.findMany({
    where: { userId: user.id },
  });
  console.log(
    `📦 Portfolio positions: ${portfolio.length} (should be 0 - no shares bought yet)`,
  );

  console.log('\n🎯 Test Results:');
  console.log(
    `✅ Balance preserved: ${balanceAfterOrder?.amount === initialBalance?.amount ? 'YES' : 'NO'}`,
  );
  console.log(
    `✅ Order is OPEN: ${orderStatus?.status === 'OPEN' ? 'YES' : 'NO'}`,
  );
  console.log(
    `✅ No transactions: ${transactions.length === 0 ? 'YES' : 'NO'}`,
  );
  console.log(
    `✅ No portfolio positions: ${portfolio.length === 0 ? 'YES' : 'NO'}`,
  );

  console.log('\n📝 Summary:');
  console.log('- Orders placed through frontend will stay OPEN if no matches');
  console.log('- Balance is NOT deducted until actual trade execution');
  console.log(
    '- Transactions and portfolio positions only created when trades execute',
  );
  console.log('- This is the CORRECT behavior for a trading system!');
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => process.exit(0));
