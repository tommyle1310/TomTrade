/* eslint-disable */
// scripts/test-buy-multiple-sell.script.ts

import {
  prisma,
  login,
  placeOrder,
  getOrders,
  getPortfolio,
  getBalance,
  getTransactions,
  clearOrders,
  createClient,
} from './test-utils';

async function main() {
  await clearOrders();
  console.log('🔃 Cleared all orders');

  // Login users
  console.log('🔐 Logging in users...');
  const buyerToken = await login('buyer@example.com', '123456');
  const seller1Token = await login('seller1@example.com', '123456');
  const seller2Token = await login('seller2@example.com', '123456');
  const seller3Token = await login('seller3@example.com', '123456');

  const buyerClient = createClient(buyerToken);
  const seller1Client = createClient(seller1Token);
  const seller2Client = createClient(seller2Token);
  const seller3Client = createClient(seller3Token);

  // Set up sellers' portfolio: each has 10 AAPL @ 150
  await prisma.portfolio.upsert({
    where: { userId_ticker: { userId: 'seller1', ticker: 'AAPL' } },
    update: { quantity: 10, averagePrice: 150 },
    create: {
      userId: 'seller1',
      ticker: 'AAPL',
      quantity: 10,
      averagePrice: 150,
      positionType: 'LONG',
    },
  });
  await prisma.portfolio.upsert({
    where: { userId_ticker: { userId: 'seller2', ticker: 'AAPL' } },
    update: { quantity: 10, averagePrice: 150 },
    create: {
      userId: 'seller2',
      ticker: 'AAPL',
      quantity: 10,
      averagePrice: 150,
      positionType: 'LONG',
    },
  });
  await prisma.portfolio.upsert({
    where: { userId_ticker: { userId: 'seller3', ticker: 'AAPL' } },
    update: { quantity: 10, averagePrice: 150 },
    create: {
      userId: 'seller3',
      ticker: 'AAPL',
      quantity: 10,
      averagePrice: 150,
      positionType: 'LONG',
    },
  });

  // Seller 1: SELL 10 @ 190 (earliest)
  console.log('📤 Seller1 places SELL LIMIT AAPL 10 @ 190...');
  await placeOrder(seller1Client, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 190,
  });

  // Seller 2: SELL 10 @ 195
  console.log('📤 Seller2 places SELL LIMIT AAPL 10 @ 195...');
  await placeOrder(seller2Client, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 195,
  });

  // Seller 3: SELL 10 @ 200
  console.log('📤 Seller3 places SELL LIMIT AAPL 10 @ 200...');
  await placeOrder(seller3Client, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 200,
  });

  // Buyer places BUY LIMIT 30 @ 200
  console.log('🛒 Buyer places BUY LIMIT AAPL 30 @ 200...');
  await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 30,
    price: 200,
  });

  // Wait for matching
  await new Promise((res) => setTimeout(res, 1000));

  // Show results
  console.log('\n📄 Buyer Orders:');
  console.dir((await getOrders(buyerClient)).myOrders, { depth: null });

  console.log('\n📄 Seller1 Orders:');
  console.dir((await getOrders(seller1Client)).myOrders, { depth: null });
  console.log('\n📄 Seller2 Orders:');
  console.dir((await getOrders(seller2Client)).myOrders, { depth: null });
  console.log('\n📄 Seller3 Orders:');
  console.dir((await getOrders(seller3Client)).myOrders, { depth: null });

  console.log('\n📦 Buyer Portfolio:');
  console.dir((await getPortfolio(buyerClient)).myPortfolio, { depth: null });

  console.log('\n💰 Balances:');
  console.log('Buyer:', (await getBalance(buyerClient)).getMyBalance);
  console.log('Seller1:', (await getBalance(seller1Client)).getMyBalance);
  console.log('Seller2:', (await getBalance(seller2Client)).getMyBalance);
  console.log('Seller3:', (await getBalance(seller3Client)).getMyBalance);

  console.log('\n🔁 Transactions (Buyer):');
  console.dir((await getTransactions(buyerClient)).myTransactions, {
    depth: null,
  });

  console.log('\n🔁 Transactions (Seller1):');
  console.dir((await getTransactions(seller1Client)).myTransactions, {
    depth: null,
  });
  console.log('\n🔁 Transactions (Seller2):');
  console.dir((await getTransactions(seller2Client)).myTransactions, {
    depth: null,
  });
  console.log('\n🔁 Transactions (Seller3):');
  console.dir((await getTransactions(seller3Client)).myTransactions, {
    depth: null,
  });
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
