/* eslint-disable */
// scripts/test-orderbook-sorting.script.ts

import {
  login,
  placeOrder,
  getOrderBook,
  clearOrders,
  createClient,
  prisma,
} from './test-utils';

async function main() {
  console.log('🔐 Logging in users...');
  const buyerToken = await login('buyer@example.com', '123456');
  const sellerToken = await login('seller@example.com', '123456');

  const buyerClient = createClient(buyerToken);
  const sellerClient = createClient(sellerToken);

  console.log('♻️ Resetting order book...');
  await clearOrders();

  console.log('📥 Placing BUY orders...');
  await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 210,
  });
  await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 200,
  });
  await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 205,
  });

  console.log('📤 Placing SELL orders...');
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 220,
  });
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 215,
  });
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 225,
  });

  console.log('📊 Getting order book...');
  const orderBook = await getOrderBook(buyerClient, 'AAPL');
  console.log('🧾 BUY orders:', orderBook.buyOrders); // Expect: 210, 205, 200
  console.log('🧾 SELL orders:', orderBook.sellOrders); // Expect: 215, 220, 225
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
