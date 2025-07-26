/* eslint-disable */
// scripts/test-limit-matching.script.ts

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
  try {
    // Clear existing orders
    await clearOrders();

    console.log('🔐 Logging in...');
    const buyerToken = await login('buyer@example.com', '123456');
    const sellerToken = await login('seller@example.com', '123456');

    const buyerClient = createClient(buyerToken);
    const sellerClient = createClient(sellerToken);

    console.log('\n💵 Checking balance BEFORE...');
    const buyerBalBefore = await getBalance(buyerClient);
    const sellerBalBefore = await getBalance(sellerClient);
    console.log('Buyer balance:', buyerBalBefore.getMyBalance);
    console.log('Seller balance:', sellerBalBefore.getMyBalance);

    console.log('\n📦 Checking portfolio BEFORE...');
    const buyerPortBefore = await getPortfolio(buyerClient);
    const sellerPortBefore = await getPortfolio(sellerClient);
    console.log(
      'Buyer portfolio:',
      JSON.stringify(buyerPortBefore.myPortfolio, null, 2),
    );
    console.log(
      'Seller portfolio:',
      JSON.stringify(sellerPortBefore.myPortfolio, null, 2),
    );

    console.log('\n🧾 Seller places LIMIT SELL 10 AAPL @ 300...');
    await placeOrder(sellerClient, {
      side: 'SELL',
      type: 'LIMIT',
      ticker: 'AAPL',
      quantity: 10,
      price: 300,
    });

    console.log('\n🛒 Buyer places LIMIT BUY 10 AAPL @ 300...');
    await placeOrder(buyerClient, {
      side: 'BUY',
      type: 'LIMIT',
      ticker: 'AAPL',
      quantity: 10,
      price: 300,
    });

    await new Promise((r) => setTimeout(r, 1000)); // chờ 1s cho server xử lý khớp

    console.log('\n🔍 Checking ORDERS after match...');
    const buyerOrders = await getOrders(buyerClient);
    const sellerOrders = await getOrders(sellerClient);
    console.log(
      '📥 Buyer orders:',
      JSON.stringify(buyerOrders.myOrders, null, 2),
    );
    console.log(
      '📤 Seller orders:',
      JSON.stringify(sellerOrders.myOrders, null, 2),
    );

    console.log('\n💰 Checking BALANCE after match...');
    const buyerBalAfter = await getBalance(buyerClient);
    const sellerBalAfter = await getBalance(sellerClient);
    console.log('Buyer balance:', buyerBalAfter.getMyBalance);
    console.log('Seller balance:', sellerBalAfter.getMyBalance);

    console.log('\n📈 Checking PORTFOLIO after match...');
    const buyerPortAfter = await getPortfolio(buyerClient);
    const sellerPortAfter = await getPortfolio(sellerClient);
    console.log(
      'Buyer portfolio:',
      JSON.stringify(buyerPortAfter.myPortfolio, null, 2),
    );
    console.log(
      'Seller portfolio:',
      JSON.stringify(sellerPortAfter.myPortfolio, null, 2),
    );

    console.log('\n🧾 Checking TRANSACTIONS after match...');
    const buyerTx = await getTransactions(buyerClient);
    const sellerTx = await getTransactions(sellerClient);
    console.log(
      'Buyer transactions:',
      JSON.stringify(buyerTx.myTransactions, null, 2),
    );
    console.log(
      'Seller transactions:',
      JSON.stringify(sellerTx.myTransactions, null, 2),
    );
  } catch (err: any) {
    if (err.response?.errors?.length) {
      console.error(`❌ GraphQL Error: ${err.response.errors[0].message}`);
    } else {
      console.error(`❌ Error: ${err.message || 'Unknown error'}`);
    }
  } finally {
    // Disconnect the Prisma client
    await prisma.$disconnect();
  }
}

// Run the test
main();
