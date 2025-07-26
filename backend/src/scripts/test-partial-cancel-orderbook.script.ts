/* eslint-disable */
// scripts/test-partial-cancel-orderbook.script.ts

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

const gql = String.raw;

async function testPartialFill() {
  await clearOrders();

  console.log('🔐 Logging in users...');
  const buyerToken = await login('buyer@example.com', '123456');
  const sellerToken = await login('seller@example.com', '123456');

  const buyer = createClient(buyerToken);
  const seller = createClient(sellerToken);

  console.log('📤 Seller places SELL LIMIT AAPL 5 @ 300...');
  await placeOrder(seller, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 5,
    price: 300,
  });

  console.log('🛒 Buyer places BUY LIMIT AAPL 10 @ 300...');
  await placeOrder(buyer, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 300,
  });

  await new Promise((r) => setTimeout(r, 1000));

  console.log('\n📄 Buyer Orders:');
  console.dir((await getOrders(buyer)).myOrders, { depth: null });

  console.log('\n📄 Seller Orders:');
  console.dir((await getOrders(seller)).myOrders, { depth: null });

  console.log('\n📦 Buyer Portfolio:');
  console.dir((await getPortfolio(buyer)).myPortfolio, { depth: null });

  console.log('\n🔁 Buyer Transactions:');
  console.dir((await getTransactions(buyer)).myTransactions, { depth: null });
}

async function testCancelOrder() {
  await clearOrders();

  console.log('🔐 Logging in buyer...');
  const buyerToken = await login('buyer@example.com', '123456');
  const buyer = createClient(buyerToken);

  console.log('🛒 Buyer places BUY LIMIT AAPL 10 @ 300...');
  const orderResult = await placeOrder(buyer, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 10,
    price: 300,
  });
  const orderId = orderResult.placeOrder.id;

  console.log('⛔ Cancel the order...');
  const mutation = gql`
    mutation Cancel($orderId: String!) {
      cancelOrder(orderId: $orderId) {
        id
        status
      }
    }
  `;
  await buyer.request(mutation, { orderId });

  console.log('\n📄 Buyer Orders after cancel:');
  console.dir((await getOrders(buyer)).myOrders, { depth: null });
}

async function testOrderBookSorting() {
  await clearOrders();

  console.log('🔐 Logging in user...');
  const token = await login('buyer@example.com', '123456');
  const client = createClient(token);

  console.log('🧪 Placing 3 BUY orders with different prices...');
  await placeOrder(client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 1,
    price: 310,
  });
  await placeOrder(client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 1,
    price: 305,
  });
  await placeOrder(client, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 1,
    price: 300,
  });

  console.log('📊 Fetching order book...');
  const query = gql`
    query OrderBook($ticker: String!) {
      orderBook(ticker: $ticker) {
        buyOrders {
          id
          price
          createdAt
        }
        sellOrders {
          id
          price
          createdAt
        }
      }
    }
  `;
  const res = await client.request(query, { ticker: 'AAPL' });

  console.log('\n📈 Order Book Sorted:');
  console.dir(res.orderBook, { depth: null });
}

async function main() {
  await testPartialFill();
  await testCancelOrder();
  await testOrderBookSorting();
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
