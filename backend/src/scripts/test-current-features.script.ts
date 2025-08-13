import { PrismaService } from 'prisma/prisma.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TransactionService } from '../transaction/transaction.service';
import { StockService } from '../stock/stock.service';
import { BalanceService } from '../balance/balance.service';
import { IndicatorService } from '../stock/indicator.service';
import { PortfolioPnLService } from '../portfolio/portfolio-pnl.service';

async function testCurrentFeatures() {
  const prisma = new PrismaService();

  try {
    console.log('🧪 Testing Current Features (Before Migration)\n');

    // Clean up any existing test data
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test-current@example.com' },
    });
    if (existingUser) {
      await prisma.balance.deleteMany({ where: { userId: existingUser.id } });
      await prisma.portfolio.deleteMany({ where: { userId: existingUser.id } });
      await prisma.transaction.deleteMany({
        where: { userId: existingUser.id },
      });
      await prisma.order.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test-current@example.com',
        passwordHash: 'test-hash',
      },
    });

    console.log('✅ Created test user');

    // Create test stock (use upsert to handle existing data)
    const stock = await prisma.stock.upsert({
      where: { ticker: 'TEST' },
      update: {},
      create: {
        ticker: 'TEST',
        companyName: 'Test Company',
        exchange: 'NASDAQ',
        sector: 'Technology',
      },
    });

    console.log('✅ Created/Updated test stock');

    // Create balance for user
    await prisma.balance.upsert({
      where: { userId: user.id },
      update: { amount: 10000 },
      create: {
        userId: user.id,
        amount: 10000,
      },
    });

    console.log('✅ Created balance for user');

    // Clean up existing market data for TEST ticker
    await prisma.marketData.deleteMany({ where: { ticker: 'TEST' } });

    // Create market data for technical indicators
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      await prisma.marketData.create({
        data: {
          ticker: 'TEST',
          timestamp: date,
          interval: '1d',
          open: 100 + Math.random() * 20,
          high: 110 + Math.random() * 20,
          low: 90 + Math.random() * 20,
          close: 100 + Math.random() * 20,
          volume: BigInt(Math.floor(1000 + Math.random() * 5000)),
        },
      });
    }

    console.log('✅ Created market data for indicators');

    // Create portfolio position
    await prisma.portfolio.upsert({
      where: {
        userId_ticker: {
          userId: user.id,
          ticker: 'TEST',
        },
      },
      update: {
        quantity: 100,
        averagePrice: 50,
      },
      create: {
        userId: user.id,
        ticker: 'TEST',
        quantity: 100,
        averagePrice: 50,
        positionType: 'LONG',
      },
    });

    console.log('✅ Created portfolio position');

    // Test 1: Dashboard
    console.log('\n📊 Test 1: Dashboard API');
    const dashboardService = new DashboardService(
      prisma,
      new PortfolioService(prisma),
      new TransactionService(prisma, new PortfolioService(prisma)),
      new StockService(prisma, null as any, null as any),
      new BalanceService(prisma),
      new PortfolioPnLService(prisma),
    );

    try {
      const dashboard = await dashboardService.getDashboard(user.id);
      console.log('✅ Dashboard Results:');
      console.log(
        '- Portfolio Value:',
        dashboard.totalPortfolioValue.toFixed(2),
      );
      console.log('- Cash Balance:', dashboard.cashBalance.toFixed(2));
      console.log('- Stock Positions:', dashboard.stockPositions.length);
    } catch (error) {
      console.log('❌ Dashboard test failed:', error.message);
    }

    // Test 2: Technical Indicators
    console.log('\n📈 Test 2: Technical Indicators');
    const indicatorService = new IndicatorService(prisma);

    try {
      const sma = await indicatorService.getSMA('TEST', 20, '1d');
      console.log('✅ SMA (20):', sma[sma.length - 1].toFixed(2));

      const ema = await indicatorService.getEMA('TEST', 20, '1d');
      console.log('✅ EMA (20):', ema[ema.length - 1].toFixed(2));

      const rsi = await indicatorService.getRSI('TEST', 14, '1d');
      console.log('✅ RSI (14):', rsi[rsi.length - 1].toFixed(2));

      const bands = await indicatorService.getBollingerBands(
        'TEST',
        20,
        2,
        '1d',
      );
      console.log(
        '✅ Bollinger Bands - Upper:',
        bands.upper[bands.upper.length - 1].toFixed(2),
      );

      const macd = await indicatorService.getMACD('TEST', 12, 26, 9, '1d');
      console.log('✅ MACD:', macd.macd[macd.macd.length - 1].toFixed(2));
    } catch (error) {
      console.log('❌ Technical indicators test failed:', error.message);
    }

    console.log('\n🎉 Current features test completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log(
      '1. Run database migration: npx prisma migrate dev --name add_new_features',
    );
    console.log(
      '2. Test new features: npx ts-node src/scripts/test-new-features.script.ts',
    );
  } catch (error) {
    console.error('❌ Current features test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCurrentFeatures();
