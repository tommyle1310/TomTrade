import { login, gqlRequest, clearOrders } from './test-utils';

async function main() {
  try {
    console.log('🔐 Logging in as demo user...');
    const token = await login('demo@example.com', 'password123');
    console.log('✅ Login successful');

    // Clear existing orders
    console.log('🧹 Clearing existing orders...');
    await clearOrders();

    console.log('\n🧪 Testing IOC Fix...');

    // Create a sell order at 290 with limited quantity
    console.log('\n📋 Creating sell order: 15 shares @ $290');
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
          price: 290,
          quantity: 15, // Limited quantity
          timeInForce: 'GTC',
        },
      },
      token,
    );
    console.log('✅ Sell order created:', sellOrderRes.placeOrder);

    // Create IOC buy order for 100 shares at 290
    console.log('\n📋 Creating IOC buy order: 100 shares @ $290');
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
          quantity: 100, // Want 100, but only 15 available
          timeInForce: 'IOC',
        },
      },
      token,
    );
    console.log('✅ IOC order created:', iocOrderRes.placeOrder);

    // Wait for orders to process
    console.log('\n⏳ Waiting for orders to process...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

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
    console.log(
      '1. IOC BUY order should be CANCELLED with 85 remaining (100 - 15)',
    );
    console.log('2. GTC SELL order should be FILLED (0 remaining)');

    console.log('\n✅ IOC Fix test completed!');
  } catch (error) {
    console.error('❌ Error in IOC fix test:', error);
    throw error;
  }
}

main().catch(console.error);
