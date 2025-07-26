/* eslint-disable */
// scripts/test-multi-match.script.ts

import { GraphQLClient } from 'graphql-request';
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
  const sellerToken = await login('seller@example.com', '123456');

  const buyerClient = createClient(buyerToken);
  const sellerClient = createClient(sellerToken);

  console.log('📤 Seller places 2 SELL LIMIT AAPL orders @ 300...');
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 5,
    price: 300,
  });
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 5,
    price: 300,
  });

  console.log('🛒 Buyer places 1 BUY LIMIT AAPL order for 10 @ 300...');
  await placeOrder(buyerClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 300,
  });

  await new Promise((r) => setTimeout(r, 1000));

  console.log('📄 Buyer Orders:');
  const buyerOrders = await getOrders(buyerClient);
  console.dir(buyerOrders.myOrders, { depth: null });

  console.log('📄 Seller Orders:');
  const sellerOrders = await getOrders(sellerClient);
  console.dir(sellerOrders.myOrders, { depth: null });

  console.log('💰 Final Balances:');
  console.log('Buyer:', (await getBalance(buyerClient)).getMyBalance);
  console.log('Seller:', (await getBalance(sellerClient)).getMyBalance);

  console.log('📦 Final Portfolios:');
  console.log('Buyer:', (await getPortfolio(buyerClient)).myPortfolio);
  console.log('Seller:', (await getPortfolio(sellerClient)).myPortfolio);

  console.log('🔁 Transactions:');
  console.dir((await getTransactions(buyerClient)).myTransactions, {
    depth: null,
  });
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
