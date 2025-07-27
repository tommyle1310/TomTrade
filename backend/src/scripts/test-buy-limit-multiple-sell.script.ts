/* eslint-disable */
// scripts/test-buy-limit-multiple-sell.script.ts

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
} from './test-utils';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await clearOrders();
  console.log('🔐 Logging in users...');
  const buyerToken = await login('buyer@example.com', '123456');
  const seller1Token = await login('seller1@example.com', '123456');
  const seller2Token = await login('seller2@example.com', '123456');
  const seller3Token = await login('seller3@example.com', '123456');

  const buyerClient = createClient(buyerToken);
  const seller1Client = createClient(seller1Token);
  const seller2Client = createClient(seller2Token);
  const seller3Client = createClient(seller3Token);

  console.log('📤 Placing SELL LIMIT orders...');
  await placeOrder(seller1Client, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 190,
  });
  await delay(50);
  await placeOrder(seller2Client, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 195,
  });
  await delay(50);
  await placeOrder(seller3Client, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 200,
  });

  console.log('📥 Placing BUY LIMIT order (30 AAPL @200)...');
  await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 30,
    price: 200,
  });

  await delay(1000); // Wait for matching

  console.log('\n📄 Orders');
  console.log('Buyer:', (await getOrders(buyerClient)).myOrders);
  console.log('Seller1:', (await getOrders(seller1Client)).myOrders);
  console.log('Seller2:', (await getOrders(seller2Client)).myOrders);
  console.log('Seller3:', (await getOrders(seller3Client)).myOrders);

  console.log('\n💰 Balances');
  console.log('Buyer:', (await getBalance(buyerClient)).getMyBalance);
  console.log('Seller1:', (await getBalance(seller1Client)).getMyBalance);
  console.log('Seller2:', (await getBalance(seller2Client)).getMyBalance);
  console.log('Seller3:', (await getBalance(seller3Client)).getMyBalance);

  console.log('\n📦 Portfolios');
  console.log('Buyer:', (await getPortfolio(buyerClient)).myPortfolio);
  console.log('Seller1:', (await getPortfolio(seller1Client)).myPortfolio);
  console.log('Seller2:', (await getPortfolio(seller2Client)).myPortfolio);
  console.log('Seller3:', (await getPortfolio(seller3Client)).myPortfolio);

  console.log('\n🔁 Transactions');
  console.log('Buyer:', (await getTransactions(buyerClient)).myTransactions);
  console.log(
    'Seller1:',
    (await getTransactions(seller1Client)).myTransactions,
  );
  console.log(
    'Seller2:',
    (await getTransactions(seller2Client)).myTransactions,
  );
  console.log(
    'Seller3:',
    (await getTransactions(seller3Client)).myTransactions,
  );
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
