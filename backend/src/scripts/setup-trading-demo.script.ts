/* eslint-disable */
// scripts/setup-trading-demo.script.ts
// This script sets up a realistic trading environment for testing

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
  console.log('🎯 Setting up Trading Demo Environment...');

  // Clean up everything first
  console.log('🧹 Cleaning up database...');
  await prisma.transaction.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.order.deleteMany();

  // Set up multiple users for realistic trading
  console.log('\n👥 Setting up users...');

  // User 1: Market Maker (has stocks to sell)
  await updateBalance('seller@example.com', 50000); // $50k
  const seller = await prisma.user.findUnique({
    where: { email: 'seller@example.com' },
  });

  if (seller) {
    // Give seller various stocks to sell
    await prisma.portfolio.createMany({
      data: [
        {
          userId: seller.id,
          ticker: 'AAPL',
          quantity: 100,
          averagePrice: 150,
          positionType: 'LONG',
        },
        {
          userId: seller.id,
          ticker: 'GOOG',
          quantity: 50,
          averagePrice: 2500,
          positionType: 'LONG',
        },
        {
          userId: seller.id,
          ticker: 'MSFT',
          quantity: 75,
          averagePrice: 300,
          positionType: 'LONG',
        },
      ],
    });
    console.log('✅ Seller has stocks: 100 AAPL, 50 GOOG, 75 MSFT');
  }

  // User 2: Buyer (has cash to buy)
  await updateBalance('buyer@example.com', 100000); // $100k
  console.log('✅ Buyer has $100,000 cash');

  // User 3: Demo user (for your frontend testing)
  await updateBalance('demo@example.com', 25000); // $25k
  console.log('✅ Demo user has $25,000 cash');

  // Create some initial market orders to populate the order book
  console.log('\n📊 Creating initial market orders...');

  const sellerToken = await login('seller@example.com', '123456');
  const sellerClient = createClient(sellerToken);

  // Place some SELL orders at different prices
  const sellOrders = [
    { ticker: 'AAPL', quantity: 10, price: 180 },
    { ticker: 'AAPL', quantity: 15, price: 185 },
    { ticker: 'AAPL', quantity: 20, price: 190 },
    { ticker: 'GOOG', quantity: 5, price: 2600 },
    { ticker: 'MSFT', quantity: 10, price: 320 },
  ];

  for (const order of sellOrders) {
    await placeOrder(sellerClient, {
      side: 'SELL',
      type: 'LIMIT',
      ticker: order.ticker,
      quantity: order.quantity,
      price: order.price,
    });
    console.log(`📤 SELL: ${order.quantity} ${order.ticker} @ $${order.price}`);
  }

  // Show current order book
  console.log('\n📋 Current Order Book:');
  for (const ticker of ['AAPL', 'GOOG', 'MSFT']) {
    const orderBook = await getOrderBook(sellerClient, ticker);
    console.log(`\n${ticker}:`);
    console.log(`  BUY orders: ${orderBook.buyOrders.length}`);
    console.log(`  SELL orders: ${orderBook.sellOrders.length}`);
    orderBook.sellOrders.forEach((order: any) => {
      console.log(`    SELL: ${order.quantity} @ $${order.price}`);
    });
  }

  console.log('\n🎯 Demo Environment Ready!');
  console.log('\n📝 How to Test in Frontend:');
  console.log('1. Login as demo@example.com (password: password123)');
  console.log('2. Go to Trading screen');
  console.log(
    '3. Try to BUY AAPL at $180 or higher - should execute immediately!',
  );
  console.log('4. Try to BUY AAPL at $170 - will stay OPEN (no match)');
  console.log('5. Check Transactions screen to see executed trades');
  console.log('6. Check Portfolio screen to see your positions');

  console.log('\n💡 Available SELL orders to match against:');
  sellOrders.forEach((order) => {
    console.log(
      `   ${order.ticker}: ${order.quantity} shares @ $${order.price}`,
    );
  });

  console.log(
    '\n🔥 Pro Tip: Buy at or above the SELL prices to get instant execution!',
  );
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => process.exit(0));
