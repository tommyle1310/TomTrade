/* eslint-disable */
// scripts/test-insufficient-balance-stock.script.ts

import {
  login,
  placeOrder,
  seedPortfolio,
  updateBalance,
  createClient,
  prisma,
} from './test-utils';

async function main() {
  console.log('🔐 Logging in users...');
  const buyerToken = await login('buyer@example.com', '123456');
  const sellerToken = await login('seller@example.com', '123456');

  const buyerClient = createClient(buyerToken);
  const sellerClient = createClient(sellerToken);

  console.log('💸 Set buyer balance = 1000');
  await updateBalance('buyer@example.com', 1000); // too little for order

  console.log('📥 Try placing BUY over balance...');
  try {
    await placeOrder(buyerClient, {
      side: 'BUY',
      type: 'LIMIT',
      ticker: 'AAPL',
      quantity: 10,
      price: 200, // requires 2000
    });
    console.log('❌ BUY order should have failed but succeeded');
  } catch (err) {
    console.log(
      '✅ BUY failed as expected:',
      err.response?.errors?.[0]?.message || err.message,
    );
  }

  console.log('🧮 Set seller AAPL stock = 0');
  await seedPortfolio('seller@example.com', 'AAPL', 0, 180); // no stock

  console.log('📤 Try placing SELL without stock...');
  try {
    await placeOrder(sellerClient, {
      side: 'SELL',
      type: 'LIMIT',
      ticker: 'AAPL',
      quantity: 5,
      price: 200,
    });
    console.log('❌ SELL order should have failed but succeeded');
  } catch (err) {
    console.log(
      '✅ SELL failed as expected:',
      err.response?.errors?.[0]?.message || err.message,
    );
  }
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
