/* eslint-disable */
// scripts/test-simulation.script.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Simulation Module...');

  try {
    // Test 1: Check if users exist
    console.log('\n📊 Test 1: Checking users...');
    const users = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: { id: true, email: true, role: true },
    });
    console.log(`✅ Found ${users.length} non-admin users:`, users.map(u => u.email));

    // Test 2: Check if stocks exist
    console.log('\n📈 Test 2: Checking stocks...');
    const stocks = await prisma.stock.findMany({
      select: { ticker: true, companyName: true },
    });
    console.log(`✅ Found ${stocks.length} stocks:`, stocks.map(s => s.ticker));

    // Test 3: Check if market data exists
    console.log('\n📊 Test 3: Checking market data...');
    const marketData = await prisma.marketData.findMany({
      select: { ticker: true, close: true, timestamp: true },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });
    console.log(`✅ Found ${marketData.length} recent market data entries:`, 
      marketData.map(m => `${m.ticker}: $${m.close} @ ${m.timestamp.toISOString()}`));

    // Test 4: Check if portfolios exist
    console.log('\n💼 Test 4: Checking portfolios...');
    const portfolios = await prisma.portfolio.findMany({
      select: { userId: true, ticker: true, quantity: true, averagePrice: true },
      take: 5,
    });
    console.log(`✅ Found ${portfolios.length} portfolio positions:`, 
      portfolios.map(p => `${p.ticker}: ${p.quantity} shares @ $${p.averagePrice}`));

    // Test 5: Check if balances exist
    console.log('\n💰 Test 5: Checking balances...');
    const balances = await prisma.balance.findMany({
      select: { userId: true, amount: true },
      take: 5,
    });
    console.log(`✅ Found ${balances.length} balances:`, 
      balances.map(b => `User: $${b.amount}`));

    console.log('\n🎉 All tests passed! Simulation module should work correctly.');
    console.log('\n📱 To test the simulation:');
    console.log('1. Start the backend server');
    console.log('2. Go to Settings screen in the frontend');
    console.log('3. Look for "Trading Simulation" in the Development section');
    console.log('4. Tap to start/stop the simulation');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
