// /* eslint-disable */
// // scripts/test-price-sync-fix.script.ts

// import {
//   login,
//   placeOrder,
//   getOrders,
//   getBalance,
//   getPortfolio,
//   getTransactions,
//   createClient,
//   prisma,
//   updateBalance,
//   seedPortfolio,
//   getDashboard,
//   clearAllTestData,
// } from './test-utils';

// async function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function printSection(title: string) {
//   console.log(`\n==== ${title} ====`);
// }

// async function main() {
//   await printSection('PRICE SYNCHRONIZATION TEST');

//   // Clean up any existing data
//   console.log('🧹 Cleaning up existing data...');
//   await clearAllTestData();

//   // Set up test users with known balances
//   await updateBalance('demo@example.com', 50000);
//   await updateBalance('buyer2@example.com', 50000);
//   await seedPortfolio('buyer2@example.com', 'AAPL', 50, 180);
//   await seedPortfolio('demo@example.com', 'MSFT', 20, 300);

//   console.log('✅ Test data setup completed');

//   // Login users
//   const demoToken = await login('demo@example.com', 'password123');
//   const buyer2Token = await login('buyer2@example.com', '123456');
//   const demoClient = createClient(demoToken);
//   const buyer2Client = createClient(buyer2Token);

//   // Initial state check
//   console.log('\n📊 Initial State:');
//   const initialDemoBalance = await getBalance(demoClient);
//   const initialDemoPortfolio = await getPortfolio(demoClient);
//   const initialDemoDashboard = await getDashboard(demoClient);

//   console.log(`Demo Balance: $${initialDemoBalance.getMyBalance}`);
//   console.log(`Demo Portfolio:`, initialDemoPortfolio.myPortfolio);
//   console.log(
//     `Demo Dashboard Total: $${initialDemoDashboard.getDashboard.totalPortfolioValue}`,
//   );
//   console.log(
//     `Demo Dashboard Cash: $${initialDemoDashboard.getDashboard.cashBalance}`,
//   );

//   // Test 1: Place a trade to trigger price updates
//   await printSection('TEST 1 - TRADE EXECUTION');
//   console.log('Placing BUY order for demo user...');

//   const buyOrder = await placeOrder(demoClient, {
//     side: 'BUY',
//     type: 'LIMIT',
//     ticker: 'AAPL',
//     quantity: 5,
//     price: 190,
//   });

//   console.log('✅ Buy order placed:', buyOrder.placeOrder.id);
//   await delay(1000);

//   // Check state after trade
//   console.log('\n📊 State After Trade:');
//   const afterTradeDemoBalance = await getBalance(demoClient);
//   const afterTradeDemoPortfolio = await getPortfolio(demoClient);
//   const afterTradeDemoDashboard = await getDashboard(demoClient);

//   console.log(`Demo Balance: $${afterTradeDemoBalance.getMyBalance}`);
//   console.log(`Demo Portfolio:`, afterTradeDemoPortfolio.myPortfolio);
//   console.log(
//     `Demo Dashboard Total: $${afterTradeDemoDashboard.getDashboard.totalPortfolioValue}`,
//   );
//   console.log(
//     `Demo Dashboard Cash: $${afterTradeDemoDashboard.getDashboard.cashBalance}`,
//   );

//   // Test 2: Check price cache consistency
//   await printSection('TEST 2 - PRICE CACHE CONSISTENCY');

//   // Import DashboardService to check cache state
//   const { DashboardService } = await import('../dashboard/dashboard.service');

//   console.log('📊 Price Cache State:');
//   console.log(DashboardService.latestPricesCache);

//   // Test 3: Multiple dashboard calls to ensure consistency
//   await printSection('TEST 3 - MULTIPLE DASHBOARD CALLS');

//   for (let i = 1; i <= 3; i++) {
//     console.log(`\n🔄 Dashboard Call ${i}:`);
//     const dashboard = await getDashboard(demoClient);
//     console.log(`  Total: $${dashboard.getDashboard.totalPortfolioValue}`);
//     console.log(`  Cash: $${dashboard.getDashboard.cashBalance}`);
//     console.log(`  Stocks: $${dashboard.getDashboard.stocksOnlyValue}`);

//     // Wait a bit between calls
//     await delay(500);
//   }

//   // Test 4: Force price refresh and check consistency
//   await printSection('TEST 4 - FORCE PRICE REFRESH');

//   console.log('🔄 Force refreshing prices...');
//   await DashboardService.forceRefreshPrices(prisma);

//   console.log('📊 Price Cache After Refresh:');
//   console.log(DashboardService.latestPricesCache);

//   // Check dashboard again
//   const finalDashboard = await getDashboard(demoClient);
//   console.log(`\n📊 Final Dashboard State:`);
//   console.log(`  Total: $${finalDashboard.getDashboard.totalPortfolioValue}`);
//   console.log(`  Cash: $${finalDashboard.getDashboard.cashBalance}`);
//   console.log(`  Stocks: $${finalDashboard.getDashboard.stocksOnlyValue}`);

//   // Test 5: Verify balance consistency
//   await printSection('TEST 5 - BALANCE CONSISTENCY VERIFICATION');

//   const finalBalance = await getBalance(demoClient);
//   const finalPortfolio = await getPortfolio(demoClient);

//   console.log(`\n💰 Balance Check:`);
//   console.log(`  GraphQL Balance: $${finalBalance.getMyBalance}`);
//   console.log(
//     `  Dashboard Balance: $${finalDashboard.getDashboard.cashBalance}`,
//   );
//   console.log(`  Portfolio Positions:`, finalPortfolio.myPortfolio);

//   // Calculate expected values
//   const expectedCash = 50000 - 5 * 190; // Initial - (shares * price)
//   const expectedTotal = expectedCash + 20 * 300 + 5 * 190; // Cash + MSFT + AAPL

//   console.log(`\n🧮 Expected Values:`);
//   console.log(`  Expected Cash: $${expectedCash}`);
//   console.log(`  Expected Total: $${expectedTotal}`);
//   console.log(
//     `  Actual Total: $${finalDashboard.getDashboard.totalPortfolioValue}`,
//   );

//   const cashDiff = Math.abs(
//     finalBalance.getMyBalance - finalDashboard.getDashboard.cashBalance,
//   );
//   const totalDiff = Math.abs(
//     expectedTotal - finalDashboard.getDashboard.totalPortfolioValue,
//   );

//   if (cashDiff < 1) {
//     console.log('✅ Cash values are consistent!');
//   } else {
//     console.log(`❌ Cash inconsistency detected: ${cashDiff}`);
//   }

//   if (totalDiff < 100) {
//     console.log('✅ Total values are within expected range!');
//   } else {
//     console.log(`❌ Total value difference: ${totalDiff}`);
//   }

//   await printSection('TEST COMPLETED');
//   console.log('🎯 Price synchronization test completed!');
// }

// main()
//   .catch((e) => console.error('❌ ERROR:', e))
//   .finally(() => prisma.$disconnect());
