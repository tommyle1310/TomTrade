import { login, gqlRequest, createClient } from './test-utils';

async function main() {
  try {
    console.log('🔐 Logging in as demo user...');
    const token = await login('demo@example.com', 'password123');
    const client = createClient(token);
    console.log('✅ Login successful');

    console.log('\n🧪 Testing GTC Order Logic...');

    // Test 1: GTC LIMIT order that gets partially filled
    console.log('\n📋 Test 1: GTC LIMIT order - partial fill should stay OPEN');
    const gtcOrderRes = await gqlRequest(
      `
      mutation PlaceOrder($input: PlaceOrderInput!) {
        placeOrder(input: $input) {
          id
          side
          type
          price
          quantity
          status
          timeInForce
        }
      }
      `,
      {
        input: {
          ticker: 'AAPL',
          side: 'BUY',
          type: 'LIMIT',
          price: 300,
          quantity: 100,
          timeInForce: 'GTC',
        },
      },
      token,
    );
    console.log('✅ GTC Order created:', gtcOrderRes.placeOrder);

    // Test 2: FOK order that should be cancelled if not fully filled
    console.log(
      '\n📋 Test 2: FOK order - should be cancelled if not fully filled',
    );
    const fokOrderRes = await gqlRequest(
      `
      mutation PlaceOrder($input: PlaceOrderInput!) {
        placeOrder(input: $input) {
          id
          side
          type
          price
          quantity
          status
          timeInForce
        }
      }
      `,
      {
        input: {
          ticker: 'AAPL',
          side: 'BUY',
          type: 'LIMIT',
          price: 280, // Lower price to ensure no matches
          quantity: 50,
          timeInForce: 'FOK',
        },
      },
      token,
    );
    console.log('✅ FOK Order created:', fokOrderRes.placeOrder);

    // Test 3: IOC order that should be partially filled then cancelled
    console.log(
      '\n📋 Test 3: IOC order - should be partially filled then cancelled',
    );
    const iocOrderRes = await gqlRequest(
      `
      mutation PlaceOrder($input: PlaceOrderInput!) {
        placeOrder(input: $input) {
          id
          side
          type
          price
          quantity
          status
          timeInForce
        }
      }
      `,
      {
        input: {
          ticker: 'AAPL',
          side: 'BUY',
          type: 'LIMIT',
          price: 290,
          quantity: 200,
          timeInForce: 'IOC',
        },
      },
      token,
    );
    console.log('✅ IOC Order created:', iocOrderRes.placeOrder);

    // Check order statuses after a delay
    console.log('\n⏳ Waiting for orders to process...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('\n🔍 Checking order statuses...');
    const ordersRes = await gqlRequest(
      `
      query {
        myOrders {
          id
          side
          type
          price
          quantity
          status
          timeInForce
          createdAt
        }
      }
      `,
      {},
      token,
    );

    console.log('\n📊 Order Statuses:');
    ordersRes.myOrders.forEach((order: any) => {
      console.log(
        `Order ${order.id}: ${order.status} (${order.timeInForce}) - ${order.quantity} @ ${order.price}`,
      );
    });

    console.log('\n✅ GTC Order Logic test completed!');
  } catch (error) {
    console.error('❌ Error in GTC Order test:', error);
    throw error;
  }
}

main().catch(console.error);
