/* eslint-disable */
// scripts/test-market-order.script.ts

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

  console.log('🔐 Logging in...');
  const buyerToken = await login('buyer@example.com', '123456');
  const sellerToken = await login('seller@example.com', '123456');

  const buyerClient = createClient(buyerToken);
  const sellerClient = createClient(sellerToken);

  console.log('📤 Seller places SELL LIMIT AAPL 10 @ 200...');
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 200,
  });

  console.log('🛒 Buyer places BUY MARKET AAPL 10...');
  await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'MARKET',
    ticker: 'AAPL',
    quantity: 10,
    price: 200,
  });

  await new Promise((r) => setTimeout(r, 1000));

  console.log('\n📄 Buyer Orders:');
  console.dir((await getOrders(buyerClient)).myOrders, { depth: null });

  console.log('\n📄 Seller Orders:');
  console.dir((await getOrders(sellerClient)).myOrders, { depth: null });

  console.log('\n💰 Final Balances:');
  console.log('Buyer:', (await getBalance(buyerClient)).getMyBalance);
  console.log('Seller:', (await getBalance(sellerClient)).getMyBalance);

  console.log('\n📦 Final Portfolios:');
  console.log('Buyer:', (await getPortfolio(buyerClient)).myPortfolio);
  console.log('Seller:', (await getPortfolio(sellerClient)).myPortfolio);

  console.log('\n🔁 Transactions (Buyer):');
  console.dir((await getTransactions(buyerClient)).myTransactions, {
    depth: null,
  });

  console.log('\n🔁 Transactions (Seller):');
  console.dir((await getTransactions(sellerClient)).myTransactions, {
    depth: null,
  });
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
