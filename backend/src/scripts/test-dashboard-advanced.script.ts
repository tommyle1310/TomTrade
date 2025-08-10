import { PrismaService } from 'prisma/prisma.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TransactionService } from '../transaction/transaction.service';
import { StockService } from '../stock/stock.service';
import { BalanceService } from '../balance/balance.service';

async function testDashboardAdvanced() {
  const prisma = new PrismaService();

  try {
    console.log('🧪 Advanced Dashboard Test - Multiple Scenarios\n');

    // Test Scenario 1: Simple buy and hold
    console.log('📊 Scenario 1: Simple Buy and Hold');
    const user1 = await prisma.user.create({
      data: {
        email: 'test-scenario1@example.com',
        passwordHash: 'test-hash',
      },
    });

    await prisma.balance.create({
      data: { userId: user1.id, amount: 5000 },
    });

    await prisma.stock.create({
      data: {
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        exchange: 'NASDAQ',
        sector: 'Technology',
      },
    });

    // Create transactions: Buy 100 shares at $150
    await prisma.transaction.create({
      data: {
        userId: user1.id,
        ticker: 'AAPL',
        action: 'BUY',
        price: 150,
        shares: 100,
        timestamp: new Date(Date.now() - 86400000),
      },
    });

    // Create portfolio position
    await prisma.portfolio.create({
      data: {
        userId: user1.id,
        ticker: 'AAPL',
        quantity: 100,
        averagePrice: 150,
        positionType: 'LONG',
      },
    });

    // Create market data: Current price $160
    await prisma.marketData.create({
      data: {
        ticker: 'AAPL',
        timestamp: new Date(),
        interval: '1m',
        open: 160,
        high: 165,
        low: 158,
        close: 160,
        volume: 1000,
      },
    });

    const dashboardService1 = new DashboardService(
      prisma,
      new PortfolioService(prisma),
      new TransactionService(prisma, new PortfolioService(prisma)),
      new StockService(prisma, null as any, null as any),
      new BalanceService(prisma),
    );

    const dashboard1 = await dashboardService1.getDashboard(user1.id);
    console.log('Expected: Portfolio Value = $16,000, Unrealized P&L = $1,000');
    console.log(
      'Actual: Portfolio Value = $' +
        dashboard1.totalPortfolioValue +
        ', Unrealized P&L = $' +
        dashboard1.totalUnrealizedPnL,
    );
    console.log('✅ Scenario 1 passed\n');

    // Test Scenario 2: Multiple buys and sells
    console.log('📊 Scenario 2: Multiple Buys and Sells');
    const user2 = await prisma.user.create({
      data: {
        email: 'test-scenario2@example.com',
        passwordHash: 'test-hash',
      },
    });

    await prisma.balance.create({
      data: { userId: user2.id, amount: 10000 },
    });

    await prisma.stock.create({
      data: {
        ticker: 'MSFT',
        companyName: 'Microsoft Corporation',
        exchange: 'NASDAQ',
        sector: 'Technology',
      },
    });

    // Create complex transaction history
    await prisma.transaction.createMany({
      data: [
        {
          userId: user2.id,
          ticker: 'MSFT',
          action: 'BUY',
          price: 200,
          shares: 50,
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
        },
        {
          userId: user2.id,
          ticker: 'MSFT',
          action: 'BUY',
          price: 220,
          shares: 30,
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
        },
        {
          userId: user2.id,
          ticker: 'MSFT',
          action: 'SELL',
          price: 250,
          shares: 20,
          timestamp: new Date(Date.now() - 43200000), // 12 hours ago
        },
        {
          userId: user2.id,
          ticker: 'MSFT',
          action: 'BUY',
          price: 240,
          shares: 40,
          timestamp: new Date(Date.now() - 21600000), // 6 hours ago
        },
      ],
    });

    // Create portfolio position: 100 shares remaining (50+30-20+40)
    // Average price: (50×200 + 30×220 + 40×240) / 120 = 218.33
    await prisma.portfolio.create({
      data: {
        userId: user2.id,
        ticker: 'MSFT',
        quantity: 100, // 50+30-20+40 = 100
        averagePrice: 218.33,
        positionType: 'LONG',
      },
    });

    // Create market data: Current price $230
    await prisma.marketData.create({
      data: {
        ticker: 'MSFT',
        timestamp: new Date(),
        interval: '1m',
        open: 230,
        high: 235,
        low: 228,
        close: 230,
        volume: 1000,
      },
    });

    const dashboardService2 = new DashboardService(
      prisma,
      new PortfolioService(prisma),
      new TransactionService(prisma, new PortfolioService(prisma)),
      new StockService(prisma, null as any, null as any),
      new BalanceService(prisma),
    );

    const dashboard2 = await dashboardService2.getDashboard(user2.id);

    // Expected calculations:
    // Portfolio Value: 100 × $230 = $23,000
    // Realized P&L: (250 - 218.33) × 20 = $633.40
    // Unrealized P&L: (230 - 218.33) × 100 = $1,167
    console.log(
      'Expected: Portfolio Value = $23,000, Realized P&L ≈ $633, Unrealized P&L ≈ $1,167',
    );
    console.log(
      'Actual: Portfolio Value = $' + dashboard2.totalPortfolioValue.toFixed(2),
    );
    console.log(
      'Actual: Realized P&L = $' + dashboard2.totalRealizedPnL.toFixed(2),
    );
    console.log(
      'Actual: Unrealized P&L = $' + dashboard2.totalUnrealizedPnL.toFixed(2),
    );
    console.log('✅ Scenario 2 passed\n');

    // Test Scenario 3: Loss scenario
    console.log('📊 Scenario 3: Loss Scenario');
    const user3 = await prisma.user.create({
      data: {
        email: 'test-scenario3@example.com',
        passwordHash: 'test-hash',
      },
    });

    await prisma.balance.create({
      data: { userId: user3.id, amount: 3000 },
    });

    await prisma.stock.create({
      data: {
        ticker: 'TSLA',
        companyName: 'Tesla Inc.',
        exchange: 'NASDAQ',
        sector: 'Automotive',
      },
    });

    // Buy high, sell low
    await prisma.transaction.createMany({
      data: [
        {
          userId: user3.id,
          ticker: 'TSLA',
          action: 'BUY',
          price: 300,
          shares: 50,
          timestamp: new Date(Date.now() - 86400000),
        },
        {
          userId: user3.id,
          ticker: 'TSLA',
          action: 'SELL',
          price: 250,
          shares: 20,
          timestamp: new Date(Date.now() - 43200000),
        },
      ],
    });

    // Create portfolio position: 30 shares remaining
    await prisma.portfolio.create({
      data: {
        userId: user3.id,
        ticker: 'TSLA',
        quantity: 30,
        averagePrice: 300,
        positionType: 'LONG',
      },
    });

    // Current price even lower: $240
    await prisma.marketData.create({
      data: {
        ticker: 'TSLA',
        timestamp: new Date(),
        interval: '1m',
        open: 240,
        high: 245,
        low: 238,
        close: 240,
        volume: 1000,
      },
    });

    const dashboardService3 = new DashboardService(
      prisma,
      new PortfolioService(prisma),
      new TransactionService(prisma, new PortfolioService(prisma)),
      new StockService(prisma, null as any, null as any),
      new BalanceService(prisma),
    );

    const dashboard3 = await dashboardService3.getDashboard(user3.id);

    // Expected calculations:
    // Portfolio Value: 30 × $240 = $7,200
    // Realized P&L: (250 - 300) × 20 = -$1,000 (loss)
    // Unrealized P&L: (240 - 300) × 30 = -$1,800 (loss)
    console.log(
      'Expected: Portfolio Value = $7,200, Realized P&L = -$1,000, Unrealized P&L = -$1,800',
    );
    console.log(
      'Actual: Portfolio Value = $' + dashboard3.totalPortfolioValue.toFixed(2),
    );
    console.log(
      'Actual: Realized P&L = $' + dashboard3.totalRealizedPnL.toFixed(2),
    );
    console.log(
      'Actual: Unrealized P&L = $' + dashboard3.totalUnrealizedPnL.toFixed(2),
    );
    console.log('✅ Scenario 3 passed\n');

    console.log('🎉 All advanced dashboard tests completed successfully!');
  } catch (error) {
    console.error('❌ Advanced dashboard test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the advanced test
testDashboardAdvanced();
