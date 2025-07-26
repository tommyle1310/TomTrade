/* eslint-disable */
// scripts/test-buy-match-multiple-sellers.script.ts

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

async function main() {
  await clearOrders();

  console.log('🔐 Logging in users...');
  const buyerToken = await login('buyer@example.com', '123456');
  const seller1Token = await login('seller@example.com', '123456');
  const seller2Token = await login('seller2@example.com', '123456');

  const buyerClient = createClient(buyerToken);
  const seller1Client = createClient(seller1Token);
  const seller2Client = createClient(seller2Token);

  console.log('📤 Sellers place SELL LIMIT AAPL 5 @ 300...');
  await placeOrder(seller1Client, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 5,
    price: 300,
  });
  await placeOrder(seller2Client, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 5,
    price: 300,
  });

  console.log('🛒 Buyer places BUY LIMIT AAPL 10 @ 300...');
  await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 300,
  });

  await new Promise((r) => setTimeout(r, 1000));

  console.log('\n📄 Buyer Orders:');
  console.dir((await getOrders(buyerClient)).myOrders, { depth: null });

  console.log('\n📄 Seller1 Orders:');
  console.dir((await getOrders(seller1Client)).myOrders, { depth: null });

  console.log('\n📄 Seller2 Orders:');
  console.dir((await getOrders(seller2Client)).myOrders, { depth: null });

  console.log('\n💰 Final Balances:');
  console.log('Buyer:', (await getBalance(buyerClient)).getMyBalance);
  console.log('Seller1:', (await getBalance(seller1Client)).getMyBalance);
  console.log('Seller2:', (await getBalance(seller2Client)).getMyBalance);

  console.log('\n📦 Final Portfolios:');
  console.log('Buyer:', (await getPortfolio(buyerClient)).myPortfolio);
  console.log('Seller1:', (await getPortfolio(seller1Client)).myPortfolio);
  console.log('Seller2:', (await getPortfolio(seller2Client)).myPortfolio);

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
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
