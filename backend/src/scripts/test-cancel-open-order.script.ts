/* eslint-disable */
// scripts/test-cancel-open-order.script.ts

import {
  login,
  placeOrder,
  cancelOrder,
  getOrders,
  createClient,
  prisma,
  clearOrders,
} from './test-utils';

async function main() {
  await clearOrders();

  console.log('🔐 Logging in...');
  const buyerToken = await login('buyer@example.com', '123456');
  const buyerClient = createClient(buyerToken);

  console.log('📥 Placing BUY LIMIT (OPEN)...');
  const orderResult = await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 180,
  });
  const orderId = orderResult.placeOrder.id;

  console.log('📛 Canceling order...');
  const cancelResult = await cancelOrder(buyerClient, orderId);

  console.log('✅ Cancel response:', cancelResult);

  console.log('📄 Orders after cancel:');
  const buyerOrders = await getOrders(buyerClient);
  console.dir(buyerOrders.myOrders, { depth: null });
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
