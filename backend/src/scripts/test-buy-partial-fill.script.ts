/* eslint-disable */
// scripts/test-buy-partial-fill.script.ts

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
  const sellerToken = await login('seller@example.com', '123456');
  const buyerToken = await login('buyer@example.com', '123456');

  const sellerClient = createClient(sellerToken);
  const buyerClient = createClient(buyerToken);

  console.log('📥 Buyer places BUY LIMIT AAPL 15 @ 200...');
  await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 15,
    price: 200,
  });

  console.log('📤 Seller places SELL MARKET AAPL 10...');
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'MARKET',
    ticker: 'AAPL',
    price: 200,
    quantity: 10,
  });

  await new Promise((r) => setTimeout(r, 1000)); // Wait for matching

  console.log('\n📄 Buyer Orders:');
  const buyerOrders = await getOrders(buyerClient);
  console.dir(buyerOrders.myOrders, { depth: null });

  console.log('\n📄 Seller Orders:');
  const sellerOrders = await getOrders(sellerClient);
  console.dir(sellerOrders.myOrders, { depth: null });

  console.log('\n💰 Final Balances:');
  const buyerBalance = await getBalance(buyerClient);
  const sellerBalance = await getBalance(sellerClient);
  console.log('Buyer:', buyerBalance.getMyBalance);
  console.log('Seller:', sellerBalance.getMyBalance);

  console.log('\n📦 Final Portfolios:');
  const buyerPortfolio = await getPortfolio(buyerClient);
  const sellerPortfolio = await getPortfolio(sellerClient);
  console.log('Buyer:', buyerPortfolio.myPortfolio);
  console.log('Seller:', sellerPortfolio.myPortfolio);

  console.log('\n🔁 Transactions (Buyer):');
  const buyerTx = await getTransactions(buyerClient);
  console.dir(buyerTx.myTransactions, { depth: null });

  console.log('\n🔁 Transactions (Seller):');
  const sellerTx = await getTransactions(sellerClient);
  console.dir(sellerTx.myTransactions, { depth: null });
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
