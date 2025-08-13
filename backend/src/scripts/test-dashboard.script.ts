import { PrismaService } from 'prisma/prisma.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TransactionService } from '../transaction/transaction.service';
import { StockService } from '../stock/stock.service';
import { BalanceService } from '../balance/balance.service';
import { PortfolioPnLService } from '../portfolio/portfolio-pnl.service';

async function testDashboard() {
  const prisma = new PrismaService();

  try {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test-dashboard@example.com',
        passwordHash: 'test-hash',
      },
    });

    console.log('✅ Created test user:', user.id);

    // Create test stock
    const stock = await prisma.stock.create({
      data: {
        ticker: 'TEST',
        companyName: 'Test Company',
        exchange: 'NASDAQ',
        sector: 'Technology',
      },
    });

    console.log('✅ Created test stock:', stock.ticker);

    // Create balance for user
    await prisma.balance.create({
      data: {
        userId: user.id,
        amount: 10000,
      },
    });

    console.log('✅ Created balance for user');

    // Create market data for current price
    await prisma.marketData.create({
      data: {
        ticker: 'TEST',
        timestamp: new Date(),
        interval: '1m',
        open: 50,
        high: 55,
        low: 48,
        close: 52,
        volume: 1000,
      },
    });

    console.log('✅ Created market data');

    // Create transactions first
    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          ticker: 'TEST',
          action: 'BUY',
          price: 40,
          shares: 50,
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
        },
        {
          userId: user.id,
          ticker: 'TEST',
          action: 'BUY',
          price: 50,
          shares: 50,
          timestamp: new Date(Date.now() - 43200000), // 12 hours ago
        },
        {
          userId: user.id,
          ticker: 'TEST',
          action: 'SELL',
          price: 55,
          shares: 20,
          timestamp: new Date(),
        },
      ],
    });

    console.log('✅ Created transactions');

    // Create portfolio position that reflects the actual state after transactions
    // Total bought: 100 shares, Total sold: 20 shares, Remaining: 80 shares
    // Average price: (50×40 + 50×50) / 100 = 45
    await prisma.portfolio.create({
      data: {
        userId: user.id,
        ticker: 'TEST',
        quantity: 80, // 100 bought - 20 sold = 80 remaining
        averagePrice: 45,
        positionType: 'LONG',
      },
    });

    console.log('✅ Created portfolio position (80 shares remaining)');

    console.log('✅ Created transactions');

    // Initialize services
    const portfolioService = new PortfolioService(prisma);
    const transactionService = new TransactionService(prisma, portfolioService);
    const stockService = new StockService(prisma, null as any, null as any);
    const balanceService = new BalanceService(prisma);
    const dashboardService = new DashboardService(
      prisma,
      portfolioService,
      transactionService,
      stockService,
      balanceService,
      new PortfolioPnLService(prisma),
    );

    // Test dashboard
    console.log('\n📊 Testing Dashboard...');
    const dashboard = await dashboardService.getDashboard(user.id);

    console.log('Dashboard Results:');
    console.log('- Total Portfolio Value:', dashboard.totalPortfolioValue);
    console.log('- Total Realized P&L:', dashboard.totalRealizedPnL);
    console.log('- Total Unrealized P&L:', dashboard.totalUnrealizedPnL);
    console.log('- Total P&L:', dashboard.totalPnL);
    console.log('- Cash Balance:', dashboard.cashBalance);
    console.log('- Stock Positions:', dashboard.stockPositions.length);

    // Expected calculations for verification
    console.log('\n📋 Expected Calculations:');
    console.log('- Portfolio Value: 80 shares × $52 = $4,160');
    console.log('- Realized P&L: (55 - 45) × 20 shares = $200');
    console.log('- Unrealized P&L: (52 - 45) × 80 shares = $560');
    console.log('- Total P&L: $200 + $560 = $760');

    if (dashboard.stockPositions.length > 0) {
      const position = dashboard.stockPositions[0];
      console.log('\nStock Position Details:');
      console.log('- Ticker:', position.ticker);
      console.log('- Company:', position.companyName);
      console.log('- Quantity:', position.quantity);
      console.log('- Average Buy Price:', position.averageBuyPrice);
      console.log('- Current Price:', position.currentPrice);
      console.log('- Market Value:', position.marketValue);
      console.log('- Unrealized P&L:', position.unrealizedPnL);
      console.log('- Unrealized P&L %:', position.unrealizedPnLPercent);
    }

    // Test individual stock position
    console.log('\n📈 Testing Individual Stock Position...');
    const stockPosition = await dashboardService.getStockPosition(
      user.id,
      'TEST',
    );

    if (stockPosition) {
      console.log('Individual Stock Position:');
      console.log('- Ticker:', stockPosition.ticker);
      console.log('- Market Value:', stockPosition.marketValue);
      console.log('- Unrealized P&L:', stockPosition.unrealizedPnL);
      console.log('- Expected Market Value: 80 × $52 = $4,160');
      console.log('- Expected Unrealized P&L: (52-45) × 80 = $560');
    }

    console.log('\n✅ Dashboard test completed successfully!');
  } catch (error) {
    console.error('❌ Dashboard test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDashboard();
