import { login, gqlRequest, clearOrders, resetOrderBook } from './test-utils';

async function main() {
  try {
    console.log('🔐 Logging in as demo user...');
    const token = await login('demo@example.com', 'password123');
    console.log('✅ Login successful');

    // Clear existing orders
    console.log('🧹 Clearing existing orders...');
    await clearOrders();

    console.log('\n🧪 Testing GTC Order Scenarios...');

    // Scenario 1: GTC LIMIT order that gets partially filled → should stay OPEN
    console.log('\n📋 Scenario 1: GTC LIMIT partial fill → should stay OPEN');

    // First, create a sell order at 300
    const sellOrderRes = await gqlRequest(
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
          side: 'SELL',
          type: 'LIMIT',
          price: 300,
          quantity: 30, // Only 30 shares available
          timeInForce: 'GTC',
        },
      },
      token,
    );
    console.log('✅ Sell order created:', sellOrderRes.placeOrder);

    // Now create a buy order for 100 shares at 300
    const buyOrderRes = await gqlRequest(
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
          quantity: 100, // Want 100, but only 30 available
          timeInForce: 'GTC',
        },
      },
      token,
    );
    console.log('✅ Buy order created:', buyOrderRes.placeOrder);

    // Scenario 2: FOK order that should be cancelled if not fully filled
    console.log(
      '\n📋 Scenario 2: FOK order → should be cancelled if not fully filled',
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
          price: 280, // Lower price, no matches
          quantity: 50,
          timeInForce: 'FOK',
        },
      },
      token,
    );
    console.log('✅ FOK order created:', fokOrderRes.placeOrder);

    // Scenario 3: IOC order that should be partially filled then cancelled
    console.log(
      '\n📋 Scenario 3: IOC order → should be partially filled then cancelled',
    );

    // Create another sell order at 290
    const sellOrder2Res = await gqlRequest(
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
          side: 'SELL',
          type: 'LIMIT',
          price: 290,
          quantity: 20, // Only 20 shares available
          timeInForce: 'GTC',
        },
      },
      token,
    );
    console.log('✅ Second sell order created:', sellOrder2Res.placeOrder);

    // Create IOC buy order for 100 shares at 290
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
          quantity: 100, // Want 100, but only 20 available
          timeInForce: 'IOC',
        },
      },
      token,
    );
    console.log('✅ IOC order created:', iocOrderRes.placeOrder);

    // Wait for orders to process
    console.log('\n⏳ Waiting for orders to process...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check final order statuses
    console.log('\n🔍 Checking final order statuses...');
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

    console.log('\n📊 Final Order Statuses:');
    ordersRes.myOrders.forEach((order: any) => {
      const status = order.status;
      const timeInForce = order.timeInForce;
      const quantity = order.quantity;
      const price = order.price;
      const side = order.side;

      console.log(
        `Order ${order.id}: ${status} (${timeInForce}) - ${side} ${quantity} @ ${price}`,
      );
    });

    // Verify expected outcomes
    console.log('\n✅ Expected Outcomes:');
    console.log('1. GTC BUY order should be PARTIAL (70 remaining) or OPEN');
    console.log('2. FOK order should be CANCELLED (no matches)');
    console.log(
      '3. IOC order should be CANCELLED (partial fill, remaining cancelled)',
    );
    console.log('4. GTC SELL orders should be FILLED or OPEN');

    console.log('\n✅ GTC Order Scenarios test completed!');
  } catch (error) {
    console.error('❌ Error in GTC scenarios test:', error);
    throw error;
  }
}

main().catch(console.error);
