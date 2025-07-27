/* eslint-disable */
// scripts/test-market-order.script.ts

import {
  login,
  placeOrder,
  getOrders,
  getBalance,
  getPortfolio,
  seedPortfolio,
  createClient,
  prisma,
} from './test-utils';

async function main() {
  console.log('🔐 Logging in users...');
  const sellerToken = await login('seller@example.com', '123456');
  const buyerToken = await login('buyer@example.com', '123456');

  const sellerClient = createClient(sellerToken);
  const buyerClient = createClient(buyerToken);

  console.log('📦 Seed seller with 10 AAPL @ 180');
  await seedPortfolio('seller@example.com', 'AAPL', 10, 180);

  console.log('📤 SELL LIMIT AAPL 10 @ 200');
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 200,
  });

  console.log('📥 Placing BUY MARKET order (10 AAPL)...');
  await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'MARKET',
    ticker: 'AAPL',
    quantity: 10,
    price: 0, // Market order still needs price parameter but it's not used
  });

  await new Promise((r) => setTimeout(r, 1000)); // Wait for matching

  console.log('📊 Getting portfolio, balance, orders...');
  const buyerBalance = await getBalance(buyerClient);
  const buyerPortfolio = await getPortfolio(buyerClient);
  const buyerOrders = await getOrders(buyerClient);

  console.log('💰 Balance:', buyerBalance.getMyBalance);
  console.log('📦 Portfolio:', buyerPortfolio.myPortfolio);
  console.log('📄 Orders:', buyerOrders.myOrders);
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
