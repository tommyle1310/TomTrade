/* eslint-disable */
// scripts/debug-order-matching.script.ts

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
  console.log('🔐 Logging in users...');
  const buyerToken = await login('buyer@example.com', '123456');
  const sellerToken = await login('seller@example.com', '123456');

  const buyerClient = createClient(buyerToken);
  const sellerClient = createClient(sellerToken);

  console.log('♻️ Resetting order book...');
  await clearOrders();

  // Ensure users have sufficient balance and portfolio
  console.log('💰 Setting up balances...');
  await updateBalance('buyer@example.com', 100000); // $100k for buyer
  await updateBalance('seller@example.com', 50000); // $50k for seller

  // Give seller some AAPL shares to sell
  console.log('📈 Setting up seller portfolio...');
  const seller = await prisma.user.findUnique({
    where: { email: 'seller@example.com' },
  });

  if (seller) {
    await prisma.portfolio.upsert({
      where: {
        userId_ticker: {
          userId: seller.id,
          ticker: 'AAPL',
        },
      },
      update: {
        quantity: 100,
        averagePrice: 150,
      },
      create: {
        userId: seller.id,
        ticker: 'AAPL',
        quantity: 100,
        averagePrice: 150,
        positionType: 'LONG',
      },
    });
    console.log('✅ Seller now has 100 AAPL shares');
  }

  console.log('\n📊 Current order book before placing orders:');
  const initialOrderBook = await getOrderBook(buyerClient, 'AAPL');
  console.log('BUY orders:', initialOrderBook.buyOrders.length);
  console.log('SELL orders:', initialOrderBook.sellOrders.length);

  console.log('\n📤 Placing a SELL order first...');
  const sellOrderResponse = await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 200,
  });
  const sellOrder = sellOrderResponse.placeOrder;
  console.log('✅ SELL order placed:', sellOrder.id);

  console.log('\n📊 Order book after SELL order:');
  const afterSellOrderBook = await getOrderBook(buyerClient, 'AAPL');
  console.log('BUY orders:', afterSellOrderBook.buyOrders.length);
  console.log('SELL orders:', afterSellOrderBook.sellOrders.length);
  afterSellOrderBook.sellOrders.forEach((order: any) => {
    console.log(`  SELL: ${order.quantity} @ $${order.price}`);
  });

  console.log('\n📥 Placing a matching BUY order...');
  const buyOrderResponse = await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 5,
    price: 200, // Same price - should match!
  });
  const buyOrder = buyOrderResponse.placeOrder;
  console.log('✅ BUY order placed:', buyOrder.id);

  console.log('\n📊 Order book after BUY order (should show execution):');
  const finalOrderBook = await getOrderBook(buyerClient, 'AAPL');
  console.log('BUY orders:', finalOrderBook.buyOrders.length);
  console.log('SELL orders:', finalOrderBook.sellOrders.length);

  finalOrderBook.buyOrders.forEach((order: any) => {
    console.log(`  BUY: ${order.quantity} @ $${order.price}`);
  });
  finalOrderBook.sellOrders.forEach((order: any) => {
    console.log(`  SELL: ${order.quantity} @ $${order.price}`);
  });

  // Check order statuses
  console.log('\n📋 Checking order statuses...');
  const sellOrderStatus = await prisma.order.findUnique({
    where: { id: sellOrder.id },
  });
  const buyOrderStatus = await prisma.order.findUnique({
    where: { id: buyOrder.id },
  });

  console.log(
    `SELL order ${sellOrder.id}: status=${sellOrderStatus?.status}, quantity=${sellOrderStatus?.quantity}`,
  );
  console.log(
    `BUY order ${buyOrder.id}: status=${buyOrderStatus?.status}, quantity=${buyOrderStatus?.quantity}`,
  );

  // Check transactions
  console.log('\n💳 Checking transactions...');
  const buyer = await prisma.user.findUnique({
    where: { email: 'buyer@example.com' },
  });

  if (buyer) {
    const buyerTransactions = await prisma.transaction.findMany({
      where: { userId: buyer.id },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });
    console.log(`Buyer transactions: ${buyerTransactions.length}`);
    buyerTransactions.forEach((tx) => {
      console.log(`  ${tx.action}: ${tx.shares} ${tx.ticker} @ $${tx.price}`);
    });

    // Check buyer portfolio
    const buyerPortfolio = await prisma.portfolio.findMany({
      where: { userId: buyer.id },
    });
    console.log(`Buyer portfolio positions: ${buyerPortfolio.length}`);
    buyerPortfolio.forEach((pos) => {
      console.log(
        `  ${pos.ticker}: ${pos.quantity} shares @ avg $${pos.averagePrice}`,
      );
    });
  }

  if (seller) {
    const sellerTransactions = await prisma.transaction.findMany({
      where: { userId: seller.id },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });
    console.log(`Seller transactions: ${sellerTransactions.length}`);
    sellerTransactions.forEach((tx) => {
      console.log(`  ${tx.action}: ${tx.shares} ${tx.ticker} @ $${tx.price}`);
    });

    // Check seller portfolio
    const sellerPortfolio = await prisma.portfolio.findMany({
      where: { userId: seller.id },
    });
    console.log(`Seller portfolio positions: ${sellerPortfolio.length}`);
    sellerPortfolio.forEach((pos) => {
      console.log(
        `  ${pos.ticker}: ${pos.quantity} shares @ avg $${pos.averagePrice}`,
      );
    });
  }

  console.log(
    '\n🎯 Test completed! Check the logs above to see if orders matched and transactions were created.',
  );
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => process.exit(0));
