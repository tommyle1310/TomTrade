/* eslint-disable */
// scripts/test-dashboard-consistency.script.ts

import {
  login,
  placeOrder,
  getDashboard,
  getBalance,
  createClient,
  prisma,
  updateBalance,
  seedPortfolio,
  getOrders,
} from './test-utils';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function printSection(title: string) {
  console.log(`\n==== ${title} ====`);
}

async function main() {
  await printSection('DASHBOARD CONSISTENCY TEST');

  // Clean up and setup
  console.log('🧹 Setting up test data...');
  await updateBalance('demo@example.com', 50000);
  await seedPortfolio('demo@example.com', 'MSFT', 20, 300);

  // Login
  const demoToken = await login('demo@example.com', 'password123');
  const demoClient = createClient(demoToken);

  // Get initial state
  console.log('\n📊 Initial State:');
  const initialDashboard = await getDashboard(demoClient);
  const initialBalance = await getBalance(demoClient);

  console.log(
    `Initial Dashboard Total: $${initialDashboard.getDashboard.totalPortfolioValue.toFixed(2)}`,
  );
  console.log(`Initial Balance: $${initialBalance.getMyBalance.toFixed(2)}`);

  // Place a trade
  console.log('\n🔄 Placing trade...');

  // CRITICAL FIX: Use MSFT shares that the user actually owns
  // First, place a SELL order for MSFT (user has 20 shares)
  console.log('📤 Placing SELL order for MSFT...');
  await placeOrder(demoClient, {
    side: 'SELL',
    type: 'LIMIT',
    ticker: 'MSFT',
    quantity: 5,
    price: 388, // Use current market price
  });

  // Wait a moment for the SELL order to be processed
  await delay(1000);

  // Now place the BUY order that should match the SELL order
  console.log('📥 Placing BUY order for MSFT...');
  await placeOrder(demoClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'MSFT',
    quantity: 5,
    price: 388, // Use current market price
  });

  // Wait for trade to process
  console.log('⏳ Waiting for trade execution...');
  await delay(3000);

  // CRITICAL FIX: Check order status to see if trades executed
  console.log('\n🔍 Checking order status...');
  const orders = await getOrders(demoClient);
  console.log('📋 Current orders:', orders.myOrders);

  // Check if any orders were filled
  const filledOrders = orders.myOrders.filter(
    (order: any) => order.status === 'FILLED',
  );
  console.log(`✅ Filled orders: ${filledOrders.length}`);

  if (filledOrders.length === 0) {
    console.log('⚠️ No orders were filled - trade may not have executed');
  } else {
    console.log('🎉 Trade executed successfully!');
  }

  // Get state after trade
  console.log('\n📊 State After Trade:');
  const afterTradeDashboard = await getDashboard(demoClient);
  const afterTradeBalance = await getBalance(demoClient);

  console.log(
    `After Trade Dashboard Total: $${afterTradeDashboard.getDashboard.totalPortfolioValue.toFixed(2)}`,
  );
  console.log(
    `After Trade Balance: $${afterTradeBalance.getMyBalance.toFixed(2)}`,
  );

  // Verify consistency
  console.log('\n🔍 Consistency Check:');
  const expectedBalance = 50000 - 5 * 388; // Initial - trade cost
  const balanceDiff = Math.abs(
    afterTradeBalance.getMyBalance - expectedBalance,
  );

  console.log(`Expected Balance: $${expectedBalance.toFixed(2)}`);
  console.log(`Actual Balance: $${afterTradeBalance.getMyBalance.toFixed(2)}`);
  console.log(`Balance Difference: $${balanceDiff.toFixed(2)}`);

  if (balanceDiff < 1) {
    console.log('✅ Balance is consistent!');
  } else {
    console.log('❌ Balance is NOT consistent!');
  }

  // Check portfolio positions
  console.log('\n📦 Portfolio Positions:');
  afterTradeDashboard.getDashboard.stockPositions.forEach((pos: any) => {
    console.log(
      `  ${pos.ticker}: ${pos.quantity} shares @ $${pos.averageBuyPrice} = $${pos.marketValue.toFixed(2)}`,
    );
  });

  // Calculate total from positions
  const totalFromPositions =
    afterTradeDashboard.getDashboard.stockPositions.reduce(
      (sum: number, pos: any) => sum + pos.marketValue,
      0,
    );
  const totalWithCash = totalFromPositions + afterTradeBalance.getMyBalance;

  console.log(`\n🧮 Calculation Check:`);
  console.log(`Total from positions: $${totalFromPositions.toFixed(2)}`);
  console.log(`Cash balance: $${afterTradeBalance.getMyBalance.toFixed(2)}`);
  console.log(`Calculated total: $${totalWithCash.toFixed(2)}`);
  console.log(
    `Dashboard total: $${afterTradeDashboard.getDashboard.totalPortfolioValue.toFixed(2)}`,
  );

  const totalDiff = Math.abs(
    totalWithCash - afterTradeDashboard.getDashboard.totalPortfolioValue,
  );
  console.log(`Total difference: $${totalDiff.toFixed(2)}`);

  if (totalDiff < 1) {
    console.log('✅ Dashboard calculation is consistent!');
  } else {
    console.log('❌ Dashboard calculation is NOT consistent!');
  }

  // CRITICAL FIX: Test manual balance update to see if the logic works
  console.log('\n🧪 Testing manual balance update...');
  const testUserId = 'bccacc53-1cf5-4b0a-88f9-b4b53f754662'; // demo user ID

  // Test direct balance update
  const testBalance = await prisma.balance.findUnique({
    where: { userId: testUserId },
  });
  console.log(`💰 Current balance: $${testBalance?.amount || 0}`);

  // Test decrement
  await prisma.balance.update({
    where: { userId: testUserId },
    data: { amount: { decrement: 1000 } },
  });

  const testBalanceAfter = await prisma.balance.findUnique({
    where: { userId: testUserId },
  });
  console.log(`💰 Balance after decrement: $${testBalanceAfter?.amount || 0}`);

  // Restore balance
  await prisma.balance.update({
    where: { userId: testUserId },
    data: { amount: { increment: 1000 } },
  });

  const testBalanceRestored = await prisma.balance.findUnique({
    where: { userId: testUserId },
  });
  console.log(`💰 Balance restored: $${testBalanceRestored?.amount || 0}`);

  if (testBalanceRestored?.amount === testBalance?.amount) {
    console.log('✅ Manual balance update works!');
  } else {
    console.log('❌ Manual balance update failed!');
  }

  await printSection('TEST COMPLETE');
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
