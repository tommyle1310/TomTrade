/* eslint-disable */
// scripts/test-sell-match-multiple-buyers.script.ts

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
  const sellerToken = await login('seller@example.com', '123456');
  const buyer1Token = await login('buyer@example.com', '123456');
  const buyer2Token = await login('buyer2@example.com', '123456');

  const sellerClient = createClient(sellerToken);
  const buyer1Client = createClient(buyer1Token);
  const buyer2Client = createClient(buyer2Token);

  console.log('🛒 2 Buyers place 2 BUY LIMIT AAPL orders @ 300...');
  await placeOrder(buyer1Client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 5,
    price: 300,
  });
  await placeOrder(buyer2Client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 5,
    price: 300,
  });

  console.log('📤 Seller places 1 SELL LIMIT AAPL order for 10 @ 300...');
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 300,
  });

  await new Promise((r) => setTimeout(r, 1000));

  console.log('\n📄 Seller Orders:');
  console.dir((await getOrders(sellerClient)).myOrders, { depth: null });

  console.log('\n📄 Buyer 1 Orders:');
  console.dir((await getOrders(buyer1Client)).myOrders, { depth: null });

  console.log('\n📄 Buyer 2 Orders:');
  console.dir((await getOrders(buyer2Client)).myOrders, { depth: null });

  console.log('\n💰 Final Balances:');
  console.log('Seller:', (await getBalance(sellerClient)).getMyBalance);
  console.log('Buyer1:', (await getBalance(buyer1Client)).getMyBalance);
  console.log('Buyer2:', (await getBalance(buyer2Client)).getMyBalance);

  console.log('\n📦 Final Portfolios:');
  console.log('Seller:', (await getPortfolio(sellerClient)).myPortfolio);
  console.log('Buyer1:', (await getPortfolio(buyer1Client)).myPortfolio);
  console.log('Buyer2:', (await getPortfolio(buyer2Client)).myPortfolio);

  console.log('\n🔁 Transactions (Buyer1):');
  console.dir((await getTransactions(buyer1Client)).myTransactions, {
    depth: null,
  });

  console.log('\n🔁 Transactions (Buyer2):');
  console.dir((await getTransactions(buyer2Client)).myTransactions, {
    depth: null,
  });
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
