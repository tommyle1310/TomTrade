/* eslint-disable */
import {
  login,
  placeOrder,
  getOrders,
  getBalance,
  getPortfolio,
  getTransactions,
  clearOrders,
  createClient,
  seedPortfolio,
  prisma,
} from './test-utils';

async function main() {
  await clearOrders();
  console.log('🔐 Logging in...');
  const sellerToken = await login('seller@example.com', '123456');
  const buyer1Token = await login('buyer1@example.com', '123456');
  const buyer2Token = await login('buyer2@example.com', '123456');
  const buyer3Token = await login('buyer3@example.com', '123456');

  const sellerClient = createClient(sellerToken);
  const buyer1Client = createClient(buyer1Token);
  const buyer2Client = createClient(buyer2Token);
  const buyer3Client = createClient(buyer3Token);

  console.log('📦 Seeding seller with 20 AAPL @ 180...');
  await seedPortfolio('seller@example.com', 'AAPL', 20, 180);

  console.log('📥 Buyers place BUY LIMIT orders...');
  await placeOrder(buyer1Client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    price: 210,
    quantity: 5,
  });
  await placeOrder(buyer2Client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    price: 205,
    quantity: 10,
  });
  await placeOrder(buyer3Client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    price: 200,
    quantity: 10,
  });

  console.log('📤 Seller places SELL LIMIT AAPL 20 @ 200...');
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    price: 200,
    quantity: 20,
  });

  await new Promise((r) => setTimeout(r, 1000)); // Wait for matching

  console.log('\n📄 Orders');
  console.log('Buyer1:', (await getOrders(buyer1Client)).myOrders);
  console.log('Buyer2:', (await getOrders(buyer2Client)).myOrders);
  console.log('Buyer3:', (await getOrders(buyer3Client)).myOrders);
  console.log('Seller:', (await getOrders(sellerClient)).myOrders);

  console.log('\n💰 Balances');
  console.log('Buyer1:', (await getBalance(buyer1Client)).getMyBalance);
  console.log('Buyer2:', (await getBalance(buyer2Client)).getMyBalance);
  console.log('Buyer3:', (await getBalance(buyer3Client)).getMyBalance);
  console.log('Seller:', (await getBalance(sellerClient)).getMyBalance);

  console.log('\n📦 Portfolios');
  console.log('Buyer1:', (await getPortfolio(buyer1Client)).myPortfolio);
  console.log('Buyer2:', (await getPortfolio(buyer2Client)).myPortfolio);
  console.log('Buyer3:', (await getPortfolio(buyer3Client)).myPortfolio);
  console.log('Seller:', (await getPortfolio(sellerClient)).myPortfolio);

  console.log('\n🔁 Transactions');
  console.log('Buyer1:', (await getTransactions(buyer1Client)).myTransactions);
  console.log('Buyer2:', (await getTransactions(buyer2Client)).myTransactions);
  console.log('Buyer3:', (await getTransactions(buyer3Client)).myTransactions);
  console.log('Seller:', (await getTransactions(sellerClient)).myTransactions);

  // ✅ CANCEL OPEN ORDER
  console.log('\n🗑 Canceling OPEN order from Buyer3...');
  const buyer3Orders = await getOrders(buyer3Client);
  const openOrder = buyer3Orders.myOrders.find((o) => o.status === 'OPEN');
  if (openOrder) {
    await prisma.order.update({
      where: { id: openOrder.id },
      data: { status: 'CANCELLED' },
    });
  }

  console.log('\n📄 Buyer3 Orders After Cancel:');
  console.log((await getOrders(buyer3Client)).myOrders);

  // ✅ MARKET ORDER TEST
  console.log('\n📤 Seller places SELL MARKET AAPL 5...');
  await seedPortfolio('seller@example.com', 'AAPL', 5, 180);
  await placeOrder(sellerClient, {
    side: 'SELL',
    type: 'MARKET',
    ticker: 'AAPL',
    price: 0,
    quantity: 5,
  });

  await new Promise((r) => setTimeout(r, 1000));

  console.log('\n📦 Portfolio after MARKET SELL');
  console.log('Buyer2:', (await getPortfolio(buyer2Client)).myPortfolio);
  console.log('Seller:', (await getPortfolio(sellerClient)).myPortfolio);

  console.log('\n💰 Balances after MARKET SELL');
  console.log('Buyer2:', (await getBalance(buyer2Client)).getMyBalance);
  console.log('Seller:', (await getBalance(sellerClient)).getMyBalance);

  // ✅ ERROR TEST CASES
  console.log('\n❌ Testing Insufficient Balance...');
  try {
    await placeOrder(buyer1Client, {
      side: 'BUY',
      type: 'LIMIT',
      ticker: 'AAPL',
      price: 100000, // very high price
      quantity: 1000,
    });
  } catch (e) {
    console.error('Expected error (insufficient balance):', e.message);
  }

  console.log('\n❌ Testing Insufficient Stocks...');
  try {
    await placeOrder(sellerClient, {
      side: 'SELL',
      type: 'LIMIT',
      ticker: 'AAPL',
      price: 190,
      quantity: 9999, // exceed portfolio
    });
  } catch (e) {
    console.error('Expected error (insufficient stock):', e.message);
  }
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
