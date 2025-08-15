/* eslint-disable */
// scripts/test-portfolio-consistency.script.ts

import {
  login,
  placeOrder,
  getBalance,
  getPortfolio,
  getDashboard,
  createClient,
  prisma,
  updateBalance,
  seedPortfolio,
  clearAllTestData,
} from './test-utils';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function printSection(title: string) {
  console.log(`\n==== ${title} ====`);
}

async function main() {
  await printSection('PORTFOLIO CONSISTENCY TEST');

  // Clean up any existing data
  console.log('🧹 Cleaning up existing data...');
  await clearAllTestData();

  // Setup test user
  await updateBalance('demo@example.com', 50000);
  await seedPortfolio('demo@example.com', 'MSFT', 20, 300);
  await seedPortfolio('demo@example.com', 'AAPL', 5, 190);

  const demoToken = await login('demo@example.com', 'password123');
  const demoClient = createClient(demoToken);

  await printSection('INITIAL STATE');
  
  // Get initial dashboard
  const initialDashboard = await getDashboard(demoClient);
  console.log('Initial Portfolio Value:', initialDashboard.getDashboard.totalPortfolioValue);
  console.log('Initial Cash Balance:', initialDashboard.getDashboard.cashBalance);

  await printSection('PLACE TRADE');
  
  // Place a trade to trigger socket updates
  await placeOrder(demoClient, {
    side: 'BUY',
    type: 'LIMIT',
    ticker: 'AAPL',
    quantity: 3,
    price: 195,
  });

  await delay(2000);

  await printSection('AFTER TRADE');
  
  // Get dashboard after trade
  const afterTradeDashboard = await getDashboard(demoClient);
  console.log('After Trade Portfolio Value:', afterTradeDashboard.getDashboard.totalPortfolioValue);
  console.log('After Trade Cash Balance:', afterTradeDashboard.getDashboard.cashBalance);

  await printSection('VERIFICATION');
  
  // Check if values are consistent
  const portfolioDiff = Math.abs(afterTradeDashboard.getDashboard.totalPortfolioValue - initialDashboard.getDashboard.totalPortfolioValue);
  const balanceDiff = Math.abs(afterTradeDashboard.getDashboard.cashBalance - initialDashboard.getDashboard.cashBalance);
  
  console.log('Portfolio Value Difference:', portfolioDiff);
  console.log('Cash Balance Difference:', balanceDiff);
  
  if (portfolioDiff > 100) {
    console.log('✅ Portfolio values are different (expected after trade)');
  } else {
    console.log('⚠️ Portfolio values are too similar (may indicate issue)');
  }
  
  if (balanceDiff > 100) {
    console.log('✅ Cash balance changed (expected after trade)');
  } else {
    console.log('⚠️ Cash balance did not change (may indicate issue)');
  }

  await printSection('DONE');
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
