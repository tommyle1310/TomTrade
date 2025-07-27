/* eslint-disable */
// scripts/test-sell-limit-multiple-buy.script.ts

import {
  login,
  placeOrder,
  getOrders,
  getBalance,
  getPortfolio,
  getTransactions,
  clearOrders,
  createClient,
  prisma,
  seedPortfolio,
} from './test-utils';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await clearOrders();
  console.log('🔐 Logging in users...');
  const buyer1Token = await login('buyer1@example.com', '123456');
  const buyer2Token = await login('buyer2@example.com', '123456');
  const buyer3Token = await login('buyer3@example.com', '123456');
  const sellerToken = await login('seller@example.com', '123456');
  await seedPortfolio('seller@example.com', 'AAPL', 20, 180);

  const buyer1Client = createClient(buyer1Token);
  const buyer2Client = createClient(buyer2Token);
  const buyer3Client = createClient(buyer3Token);
  const sellerClient = createClient(sellerToken);

  console.log('📥 Placing BUY LIMIT orders...');
  await placeOrder(buyer1Client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 5,
    price: 210,
  });
  await delay(50);
  await placeOrder(buyer2Client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 205,
  });
  await delay(50);
  await placeOrder(buyer3Client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 200,
  });

  console.log('📤 Placing SELL LIMIT (20 AAPL @ 200)...');
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 20,
    price: 200,
  });

  await delay(1000); // Wait for matching

  console.log('\n📄 Orders');
  console.log('Buyer1:', (await getOrders(buyer1Client)).myOrders);
  console.log('Buyer2:', (await getOrders(buyer2Client)).myOrders);
  console.log('Buyer3:', (await getOrders(buyer3Client)).myOrders);
  console.log('Seller:', (await getOrders(sellerClient)).myOrders);

  console.log('\n💰 Balances');
  console.log('Buyer1:', (await getBalance(buyer1Client)).getMyBalance);
  console.log('Buyer2:', (await getBalance(buyer2Client)).getMyBalance);
  console.log('Buyer3:', (await getBalance(buyer3Client)).getMyBalance);
  console.log('Seller:', (await getBalance(sellerClient)).getMyBalance);

  console.log('\n📦 Portfolios');
  console.log('Buyer1:', (await getPortfolio(buyer1Client)).myPortfolio);
  console.log('Buyer2:', (await getPortfolio(buyer2Client)).myPortfolio);
  console.log('Buyer3:', (await getPortfolio(buyer3Client)).myPortfolio);
  console.log('Seller:', (await getPortfolio(sellerClient)).myPortfolio);

  console.log('\n🔁 Transactions');
  console.log('Buyer1:', (await getTransactions(buyer1Client)).myTransactions);
  console.log('Buyer2:', (await getTransactions(buyer2Client)).myTransactions);
  console.log('Buyer3:', (await getTransactions(buyer3Client)).myTransactions);
  console.log('Seller:', (await getTransactions(sellerClient)).myTransactions);
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
